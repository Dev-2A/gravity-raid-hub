import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { WEAPONS, AWARD_CATEGORIES } from '../lib/constants'

export default function Home() {
  const [currentToto, setCurrentToto] = useState(null)
  const [currentAward, setCurrentAward] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 현재 토토 라운드
      const { data: totoData } = await supabase
        .from('toto_rounds')
        .select('*, bets:toto_bets(*)')
        .in('status', ['open', 'closed', 'finished'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setCurrentToto(totoData)

      // 현재 시상식
      const { data: awardData } = await supabase
        .from('award_sessions')
        .select('*, votes:award_votes(*)')
        .eq('status', 'voting')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setCurrentAward(awardData)

      // 최근 완료된 기록
      const { data: recentToto } = await supabase
        .from('toto_rounds')
        .select('*, bets:toto_bets(*, member:members(name))')
        .eq('status', 'finished')
        .order('created_at', { ascending: false })
        .limit(3)

      const { data: recentAwards } = await supabase
        .from('award_sessions')
        .select('*')
        .eq('status', 'finished')
        .order('created_at', { ascending: false })
        .limit(3)

      // 최근 활동 합치기
      const activities = []
      
      recentToto?.forEach((round) => {
        const winners = round.bets?.filter((b) => b.weapon === round.actual_weapon) || []
        activities.push({
          type: 'toto',
          date: round.week_start,
          weapon: round.actual_weapon,
          winners: winners.map((w) => w.member?.name)
        })
      })

      recentAwards?.forEach((session) => {
        activities.push({
          type: 'award',
          date: session.raid_date
        })
      })

      // 날짜순 정렬
      activities.sort((a, b) => new Date(b.date) - new Date(a.date))
      setRecentActivity(activities.slice(0, 5))

      setLoading(false)
    }

    fetchData()
  }, [])

  // 무기 이름 찾기
  const getWeaponName = (weaponId) => {
    const weapon = WEAPONS.find((w) => w.id === weaponId)
    return weapon ? weapon.name : weaponId
  }

  // 마감까지 남은 시간 계산
  const getTimeRemaining = (deadline) => {
    const now = new Date()
    const end = new Date(deadline)
    const diff = end - now

    if (diff <= 0) return '마감됨'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}일 ${hours}시간 남음`
    return `${hours}시간 남음`
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--color-text-muted)]">로딩 중...</div>
  }

  return (
    <div className="space-y-8">
      {/* 히어로 섹션 */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-[var(--color-accent)]">🌀 과중력</span> 공대 포털
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg">
          아르카디아: 헤비급 정복을 향해!
        </p>
      </section>

      {/* 퀵 링크 카드 */}
      <section className="grid md:grid-cols-2 gap-6">
        <Link 
          to="/toto"
          className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10 
                     hover:border-[var(--color-primary)] transition-colors group"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">🎰</span>
            <div>
              <h2 className="text-xl font-bold group-hover:text-[var(--color-primary)]">
                무기 토토
              </h2>
              <p className="text-[var(--color-text-muted)] text-sm">
                이번 주 4층 무기를 맞춰보세요
              </p>
            </div>
          </div>
          <div className="text-[var(--color-text-muted)] text-sm">
            {currentToto ? (
              currentToto.status === 'open' ? (
                <span className="text-[var(--color-success)]">
                  🟢 {getTimeRemaining(currentToto.deadline)} • {currentToto.bets?.length || 0}명 참여
                </span>
              ) : (
                <span className="text-[var(--color-accent)]">🟡 결과 대기 중</span>
              )
            ) : (
              <span>진행 중인 토토 없음</span>
            )}
          </div>
        </Link>

        <Link 
          to="/awards"
          className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10 
                     hover:border-[var(--color-primary)] transition-colors group"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">🏆</span>
            <div>
              <h2 className="text-xl font-bold group-hover:text-[var(--color-primary)]">
                공대 시상식
              </h2>
              <p className="text-[var(--color-text-muted)] text-sm">
                오늘의 MVP와 광대를 뽑아주세요
              </p>
            </div>
          </div>
          <div className="text-[var(--color-text-muted)] text-sm">
            {currentAward ? (
              <span className="text-[var(--color-success)]">
                🟢 투표 진행 중 • {currentAward.votes?.length || 0}표
              </span>
            ) : (
              <span>진행 중인 투표 없음</span>
            )}
          </div>
        </Link>
      </section>

      {/* 최근 활동 */}
      <section className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📊</span> 최근 활동
        </h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                <span className="text-xl">{activity.type === 'toto' ? '🎰' : '🏆'}</span>
                <div className="flex-1">
                  {activity.type === 'toto' ? (
                    <>
                      <span className="font-medium">{getWeaponName(activity.weapon)}</span>
                      {activity.winners?.length > 0 && (
                        <span className="text-[var(--color-success)] ml-2">
                          - {activity.winners.join(', ')} 적중!
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-medium">시상식 완료</span>
                  )}
                </div>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {new Date(activity.date).toLocaleDateString('ko-KR')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[var(--color-text-muted)] text-center py-8">
            아직 기록이 없습니다. 첫 번째 토토나 투표를 시작해보세요!
          </div>
        )}
      </section>
    </div>
  )
}