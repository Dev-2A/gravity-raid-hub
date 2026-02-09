import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { WEAPONS, AWARD_CATEGORIES, TOTO_TYPES } from '../lib/constants'

export default function History() {
  const [activeTab, setActiveTab] = useState('toto')
  const [totoHistory, setTotoHistory] = useState([])
  const [awardHistory, setAwardHistory] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // 멤버 목록 불러오기 (사망자 토토 표시용)
  const fetchMembers = async () => {
    const { data } = await supabase
      .from('members')
      .select('*')
    return data || []
  }

  // 토토 기록 불러오기
  const fetchTotoHistory = async () => {
    const { data, error } = await supabase
      .from('toto_rounds')
      .select(`
        *,
        bets:toto_bets(
          *,
          member:members(id, name)
        )
      `)
      .eq('status', 'finished')
      .order('week_start', { ascending: false })

    if (!error) setTotoHistory(data || [])
  }

  // 시상식 기록 불러오기
  const fetchAwardHistory = async () => {
    const { data, error } = await supabase
      .from('award_sessions')
      .select(`
        *,
        votes:award_votes(
          *,
          voter:members!award_votes_voter_id_fkey(id, name),
          nominee:members!award_votes_nominee_id_fkey(id, name)
        )
      `)
      .eq('status', 'finished')
      .order('raid_date', { ascending: false })

    if (!error) setAwardHistory(data || [])
  }

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      const membersData = await fetchMembers()
      setMembers(membersData)
      await Promise.all([fetchTotoHistory(), fetchAwardHistory()])
      setLoading(false)
    }
    fetchAll()
  }, [])

  // 무기 이름 찾기
  const getWeaponName = (weaponId) => {
    const weapon = WEAPONS.find((w) => w.id === weaponId)
    return weapon ? `${weapon.name} (${weapon.job})` : weaponId
  }

  // 멤버 이름 찾기
  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId)
    return member ? member.name : memberId
  }

  // 토토 유형 정보
  const getTotoType = (round) => {
    return TOTO_TYPES.find((t) => t.id === round.toto_type) || TOTO_TYPES[0]
  }

  // 베팅값 표시
  const displayBetValue = (bet, round) => {
    const value = bet.bet_value || bet.weapon
    const type = round.toto_type || 'weapon'

    if (type === 'weapon') return getWeaponName(value)
    if (type === 'first_death' || type === 'last_death') return getMemberName(value)
    if (type === 'wipe_count' || type === 'total_deaths') return `${value}회`
    return value
  }

  // 결과값 표시
  const displayResult = (round) => {
    const result = round.actual_result || round.actual_weapon
    if (!result) return '-'

    if (round.toto_type === 'weapon') return getWeaponName(result)
    if (round.toto_type === 'first_death' || round.toto_type === 'last_death') return getMemberName(result)
    if (round.toto_type === 'wipe_count') return `${result}회`
    if (round.toto_type === 'total_deaths') return `${result}회`
    return result
  }

  // 숫자 토토 근접치 우승자 계산
  const getNumberWinners = (allBets, actualResult) => {
    const actual = Number(actualResult)
    if (isNaN(actual) || allBets.length === 0) return []

    const betDiffs = allBets.map((bet) => {
      const betNum = Number(bet.bet_value || bet.weapon || 0)
      return { memberId: bet.member_id, betNum, diff: Math.abs(betNum - actual) }
    })

    const minDiff = Math.min(...betDiffs.map((b) => b.diff))
    const closest = betDiffs.filter((b) => b.diff === minDiff)

    if (closest.length > 1) {
      const lowerGuesses = closest.filter((b) => b.betNum <= actual)
      if (lowerGuesses.length > 0) return lowerGuesses.map((b) => b.memberId)
    }

    return closest.map((b) => b.memberId)
  }

  // 정답 확인
  const isCorrect = (bet, round, allBets = []) => {
    const result = round.actual_result || round.actual_weapon
    const value = bet.bet_value || bet.weapon

    if (round.toto_type === 'wipe_count' || round.toto_type === 'total_deaths') {
      const winners = getNumberWinners(allBets, result)
      return winners.includes(bet.member_id)
    }

    return String(value) === String(result)
  }

  // 시상식 결과 집계
  const getAwardResults = (votes) => {
    const results = {}

    votes.forEach((vote) => {
      if (!results[vote.category]) {
        results[vote.category] = {}
      }
      const nomineeId = vote.nominee_id
      if (!results[vote.category][nomineeId]) {
        results[vote.category][nomineeId] = {
          nominee: vote.nominee,
          count: 0
        }
      }
      results[vote.category][nomineeId].count++
    })

    const winners = {}
    Object.entries(results).forEach(([category, nominees]) => {
      const sorted = Object.values(nominees).sort((a, b) => b.count - a.count)
      if (sorted.length > 0) {
        winners[category] = sorted[0]
      }
    })

    return winners
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--color-text-muted)]">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📜</span> 기록실
        </h1>
        <span className="text-[var(--color-text-muted)] text-sm">
          과중력 공대의 역사
        </span>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('toto')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'toto'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-muted)] hover:bg-white/5'
          }`}
        >
          🎰 토토 기록
        </button>
        <button
          onClick={() => setActiveTab('awards')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'awards'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-muted)] hover:bg-white/5'
          }`}
        >
          🏆 시상식 기록
        </button>
      </div>

      {/* 토토 기록 */}
      {activeTab === 'toto' && (
        <div className="space-y-4">
          {totoHistory.length > 0 ? (
            totoHistory.map((round) => {
              const type = getTotoType(round)
              const result = round.actual_result || round.actual_weapon
              const winners = round.bets.filter((b) => isCorrect(b, round, round.bets))
              const floorText = round.floor ? `${round.floor}층 ` : ''

              return (
                <div
                  key={round.id}
                  className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">
                      {new Date(round.week_start).toLocaleDateString('ko-KR')}
                    </h3>
                    <span className="text-[var(--color-accent)]">
                      {displayResult(round)}
                    </span>
                  </div>

                  {/* 토토 유형 배지 */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                      {type.emoji} {floorText}{type.name}
                    </span>
                  </div>

                  <div className="grid gap-2">
                    {round.bets.map((bet) => {
                      const correct = isCorrect(bet, round, round.bets)
                      return (
                        <div
                          key={bet.id}
                          className={`flex justify-between items-center p-2 rounded-lg ${
                            correct
                              ? 'bg-[var(--color-success)]/20'
                              : 'bg-black/20'
                          }`}
                        >
                          <span>{bet.member?.name}</span>
                          <span className="text-[var(--color-text-muted)]">
                            {displayBetValue(bet, round)}
                            {correct && ' ✅'}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {winners.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <span className="text-[var(--color-success)]">
                        🎉 적중: {winners.map((w) => w.member?.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
              <div className="text-[var(--color-text-muted)] text-center py-8">
                아직 기록이 없습니다
              </div>
            </div>
          )}
        </div>
      )}

      {/* 시상식 기록 */}
      {activeTab === 'awards' && (
        <div className="space-y-4">
          {awardHistory.length > 0 ? (
            awardHistory.map((session) => {
              const winners = getAwardResults(session.votes)
              return (
                <div
                  key={session.id}
                  className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10"
                >
                  <h3 className="font-bold mb-4">
                    {new Date(session.raid_date).toLocaleDateString('ko-KR')} 레이드
                  </h3>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {AWARD_CATEGORIES.map((cat) => {
                      const winner = winners[cat.id]
                      return (
                        <div
                          key={cat.id}
                          className="p-3 rounded-lg bg-black/20"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span>{cat.emoji}</span>
                            <span className="text-sm text-[var(--color-text-muted)]">{cat.name}</span>
                          </div>
                          <div className="font-medium">
                            {winner ? (
                              <>👑 {winner.nominee.name} <span className="text-[var(--color-text-muted)]">({winner.count}표)</span></>
                            ) : (
                              <span className="text-[var(--color-text-muted)]">-</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
              <div className="text-[var(--color-text-muted)] text-center py-8">
                아직 기록이 없습니다
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
