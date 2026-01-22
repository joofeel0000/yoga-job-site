'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentResumes, setRecentResumes] = useState([]);

  useEffect(() => {
    checkUser();
    fetchRecentData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile && profile.role === 'admin') {
        setIsAdmin(true);
      }
    } else {
      setIsAdmin(false);
    }
  };

  const fetchRecentData = async () => {
    // 최근 구인 공고 3개
    const { data: jobsData } = await supabase
      .from('job')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (jobsData) setRecentJobs(jobsData);

    // 최근 이력서 3개
    const { data: resumesData } = await supabase
      .from('candidate')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (resumesData) setRecentResumes(resumesData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    alert('로그아웃되었습니다');
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-12">
          <div className="flex justify-end mb-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{user.email}</span>
                <Link href="/mypage">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    📄 마이페이지
                  </button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                      🔧 관리자
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  로그인
                </button>
              </Link>
            )}
          </div>
          <h1 className="text-5xl font-bold text-purple-900 mb-4">
            🧘‍♀️ 요가 구인구직 플랫폼
          </h1>
          <p className="text-xl text-gray-600">
            AI가 도와주는 스마트한 매칭 서비스
          </p>
        </header>

        {/* 구인 섹션 */}
        {/* 구인/구직 섹션 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 구인 섹션 */}
          <section>
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full">
              <div className="text-4xl mb-3">💼</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                강사를 찾으시나요?
              </h2>
              <p className="text-gray-600 mb-6">
                AI가 최적의 요가 강사를 찾아드립니다
              </p>
              
              <Link href="/post-job">
                <button className="w-full mb-6 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
                  구인 공고 등록하기
                </button>
              </Link>

              {/* 최근 구인 공고 */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-700">최근 구인 공고</h3>
                <Link href="/jobs" className="text-purple-600 hover:underline text-sm font-semibold">
                  더보기 →
                </Link>
              </div>
              
              {recentJobs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">등록된 구인 공고가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentJobs.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <div className="p-3 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{job.title}</h4>
                            <div className="flex gap-3 text-sm text-gray-600 mt-1">
                              <span>📍 {job.location}</span>
                              <span>🧘 {job.yoga_style}</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-4">
                            {new Date(job.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 구직 섹션 */}
          <section>
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full">
              <div className="text-4xl mb-3">🙋‍♀️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                일자리를 찾으시나요?
              </h2>
              <p className="text-gray-600 mb-6">
                나에게 딱 맞는 요가 센터를 찾아보세요
              </p>
              
              <Link href="/post-resume">
                <button className="w-full mb-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                  이력서 등록하기
                </button>
              </Link>

              {/* 최근 이력서 */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-700">최근 등록된 강사</h3>
                <Link href="/resumes" className="text-indigo-600 hover:underline text-sm font-semibold">
                  더보기 →
                </Link>
              </div>
              
              {recentResumes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">등록된 이력서가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentResumes.map((resume) => (
                    <Link key={resume.id} href={`/resumes/${resume.id}`}>
                      <div className="p-3 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{resume.name}</h4>
                            <div className="flex gap-3 text-sm text-gray-600 mt-1">
                              <span>📍 {resume.location}</span>
                              <span>🧘 {resume.yoga_styles}</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-4">
                            {new Date(resume.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}