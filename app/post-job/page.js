'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import Link from 'next/link';

export default function PostJob() {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    yogaStyle: '',
    experience: '',
    salary: '',
    description: ''
  });

const [aiGenerated, setAiGenerated] = useState('');
const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
      body: JSON.stringify({
        location: formData.location,
        yogaStyle: formData.yogaStyle,
        experience: formData.experience,
        salary: formData.salary
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || 'AI 생성 실패');
    }

    setAiGenerated(data.generatedText || '');
  } catch (err) {
    console.error(err);
    alert(String(err?.message || err));
  } finally {
    setIsGenerating(false);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('job')
      .insert([
        {
          title: formData.title,
          location: formData.location,
          yoga_style: formData.yogaStyle,
          experience: formData.experience,
          salary: formData.salary,
          description: formData.description
        }
      ]);

    if (error) {
      console.error('에러:', error);
      alert('등록 실패: ' + error.message);
    } else {
      alert('공고가 성공적으로 등록되었습니다!');
      setFormData({
        title: '',
        location: '',
        yogaStyle: '',
        experience: '',
        salary: '',
        description: ''
      });
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-purple-600 hover:underline mb-6 inline-block">
          ← 홈으로 돌아가기
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            구인 공고 등록
          </h1>
          <p className="text-gray-600 mb-8">
            필요한 정보를 입력하시면 AI가 매력적인 공고문을 작성해드립니다
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                공고 제목 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: 빈야사 요가 강사 모집"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                지역 *
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
                요가 종류 *
              </label>
              <select
                name="yogaStyle"
                value={formData.yogaStyle}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">선택해주세요</option>
                <option value="하타요가">하타요가</option>
                <option value="빈야사">빈야사</option>
                <option value="아쉬탕가">아쉬탕가</option>
                <option value="파워요가">파워요가</option>
                <option value="음요가">음요가</option>
                <option value="핫요가">핫요가</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                필요 경력
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">선택해주세요</option>
                <option value="신입">신입</option>
                <option value="1년 이상">1년 이상</option>
                <option value="3년 이상">3년 이상</option>
                <option value="5년 이상">5년 이상</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                급여 조건
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="예: 시급 30,000원 ~ 50,000원"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상세 설명
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="센터 소개, 근무 조건 등을 입력해주세요"
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <p className="text-sm text-purple-800 mb-3">
                💡 AI가 입력하신 정보를 바탕으로 전문적인 공고문을 작성해드립니다
              </p>
              <button
  type="button"
  onClick={generateWithAI}
  disabled={isGenerating}
  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
>
  {isGenerating ? '✨ AI가 작성 중...' : '✨ AI로 공고 작성하기'}
</button>

{aiGenerated && (
  <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
    <h4 className="font-semibold text-gray-800 mb-2">AI 생성 결과:</h4>
    <p className="text-gray-700 whitespace-pre-wrap">{aiGenerated}</p>
    <button
      type="button"
      onClick={() => setFormData({ ...formData, description: aiGenerated })}
      className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
    >
      이 내용을 상세 설명에 적용하기
    </button>
  </div>
)}

            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition"
            >
              공고 등록하기
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}