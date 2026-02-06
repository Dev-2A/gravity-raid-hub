import { useState } from "react";
import { useMembers } from "../hooks/useMembers";
import { useToto } from "../hooks/useToto";
import { useAchievements } from "../hooks/useAchievements";
import {
  WEAPONS,
  ROLE_NAMES,
  TOTO_TYPES,
  RAID_FLOORS,
  ACHIEVEMENTS,
} from "../lib/constants";

export default function Toto() {
  const { members, addMember } = useMembers();
  const {
    currentRounds,
    selectedRound,
    bets,
    loading,
    selectRound,
    createRound,
    placeBet,
    closeRound,
    finishRound,
    isCorrect,
  } = useToto();
  const { checkTotoAchievements } = useAchievements();

  const [selectedMember, setSelectedMember] = useState("");
  const [newAchievementAlert, setNewAchievementAlert] = useState(null);
  const [betValue, setBetValue] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("21:00");
  const [resultValue, setResultValue] = useState("");
  const [newTotoType, setNewTotoType] = useState("weapon");
  const [newFloor, setNewFloor] = useState("");

  // 무기를 역할별로 그룹화
  const weaponsByRole = WEAPONS.reduce((acc, weapon) => {
    if (!acc[weapon.role]) acc[weapon.role] = [];
    acc[weapon.role].push(weapon);
    return acc;
  }, {});

  // 현재 토토 유형 정보
  const getCurrentType = () => {
    if (!selectedRound) return null;
    return (
      TOTO_TYPES.find((t) => t.id === selectedRound.toto_type) || TOTO_TYPES[0]
    );
  };

  // 베팅 제출
  const handleBet = async () => {
    if (!selectedMember || !betValue)
      return alert("공대원과 베팅값을 선택/입력해주세요");

    const { error } = await placeBet(selectedMember, betValue);
    if (error) {
      alert("베팅 실패: " + error);
    } else {
      alert("베팅 완료!");
      setBetValue("");
    }
  };

  // 새 라운드 생성
  const handleCreateRound = async () => {
    if (!deadlineDate) return alert("마감일을 선택해주세요");
    if (!newTotoType) return alert("토토 유형을 선택해주세요");

    const deadline = `${deadlineDate}T${deadlineTime}:00`;
    const floor = newFloor ? parseInt(newFloor) : null;
    const { error } = await createRound(
      deadlineDate,
      deadline,
      newTotoType,
      floor,
    );
    if (error) {
      alert("라운드 생성 실패: " + error);
    } else {
      alert("새 라운드가 생성되었습니다!");
      setNewFloor("");
    }
  };

  // 결과 입력 + 업적 체크
  const handleFinish = async () => {
    if (!resultValue) return alert("결과를 입력해주세요");

    const { error, newAchievements } = await finishRound(
      resultValue,
      checkTotoAchievements,
    );
    if (error) {
      alert("결과 입력 실패: " + error);
    } else {
      if (newAchievements && newAchievements.length > 0) {
        const messages = newAchievements.map((na) => {
          const achNames = na.achievements.map((key) => {
            const info = ACHIEVEMENTS.find((a) => a.key === key);
            return info ? `${info.emoji} ${info.name}` : key;
          });
          return `${na.memberName}: ${achNames.join(", ")}`;
        });
        setNewAchievementAlert(messages);
      }
      alert("결과가 입력되었습니다!");
      setResultValue("");
    }
  };

  // 업적 알림 닫기
  const closeAchievementAlert = () => setNewAchievementAlert(null);

  // 새 공대원 추가
  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;

    const { error } = await addMember(newMemberName.trim());
    if (error) {
      alert("추가 실패: " + error);
    } else {
      setNewMemberName("");
    }
  };

  // 무기 이름 찾기
  const getWeaponName = (weaponId) => {
    const weapon = WEAPONS.find((w) => w.id === weaponId);
    return weapon ? `${weapon.name} (${weapon.job})` : weaponId;
  };

  // 베팅값 표시 (유형에 따라)
  const displayBetValue = (bet, round) => {
    const value = bet.bet_value || bet.weapon;
    const type = round?.toto_type || "weapon";

    if (type === "weapon") return getWeaponName(value);
    if (type === "first_death" || type === "last_death") {
      const member = members.find((m) => m.id === value);
      return member ? member.name : value;
    }
    if (type === "wipe_count") return `${value}회`;
    if (type === "total_deaths") return `${value}회`;
    return value;
  };

  // 결과값 표시
  const displayResult = (round) => {
    const result = round.actual_result || round.actual_weapon;
    if (!result) return "";

    if (round.toto_type === "weapon") return getWeaponName(result);
    if (round.toto_type === "first_death" || round.toto_type === "last_death") {
      const member = members.find((m) => m.id === result);
      return member ? member.name : result;
    }
    if (round.toto_type === "wipe_count") return `${result}회`;
    if (round.toto_type === "total_deaths") return `${result}회`;
    return result;
  };

  // 토토 유형 이름+이모지
  const getTypeBadge = (round) => {
    const type =
      TOTO_TYPES.find((t) => t.id === round.toto_type) || TOTO_TYPES[0];
    const floorText = round.floor ? ` ${round.floor}층` : "";
    return `${type.emoji}${floorText} ${type.name}`;
  };

  // 베팅 입력 컴포넌트 렌더링
  const renderBetInput = () => {
    const type = getCurrentType();
    if (!type) return null;

    switch (type.inputType) {
      case "weapon":
        return (
          <select
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
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
        );

      case "member":
        return (
          <select
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
          >
            <option value="">공대원 선택</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            min="0"
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            placeholder="숫자 입력"
            className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
          />
        );

      default:
        return null;
    }
  };

  // 결과 입력 컴포넌트 렌더링
  const renderResultInput = () => {
    const type = getCurrentType();
    if (!type) return null;

    switch (type.inputType) {
      case "weapon":
        return (
          <select
            value={resultValue}
            onChange={(e) => setResultValue(e.target.value)}
            className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
          >
            <option value="">무기 선택</option>
            {WEAPONS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.job})
              </option>
            ))}
          </select>
        );

      case "member":
        return (
          <select
            value={resultValue}
            onChange={(e) => setResultValue(e.target.value)}
            className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
          >
            <option value="">공대원 선택</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            min="0"
            value={resultValue}
            onChange={(e) => setResultValue(e.target.value)}
            placeholder="숫자 입력"
            className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
          />
        );

      default:
        return null;
    }
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
              onClick={closeAchievementAlert}
              className="text-[var(--color-text-muted)] hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>🎰</span> 토토
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

          {/* 공대원 추가 */}
          <div className="mb-6">
            <h3 className="text-sm text-[var(--color-text-muted)] mb-2">
              공대원 추가
            </h3>
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

          {/* 새 라운드 생성 */}
          <div className="mb-6">
            <h3 className="text-sm text-[var(--color-text-muted)] mb-2">
              새 토토 생성
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <select
                  value={newTotoType}
                  onChange={(e) => setNewTotoType(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                >
                  {TOTO_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.emoji} {t.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newFloor}
                  onChange={(e) => setNewFloor(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                >
                  <option value="">층 선택 (선택사항)</option>
                  {RAID_FLOORS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
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
                  생성
                </button>
              </div>
            </div>
          </div>

          {/* 선택된 라운드 관리 */}
          {selectedRound && selectedRound.status === "open" && (
            <div className="mb-4">
              <h3 className="text-sm text-[var(--color-text-muted)] mb-2">
                라운드 마감
              </h3>
              <button
                onClick={closeRound}
                className="px-4 py-2 bg-[var(--color-accent)] rounded-lg hover:opacity-80"
              >
                베팅 마감하기
              </button>
            </div>
          )}

          {selectedRound && selectedRound.status === "closed" && (
            <div>
              <h3 className="text-sm text-[var(--color-text-muted)] mb-2">
                결과 입력 — {getCurrentType()?.resultLabel}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {renderResultInput()}
                <button
                  onClick={handleFinish}
                  className="px-4 py-2 bg-[var(--color-success)] rounded-lg hover:opacity-80"
                >
                  결과 확정
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 라운드 탭 (여러 토토 동시 진행 가능) */}
      {currentRounds.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {currentRounds.map((round) => {
            const type =
              TOTO_TYPES.find((t) => t.id === round.toto_type) || TOTO_TYPES[0];
            const isSelected = selectedRound?.id === round.id;
            const floorText = round.floor ? ` ${round.floor}층` : "";
            return (
              <button
                key={round.id}
                onClick={() => selectRound(round)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isSelected
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-white/10 border border-white/10"
                }`}
              >
                {type.emoji}
                {floorText} {type.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 현재 라운드 상태 */}
      {selectedRound ? (
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold">
              {selectedRound.status === "open" && "🟢 베팅 진행 중"}
              {selectedRound.status === "closed" && "🟡 베팅 마감 (결과 대기)"}
              {selectedRound.status === "finished" && "✅ 결과 발표"}
            </h2>
            <span className="text-sm text-[var(--color-text-muted)]">
              마감: {new Date(selectedRound.deadline).toLocaleString("ko-KR")}
            </span>
          </div>

          {/* 토토 유형 배지 */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-sm bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
              {getTypeBadge(selectedRound)}
            </span>
          </div>

          {/* 결과 발표 */}
          {selectedRound.status === "finished" &&
            (selectedRound.actual_result || selectedRound.actual_weapon) && (
              <div className="mb-6 p-4 bg-[var(--color-accent)]/20 rounded-lg text-center">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">
                  {getCurrentType()?.resultLabel || "결과"}
                </p>
                <p className="text-xl font-bold text-[var(--color-accent)]">
                  🎉 {displayResult(selectedRound)}
                </p>
              </div>
            )}

          {/* 베팅 폼 */}
          {selectedRound.status === "open" && (
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
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {renderBetInput()}
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
                {bets.map((bet) => {
                  const correct =
                    selectedRound.status === "finished" &&
                    isCorrect(bet, selectedRound);
                  return (
                    <div
                      key={bet.id}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        selectedRound.status === "finished"
                          ? correct
                            ? "bg-[var(--color-success)]/20 border border-[var(--color-success)]"
                            : "bg-black/20"
                          : "bg-black/20"
                      }`}
                    >
                      <span className="font-medium">{bet.member?.name}</span>
                      <span className="text-[var(--color-text-muted)]">
                        {displayBetValue(bet, selectedRound)}
                        {correct && <span className="ml-2">✅</span>}
                      </span>
                    </div>
                  );
                })}
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
              관리자 패널에서 새 토토를 생성해주세요
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
