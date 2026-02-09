import { useState } from "react";
import { useMembers } from "../hooks/useMembers";
import { useTimeline } from "../hooks/useTimeline";

const REACTION_EMOJIS = ["😂", "🔥", "💀", "👏", "😭"];

export default function Timeline() {
  const { members } = useMembers();
  const { posts, loading, addPost, deletePost, toggleReaction } = useTimeline();

  const [selectedMember, setSelectedMember] = useState("");
  const [message, setMessage] = useState("");
  const [reactionMember, setReactionMember] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 글 작성
  const handleSubmit = async () => {
    if (!selectedMember) return alert("멤버를 선택해주세요");
    if (!message.trim()) return alert("메시지를 입력해주세요");

    setSubmitting(true);
    const { error } = await addPost(selectedMember, message);
    setSubmitting(false);

    if (error) {
      alert("작성 실패: " + error);
    } else {
      setMessage("");
    }
  };

  // 리액션
  const handleReaction = async (timelineId, emoji) => {
    if (!reactionMember) return alert("리액션할 멤버를 먼저 선택해주세요");
    await toggleReaction(timelineId, reactionMember, emoji);
  };

  // 리액션 그룹핑 (이모지별 카운트 + 누가 눌렀는지)
  const groupReactions = (reactions) => {
    const grouped = {};
    reactions.forEach((r) => {
      if (!grouped[r.emoji]) grouped[r.emoji] = [];
      grouped[r.emoji].push(r.member?.name || "?");
    });
    return grouped;
  };

  // 날짜 포맷
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  // 날짜별 그룹핑
  const groupByDate = (posts) => {
    const groups = {};
    posts.forEach((post) => {
      const date = new Date(post.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(post);
    });
    return groups;
  };

  const dateGroups = groupByDate(posts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>💬</span> 타임라인
        </h1>
        <span className="text-[var(--color-text-muted)] text-sm">
          레이드 후 한마디
        </span>
      </div>

      {/* 글 작성 */}
      <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-white/10">
        <div className="flex gap-2 mb-3 flex-wrap">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMember(m.id)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedMember === m.id
                  ? "bg-[var(--color-accent)] text-black font-bold"
                  : "bg-black/20 hover:bg-white/10"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="오늘 레이드 한마디... (최대 100자)"
            maxLength={100}
            className="flex-1 px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-accent)]"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedMember || !message.trim()}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-black font-bold hover:opacity-90 disabled:opacity-40 transition-all whitespace-nowrap"
          >
            {submitting ? "..." : "작성"}
          </button>
        </div>
        <div className="text-right text-xs text-[var(--color-text-muted)] mt-1">
          {message.length}/100
        </div>
      </div>

      {/* 리액션용 멤버 선택 */}
      <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-white/10">
        <p className="text-sm text-[var(--color-text-muted)] mb-2">
          리액션할 멤버 선택:
        </p>
        <div className="flex gap-2 flex-wrap">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setReactionMember(m.id)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                reactionMember === m.id
                  ? "bg-[var(--color-primary)] text-white font-bold"
                  : "bg-black/20 hover:bg-white/10"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* 타임라인 */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          로딩 중...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <div className="text-5xl mb-4">🤫</div>
          <p>아직 아무도 글을 남기지 않았어요</p>
          <p className="text-sm mt-1">첫 번째 한마디를 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(dateGroups).map(([date, datePosts]) => (
            <div key={date}>
              {/* 날짜 구분선 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                  {date}
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* 포스트 목록 */}
              <div className="space-y-3">
                {datePosts.map((post) => {
                  const grouped = groupReactions(post.reactions);

                  return (
                    <div
                      key={post.id}
                      className="bg-[var(--color-surface)] rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      {/* 헤더 */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[var(--color-accent)]">
                          {post.member?.name || "?"}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {formatDate(post.created_at)}
                        </span>
                      </div>

                      {/* 메시지 */}
                      <p className="text-white mb-3">{post.message}</p>

                      {/* 리액션 표시 + 버튼 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 기존 리액션 */}
                        {Object.entries(grouped).map(([emoji, names]) => {
                          const isMine =
                            reactionMember &&
                            post.reactions.some(
                              (r) =>
                                r.emoji === emoji &&
                                r.member_id === reactionMember,
                            );
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(post.id, emoji)}
                              title={names.join(", ")}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
                                isMine
                                  ? "bg-[var(--color-primary)]/30 border border-[var(--color-primary)]"
                                  : "bg-black/20 hover:bg-white/10 border border-transparent"
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-xs">{names.length}</span>
                            </button>
                          );
                        })}

                        {/* 리액션 추가 버튼 */}
                        <div className="flex gap-1 ml-1">
                          {REACTION_EMOJIS.filter((e) => !grouped[e]).map(
                            (emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(post.id, emoji)}
                                className="w-7 h-7 rounded-full text-sm opacity-30 hover:opacity-100 hover:bg-white/10 transition-all"
                              >
                                {emoji}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
