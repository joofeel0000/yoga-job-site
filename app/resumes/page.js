'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('에러:', error);
    } else {
      setResumes(data);
    }
    setLoading(false);
  };

  const filteredResumes = resumes.filter(resume => {
    const matchSearch = 
      resume.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.yoga_styles?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900">
            🙋‍♀️ 요가 강사 찾기
          </h1>
          <Link href="/" className="text-indigo-600 hover:underline">
            ← 홈으로
          </Link>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            검색
          </label>
          <input
            type="text"
            placeholder="이름, 지역, 요가 종류로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* 이력서 목록 */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <Link href={`/resumes/${resume.id}`} key={resume.id} className="block">
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer">     
                    {/* 프로필 사진 */}
                    {resume.photo_url && (
                    <div className="mb-4">
                        <img 
                        src={resume.photo_url} 
                        alt={resume.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto"
                        onError={(e) => { e.target.style.display = 'none' }}
                        />
                    </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                    {resume.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                    <p className="text-gray-600 flex items-center">
                        <span className="font-semibold mr-2">📍</span>
                        {resume.location}
                    </p>
                    
                    <p className="text-gray-600 flex items-center">
                        <span className="font-semibold mr-2">🧘</span>
                        {resume.yoga_styles}
                    </p>
                    
                    {resume.experience_years && (
                        <p className="text-gray-600 flex items-center">
                        <span className="font-semibold mr-2">📊</span>
                        경력 {resume.experience_years}
                        </p>
                    )}
                    
                    {resume.certifications && (
                        <p className="text-gray-600 flex items-center">
                        <span className="font-semibold mr-2">🏆</span>
                        {resume.certifications}
                        </p>
                    )}
                    </div>

                    {resume.introduction && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {resume.introduction}
                    </p>
                    )}

                    <p className="text-gray-400 text-xs">
                    등록일: {new Date(resume.created_at).toLocaleDateString('ko-KR')}
                    </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            총 {filteredResumes.length}명의 강사
          </p>
        </div>
      </div>
    </main>
  );
}