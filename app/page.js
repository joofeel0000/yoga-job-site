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

      if (profile && profile.role === 'admin') setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  const fetchRecentData = async () => {
    const { data: jobsData } = await supabase
      .from('job')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    if (jobsData) setRecentJobs(jobsData);

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
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/40 to-emerald-50/30">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-stone-100 via-amber-50 to-emerald-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-8 pt-10 pb-14">

          {/* Auth bar */}
          <div className="flex justify-end mb-10 gap-2">
            {user ? (
              <>
                <span className="self-center text-stone-400 text-sm mr-1">{user.email}</span>
                <Link href="/mypage">
                  <button className="px-4 py-2 bg-green-700 text-white text-sm rounded-full hover:bg-green-800 transition font-medium">
                    마이페이지
                  </button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <button className="px-4 py-2 bg-amber-600 text-white text-sm rounded-full hover:bg-amber-700 transition font-medium">
                      관리자
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-stone-200 text-stone-600 text-sm rounded-full hover:bg-stone-300 transition font-medium"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/login">
                <button className="px-5 py-2 bg-green-700 text-white text-sm rounded-full hover:bg-green-800 transition font-medium shadow-sm">
                  로그인
                </button>
              </Link>
            )}
          </div>

          {/* Hero text */}
          <div className="text-center">
            <div className="text-6xl mb-5">🌿</div>
            <h1 className="text-5xl font-bold text-stone-800 mb-3 tracking-tight">
              요가 구인구직 플랫폼
            </h1>
            <p className="text-stone-500 text-lg mb-1">요가 강사와 센터를 연결하는 따뜻한 공간</p>
            <p className="text-stone-400 text-sm">AI 스마트 매칭 서비스</p>
          </div>
        </div>

        {/* Decorative accent line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-60" />
      </section>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">

          {/* 구인 카드 */}
          <section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center text-xl shrink-0">💼</div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">강사를 찾으시나요?</h2>
                <p className="text-xs text-stone-400 mt-0.5">AI가 최적의 요가 강사를 연결해드립니다</p>
              </div>
            </div>

            <Link href="/post-job">
              <button className="w-full mb-7 py-3 bg-green-700 text-white rounded-2xl font-semibold hover:bg-green-800 active:scale-95 transition text-sm">
                구인 공고 등록하기
              </button>
            </Link>

            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">최근 구인 공고</span>
              <Link href="/jobs" className="text-green-600 hover:text-green-700 text-xs font-semibold">
                더보기 →
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 text-center">
                <span className="text-4xl mb-3">🧘‍♀️</span>
                <p className="text-stone-500 font-medium text-sm">아직 등록된 공고가 없어요</p>
                <p className="text-stone-400 text-xs mt-1">첫 번째 구인 공고를 올려보세요</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="p-4 bg-stone-50 rounded-2xl border border-transparent hover:bg-green-50 hover:border-green-200 transition cursor-pointer">
                      <p className="font-semibold text-stone-800 text-sm mb-1">{job.title}</p>
                      <div className="flex gap-3 text-xs text-stone-500">
                        <span>📍 {job.location}</span>
                        <span>🌿 {job.yoga_style}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* 구직 카드 */}
          <section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-xl shrink-0">🙋‍♀️</div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">일자리를 찾으시나요?</h2>
                <p className="text-xs text-stone-400 mt-0.5">나에게 딱 맞는 요가 센터를 찾아보세요</p>
              </div>
            </div>

            <Link href="/post-resume">
              <button className="w-full mb-7 py-3 bg-amber-600 text-white rounded-2xl font-semibold hover:bg-amber-700 active:scale-95 transition text-sm">
                이력서 등록하기
              </button>
            </Link>

            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">최근 등록 강사</span>
              <Link href="/resumes" className="text-amber-600 hover:text-amber-700 text-xs font-semibold">
                더보기 →
              </Link>
            </div>

            {recentResumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 text-center">
                <span className="text-4xl mb-3">🌺</span>
                <p className="text-stone-500 font-medium text-sm">아직 등록된 강사가 없어요</p>
                <p className="text-stone-400 text-xs mt-1">첫 번째 이력서를 등록해보세요</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentResumes.map((resume) => (
                  <Link key={resume.id} href={`/resumes/${resume.id}`}>
                    <div className="p-4 bg-stone-50 rounded-2xl border border-transparent hover:bg-amber-50 hover:border-amber-200 transition cursor-pointer">
                      <p className="font-semibold text-stone-800 text-sm mb-1">{resume.name}</p>
                      <div className="flex gap-3 text-xs text-stone-500">
                        <span>📍 {resume.location}</span>
                        <span>🌿 {resume.yoga_styles}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer tagline */}
        <div className="text-center mt-12 pt-8 border-t border-stone-100">
          <p className="text-stone-300 text-sm">🌿 요가로 연결되는 따뜻한 인연</p>
        </div>
      </div>
    </main>
  );
}
