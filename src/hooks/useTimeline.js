import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useTimeline() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);

    const { data: postsData } = await supabase
      .from("timeline")
      .select("*, member:members(id, name)")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: reactionsData } = await supabase
      .from("timeline_reactions")
      .select("*, member:members(id, name)");

    // 리액션을 포스트별로 그룹핑
    const reactionMap = {};
    (reactionsData || []).forEach((r) => {
      if (!reactionMap[r.timeline_id]) reactionMap[r.timeline_id] = [];
      reactionMap[r.timeline_id].push(r);
    });

    const combined = (postsData || []).map((post) => ({
      ...post,
      reactions: reactionMap[post.id] || [],
    }));

    setPosts(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 글 작성
  const addPost = async (memberId, message) => {
    if (!message.trim()) return { error: "메시지를 입력해주세요" };
    if (message.length > 100) return { error: "100자 이내로 작성해주세요" };

    const { error } = await supabase
      .from("timeline")
      .insert([{ member_id: memberId, message: message.trim() }]);

    if (error) return { error: error.message };
    await fetchPosts();
    return { error: null };
  };

  // 글 삭제
  const deletePost = async (postId) => {
    const { error } = await supabase.from("timeline").delete().eq("id", postId);

    if (error) return { error: error.message };
    await fetchPosts();
    return { error: null };
  };

  // 리액션 토글
  const toggleReaction = async (timelineId, memberId, emoji) => {
    // 이미 있는지 확인
    const { data: existing } = await supabase
      .from("timeline_reactions")
      .select("id")
      .eq("timeline_id", timelineId)
      .eq("member_id", memberId)
      .eq("emoji", emoji)
      .single();

    if (existing) {
      // 제거
      const { error } = await supabase
        .from("timeline_reactions")
        .delete()
        .eq("id", existing.id);

      if (error) return { error: error.message };
    } else {
      // 추가
      const { error } = await supabase
        .from("timeline_reactions")
        .insert([{ timeline_id: timelineId, member_id: memberId, emoji }]);

      if (error) return { error: error.message };
    }

    await fetchPosts();
    return { error: null };
  };

  return {
    posts,
    loading,
    addPost,
    deletePost,
    toggleReaction,
    refresh: fetchPosts,
  };
}
