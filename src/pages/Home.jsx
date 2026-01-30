import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className='space-y-8'>
      {/* 히어로 섹션 */}
      <section className='text-center py-12'>
        <h1 className='text-4xl font-bold mb-4'>
          <span className='text-[var(--color-accent)]'>🌀 과중력</span> 공대 포털
        </h1>
        <p className='text-[var(--color-text-muted)] text-lg'>
          아르카디아: 헤비급 정복을 향해!
        </p>
      </section>

      {/* 퀵 링크 카드 */}
      <section className='grid md:grid-cols-2 gap-6'>
        <Link
          to="/toto"
          className='bg-[var(--color-surface)] rounded-xl p-6 border border-white/10
                     hover:border-[bar(--color-primary)] transition-colors group'
        >
          <div className='flex items-center gap-4 mb-4'>
            <span className='text-4xl'>🎰</span>
            <div>
              <h2 className='text-xl font-bold group-hover:text-[var(--color-primary)]'>
                무기 토토
              </h2>
              <p className='text-[var(--color-text-muted)] text-sm'>
                이번 주 4층 무기를 맞춰보세요
              </p>
            </div>
          </div>
          <div className='text-[var(--color-text-muted)] text-sm'>
            베팅 마감까지 <span className='text-[var(--color-accent)]'>준비 중</span>
          </div>
        </Link>

        <Link
          to="/awards"
          className='bg-[var(--color-surface)] rounded-xl p-6 border border-white/10 
                     hover:border-[var(--color-primary)] transition-colors group'
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
            투표 <span className="text-[var(--color-accent)]">준비 중</span>
          </div>
        </Link>
      </section>

      {/* 최근 활동 */}
      <section className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📊</span> 최근 활동
        </h2>
        <div className="text-[var(--color-text-muted)] text-center py-8">
          아직 기록이 없습니다. 첫 번째 토토나 투표를 시작해보세요!
        </div>
      </section>
    </div>
  )
}