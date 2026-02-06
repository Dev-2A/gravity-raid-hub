import { useState, useEffect, useCallback } from "react";
import { supabase } from '../lib/supabase'

export function useToto() {
  const [currentRounds, setCurrentRounds] = useState([])
  const [selectedRound, setSelectedRound] = useState(null)
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 현재 진행 중인 라운드들 가져오기 (여러 개 가능)
  const fetchCurrentRounds = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('toto_rounds')
        .select('*')
        .in('status', ['open', 'closed', 'finished'])
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      const rounds = data || []
      setCurrentRounds(rounds)

      // 가장 최근 라운드 자동 선택
      if (rounds.length > 0 && !selectedRound) {
        setSelectedRound(rounds[0])
        await fetchBets(rounds[0].id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [selectedRound])

  // 특정 라운드 선택
  const selectRound = async (round) => {
    setSelectedRound(round)
    await fetchBets(round.id)
  }

  // 해당 라운드의 베팅 목록 가져오기
  const fetchBets = async (roundId) => {
    try {
      const { data, error } = await supabase
        .from('toto_bets')
        .select(`
          *,
          member:members(id, name)
        `)
        .eq('round_id', roundId)

      if (error) throw error
      setBets(data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  // 새 라운드 생성
  const createRound = async (weekStart, deadline, totoType = 'weapon', floor = null) => {
    try {
      const { data, error } = await supabase
        .from('toto_rounds')
        .insert([{
          week_start: weekStart,
          deadline,
          toto_type: totoType,
          floor: floor,
        }])
        .select()
        .single()

      if (error) throw error
      setCurrentRounds((prev) => [data, ...prev])
      setSelectedRound(data)
      setBets([])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  // 베팅하기 (범용)
  const placeBet = async (memberId, betValue) => {
    if (!selectedRound) return { data: null, error: '진행 중인 라운드가 없습니다' }

    try {
      // 기존 호환: 무기 토토면 weapon 컬럼에도 저장
      const insertData = {
        round_id: selectedRound.id,
        member_id: memberId,
        bet_value: String(betValue),
      }

      if (selectedRound.toto_type === 'weapon') {
        insertData.weapon = String(betValue)
      }

      const { data, error } = await supabase
        .from('toto_bets')
        .upsert([insertData], {
          onConflict: 'round_id,member_id'
        })
        .select(`
          *,
          member:members(id, name)
        `)
        .single()

      if (error) throw error

      setBets((prev) => {
        const filtered = prev.filter((b) => b.member_id !== memberId)
        return [...filtered, data]
      })
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  // 라운드 마감
  const closeRound = async () => {
    if (!selectedRound) return { error: '진행 중인 라운드가 없습니다' }

    try {
      const { error } = await supabase
        .from('toto_rounds')
        .update({ status: 'closed' })
        .eq('id', selectedRound.id)

      if (error) throw error
      const updated = { ...selectedRound, status: 'closed' }
      setSelectedRound(updated)
      setCurrentRounds((prev) =>
        prev.map((r) => r.id === selectedRound.id ? updated : r)
      )
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  // 결과 입력 (범용)
  const finishRound = async (resultValue) => {
    if (!selectedRound) return { error: '진행 중인 라운드가 없습니다' }

    try {
      const updateData = {
        status: 'finished',
        actual_result: String(resultValue),
      }

      // 기존 호환: 무기 토토면 actual_weapon에도 저장
      if (selectedRound.toto_type === 'weapon') {
        updateData.actual_weapon = String(resultValue)
      }

      const { error } = await supabase
        .from('toto_rounds')
        .update(updateData)
        .eq('id', selectedRound.id)

      if (error) throw error
      const updated = { ...selectedRound, ...updateData }
      setSelectedRound(updated)
      setCurrentRounds((prev) =>
        prev.map((r) => r.id === selectedRound.id ? updated : r)
      )
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  // 베팅값이 정답인지 확인 (유형별)
  const isCorrect = (bet, round) => {
    if (!round?.actual_result && !round?.actual_weapon) return false
    const result = round.actual_result || round.actual_weapon
    const value = bet.bet_value || bet.weapon

    if (round.toto_type === 'wipe_count' || round.toto_type === 'total_deaths') {
      return String(value) === String(result)
    }

    return value === result
  }

  useEffect(() => {
    fetchCurrentRounds()
  }, [fetchCurrentRounds])

  return {
    currentRounds,
    selectedRound,
    bets,
    loading,
    error,
    selectRound,
    createRound,
    placeBet,
    closeRound,
    finishRound,
    isCorrect,
    refetch: fetchCurrentRounds
  }
}
