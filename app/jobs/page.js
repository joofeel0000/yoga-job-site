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
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('에러:', error);
    } else {
      setJobs(data);
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job => {
    const matchSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchYogaStyle = 
      !filterYogaStyle || job.yoga_style === filterYogaStyle;

    return matchSearch && matchYogaStyle;
  });

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900">
            🧘‍♀️ 요가 구인 공고
          </h1>
          <Link href="/" className="text-purple-600 hover:underline">
            ← 홈으로
          </Link>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* 검색 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                검색
              </label>
              <input
                type="text"
                placeholder="제목, 지역으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* 요가 종류 필터 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                요가 종류
              </label>
              <select
                value={filterYogaStyle}
                onChange={(e) => setFilterYogaStyle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          <div className="text-center py-20">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Link href={`/jobs/${job.id}`} key={job.id}>
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {job.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 flex items-center">
                    <span className="font-semibold mr-2">📍</span>
                    {job.location}
                  </p>
                  
                  <p className="text-gray-600 flex items-center">
                    <span className="font-semibold mr-2">🧘</span>
                    {job.yoga_style}
                  </p>
                  
                  {job.experience && (
                    <p className="text-gray-600 flex items-center">
                      <span className="font-semibold mr-2">📊</span>
                      {job.experience}
                    </p>
                  )}
                  
                  {job.salary && (
                    <p className="text-gray-600 flex items-center">
                      <span className="font-semibold mr-2">💰</span>
                      {job.salary}
                    </p>
                  )}
                </div>

                {job.description && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {job.description}
                  </p>
                )}

                <p className="text-gray-400 text-xs">
                  등록일: {new Date(job.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            총 {filteredJobs.length}개의 공고
          </p>
        </div>
      </div>
    </main>
  );
}