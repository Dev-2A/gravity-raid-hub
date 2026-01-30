export default function Awards() {
  const categories = [
    { id: 'wipe', emoji: '🪦', name: '전멸의 주범', desc: '오늘 전멸 원인 1등' },
    { id: 'clown', emoji: '🤡', name: '공대의 광대', desc: '제일 웃긴 행동/발언' },
    { id: 'ghost', emoji: '👻', name: '생전 고인', desc: '죽기 직전 개쩌는 플레이' },
    { id: 'mvp', emoji: '🛡️', name: '진짜 MVP', desc: '오늘 캐리한 사람' },
    { id: 'floor', emoji: '💀', name: '바닥 감정사', desc: '바닥 제일 많이 본 사람' },
    { id: 'actor', emoji: '🎭', name: '명연기상', desc: '"아 나 버프 눌렀는데?"' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>🏆</span> 공대 시상식
        </h1>
        <span className="text-[var(--color-text-muted)] text-sm">
          오늘의 MVP와 광대를 뽑아주세요
        </span>
      </div>

      {/* 투표 카테고리 */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
        <h2 className="font-bold mb-4">투표 카테고리</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              className="p-4 rounded-lg bg-black/20 border border-white/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="font-medium">{cat.name}</span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 투표 상태 */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
        <div className="text-center py-8">
          <p className="text-[var(--color-text-muted)] mb-4">
            🚧 투표 시스템 준비 중입니다
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            곧 투표를 시작할 수 있어요!
          </p>
        </div>
      </div>

      {/* 역대 수상 기록 */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <span>🏅</span> 명예의 전당
        </h2>
        <div className="text-[var(--color-text-muted)] text-center py-4">
          아직 기록이 없습니다
        </div>
      </div>
    </div>
  )
}