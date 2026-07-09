'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const catColor = {
  '자유게시판': { bg: '#F4F1E9', text: '#76705F' },
  '강사Q&A': { bg: '#EEF2FF', text: '#4B5CB8' },
  '노하우': { bg: '#F0FDF4', text: '#16A34A' },
  '후기': { bg: '#FDF3E3', text: '#C2922F' },
  'Q&A': { bg: '#EEF2FF', text: '#4B5CB8' },
  '요가정보': { bg: '#F0FDF4', text: '#16A34A' },
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
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    init();
  }, [id]);

  const fetchComments = async () => {
    const { data } = await supabase.from('community_comments').select('*').eq('post_id', id).order('created_at', { ascending: true });
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
    router.push('/community');
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) { alert('로그인이 필요합니다'); return; }
    if (!newComment.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('community_comments').insert([{
      post_id: id, user_id: user.id, author_email: user.email, content: newComment.trim(),
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
      <main style={{ minHeight: '100vh', background: '#F4F1E9', paddingTop: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9A9382', fontSize: 14 }}>불러오는 중...</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main style={{ minHeight: '100vh', background: '#F4F1E9', paddingTop: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#76705F', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>게시글을 찾을 수 없습니다</p>
          <Link href="/community" style={{ fontSize: 13, color: '#23211C', textDecoration: 'underline' }}>← 목록으로</Link>
        </div>
      </main>
    );
  }

  const cc = catColor[post.category] || { bg: '#F4F1E9', text: '#76705F' };

  return (
    <main style={{ minHeight: '100vh', background: '#F4F1E9' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Link href="/community" style={{ fontSize: 13, color: '#76705F', textDecoration: 'none' }}>← 커뮤니티</Link>
          {isOwner && (
            <button onClick={handleDeletePost} style={{ fontSize: 13, color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer' }}>
              삭제
            </button>
          )}
        </div>

        {/* Post */}
        <div className="bg-white rounded-[18px] border border-[#E3DDD0] p-5 sm:p-8 mb-4">
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: cc.bg, color: cc.text, marginBottom: 16 }}>
            {post.category}
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#23211C', marginBottom: 16, lineHeight: 1.4 }}>{post.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 20, borderBottom: '1px solid #F4F1E9', marginBottom: 24, fontSize: 13, color: '#9A9382' }}>
            <span style={{ fontWeight: 600, color: '#76705F' }}>{post.author_email?.split('@')[0]}</span>
            <span>{new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>👁 {post.views ?? 0}</span>
            <span>💬 {comments.length}</span>
          </div>
          <div style={{ fontSize: 15, color: '#26241D', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{post.content}</div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-7 pt-5 border-t border-[#F4F1E9]">
            <button
              onClick={() => setLiked(!liked)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: liked ? '#FDF3E3' : '#F4F1E9',
                color: liked ? '#C2922F' : '#76705F',
                border: `1px solid ${liked ? '#C2922F' : '#E3DDD0'}`, cursor: 'pointer',
              }}
            >
              {liked ? '♥' : '♡'} 좋아요
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: '#F4F1E9', color: '#76705F', border: '1px solid #E3DDD0', cursor: 'pointer',
            }}>
              🔖 스크랩
            </button>
            <button
              onClick={() => { if (typeof navigator !== 'undefined') { navigator.clipboard?.writeText(window.location.href); alert('링크가 복사되었습니다'); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: '#F4F1E9', color: '#76705F', border: '1px solid #E3DDD0', cursor: 'pointer',
              }}
            >
              🔗 공유
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-[18px] border border-[#E3DDD0] p-5 sm:p-8">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#23211C', marginBottom: 20 }}>댓글 {comments.length}개</h2>

          {comments.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9A9382', textAlign: 'center', padding: '24px 0' }}>첫 댓글을 남겨보세요</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {comments.map(comment => (
                <div key={comment.id} style={{ background: '#F4F1E9', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#23211C' }}>{comment.author_email?.split('@')[0]}</span>
                      <span style={{ fontSize: 12, color: '#9A9382' }}>{new Date(comment.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {user?.id === comment.user_id && (
                      <button onClick={() => handleDeleteComment(comment.id, comment.user_id)} style={{ fontSize: 12, color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer' }}>
                        삭제
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: '#26241D', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {user ? (
            <form onSubmit={handleSubmitComment} className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-[#E3DDD0]">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={2}
                style={{
                  flex: 1, padding: '10px 14px', border: '1px solid #E3DDD0', borderRadius: 10,
                  fontSize: 14, color: '#23211C', background: '#F4F1E9', resize: 'none', outline: 'none',
                }}
              />
              <button type="submit" disabled={submitting || !newComment.trim()} style={{
                padding: '11px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: '#23211C', color: '#fff', border: 'none', cursor: 'pointer',
                opacity: submitting || !newComment.trim() ? 0.5 : 1,
              }}>
                {submitting ? '...' : '등록'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #E3DDD0' }}>
              <p style={{ fontSize: 13, color: '#9A9382' }}>로그인 후 댓글을 작성할 수 있습니다</p>
              <Link href="/login">
                <button style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#23211C', color: '#fff', border: 'none', cursor: 'pointer' }}>
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
