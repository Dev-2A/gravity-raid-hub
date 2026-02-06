import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { AWARD_CATEGORIES, ACHIEVEMENTS } from "../lib/constants";

export default function HallOfFame() {
  const [activeTab, setActiveTab] = useState("fame");
  const [rankings, setRankings] = useState({});
  const [memberAchievements, setMemberAchievements] = useState({});
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 멤버 목록
      const { data: membersData } = await supabase.from("members").select("*");
      setMembers(membersData || []);

      // 모든 완료된 시상식 투표
      const { data: allVotes } = await supabase.from("award_votes").select(`
          category, nominee_id, session_id, comment,
          voter:members!award_votes_voter_id_fkey(id, name),
          nominee:members!award_votes_nominee_id_fkey(id, name)
        `);

      // 완료된 세션 ID 가져오기
      const { data: finishedSessions } = await supabase
        .from("award_sessions")
        .select("id")
        .eq("status", "finished");

      const finishedIds = new Set((finishedSessions || []).map((s) => s.id));

      // 완료된 세션의 투표만 필터
      const finishedVotes = (allVotes || []).filter((v) =>
        finishedIds.has(v.session_id),
      );

      // 세션+카테고리별 1등 계산
      const sessionCatMap = {};
      finishedVotes.forEach((v) => {
        const key = `${v.session_id}_${v.category}`;
        if (!sessionCatMap[key]) sessionCatMap[key] = {};
        if (!sessionCatMap[key][v.nominee_id]) {
          sessionCatMap[key][v.nominee_id] = {
            nominee: v.nominee,
            count: 0,
            comments: [],
          };
        }
        sessionCatMap[key][v.nominee_id].count++;
        if (v.comment) {
          sessionCatMap[key][v.nominee_id].comments.push({
            voter: v.voter?.name || "?",
            comment: v.comment,
          });
        }
      });

      // 카테고리별 역대 1등 수상 횟수 집계
      const categoryRankings = {};
      AWARD_CATEGORIES.forEach((cat) => {
        categoryRankings[cat.id] = {};
      });

      Object.entries(sessionCatMap).forEach(([key, nominees]) => {
        const category = key.split("_").pop();
        const sorted = Object.entries(nominees).sort(
          (a, b) => b[1].count - a[1].count,
        );
        if (sorted.length > 0) {
          const winnerId = sorted[0][0];
          const winnerData = sorted[0][1];

          if (!categoryRankings[category]) return;
          if (!categoryRankings[category][winnerId]) {
            categoryRankings[category][winnerId] = {
              nominee: winnerData.nominee,
              wins: 0,
              bestComments: [],
            };
          }
          categoryRankings[category][winnerId].wins++;
          // 베스트 코멘트 수집 (최대 3개)
          winnerData.comments.forEach((c) => {
            if (categoryRankings[category][winnerId].bestComments.length < 3) {
              categoryRankings[category][winnerId].bestComments.push(c);
            }
          });
        }
      });

      // 정렬
      const sortedRankings = {};
      Object.entries(categoryRankings).forEach(([cat, members]) => {
        sortedRankings[cat] = Object.values(members).sort(
          (a, b) => b.wins - a.wins,
        );
      });
      setRankings(sortedRankings);

      // 업적 불러오기
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*, member:members(id, name)");

      const achByMember = {};
      (achievementsData || []).forEach((a) => {
        if (!achByMember[a.member_id]) achByMember[a.member_id] = [];
        achByMember[a.member_id].push(a);
      });
      setMemberAchievements(achByMember);

      setLoading(false);
    };

    fetchData();
  }, []);

  // 명예의 전당 카테고리 (좋은 것들)
  const fameCategories = AWARD_CATEGORIES.filter((c) =>
    ["mvp", "ghost"].includes(c.id),
  );

  // 불명예의 전당 카테고리 (웃긴 것들)
  const shameCategories = AWARD_CATEGORIES.filter((c) =>
    ["wipe", "clown", "floor", "actor"].includes(c.id),
  );

  // 메달 이모지
  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}위`;
  };

  // 업적 정보 찾기
  const getAchievementInfo = (key) => {
    return ACHIEVEMENTS.find((a) => a.key === key);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--color-text-muted)]">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>👑</span> 명예의 전당
        </h1>
        <span className="text-[var(--color-text-muted)] text-sm">
          과중력 공대의 전설들
        </span>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("fame")}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === "fame"
              ? "bg-[var(--color-accent)] text-black font-bold"
              : "text-[var(--color-text-muted)] hover:bg-white/5"
          }`}
        >
          ⭐ 명예의 전당
        </button>
        <button
          onClick={() => setActiveTab("shame")}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === "shame"
              ? "bg-[var(--color-danger)] text-white font-bold"
              : "text-[var(--color-text-muted)] hover:bg-white/5"
          }`}
        >
          💀 불명예의 전당
        </button>
        <button
          onClick={() => setActiveTab("achievements")}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === "achievements"
              ? "bg-[var(--color-primary)] text-white font-bold"
              : "text-[var(--color-text-muted)] hover:bg-white/5"
          }`}
        >
          🏅 업적
        </button>
      </div>

      {/* 명예의 전당 */}
      {activeTab === "fame" && (
        <div className="space-y-6">
          {fameCategories.map((cat) => {
            const ranked = rankings[cat.id] || [];
            return (
              <div
                key={cat.id}
                className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-accent)]/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{cat.emoji}</span>
                  <div>
                    <h2 className="text-lg font-bold">{cat.name}</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {cat.desc}
                    </p>
                  </div>
                </div>

                {ranked.length > 0 ? (
                  <div className="space-y-3">
                    {ranked.map((r, idx) => (
                      <div key={r.nominee.id}>
                        <div
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            idx === 0
                              ? "bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40"
                              : "bg-black/20"
                          }`}
                        >
                          <span
                            className={idx === 0 ? "font-bold text-lg" : ""}
                          >
                            {getMedal(idx)} {r.nominee.name}
                          </span>
                          <span className="text-[var(--color-accent)] font-bold">
                            {r.wins}회 수상
                          </span>
                        </div>

                        {/* 베스트 코멘트 */}
                        {r.bestComments.length > 0 && idx === 0 && (
                          <div className="ml-8 mt-1 space-y-1">
                            {r.bestComments.map((c, cIdx) => (
                              <div
                                key={cIdx}
                                className="text-sm text-[var(--color-text-muted)]"
                              >
                                💬 "{c.comment}" — {c.voter}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-text-muted)] text-center py-4">
                    아직 기록이 없습니다
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 불명예의 전당 */}
      {activeTab === "shame" && (
        <div className="space-y-6">
          {shameCategories.map((cat) => {
            const ranked = rankings[cat.id] || [];
            return (
              <div
                key={cat.id}
                className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-danger)]/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{cat.emoji}</span>
                  <div>
                    <h2 className="text-lg font-bold">{cat.name}</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {cat.desc}
                    </p>
                  </div>
                </div>

                {ranked.length > 0 ? (
                  <div className="space-y-3">
                    {ranked.map((r, idx) => (
                      <div key={r.nominee.id}>
                        <div
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            idx === 0
                              ? "bg-[var(--color-danger)]/20 border border-[var(--color-danger)]/40"
                              : "bg-black/20"
                          }`}
                        >
                          <span
                            className={idx === 0 ? "font-bold text-lg" : ""}
                          >
                            {getMedal(idx)} {r.nominee.name}
                          </span>
                          <span className="text-[var(--color-danger)] font-bold">
                            {r.wins}회 수상
                          </span>
                        </div>

                        {/* 베스트 코멘트 */}
                        {r.bestComments.length > 0 && idx === 0 && (
                          <div className="ml-8 mt-1 space-y-1">
                            {r.bestComments.map((c, cIdx) => (
                              <div
                                key={cIdx}
                                className="text-sm text-[var(--color-text-muted)]"
                              >
                                💬 "{c.comment}" — {c.voter}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-text-muted)] text-center py-4">
                    아직 기록이 없습니다
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 업적 */}
      {activeTab === "achievements" && (
        <div className="space-y-6">
          {members.map((member) => {
            const memberAchs = memberAchievements[member.id] || [];
            if (memberAchs.length === 0) return null;

            return (
              <div
                key={member.id}
                className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10"
              >
                <h3 className="font-bold text-lg mb-3">{member.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {memberAchs.map((ach) => {
                    const info = getAchievementInfo(ach.achievement_key);
                    if (!info) return null;
                    return (
                      <div
                        key={ach.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30"
                        title={info.desc}
                      >
                        <span>{info.emoji}</span>
                        <span className="text-sm font-medium">{info.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* 전체 업적 목록 */}
          <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
            <h3 className="font-bold text-lg mb-4">📋 전체 업적 목록</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {ACHIEVEMENTS.map((ach) => {
                // 누군가 달성했는지 확인
                const achieved = Object.values(memberAchievements)
                  .flat()
                  .some((a) => a.achievement_key === ach.key);
                return (
                  <div
                    key={ach.key}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      achieved ? "bg-black/20" : "bg-black/10 opacity-50"
                    }`}
                  >
                    <span className="text-xl">
                      {ach.hidden && !achieved ? "❓" : ach.emoji}
                    </span>
                    <div>
                      <p className="font-medium text-sm">
                        {ach.hidden && !achieved ? "???" : ach.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {ach.hidden && !achieved ? "히든 업적" : ach.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
