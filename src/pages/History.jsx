import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { WEAPONS, AWARD_CATEGORIES } from '../lib/constants'

export default function History() {
  const [activeTab, setActiveTab] = useState('toto')
  const [totoHistory, setTotoHistory] = useState([])
  const [awardHistory, setAwardHistory] = useState([])
  const [loading, setLoading] = useState(true)

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

    // 각 카테고리별 1등만 추출
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
              const winners = round.bets.filter((b) => b.weapon === round.actual_weapon)
              return (
                <div
                  key={round.id}
                  className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">
                      {new Date(round.week_start).toLocaleDateString('ko-KR')} 주차
                    </h3>
                    <span className="text-[var(--color-accent)]">
                      {getWeaponName(round.actual_weapon)}
                    </span>
                  </div>
                  
                  <div className="grid gap-2">
                    {round.bets.map((bet) => (
                      <div
                        key={bet.id}
                        className={`flex justify-between items-center p-2 rounded-lg ${
                          bet.weapon === round.actual_weapon
                            ? 'bg-[var(--color-success)]/20'
                            : 'bg-black/20'
                        }`}
                      >
                        <span>{bet.member?.name}</span>
                        <span className="text-[var(--color-text-muted)]">
                          {getWeaponName(bet.weapon)}
                          {bet.weapon === round.actual_weapon && ' ✅'}
                        </span>
                      </div>
                    ))}
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