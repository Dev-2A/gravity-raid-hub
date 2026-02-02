import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 공대원 목록 불러오기
  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name')
      
      if (error) throw error
      setMembers(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 공대원 추가
  const addMember = async (name) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert([{ name }])
        .select()
        .single()
      
      if (error) throw error
      setMembers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  return { members, loading, error, addMember, refetch: fetchMembers }
}