'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ResumeDetail() {
  const params = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('candidate')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('에러:', error);
    } else {
      setResume(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500 py-20">로딩 중...</p>
        </div>
      </main>
    );
  }

  if (!resume) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 mb-4">이력서를 찾을 수 없습니다</p>
            <Link href="/resumes" className="text-indigo-600 hover:underline">
              ← 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 */}
        <Link href="/resumes" className="text-indigo-600 hover:underline mb-6 inline-block">
          ← 목록으로 돌아가기
        </Link>

        {/* 상세 내용 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 프로필 사진 */}
          {resume.photo_url && (
            <div className="text-center mb-6">
              <img 
                src={resume.photo_url} 
                alt={resume.name}
                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-indigo-100"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          )}

          {/* 이름 */}
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
            {resume.name}
          </h1>

          {/* 기본 정보 */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 bg-indigo-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">📍 희망 지역</p>
              <p className="text-lg font-semibold text-gray-800">{resume.location}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">🧘 가능한 요가 종류</p>
              <p className="text-lg font-semibold text-gray-800">{resume.yoga_styles}</p>
            </div>

            {resume.experience_years && (
              <div>
                <p className="text-sm text-gray-600 mb-1">📊 경력</p>
                <p className="text-lg font-semibold text-gray-800">{resume.experience_years}</p>
              </div>
            )}

            {resume.certifications && (
              <div>
                <p className="text-sm text-gray-600 mb-1">🏆 자격증</p>
                <p className="text-lg font-semibold text-gray-800">{resume.certifications}</p>
              </div>
            )}
          </div>

          {/* 자기소개 */}
          {resume.introduction && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">자기소개</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {resume.introduction}
                </p>
              </div>
            </div>
          )}

          {/* 등록일 */}
          <div className="border-t pt-6">
            <p className="text-gray-400 text-sm">
              등록일: {new Date(resume.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* 연락하기 버튼 (임시) */}
          <div className="mt-8">
            <button className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition">
              연락하기
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}