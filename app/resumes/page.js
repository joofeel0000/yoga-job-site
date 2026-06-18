'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BannerZone from '@/app/components/BannerZone';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('candidate')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('에러:', error);
    else setResumes(data);
    setLoading(false);
  };

  const filteredResumes = resumes.filter(resume =>
    resume.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.yoga_styles?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">강사 찾기</h1>
            <p className="text-stone-400 text-sm mt-1">센터에 어울리는 요가 강사를 찾아보세요</p>
          </div>
          <Link href="/" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
            ← 홈으로
          </Link>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">검색</label>
          <input
            type="text"
            placeholder="이름, 지역, 요가 종류로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
          />
        </div>

        {/* 이력서 목록 + 사이드바 */}
        <div className="flex gap-6 items-start">

          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-24">
                <div className="text-4xl mb-3 animate-pulse">🌺</div>
                <p className="text-stone-400 text-sm">불러오는 중...</p>
              </div>
            ) : filteredResumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-stone-200 text-center">
                <span className="text-5xl mb-4">🌺</span>
                <p className="text-stone-500 font-medium">
                  {searchTerm ? '검색 결과가 없습니다' : '아직 등록된 강사가 없어요'}
                </p>
                <p className="text-stone-400 text-sm mt-1">
                  {searchTerm ? '다른 이름, 지역, 요가 종류로 시도해보세요' : '첫 번째 이력서를 등록해보세요'}
                </p>
                {!searchTerm && (
                  <Link href="/post-resume">
                    <button className="mt-5 px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-full hover:bg-amber-700 transition">
                      이력서 등록하기
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResumes.map((resume) => (
                  <Link href={`/resumes/${resume.id}`} key={resume.id} className="block">
                    <div className="bg-white rounded-2xl border border-stone-100 p-6 hover:border-amber-200 hover:shadow-md transition cursor-pointer h-full flex flex-col">
                      {resume.photo_url && (
                        <div className="mb-4 flex justify-center">
                          <img
                            src={resume.photo_url}
                            alt={resume.name}
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-stone-100"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <h3 className="text-base font-bold text-stone-800 mb-3 text-center">
                        {resume.name}
                      </h3>
                      <div className="space-y-1.5 mb-4 flex-1">
                        <p className="text-stone-500 text-sm flex items-center gap-2">
                          <span>📍</span>{resume.location}
                        </p>
                        <p className="text-stone-500 text-sm flex items-center gap-2">
                          <span>🌿</span>{resume.yoga_styles}
                        </p>
                        {resume.experience_years && (
                          <p className="text-stone-500 text-sm flex items-center gap-2">
                            <span>📊</span>경력 {resume.experience_years}
                          </p>
                        )}
                        {resume.certifications && (
                          <p className="text-stone-500 text-sm flex items-center gap-2">
                            <span>🏆</span>{resume.certifications}
                          </p>
                        )}
                      </div>
                      {resume.introduction && (
                        <p className="text-stone-400 text-xs line-clamp-2 mb-4">
                          {resume.introduction}
                        </p>
                      )}
                      <p className="text-stone-300 text-xs text-center">
                        {new Date(resume.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && (
              <div className="mt-8 text-center">
                <p className="text-stone-300 text-sm">총 {filteredResumes.length}명의 강사</p>
              </div>
            )}
          </div>

          {/* 우측 사이드바 배너 */}
          <BannerZone position="resumes_top" />
        </div>

      </div>
    </main>
  );
}
