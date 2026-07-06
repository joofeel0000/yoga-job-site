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
      <div className="mx-auto" style={{ maxWidth: 720, padding: '32px 24px' }}>
        <Link href="/" className="text-sm text-[#23211C] hover:text-black font-medium mb-6 inline-block transition-colors">
          ← 홈으로 돌아가기
        </Link>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
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
