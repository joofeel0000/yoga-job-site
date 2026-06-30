'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const inputClass = "input-base";
const labelClass = "label-field";

export default function PostProperty() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    property_type: '임대',
    location: '',
    area: '',
    price: '',
    description: '',
    contact: '',
  });

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      sessionStorage.setItem('loginRequired', 'true');
      router.push('/login?redirect=post-property');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('제목과 상세 설명은 필수입니다.');
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase.from('property').insert([{
      title: formData.title.trim(),
      property_type: formData.property_type,
      location: formData.location.trim(),
      area: formData.area.trim(),
      price: formData.price.trim(),
      description: formData.description.trim(),
      contact: formData.contact.trim(),
      user_id: user.id,
      status: 'active',
    }]).select();

    setSubmitting(false);
    if (error) { alert('등록 실패: ' + error.message); return; }
    alert('매물이 등록되었습니다!');
    router.push(data?.[0] ? `/property/${data[0].id}` : '/property');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F1E9] flex items-center justify-center">
        <p className="text-stone-400">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F1E9]">
      <div className="mx-auto" style={{ maxWidth: 720, padding: '32px 24px' }}>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">매물 등록</h1>
            <p className="text-stone-400 text-sm mt-1">요가 스튜디오 매물 정보를 등록하세요</p>
          </div>
          <Link href="/property" className="text-sm text-[#23211C] hover:text-black font-medium transition-colors">
            ← 목록으로
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 space-y-6">

          <div>
            <label className={labelClass}>거래 유형 *</label>
            <div className="flex gap-3">
              {['임대', '매매', '양도'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, property_type: t })}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition ${
                    formData.property_type === t
                      ? 'bg-[#23211C] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {t}
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
              placeholder="예: 강남 요가 스튜디오 임대 (전용 50평)"
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>위치</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="예: 서울 강남구 역삼동"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>면적</label>
              <input
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="예: 50평 / 165㎡"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>가격</label>
            <input
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="예: 보증금 5천만 / 월세 300만, 매매가 5억"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>상세 설명 *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="시설 현황, 권리금, 인테리어 상태, 계약 조건 등 자세히 작성해주세요"
              rows={6}
              required
              className={inputClass + ' resize-none'}
            />
          </div>

          <div>
            <label className={labelClass}>연락처</label>
            <input
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="전화번호 또는 이메일 (로그인 사용자에게만 공개)"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#23211C] text-white font-bold rounded-2xl hover:bg-black active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? '등록 중...' : '매물 등록하기'}
          </button>
        </form>
      </div>
    </main>
  );
}
