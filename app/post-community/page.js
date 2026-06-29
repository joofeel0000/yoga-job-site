'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = ['자유게시판', '강사Q&A', '노하우', '후기', '요가정보'];

export default function PostCommunity() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ category: '자유게시판', title: '', content: '' });

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) {
      sessionStorage.setItem('loginRequired', 'true');
      router.push('/login?redirect=post-community');
      return;
    }
    setUser(u);
    setLoading(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) { alert('제목과 내용을 입력해주세요.'); return; }
    setSubmitting(true);
    const { data, error } = await supabase.from('community_posts').insert([{
      title: formData.title.trim(), content: formData.content.trim(),
      category: formData.category, user_id: user.id, author_email: user.email, views: 0,
    }]).select();
    setSubmitting(false);
    if (error) { alert('등록 실패: ' + error.message); return; }
    router.push(data?.[0] ? `/community/${data[0].id}` : '/community');
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#F4F1E9', paddingTop: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9A9382', fontSize: 14 }}>로딩 중...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F4F1E9' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#23211C', marginBottom: 4 }}>글쓰기</h1>
            <p style={{ fontSize: 14, color: '#9A9382' }}>커뮤니티에 글을 작성하세요</p>
          </div>
          <Link href="/community" style={{ fontSize: 13, color: '#76705F', textDecoration: 'none' }}>← 목록으로</Link>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 18, border: '1px solid #E3DDD0', padding: '32px' }}>

          {/* Category */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#9A9382', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 10 }}>
              카테고리
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => {
                const active = formData.category === cat;
                return (
                  <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })} style={{
                    padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: active ? 700 : 400,
                    background: active ? '#23211C' : '#F4F1E9',
                    color: active ? '#fff' : '#76705F',
                    border: `1px solid ${active ? '#23211C' : '#E3DDD0'}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#9A9382', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
              제목
            </label>
            <input
              name="title" value={formData.title} onChange={handleChange}
              placeholder="제목을 입력하세요" required
              style={{
                width: '100%', padding: '12px 16px', border: '1px solid #E3DDD0', borderRadius: 10,
                fontSize: 15, color: '#23211C', background: '#F4F1E9', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#9A9382', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
              내용
            </label>
            <textarea
              name="content" value={formData.content} onChange={handleChange}
              placeholder="내용을 자유롭게 작성하세요..." rows={12} required
              style={{
                width: '100%', padding: '12px 16px', border: '1px solid #E3DDD0', borderRadius: 10,
                fontSize: 14, color: '#23211C', background: '#F4F1E9', outline: 'none', resize: 'vertical',
                boxSizing: 'border-box', lineHeight: 1.7,
              }}
            />
          </div>

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '15px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: submitting ? '#E3DDD0' : '#23211C',
            color: submitting ? '#9A9382' : '#fff',
            border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
          }}>
            {submitting ? '등록 중...' : '게시글 등록'}
          </button>
        </form>
      </div>
    </main>
  );
}
