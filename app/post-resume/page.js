'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/app/components/ImageUpload';

const inputClass = "input-base";
const labelClass = "label-field";

export default function PostResume() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', location: '', yogaStyles: '', experienceYears: '',
    certifications: '', photoUrl: '', introduction: ''
  });
  const [aiGenerated, setAiGenerated] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      sessionStorage.setItem('loginRequired', 'true');
      router.push('/login?redirect=post-resume');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateWithAI = async () => {
    if (!formData.yogaStyles) {
      alert('가능한 요가 종류를 먼저 입력해주세요!');
      return;
    }
    setIsGenerating(true);
    setAiGenerated('');
    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          yogaStyles: formData.yogaStyles,
          experienceYears: formData.experienceYears,
          certifications: formData.certifications,
        })
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

    const { data, error } = await supabase.from('candidate').insert([{
      name: formData.name,
      location: formData.location,
      yoga_styles: formData.yogaStyles,
      experience_years: formData.experienceYears,
      certifications: formData.certifications,
      photo_url: formData.photoUrl,
      introduction: formData.introduction,
      user_id: user.id,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }]).select();

    if (error) {
      alert('등록 실패: ' + error.message);
    } else {
      alert('이력서가 성공적으로 등록되었습니다!');
      router.push(data?.[0] ? `/resumes/${data[0].id}` : '/resumes');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F4F1E9]">
        <div className="text-4xl animate-pulse">🌺</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F1E9]">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link href="/" className="text-sm text-[#23211C] hover:text-black font-medium mb-6 inline-block transition-colors">
          ← 홈으로 돌아가기
        </Link>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5 sm:p-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-1">이력서 등록</h1>
          <p className="text-stone-400 text-sm mb-8">나에게 맞는 요가 센터를 찾아보세요</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>이름 *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="예: 김요가" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>희망 지역 *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange}
                placeholder="예: 서울 강남구" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>가능한 요가 종류 *</label>
              <input type="text" name="yogaStyles" value={formData.yogaStyles} onChange={handleChange}
                placeholder="예: 빈야사, 하타요가, 파워요가" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>경력</label>
              <select name="experienceYears" value={formData.experienceYears} onChange={handleChange} className={inputClass}>
                <option value="">선택해주세요</option>
                <option>신입</option><option>1년</option><option>2년</option>
                <option>3년</option><option>4년</option><option>5년 이상</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>자격증</label>
              <input type="text" name="certifications" value={formData.certifications} onChange={handleChange}
                placeholder="예: 요가지도자 2급, RYT 200" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>프로필 사진</label>
              <ImageUpload
                bucket="avatars"
                value={formData.photoUrl}
                onChange={(url) => setFormData(f => ({ ...f, photoUrl: url }))}
                hint="선택사항 · JPG · PNG · WebP · 최대 5MB"
              />
            </div>
            {/* AI 섹션 */}
            <div className="bg-[#ECE9E1] p-5 rounded-2xl border border-[#E3DDD0]">
              <p className="text-sm text-[#23211C] mb-1 font-semibold">✦ AI 자기소개 자동 작성</p>
              <p className="text-xs text-stone-500 mb-4">요가 종류·경력·자격증을 입력하면 AI가 자연스러운 자기소개를 만들어드립니다</p>
              <button type="button" onClick={generateWithAI} disabled={isGenerating}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#23211C] text-white text-sm rounded-full hover:bg-black transition disabled:bg-stone-300 font-semibold">
                {isGenerating ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI가 작성 중입니다...
                  </>
                ) : (
                  'AI로 자기소개 작성하기'
                )}
              </button>

              {aiGenerated && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-[#E3DDD0]">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">AI 생성 결과</p>
                  <p className="text-stone-700 whitespace-pre-wrap text-sm leading-relaxed">{aiGenerated}</p>
                  <button type="button"
                    onClick={() => setFormData({ ...formData, introduction: aiGenerated })}
                    className="mt-3 px-4 py-2 bg-[#23211C] text-white rounded-full hover:bg-black transition text-xs font-semibold">
                    자기소개에 적용하기
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>자기소개 *</label>
              <textarea name="introduction" value={formData.introduction} onChange={handleChange}
                placeholder="본인의 강점, 강의 스타일 등을 자유롭게 작성해주세요"
                rows="5" className={inputClass + " resize-none"} required />
            </div>

            <button type="submit"
              className="w-full bg-[#23211C] text-white py-4 rounded-2xl font-semibold text-base hover:bg-black active:scale-95 transition">
              이력서 등록하기
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
