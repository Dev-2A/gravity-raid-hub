import { useState } from "react";
import { supabase } from "../lib/supabase";
import { TOTO_TYPES, AWARD_CATEGORIES } from "../lib/constants";

export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async (memberId, members = []) => {
    setLoading(true);

    try {
      // 1) 토토 베팅 내역
      const { data: allBets } = await supabase
        .from("toto_bets")
        .select("*, round:toto_rounds(*)")
        .eq("member_id", memberId);

      const finishedBets = (allBets || []).filter(
        (b) => b.round?.status === "finished",
      );

      // 적중 판정
      const results = finishedBets.map((bet) => {
        const round = bet.round;
        const betVal = String(bet.bet_value || bet.weapon || "");
        const actualVal = String(
          round.actual_result || round.actual_weapon || "",
        );

        let correct = false;
        if (
          round.toto_type === "wipe_count" ||
          round.toto_type === "total_deaths"
        ) {
          correct = betVal === actualVal;
        } else {
          correct = betVal.toLowerCase() === actualVal.toLowerCase();
        }

        return { ...bet, correct, totoType: round.toto_type };
      });

      const totalBets = results.length;
      const totalHits = results.filter((r) => r.correct).length;
      const hitRate =
        totalBets > 0 ? Math.round((totalHits / totalBets) * 100) : 0;

      // 유형별 통계
      const typeStats = {};
      TOTO_TYPES.forEach((t) => {
        const typeBets = results.filter((r) => r.totoType === t.id);
        const typeHits = typeBets.filter((r) => r.correct);
        typeStats[t.id] = {
          total: typeBets.length,
          hits: typeHits.length,
          rate:
            typeBets.length > 0
              ? Math.round((typeHits.length / typeBets.length) * 100)
              : 0,
        };
      });

      // 연속 기록 계산
      let currentStreak = 0;
      let currentStreakType = null; // 'hit' or 'miss'
      let bestHitStreak = 0;
      let bestMissStreak = 0;
      let tempHit = 0;
      let tempMiss = 0;

      // 시간순 정렬
      const sorted = [...results].sort(
        (a, b) => new Date(a.round.created_at) - new Date(b.round.created_at),
      );

      sorted.forEach((r) => {
        if (r.correct) {
          tempHit++;
          tempMiss = 0;
          if (tempHit > bestHitStreak) bestHitStreak = tempHit;
        } else {
          tempMiss++;
          tempHit = 0;
          if (tempMiss > bestMissStreak) bestMissStreak = tempMiss;
        }
      });

      // 현재 연속 기록
      if (sorted.length > 0) {
        const last = sorted[sorted.length - 1];
        currentStreakType = last.correct ? "hit" : "miss";
        currentStreak = 1;
        for (let i = sorted.length - 2; i >= 0; i--) {
          if (sorted[i].correct === last.correct) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // 2) 시상식 수상 내역
      const { data: finishedSessions } = await supabase
        .from("award_sessions")
        .select("id")
        .eq("status", "finished");

      const finishedIds = new Set((finishedSessions || []).map((s) => s.id));

      const { data: allVotes } = await supabase
        .from("award_votes")
        .select(
          "session_id, category, nominee_id, comment, voter:members!award_votes_voter_id_fkey(name)",
        );

      const finishedVotes = (allVotes || []).filter((v) =>
        finishedIds.has(v.session_id),
      );

      // 세션+카테고리별 1등 계산
      const wins = {};
      const receivedComments = [];
      AWARD_CATEGORIES.forEach((c) => {
        wins[c.id] = 0;
      });

      const sessionCatMap = {};
      finishedVotes.forEach((v) => {
        const key = `${v.session_id}_${v.category}`;
        if (!sessionCatMap[key]) sessionCatMap[key] = {};
        if (!sessionCatMap[key][v.nominee_id])
          sessionCatMap[key][v.nominee_id] = 0;
        sessionCatMap[key][v.nominee_id]++;

        // 이 멤버에 대한 코멘트 수집
        if (v.nominee_id === memberId && v.comment) {
          const cat = AWARD_CATEGORIES.find((c) => c.id === v.category);
          receivedComments.push({
            category: cat?.emoji || "",
            categoryName: cat?.name || v.category,
            comment: v.comment,
            voter: v.voter?.name || "?",
          });
        }
      });

      Object.entries(sessionCatMap).forEach(([key, nominees]) => {
        const category = key.split("_").slice(1).join("_");
        const sorted = Object.entries(nominees).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0 && sorted[0][0] === memberId) {
          if (wins[category] !== undefined) wins[category]++;
        }
      });

      const totalWins = Object.values(wins).reduce((a, b) => a + b, 0);

      // 가장 많이 받은 상
      let topAward = null;
      let topAwardCount = 0;
      Object.entries(wins).forEach(([catId, count]) => {
        if (count > topAwardCount) {
          topAwardCount = count;
          topAward = catId;
        }
      });

      // 3) 업적
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("member_id", memberId);

      // 4) 최근 활동 (최근 5개 베팅)
      const recentBets = [...(allBets || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map((bet) => {
          const type = TOTO_TYPES.find((t) => t.id === bet.round?.toto_type);
          const memberName =
            bet.round?.toto_type === "first_death" ||
            bet.round?.toto_type === "last_death"
              ? members.find((m) => m.id === bet.bet_value)?.name ||
                bet.bet_value
              : bet.bet_value || bet.weapon;
          return {
            type: type?.emoji || "🎰",
            typeName: type?.name || "토토",
            betValue: memberName,
            status: bet.round?.status,
            correct:
              bet.round?.status === "finished"
                ? String(bet.bet_value || bet.weapon || "") ===
                  String(
                    bet.round.actual_result || bet.round.actual_weapon || "",
                  )
                : null,
          };
        });

      setStats({
        toto: {
          totalBets,
          totalHits,
          hitRate,
          typeStats,
          currentStreak,
          currentStreakType,
          bestHitStreak,
          bestMissStreak,
          recentBets,
        },
        awards: {
          totalWins,
          wins,
          topAward,
          topAwardCount,
          receivedComments: receivedComments.slice(0, 10), // 최근 10개
        },
        achievements: achievements || [],
      });
    } catch (err) {
      console.error("통계 조회 실패:", err);
      setStats(null);
    }

    setLoading(false);
  };

  return { stats, loading, fetchStats };
}
