'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const categoryColor = {
  '자유게시판': 'bg-stone-100 text-stone-600',
  '요가정보': 'bg-green-100 text-green-700',
  'Q&A': 'bg-blue-100 text-blue-700',
  '후기': 'bg-amber-100 text-amber-700',
};

export default function CommunityPostDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    init();
  }, [id]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    setComments(data || []);
  };

  const init = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    setLoading(true);
    const { data, error } = await supabase.from('community_posts').select('*').eq('id', id).single();
    if (error) { console.error('에러:', error); setLoading(false); return; }
    setPost(data);
    setIsOwner(currentUser?.id === data.user_id);
    setLoading(false);

    await supabase.from('community_posts').update({ views: (data.views || 0) + 1 }).eq('id', id);
    await fetchComments();
  };

  const handleDeletePost = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('community_posts').delete().eq('id', id);
    if (error) { alert('삭제 실패: ' + error.message); return; }
    alert('삭제되었습니다.');
    router.push('/community');
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) { alert('로그인이 필요합니다'); return; }
    if (!newComment.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('community_comments').insert([{
      post_id: id,
      user_id: user.id,
      author_email: user.email,
      content: newComment.trim(),
    }]);

    setSubmitting(false);
    if (error) { alert('댓글 등록 실패: ' + error.message); return; }
    setNewComment('');
    fetchComments();
  };

  const handleDeleteComment = async (commentId, commentUserId) => {
    if (user?.id !== commentUserId) return;
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    await supabase.from('community_comments').delete().eq('id', commentId);
    fetchComments();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-emerald-50/20 flex items-center justify-center">
        <p className="text-stone-400">불러오는 중...</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-emerald-50/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 text-lg font-medium mb-4">게시글을 찾을 수 없습니다</p>
          <Link href="/community" className="text-green-700 hover:underline text-sm">← 목록으로</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-3xl mx-auto px-8 py-10">

        <div className="flex justify-between items-center mb-8">
          <Link href="/community" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
            ← 커뮤니티
          </Link>
          {isOwner && (
            <button
              onClick={handleDeletePost}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              삭제
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColor[post.category] || 'bg-stone-100 text-stone-600'}`}>
              {post.category}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-stone-800 mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-xs text-stone-400 pb-5 border-b border-stone-100 mb-6">
            <span>{post.author_email?.split('@')[0]}</span>
            <span>{new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>👁 {post.views ?? 0}</span>
            <span>💬 {comments.length}</span>
          </div>

          <div className="text-stone-700 leading-relaxed whitespace-pre-wrap text-sm">
            {post.content}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-5">
            댓글 {comments.length}개
          </h2>

          {comments.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">첫 댓글을 남겨보세요</p>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-stone-50 rounded-2xl p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-stone-700">{comment.author_email?.split('@')[0]}</span>
                      <span className="text-xs text-stone-400">
                        {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id, comment.user_id)}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="text-stone-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {user ? (
            <form onSubmit={handleSubmitComment} className="flex gap-3 pt-4 border-t border-stone-100">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={2}
                className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm resize-none"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-5 py-3 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-60 disabled:cursor-not-allowed self-end"
              >
                {submitting ? '...' : '등록'}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <p className="text-stone-400 text-sm">로그인 후 댓글을 작성할 수 있습니다</p>
              <Link href="/login">
                <button className="px-4 py-2 bg-green-700 text-white text-sm rounded-full hover:bg-green-800 transition">
                  로그인
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
