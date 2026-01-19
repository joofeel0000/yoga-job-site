'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function JobDetail() {
  const params = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('에러:', error);
    } else {
      setJob(data);
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

  if (!job) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 mb-4">공고를 찾을 수 없습니다</p>
            <Link href="/jobs" className="text-purple-600 hover:underline">
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
        <Link href="/jobs" className="text-purple-600 hover:underline mb-6 inline-block">
          ← 목록으로 돌아가기
        </Link>

        {/* 상세 내용 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 제목 */}
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            {job.title}
          </h1>

          {/* 기본 정보 */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 bg-purple-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">📍 지역</p>
              <p className="text-lg font-semibold text-gray-800">{job.location}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">🧘 요가 종류</p>
              <p className="text-lg font-semibold text-gray-800">{job.yoga_style}</p>
            </div>

            {job.experience && (
              <div>
                <p className="text-sm text-gray-600 mb-1">📊 필요 경력</p>
                <p className="text-lg font-semibold text-gray-800">{job.experience}</p>
              </div>
            )}

            {job.salary && (
              <div>
                <p className="text-sm text-gray-600 mb-1">💰 급여</p>
                <p className="text-lg font-semibold text-gray-800">{job.salary}</p>
              </div>
            )}
          </div>

          {/* 상세 설명 */}
          {job.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">상세 설명</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>
            </div>
          )}

          {/* 등록일 */}
          <div className="border-t pt-6">
            <p className="text-gray-400 text-sm">
              등록일: {new Date(job.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* 지원 버튼 (임시) */}
          <div className="mt-8">
            <button className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition">
              지원하기
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}