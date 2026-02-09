import { useState } from "react";
import { useMembers } from "../hooks/useMembers";
import { useStats } from "../hooks/useStats";
import { TOTO_TYPES, AWARD_CATEGORIES, ACHIEVEMENTS } from "../lib/constants";

export default function Profile() {
  const { members } = useMembers();
  const { stats, loading, fetchStats } = useStats();
  const [selectedMember, setSelectedMember] = useState("");

  const handleSelect = (memberId) => {
    setSelectedMember(memberId);
    if (memberId) {
      fetchStats(memberId, members);
    }
  };

  // 적중률에 따른 칭호
  const getTitle = (rate, totalBets) => {
    if (totalBets === 0) return { emoji: "🌱", title: "새싹 도박꾼" };
    if (rate >= 80) return { emoji: "🔮", title: "예언자" };
    if (rate >= 60) return { emoji: "🎯", title: "신궁" };
    if (rate >= 40) return { emoji: "🎲", title: "도박꾼" };
    if (rate >= 20) return { emoji: "🌀", title: "역예언자" };
    return { emoji: "🕳️", title: "공대의 의의" };
  };

  // 적중률 바 색상
  const getRateColor = (rate) => {
    if (rate >= 60) return "var(--color-accent)";
    if (rate >= 40) return "var(--color-primary)";
    if (rate >= 20) return "var(--color-warning, #f59e0b)";
    return "var(--color-danger)";
  };

  const member = members.find((m) => m.id === selectedMember);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <span>📊</span> 개인 통계
      </h1>

      {/* 멤버 선택 */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m.id)}
            className={`p-3 rounded-xl text-center transition-all ${
              selectedMember === m.id
                ? "bg-[var(--color-accent)] text-black font-bold scale-105"
                : "bg-[var(--color-surface)] hover:bg-white/10"
            }`}
          >
            <div className="text-lg">{m.name}</div>
          </button>
        ))}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          통계 계산 중...
        </div>
      )}

      {/* 통계 표시 */}
      {stats && member && !loading && (
        <div className="space-y-6">
          {/* 프로필 카드 */}
          <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-accent)]/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">
                {getTitle(stats.toto.hitRate, stats.toto.totalBets).emoji}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{member.name}</h2>
                <p className="text-[var(--color-accent)]">
                  {getTitle(stats.toto.hitRate, stats.toto.totalBets).title}
                </p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-3xl font-bold text-[var(--color-accent)]">
                  {stats.toto.hitRate}%
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  토토 적중률
                </div>
              </div>
            </div>

            {/* 요약 수치 */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xl font-bold">{stats.toto.totalBets}</div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  토토 참여
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xl font-bold">
                  {stats.awards.totalWins}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  시상식 수상
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xl font-bold">
                  {stats.achievements.length}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  업적 달성
                </div>
              </div>
            </div>
          </div>

          {/* 🎰 토토 상세 */}
          <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
            <h3 className="font-bold text-lg mb-4">🎰 토토 통계</h3>

            {/* 전체 적중률 바 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>전체 적중률</span>
                <span>
                  {stats.toto.totalHits}/{stats.toto.totalBets} (
                  {stats.toto.hitRate}%)
                </span>
              </div>
              <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${stats.toto.hitRate}%`,
                    backgroundColor: getRateColor(stats.toto.hitRate),
                  }}
                />
              </div>
            </div>

            {/* 유형별 통계 */}
            <div className="space-y-2 mb-4">
              {TOTO_TYPES.map((type) => {
                const ts = stats.toto.typeStats[type.id];
                if (!ts || ts.total === 0) return null;
                return (
                  <div key={type.id} className="flex items-center gap-3">
                    <span className="w-6 text-center">{type.emoji}</span>
                    <span className="text-sm flex-1">{type.name}</span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {ts.hits}/{ts.total}
                    </span>
                    <div className="w-20 h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${ts.rate}%`,
                          backgroundColor: getRateColor(ts.rate),
                        }}
                      />
                    </div>
                    <span className="text-sm w-10 text-right font-mono">
                      {ts.rate}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 연속 기록 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold">
                  {stats.toto.currentStreak > 0 && (
                    <>
                      {stats.toto.currentStreakType === "hit" ? "🔥" : "❄️"}
                      {stats.toto.currentStreak}연속
                    </>
                  )}
                  {stats.toto.currentStreak === 0 && "-"}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  현재 연속
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-[var(--color-accent)]">
                  🔥 {stats.toto.bestHitStreak}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  최고 연속 적중
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-[var(--color-danger)]">
                  ❄️ {stats.toto.bestMissStreak}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  최고 연속 꽝
                </div>
              </div>
            </div>

            {/* 최근 베팅 */}
            {stats.toto.recentBets.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-bold text-[var(--color-text-muted)] mb-2">
                  최근 베팅
                </h4>
                <div className="space-y-1">
                  {stats.toto.recentBets.map((bet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm py-1 px-2 rounded bg-black/10"
                    >
                      <span>{bet.type}</span>
                      <span className="flex-1">{bet.betValue}</span>
                      {bet.status === "finished" && (
                        <span
                          className={
                            bet.correct
                              ? "text-[var(--color-accent)]"
                              : "text-[var(--color-danger)]"
                          }
                        >
                          {bet.correct ? "✅ 적중" : "❌ 꽝"}
                        </span>
                      )}
                      {bet.status === "open" && (
                        <span className="text-[var(--color-text-muted)]">
                          ⏳ 진행중
                        </span>
                      )}
                      {bet.status === "closed" && (
                        <span className="text-[var(--color-text-muted)]">
                          🔒 마감
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 🏆 시상식 통계 */}
          <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
            <h3 className="font-bold text-lg mb-4">🏆 시상식 통계</h3>

            {stats.awards.totalWins > 0 ? (
              <>
                {/* 카테고리별 수상 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {AWARD_CATEGORIES.map((cat) => {
                    const count = stats.awards.wins[cat.id] || 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={cat.id}
                        className={`p-3 rounded-lg text-center ${
                          cat.id === stats.awards.topAward
                            ? "bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40"
                            : "bg-black/20"
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.emoji}</div>
                        <div className="text-sm font-bold">{cat.name}</div>
                        <div className="text-lg font-bold mt-1">{count}회</div>
                      </div>
                    );
                  })}
                </div>

                {/* 받은 코멘트 */}
                {stats.awards.receivedComments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-text-muted)] mb-2">
                      💬 받은 코멘트
                    </h4>
                    <div className="space-y-2">
                      {stats.awards.receivedComments.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm py-2 px-3 rounded-lg bg-black/10"
                        >
                          <span>{c.category}</span>
                          <div className="flex-1">
                            <span className="text-[var(--color-text-muted)]">
                              "{c.comment}"
                            </span>
                            <span className="text-[var(--color-text-muted)] ml-2">
                              — {c.voter}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[var(--color-text-muted)] text-center py-4">
                아직 수상 기록이 없습니다
              </p>
            )}
          </div>

          {/* 🏅 업적 */}
          <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
            <h3 className="font-bold text-lg mb-4">🏅 달성 업적</h3>

            {stats.achievements.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.achievements.map((ach) => {
                  const info = ACHIEVEMENTS.find(
                    (a) => a.key === ach.achievement_key,
                  );
                  if (!info) return null;
                  return (
                    <div
                      key={ach.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30"
                      title={info.desc}
                    >
                      <span>{info.emoji}</span>
                      <div>
                        <span className="text-sm font-medium">{info.name}</span>
                        <span className="text-xs text-[var(--color-text-muted)] ml-2">
                          {info.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[var(--color-text-muted)] text-center py-4">
                아직 달성한 업적이 없습니다
              </p>
            )}
          </div>
        </div>
      )}

      {/* 선택 안 한 상태 */}
      {!selectedMember && !loading && (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <div className="text-5xl mb-4">👆</div>
          <p>멤버를 선택해서 통계를 확인해보세요!</p>
        </div>
      )}
    </div>
  );
}
