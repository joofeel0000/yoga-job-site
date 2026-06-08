'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYogaStyle, setFilterYogaStyle] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('에러:', error);
    else setJobs(data);
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job => {
    const matchSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchYogaStyle = !filterYogaStyle || job.yoga_style === filterYogaStyle;
    return matchSearch && matchYogaStyle;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">구인 공고</h1>
            <p className="text-stone-400 text-sm mt-1">요가 강사를 모집하는 센터들을 만나보세요</p>
          </div>
          <Link href="/" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
            ← 홈으로
          </Link>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">검색</label>
              <input
                type="text"
                placeholder="제목, 지역으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">요가 종류</label>
              <select
                value={filterYogaStyle}
                onChange={(e) => setFilterYogaStyle(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
              >
                <option value="">전체</option>
                <option value="하타요가">하타요가</option>
                <option value="빈야사">빈야사</option>
                <option value="아쉬탕가">아쉬탕가</option>
                <option value="파워요가">파워요가</option>
                <option value="음요가">음요가</option>
                <option value="핫요가">핫요가</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>
        </div>

        {/* 공고 목록 */}
        {loading ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-3 animate-pulse">🌿</div>
            <p className="text-stone-400 text-sm">불러오는 중...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-stone-200 text-center">
            <span className="text-5xl mb-4">🧘‍♀️</span>
            <p className="text-stone-500 font-medium">
              {searchTerm || filterYogaStyle ? '검색 결과가 없습니다' : '아직 등록된 공고가 없어요'}
            </p>
            <p className="text-stone-400 text-sm mt-1">
              {searchTerm || filterYogaStyle ? '다른 검색어나 요가 종류로 시도해보세요' : '첫 번째 구인 공고를 올려보세요'}
            </p>
            {!(searchTerm || filterYogaStyle) && (
              <Link href="/post-job">
                <button className="mt-5 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-full hover:bg-green-800 transition">
                  공고 등록하기
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <Link href={`/jobs/${job.id}`} key={job.id}>
                <div className="bg-white rounded-2xl border border-stone-100 p-6 hover:border-green-200 hover:shadow-md transition cursor-pointer h-full flex flex-col">
                  <h3 className="text-base font-bold text-stone-800 mb-3 leading-snug">
                    {job.title}
                  </h3>

                  <div className="space-y-1.5 mb-4 flex-1">
                    <p className="text-stone-500 text-sm flex items-center gap-2">
                      <span>📍</span>{job.location}
                    </p>
                    <p className="text-stone-500 text-sm flex items-center gap-2">
                      <span>🌿</span>{job.yoga_style}
                    </p>
                    {job.experience && (
                      <p className="text-stone-500 text-sm flex items-center gap-2">
                        <span>📊</span>{job.experience}
                      </p>
                    )}
                    {job.salary && (
                      <p className="text-stone-500 text-sm flex items-center gap-2">
                        <span>💰</span>{job.salary}
                      </p>
                    )}
                  </div>

                  {job.description && (
                    <p className="text-stone-400 text-xs line-clamp-2 mb-4">
                      {job.description}
                    </p>
                  )}

                  <p className="text-stone-300 text-xs">
                    {new Date(job.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && (
          <div className="mt-8 text-center">
            <p className="text-stone-300 text-sm">총 {filteredJobs.length}개의 공고</p>
          </div>
        )}
      </div>
    </main>
  );
}
