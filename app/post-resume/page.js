'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostResume() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkUser();
  }, []);

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

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    yogaStyles: '',
    experienceYears: '',
    certifications: '',
    photoUrl: '',
    introduction: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const { data, error } = await supabase
    .from('candidate')
    .insert([
      {
        name: formData.name,
        location: formData.location,
        yoga_styles: formData.yogaStyles,
        experience_years: formData.experienceYears,
        certifications: formData.certifications,
        photo_url: formData.photoUrl,
        introduction: formData.introduction
      }
    ])
    .select();

  if (error) {
    console.error('에러:', error);
    alert('등록 실패: ' + error.message);
  } else {
    alert('이력서가 성공적으로 등록되었습니다!');
    if (data && data[0]) {
      router.push(`/resumes/${data[0].id}`);
    } else {
      router.push('/resumes');
    }
  }
};

  if (loading) {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </main>
  );
}

return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-purple-600 hover:underline mb-6 inline-block">
          ← 홈으로 돌아가기
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            이력서 등록
          </h1>
          <p className="text-gray-600 mb-8">
            요가 강사로 일하고 싶으신가요? 이력서를 등록해주세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                이름 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 김요가"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                희망 지역 *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="예: 서울 강남구"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                가능한 요가 종류 *
              </label>
              <input
                type="text"
                name="yogaStyles"
                value={formData.yogaStyles}
                onChange={handleChange}
                placeholder="예: 빈야사, 하타요가, 파워요가"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                경력
              </label>
              <select
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">선택해주세요</option>
                <option value="신입">신입</option>
                <option value="1년">1년</option>
                <option value="2년">2년</option>
                <option value="3년">3년</option>
                <option value="4년">4년</option>
                <option value="5년 이상">5년 이상</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                자격증
              </label>
              <input
                type="text"
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                placeholder="예: 요가지도자 2급, RYT 200"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                프로필 사진 URL
              </label>
              <input
                type="url"
                name="photoUrl"
                value={formData.photoUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                이미지 URL을 입력하세요 (선택사항)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                자기소개 *
              </label>
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                placeholder="본인의 강점, 강의 스타일 등을 자유롭게 작성해주세요"
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition"
            >
              이력서 등록하기
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}