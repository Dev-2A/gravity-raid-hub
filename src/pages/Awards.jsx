import { useState } from "react";
import { useMembers } from "../hooks/useMembers";
import { useAwards } from "../hooks/useAwards";
import { useAchievements } from "../hooks/useAchievements";
import { AWARD_CATEGORIES, ACHIEVEMENTS } from "../lib/constants";

export default function Awards() {
  const { members } = useMembers();
  const {
    currentSession,
    votes,
    loading,
    createSession,
    vote,
    finishSession,
    getResults,
  } = useAwards();
  const { checkAwardAchievements } = useAchievements();

  const [newAchievementAlert, setNewAchievementAlert] = useState(null);
  const [selectedVoter, setSelectedVoter] = useState("");
  const [selectedVotes, setSelectedVotes] = useState({});
  const [comments, setComments] = useState({});
  const [showAdmin, setShowAdmin] = useState(false);
  const [raidDate, setRaidDate] = useState("");

  // 투표 선택 변경
  const handleVoteChange = (category, nomineeId) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [category]: nomineeId,
    }));
  };

  // 코멘트 변경
  const handleCommentChange = (category, text) => {
    setComments((prev) => ({
      ...prev,
      [category]: text,
    }));
  };

  // 투표 제출
  const handleSubmitVotes = async () => {
    if (!selectedVoter) return alert("투표자를 선택해주세요");

    const entries = Object.entries(selectedVotes);
    if (entries.length === 0) return alert("최소 한 개 이상 투표해주세요");

    for (const [category, nomineeId] of entries) {
      const comment = comments[category] || null;
      const { error } = await vote(selectedVoter, category, nomineeId, comment);
      if (error) {
        alert(`투표 실패 (${category}): ${error}`);
        return;
      }
    }

    alert("투표가 완료되었습니다!");
    setSelectedVotes({});
    setComments({});
  };

  // 새 세션 생성
  const handleCreateSession = async () => {
    if (!raidDate) return alert("레이드 날짜를 선택해주세요");

    const { error } = await createSession(raidDate);
    if (error) {
      alert("세션 생성 실패: " + error);
    } else {
      alert("새 시상식이 생성되었습니다!");
    }
  };

  // 투표 종료
  const handleFinish = async () => {
    if (!confirm("시상식을 마감하시겠습니까?")) return;
    const { error } = await finishSession();
    if (error) {
      alert("마감 실패: " + error);
      return;
    }

    // 업적 체크: 모든 멤버 확인
    try {
      const newAchievements = [];
      for (const member of members) {
        const achieved = await checkAwardAchievements(member.id);
        if (achieved.length > 0) {
          newAchievements.push({
            memberName: member.name,
            achievements: achieved,
          });
        }
      }
      if (newAchievements.length > 0) {
        const messages = newAchievements.map((na) => {
          const achNames = na.achievements.map((key) => {
            const info = ACHIEVEMENTS.find((a) => a.key === key);
            return info ? `${info.emoji} ${info.name}` : key;
          });
          return `${na.memberName}: ${achNames.join(", ")}`;
        });
        setNewAchievementAlert(messages);
      }
    } catch (e) {
      console.error("업적 체크 실패:", e);
    }
  };

  // 내가 이미 투표한 항목 찾기
  const getMyVotes = () => {
    if (!selectedVoter) return {};
    const myVotes = {};
    votes
      .filter((v) => v.voter_id === selectedVoter)
      .forEach((v) => {
        myVotes[v.category] = v.nominee_id;
      });
    return myVotes;
  };

  // 카테고리별 코멘트 모아보기
  const getCategoryComments = (categoryId) => {
    return votes
      .filter((v) => v.category === categoryId && v.comment)
      .map((v) => ({
        voter: v.voter?.name || "익명",
        nominee: v.nominee?.name || "?",
        comment: v.comment,
      }));
  };

  const myVotes = getMyVotes();
  const results = getResults();

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--color-text-muted)]">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 업적 달성 알림 */}
      {newAchievementAlert && (
        <div className="bg-[var(--color-accent)]/20 border border-[var(--color-accent)] rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-[var(--color-accent)] mb-2">
                🎉 새 업적 달성!
              </h3>
              {newAchievementAlert.map((msg, idx) => (
                <p key={idx} className="text-sm">
                  {msg}
                </p>
              ))}
            </div>
            <button
              onClick={() => setNewAchievementAlert(null)}
              className="text-[var(--color-text-muted)] hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>🏆</span> 공대 시상식
        </h1>
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="text-sm text-[var(--color-text-muted)] hover:text-white"
        >
          {showAdmin ? "관리 닫기" : "⚙️ 관리"}
        </button>
      </div>

      {/* 관리자 패널 */}
      {showAdmin && (
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-primary)]">
          <h2 className="font-bold mb-4">🔧 관리자 패널</h2>

          {!currentSession ? (
            <div>
              <h3 className="text-sm text-[var(--color-text-muted)] mb-2">
                새 시상식 생성
              </h3>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={raidDate}
                  onChange={(e) => setRaidDate(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                />
                <button
                  onClick={handleCreateSession}
                  className="px-4 py-2 bg-[var(--color-success)] rounded-lg hover:opacity-80"
                >
                  시상식 생성
                </button>
              </div>
            </div>
          ) : currentSession.status === "voting" ? (
            <div>
              <h3 className="text-sm text-[var(--color-text-muted)] mb-2">
                투표 종료
              </h3>
              <button
                onClick={handleFinish}
                className="px-4 py-2 bg-[var(--color-danger)] rounded-lg hover:opacity-80"
              >
                투표 종료하기
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* 현재 세션 */}
      {currentSession ? (
        <>
          {/* 세션 상태 */}
          <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">
                {currentSession.status === "voting" && "🟢 투표 진행 중"}
                {currentSession.status === "finished" && "✅ 투표 종료"}
              </h2>
              <span className="text-sm text-[var(--color-text-muted)]">
                레이드 날짜:{" "}
                {new Date(currentSession.raid_date).toLocaleDateString("ko-KR")}
              </span>
            </div>

            {/* 투표자 선택 */}
            {currentSession.status === "voting" && (
              <div className="mb-4">
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                  투표자 선택
                </label>
                <select
                  value={selectedVoter}
                  onChange={(e) => setSelectedVoter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                >
                  <option value="">공대원 선택</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 카테고리별 투표 */}
          <div className="grid gap-4">
            {AWARD_CATEGORIES.map((cat) => {
              const categoryComments = getCategoryComments(cat.id);

              return (
                <div
                  key={cat.id}
                  className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{cat.emoji}</span>
                    <div>
                      <h3 className="font-bold">{cat.name}</h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  {/* 투표 진행 중 */}
                  {currentSession.status === "voting" && selectedVoter && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {members
                          .filter((m) => m.id !== selectedVoter)
                          .map((m) => {
                            const isSelected =
                              selectedVotes[cat.id] === m.id ||
                              myVotes[cat.id] === m.id;
                            return (
                              <button
                                key={m.id}
                                onClick={() => handleVoteChange(cat.id, m.id)}
                                className={`p-2 rounded-lg text-sm transition-colors ${
                                  isSelected
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "bg-black/20 hover:bg-black/40"
                                }`}
                              >
                                {m.name}
                              </button>
                            );
                          })}
                      </div>

                      {/* 코멘트 입력 */}
                      {(selectedVotes[cat.id] || myVotes[cat.id]) && (
                        <input
                          type="text"
                          value={comments[cat.id] || ""}
                          onChange={(e) =>
                            handleCommentChange(cat.id, e.target.value)
                          }
                          placeholder="한 줄 코멘트 (선택사항)"
                          maxLength={100}
                          className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none text-sm"
                        />
                      )}
                    </div>
                  )}

                  {/* 결과 표시 */}
                  {(currentSession.status === "finished" || votes.length > 0) &&
                    results[cat.id] && (
                      <div className="space-y-2">
                        {results[cat.id].map((r, idx) => (
                          <div
                            key={r.nominee.id}
                            className={`flex justify-between items-center p-2 rounded-lg ${
                              idx === 0
                                ? "bg-[var(--color-accent)]/20"
                                : "bg-black/20"
                            }`}
                          >
                            <span className={idx === 0 ? "font-bold" : ""}>
                              {idx === 0 && "👑 "}
                              {r.nominee.name}
                            </span>
                            <span className="text-[var(--color-text-muted)]">
                              {r.count}표
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* 코멘트 표시 */}
                  {categoryComments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-[var(--color-text-muted)] mb-2">
                        💬 코멘트
                      </p>
                      <div className="space-y-1">
                        {categoryComments.map((c, idx) => (
                          <div
                            key={idx}
                            className="text-sm bg-black/20 rounded-lg px-3 py-2"
                          >
                            <span className="text-[var(--color-text-muted)]">
                              {c.voter}:
                            </span>{" "}
                            <span>"{c.comment}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSession.status === "voting" && !results[cat.id] && (
                    <p className="text-[var(--color-text-muted)] text-sm">
                      아직 투표가 없습니다
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 투표 제출 버튼 */}
          {currentSession.status === "voting" && selectedVoter && (
            <button
              onClick={handleSubmitVotes}
              className="w-full py-3 bg-[var(--color-primary)] rounded-xl font-bold hover:opacity-80"
            >
              투표 제출하기
            </button>
          )}
        </>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
          <div className="text-center py-8">
            <p className="text-[var(--color-text-muted)] mb-4">
              진행 중인 시상식이 없습니다
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              관리자 패널에서 새 시상식을 생성해주세요
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
