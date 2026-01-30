export default function History() {
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
        <button className="px-4 py-2 rounded-t-lg bg-[var(--color-primary)] text-white">
          토토 기록
        </button>
        <button className="px-4 py-2 rounded-t-lg text-[var(--color-text-muted)] hover:bg-white/5">
          시상식 기록
        </button>
        <button className="px-4 py-2 rounded-t-lg text-[var(--color-text-muted)] hover:bg-white/5">
          통계
        </button>
      </div>

      {/* 기록 리스트 */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
        <div className="text-[var(--color-text-muted)] text-center py-8">
          아직 기록이 없습니다
        </div>
      </div>
    </div>
  )
}