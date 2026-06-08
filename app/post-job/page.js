'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const inputClass = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm";
const labelClass = "block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2";

export default function PostJob() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '', location: '', yogaStyle: '', experience: '', salary: '', description: ''
  });
  const [aiGenerated, setAiGenerated] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      sessionStorage.setItem('loginRequired', 'true');
      router.push('/login?redirect=post-job');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateWithAI = async () => {
    if (!formData.location || !formData.yogaStyle) {
      alert('지역과 요가 종류를 먼저 입력해주세요!');
      return;
    }
    setIsGenerating(true);
    setAiGenerated('');
    try {
      const res = await fetch('/api/generate-job-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: formData.location, yogaStyle: formData.yogaStyle, experience: formData.experience, salary: formData.salary })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'AI 생성 실패');
      setAiGenerated(data.generatedText || '');
    } catch (err) {
      alert(String(err?.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('로그인이 필요합니다'); return; }

    const { data, error } = await supabase.from('job').insert([{
      title: formData.title,
      location: formData.location,
      yoga_style: formData.yogaStyle,
      experience: formData.experience,
      salary: formData.salary,
      description: formData.description,
      user_id: user.id,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }]).select();

    if (error) {
      alert('등록 실패: ' + error.message);
    } else {
      alert('공고가 성공적으로 등록되었습니다!');
      router.push(data?.[0] ? `/jobs/${data[0].id}` : '/jobs');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
        <div className="text-4xl animate-pulse">🌿</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-green-700 hover:text-green-800 font-medium mb-6 inline-block transition-colors">
          ← 홈으로 돌아가기
        </Link>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-1">구인 공고 등록</h1>
          <p className="text-stone-400 text-sm mb-8">AI가 매력적인 공고문을 작성해드립니다</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>공고 제목 *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="예: 빈야사 요가 강사 모집" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>지역 *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange}
                placeholder="예: 서울 강남구" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>요가 종류 *</label>
              <select name="yogaStyle" value={formData.yogaStyle} onChange={handleChange} className={inputClass} required>
                <option value="">선택해주세요</option>
                <option>하타요가</option><option>빈야사</option><option>아쉬탕가</option>
                <option>파워요가</option><option>음요가</option><option>핫요가</option><option>기타</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>필요 경력</label>
              <select name="experience" value={formData.experience} onChange={handleChange} className={inputClass}>
                <option value="">선택해주세요</option>
                <option>신입</option><option>1년 이상</option><option>3년 이상</option><option>5년 이상</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>급여 조건</label>
              <input type="text" name="salary" value={formData.salary} onChange={handleChange}
                placeholder="예: 시급 30,000원 ~ 50,000원" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>상세 설명</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                placeholder="센터 소개, 근무 조건 등을 입력해주세요" rows="5"
                className={inputClass + " resize-none"} />
            </div>

            {/* AI 섹션 */}
            <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
              <p className="text-sm text-green-800 mb-3 font-medium">
                ✨ AI가 입력하신 정보를 바탕으로 전문적인 공고문을 작성해드립니다
              </p>
              <button type="button" onClick={generateWithAI} disabled={isGenerating}
                className="px-5 py-2 bg-green-700 text-white text-sm rounded-full hover:bg-green-800 transition disabled:bg-stone-300 font-semibold">
                {isGenerating ? 'AI가 작성 중...' : 'AI로 공고 작성하기'}
              </button>

              {aiGenerated && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-green-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">AI 생성 결과</p>
                  <p className="text-stone-700 whitespace-pre-wrap text-sm leading-relaxed">{aiGenerated}</p>
                  <button type="button"
                    onClick={() => setFormData({ ...formData, description: aiGenerated })}
                    className="mt-3 px-4 py-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition text-xs font-semibold">
                    상세 설명에 적용하기
                  </button>
                </div>
              )}
            </div>

            <button type="submit"
              className="w-full bg-green-700 text-white py-4 rounded-2xl font-semibold text-base hover:bg-green-800 active:scale-95 transition">
              공고 등록하기
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
