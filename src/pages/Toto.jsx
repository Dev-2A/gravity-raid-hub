export default function Toto() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>🎰</span> 무기 토토
        </h1>
        <span className="text-[var(--color-text-muted)] text-sm">
          4층 무기 예측 베팅
        </span>
      </div>

      {/* 현재 토토 상태 */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
        <div className="text-center py-8">
          <p className="text-[var(--color-text-muted)] mb-4">
            🚧 토토 시스템 준비 중입니다
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            곧 베팅을 시작할 수 있어요!
          </p>
        </div>
      </div>

      {/* 역대 기록 미리보기 */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <span>📈</span> 적중률 랭킹
        </h2>
        <div className="text-[var(--color-text-muted)] text-center py-4">
          아직 기록이 없습니다
        </div>
      </div>
    </div>
  )
}