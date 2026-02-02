import { useState, useEffect, useCallback } from "react";
import { supabase } from '../lib/supabase'

export function useToto() {
  const [currentRound, setCurrentRound] = useState(null)
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 현재 진행 중인 라운드 가져오기
  const fetchCurrentRound = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('toto_rounds')
        .select('*')
        .in('status', ['open', 'closed', 'finished'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      setCurrentRound(data || null)

      if (data) {
        await fetchBets(data.id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

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
  const createRound = async (weekStart, deadline) => {
    try {
      const { data, error } = await supabase
        .from('toto_rounds')
        .insert([{ week_start: weekStart, deadline }])
        .select()
        .single()
      
      if (error) throw error
      setCurrentRound(data)
      setBets([])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  // 베팅하기
  const placeBet = async (memberId, weapon) => {
    if (!currentRound) return { data: null, error: '진행 중인 라운드가 없습니다' }

    try {
      const { data, error } = await supabase
        .from('toto_bets')
        .upsert([{
          round_id: currentRound.id,
          member_id: memberId,
          weapon
        }], {
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
    if (!currentRound) return { error: '진행 중인 라운드가 없습니다' }

    try {
      const { error } = await supabase
        .from('toto_rounds')
        .update({ status: 'closed' })
        .eq('id', currentRound.id)
      
      if (error) throw error
      setCurrentRound((prev) => ({ ...prev, status: 'closed' }))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  // 결과 입력
  const finishRound = async (actualWeapon) => {
    if (!currentRound) return { error: '진행 중인 라운드가 없습니다' }

    try {
      const { error } = await supabase
        .from('toto_rounds')
        .update({ status: 'finished', actual_weapon: actualWeapon })
        .eq('id', currentRound.id)
      
      if (error) throw error
      setCurrentRound((prev) => ({ ...prev, status: 'finished', actual_weapon: actualWeapon }))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  useEffect(() => {
    fetchCurrentRound()
  }, [fetchCurrentRound])

  return {
    currentRound,
    bets,
    loading,
    error,
    createRound,
    placeBet,
    closeRound,
    finishRound,
    refetch: fetchCurrentRound
  }
}