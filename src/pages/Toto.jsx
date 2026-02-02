import { useState } from 'react'
import { useMembers } from '../hooks/useMembers'
import { useToto } from '../hooks/useToto'
import { WEAPONS, ROLE_NAMES } from '../lib/constants'

export default function Toto() {
  const { members, addMember } = useMembers()
  const { currentRound, bets, loading, createRound, placeBet, closeRound, finishRound } = useToto()

  const [selectedMember, setSelectedMember] = useState('')
  const [selectedWeapon, setSelectedWeapon] = useState('')
  const [newMemberName, setNewMemberName] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)
  const [deadlineDate, setDeadlineDate] = useState('')
  const [deadlineTime, setDeadlineTime] = useState('21:00')
  const [resultWeapon, setResultWeapon] = useState('')

  // 무기를 역할별로 그룹화
  const weaponsByRole = WEAPONS.reduce((acc, weapon) => {
    if (!acc[weapon.role]) acc[weapon.role] = []
    acc[weapon.role].push(weapon)
    return acc
  }, {})

  // 베팅 제출
  const handleBet = async () => {
    if (!selectedMember || !selectedWeapon) return alert('공대원과 무기를 선택해주세요')
    
    const { error } = await placeBet(selectedMember, selectedWeapon)
    if (error) {
      alert('베팅 실패: ' + error)
    } else {
      alert('베팅 완료!')
      setSelectedWeapon('')
    }
  }

  // 새 라운드 생성
  const handleCreateRound = async () => {
    if (!deadlineDate) return alert('마감일을 선택해주세요')
    
    const deadline = `${deadlineDate}T${deadlineTime}:00`
    const { error } = await createRound(deadlineDate, deadline)
    if (error) {
      alert('라운드 생성 실패: ' + error)
    } else {
      alert('새 라운드가 생성되었습니다!')
    }
  }

  // 결과 입력
  const handleFinish = async () => {
    if (!resultWeapon) return alert('드랍된 무기를 선택해주세요')
    
    const { error } = await finishRound(resultWeapon)
    if (error) {
      alert('결과 입력 실패: ' + error)
    } else {
      alert('결과가 입력되었습니다!')
    }
  }

  // 새 공대원 추가
  const handleAddMember = async () => {
    if (!newMemberName.trim()) return
    
    const { error } = await addMember(newMemberName.trim())
    if (error) {
      alert('추가 실패: ' + error)
    } else {
      setNewMemberName('')
    }
  }

  // 무기 이름 찾기
  const getWeaponName = (weaponId) => {
    const weapon = WEAPONS.find((w) => w.id === weaponId)
    return weapon ? `${weapon.name} (${weapon.job})` : weaponId
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--color-text-muted)]">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>🎰</span> 무기 토토
        </h1>
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="text-sm text-[var(--color-text-muted)] hover:text-white"
        >
          {showAdmin ? '관리 닫기' : '⚙️ 관리'}
        </button>
      </div>

      {/* 관리자 패널 */}
      {showAdmin && (
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-primary)]">
          <h2 className="font-bold mb-4">🔧 관리자 패널</h2>
          
          {/* 공대원 추가 */}
          <div className="mb-6">
            <h3 className="text-sm text-[var(--color-text-muted)] mb-2">공대원 추가</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="이름 입력"
                className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
              />
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-[var(--color-primary)] rounded-lg hover:opacity-80"
              >
                추가
              </button>
            </div>
          </div>

          {/* 라운드 관리 */}
          {!currentRound ? (
            <div>
              <h3 className="text-sm text-[var(--color-text-muted)] mb-2">새 라운드 생성</h3>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                />
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                />
                <button
                  onClick={handleCreateRound}
                  className="px-4 py-2 bg-[var(--color-success)] rounded-lg hover:opacity-80"
                >
                  라운드 생성
                </button>
              </div>
            </div>
          ) : currentRound.status === 'open' ? (
            <div>
              <h3 className="text-sm text-[var(--color-text-muted)] mb-2">라운드 마감</h3>
              <button
                onClick={closeRound}
                className="px-4 py-2 bg-[var(--color-accent)] rounded-lg hover:opacity-80"
              >
                베팅 마감하기
              </button>
            </div>
          ) : currentRound.status === 'closed' ? (
            <div>
              <h3 className="text-sm text-[var(--color-text-muted)] mb-2">결과 입력</h3>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={resultWeapon}
                  onChange={(e) => setResultWeapon(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                >
                  <option value="">무기 선택</option>
                  {WEAPONS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.job})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleFinish}
                  className="px-4 py-2 bg-[var(--color-success)] rounded-lg hover:opacity-80"
                >
                  결과 확정
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* 현재 라운드 상태 */}
      {currentRound ? (
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">
              {currentRound.status === 'open' && '🟢 베팅 진행 중'}
              {currentRound.status === 'closed' && '🟡 베팅 마감 (결과 대기)'}
              {currentRound.status === 'finished' && '✅ 결과 발표'}
            </h2>
            <span className="text-sm text-[var(--color-text-muted)]">
              마감: {new Date(currentRound.deadline).toLocaleString('ko-KR')}
            </span>
          </div>

          {/* 결과 발표 */}
          {currentRound.status === 'finished' && currentRound.actual_weapon && (
            <div className="mb-6 p-4 bg-[var(--color-accent)]/20 rounded-lg text-center">
              <p className="text-sm text-[var(--color-text-muted)] mb-1">이번 주 드랍 무기</p>
              <p className="text-xl font-bold text-[var(--color-accent)]">
                🎉 {getWeaponName(currentRound.actual_weapon)}
              </p>
            </div>
          )}

          {/* 베팅 폼 */}
          {currentRound.status === 'open' && (
            <div className="mb-6 p-4 bg-black/20 rounded-lg">
              <h3 className="font-medium mb-3">내 베팅</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                >
                  <option value="">공대원 선택</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <select
                  value={selectedWeapon}
                  onChange={(e) => setSelectedWeapon(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                >
                  <option value="">무기 선택</option>
                  {Object.entries(weaponsByRole).map(([role, weapons]) => (
                    <optgroup key={role} label={ROLE_NAMES[role]}>
                      {weapons.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.job})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button
                  onClick={handleBet}
                  className="px-6 py-2 bg-[var(--color-primary)] rounded-lg hover:opacity-80 font-medium"
                >
                  베팅!
                </button>
              </div>
            </div>
          )}

          {/* 베팅 현황 */}
          <div>
            <h3 className="font-medium mb-3">베팅 현황 ({bets.length}명)</h3>
            {bets.length > 0 ? (
              <div className="grid gap-2">
                {bets.map((bet) => (
                  <div
                    key={bet.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      currentRound.status === 'finished'
                        ? bet.weapon === currentRound.actual_weapon
                          ? 'bg-[var(--color-success)]/20 border border-[var(--color-success)]'
                          : 'bg-black/20'
                        : 'bg-black/20'
                    }`}
                  >
                    <span className="font-medium">{bet.member?.name}</span>
                    <span className="text-[var(--color-text-muted)]">
                      {getWeaponName(bet.weapon)}
                      {currentRound.status === 'finished' && bet.weapon === currentRound.actual_weapon && (
                        <span className="ml-2">✅</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-text-muted)] text-center py-4">
                아직 베팅이 없습니다
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
          <div className="text-center py-8">
            <p className="text-[var(--color-text-muted)] mb-4">
              진행 중인 토토가 없습니다
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              관리자 패널에서 새 라운드를 생성해주세요
            </p>
          </div>
        </div>
      )}
    </div>
  )
}