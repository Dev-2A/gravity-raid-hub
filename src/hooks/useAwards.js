import { useState, useEffect, useCallback } from "react";
import { supabase } from '../lib/supabase'

export function useAwards() {
  const [currentSession, setCurrnetSession] = useState(null)
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 현재 진행 중인 세션 가져오기
  const fetchCurrentSession = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('award_sessions')
        .select('*')
        .eq('status', 'voting')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      setCurrnetSession(data || null)

      if (data) {
        await fetchVotes(data.id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // 해당 세션의 투표 목록 가져오기
  const fetchVotes = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('award_votes')
        .select(`
          *,
          voter:members!award_votes_voter_id_fkey(id, name),
          nominee:members!award_votes_nominee_id_fkey(id, name)
        `)
        .eq('session_id', sessionId)
      
      if (error) throw error
      setVotes(data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  // 새 세션 생성
  const createSession = async (raidDate) => {
    try {
      const { data, error } = await supabase
        .from('award_sessions')
        .insert([{ raid_date: raidDate }])
        .select()
        .single()
      
      if (error) throw error
      setCurrnetSession(data)
      setVotes([])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  // 투표하기
  const vote = async (voterId, category, nomineeId) => {
    if (!currentSession) return { data: null, error: '진행 중인 세션이 없습니다' }

    try {
      const { data, error } = await supabase
        .from('award_votes')
        .upsert([{
          session_id: currentSession.id,
          voter_id: voterId,
          category,
          nominee_id: nomineeId
        }], {
          onConflict: 'session_id,voter_id,category'
        })
        .select(`
          *,
          voter:members!award_votes_voter_id_fkey(id, name),
          nominee:members!award_votes_nominee_id_fkey(id, name)
        `)
        .single()
      
      if (error) throw error

      setVotes((prev) => {
        const filtered = prev.filter(
          (v) => !(v.voter_id === voterId && v.category === category)
        )
        return [...filtered, data]
      })
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  // 세션 종료
  const finishSession = async () => {
    if (!currentSession) return { error: '진행 중인 세션이 없습니다' }

    try {
      const { error } = await supabase
        .from('award_sessions')
        .update({ status: 'finished' })
        .eq('id', currentSession.id)
      
      if (error) throw error
      setCurrnetSession((prev) => ({ ...prev, status: 'finished' }))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  // 카테고리별 결과 집계
  const getResults = () => {
    const results = {}

    votes.forEach((vote) => {
      if (!results[vote.category]) {
        results[vote.category] = {}
      }
      const nomineeId = vote.nominee_id
      if (!results[vote.category][nomineeId]) {
        results[vote.category][nomineeId] = {
          nominee: vote.nominee,
          cound: 0
        }
      }
      results[vote.category][nomineeId].count++
    })

    // 각 카테고리별 정렬
    Object.keys(results).forEach((category) => {
      results[category] = Object.values(results[category]).sort(
        (a, b) => b.count - a.count
      )
    })

    return results
  } 

  useEffect(() => {
    fetchCurrentSession()
  }, [fetchCurrentSession])

  return {
    currentSession,
    votes,
    loading,
    error,
    createSession,
    vote,
    finishSession,
    getResults,
    refetch: fetchCurrentSession
  }
}