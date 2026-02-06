import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { ACHIEVEMENTS, AWARD_CATEGORIES } from '../lib/constants'

export function useAchievements() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  // 전체 업적 현황 불러오기
  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('achievements')
        .select('*, member:members(id, name)')
        .order('achieved_at', { ascending: false })

      if (error) throw error
      setAchievements(data || [])
    } catch (err) {
      console.error('업적 조회 실패:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 특정 멤버의 업적 목록
  const getMemberAchievements = (memberId) => {
    return achievements.filter((a) => a.member_id === memberId)
  }

  // 업적 부여
  const grantAchievement = async (memberId, achievementKey) => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .upsert([{
          member_id: memberId,
          achievement_key: achievementKey
        }], {
          onConflict: 'member_id,achievement_key'
        })
        .select('*, member:members(id, name)')
        .single()

      if (error) throw error

      setAchievements((prev) => {
        const exists = prev.find(
          (a) => a.member_id === memberId && a.achievement_key === achievementKey
        )
        if (exists) return prev
        return [data, ...prev]
      })
      return { data, error: null, isNew: true }
    } catch (err) {
      return { data: null, error: err.message, isNew: false }
    }
  }

  // 토토 업적 체크 및 부여
  const checkTotoAchievements = async (memberId) => {
    const newAchievements = []

    try {
      // 해당 멤버의 전체 토토 참여 기록
      const { data: allBets } = await supabase
        .from('toto_bets')
        .select('*, round:toto_rounds(id, status, actual_weapon)')
        .eq('member_id', memberId)
        .order('created_at', { ascending: true })

      if (!allBets || allBets.length === 0) return newAchievements

      const finishedBets = allBets.filter((b) => b.round?.status === 'finished')
      const totalBets = allBets.length
      const totalHits = finishedBets.filter((b) => b.weapon === b.round?.actual_weapon).length

      // 첫 도박
      if (totalBets >= 1) {
        const result = await grantAchievement(memberId, 'toto_first')
        if (result.isNew) newAchievements.push('toto_first')
      }

      // 도박꾼 (10회)
      if (totalBets >= 10) {
        const result = await grantAchievement(memberId, 'toto_10')
        if (result.isNew) newAchievements.push('toto_10')
      }

      // 프로 도박꾼 (20회)
      if (totalBets >= 20) {
        const result = await grantAchievement(memberId, 'toto_20')
        if (result.isNew) newAchievements.push('toto_20')
      }

      // 비기너즈 럭 (첫 적중)
      if (totalHits >= 1) {
        const result = await grantAchievement(memberId, 'toto_hit_first')
        if (result.isNew) newAchievements.push('toto_hit_first')
      }

      // 행운의 별 (통산 5회)
      if (totalHits >= 5) {
        const result = await grantAchievement(memberId, 'toto_hit_5')
        if (result.isNew) newAchievements.push('toto_hit_5')
      }

      // 이거 암튼 사기임 (통산 10회)
      if (totalHits >= 10) {
        const result = await grantAchievement(memberId, 'toto_hit_10')
        if (result.isNew) newAchievements.push('toto_hit_10')
      }

      // 연속 적중/꽝 체크
      let streak = 0
      let maxHitStreak = 0
      let missStreak = 0
      let maxMissStreak = 0

      finishedBets.forEach((bet) => {
        if (bet.weapon === bet.round?.actual_weapon) {
          streak++
          missStreak = 0
          maxHitStreak = Math.max(maxHitStreak, streak)
        } else {
          missStreak++
          streak = 0
          maxMissStreak = Math.max(maxMissStreak, missStreak)
        }
      })

      // 예언자 (3연속 적중)
      if (maxHitStreak >= 3) {
        const result = await grantAchievement(memberId, 'toto_hit_3_streak')
        if (result.isNew) newAchievements.push('toto_hit_3_streak')
      }

      // 공대의 의의 (5연속 꽝)
      if (maxMissStreak >= 5) {
        const result = await grantAchievement(memberId, 'toto_miss_5_streak')
        if (result.isNew) newAchievements.push('toto_miss_5_streak')
      }
    } catch (err) {
      console.error('토토 업적 체크 실패:', err)
    }

    return newAchievements
  }

  // 시상식 업적 체크 및 부여
  const checkAwardAchievements = async (memberId) => {
    const newAchievements = []

    try {
      // 해당 멤버의 투표 참여 횟수 (세션 단위)
      const { data: voterData } = await supabase
        .from('award_votes')
        .select('session_id')
        .eq('voter_id', memberId)

      if (voterData) {
        const uniqueSessions = [...new Set(voterData.map((v) => v.session_id))]

        // 민주주의의 꽃 (첫 투표)
        if (uniqueSessions.length >= 1) {
          const result = await grantAchievement(memberId, 'vote_first')
          if (result.isNew) newAchievements.push('vote_first')
        }

        // 민주주의자 (10회)
        if (uniqueSessions.length >= 10) {
          const result = await grantAchievement(memberId, 'vote_10')
          if (result.isNew) newAchievements.push('vote_10')
        }
      }

      // 해당 멤버가 수상한 기록 (카테고리별 1등만)
      const { data: allVotes } = await supabase
        .from('award_votes')
        .select('category, nominee_id, session_id')
        .eq('nominee_id', memberId)

      if (allVotes) {
        // 세션+카테고리별로 그룹핑해서 1등인지 확인
        const { data: allSessionVotes } = await supabase
          .from('award_votes')
          .select('category, nominee_id, session_id')

        // 세션별, 카테고리별 1등 계산
        const winMap = {}
        const sessionCatMap = {}

        allSessionVotes?.forEach((v) => {
          const key = `${v.session_id}_${v.category}`
          if (!sessionCatMap[key]) sessionCatMap[key] = {}
          if (!sessionCatMap[key][v.nominee_id]) sessionCatMap[key][v.nominee_id] = 0
          sessionCatMap[key][v.nominee_id]++
        })

        Object.entries(sessionCatMap).forEach(([key, nominees]) => {
          const sorted = Object.entries(nominees).sort((a, b) => b[1] - a[1])
          if (sorted.length > 0 && sorted[0][0] === memberId) {
            const category = key.split('_').pop()
            if (!winMap[category]) winMap[category] = 0
            winMap[category]++
          }
        })

        // 카테고리별 수상 횟수 체크
        const categoryChecks = [
          { cat: 'wipe', counts: [{ n: 3, key: 'wipe_3' }, { n: 5, key: 'wipe_5' }] },
          { cat: 'clown', counts: [{ n: 3, key: 'clown_3' }, { n: 5, key: 'clown_5' }] },
          { cat: 'ghost', counts: [{ n: 3, key: 'ghost_3' }] },
          { cat: 'mvp', counts: [{ n: 3, key: 'mvp_3' }, { n: 5, key: 'mvp_5' }] },
          { cat: 'floor', counts: [{ n: 3, key: 'floor_3' }] },
          { cat: 'actor', counts: [{ n: 3, key: 'actor_3' }] },
        ]

        for (const check of categoryChecks) {
          const wins = winMap[check.cat] || 0
          for (const { n, key } of check.counts) {
            if (wins >= n) {
              const result = await grantAchievement(memberId, key)
              if (result.isNew) newAchievements.push(key)
            }
          }
        }

        // 만능 엔터테이너 (모든 카테고리 1회 이상)
        const allCatIds = AWARD_CATEGORIES.map((c) => c.id)
        const hasAllCategories = allCatIds.every((cat) => (winMap[cat] || 0) >= 1)
        if (hasAllCategories) {
          const result = await grantAchievement(memberId, 'all_category')
          if (result.isNew) newAchievements.push('all_category')
        }
      }
    } catch (err) {
      console.error('시상식 업적 체크 실패:', err)
    }

    return newAchievements
  }

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  return {
    achievements,
    loading,
    getMemberAchievements,
    grantAchievement,
    checkTotoAchievements,
    checkAwardAchievements,
    refetch: fetchAchievements
  }
}
