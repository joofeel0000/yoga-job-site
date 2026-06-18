'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const inputClass = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm";
const labelClass = "block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2";
const CATEGORIES = ['자유게시판', '요가정보', 'Q&A', '후기'];

export default function PostCommunity() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '자유게시판',
    title: '',
    content: '',
  });

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      sessionStorage.setItem('loginRequired', 'true');
      router.push('/login?redirect=post-community');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase.from('community_posts').insert([{
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      user_id: user.id,
      author_email: user.email,
      views: 0,
    }]).select();

    setSubmitting(false);
    if (error) { alert('등록 실패: ' + error.message); return; }
    alert('게시글이 등록되었습니다!');
    router.push(data?.[0] ? `/community/${data[0].id}` : '/community');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-emerald-50/20 flex items-center justify-center">
        <p className="text-stone-400">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-2xl mx-auto px-8 py-10">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">글쓰기</h1>
            <p className="text-stone-400 text-sm mt-1">커뮤니티에 글을 작성하세요</p>
          </div>
          <Link href="/community" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
            ← 목록으로
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 space-y-6">

          <div>
            <label className={labelClass}>카테고리 *</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    formData.category === cat
                      ? 'bg-green-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>제목 *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="제목을 입력하세요"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>내용 *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="내용을 자유롭게 작성하세요..."
              rows={10}
              required
              className={inputClass + ' resize-none'}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-green-700 text-white font-bold rounded-2xl hover:bg-green-800 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? '등록 중...' : '게시글 등록'}
          </button>
        </form>
      </div>
    </main>
  );
}
