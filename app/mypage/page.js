'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [myResumes, setMyResumes] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [bookmarkedResumes, setBookmarkedResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('로그인이 필요합니다');
      router.push('/login?redirect=mypage');
      return;
    }

    setUser(user);
    fetchMyData(user.id);
  };

  const fetchMyData = async (userId) => {
    setLoading(true);

    // 내가 등록한 구인 공고
    const { data: jobsData } = await supabase
      .from('job')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (jobsData) setMyJobs(jobsData);

    // 내가 등록한 이력서
    const { data: resumesData } = await supabase
      .from('candidate')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (resumesData) setMyResumes(resumesData);

    // 북마크한 구인 공고
  const { data: bookmarkedJobsData } = await supabase
    .from('bookmarks')
    .select('job_id')
    .eq('user_id', userId)
    .not('job_id', 'is', null);

  if (bookmarkedJobsData && bookmarkedJobsData.length > 0) {
    const jobPromises = bookmarkedJobsData.map(b => 
      supabase
        .from('job')
        .select('*')
        .eq('id', b.job_id)
        .single()
    );
    
    const jobResults = await Promise.all(jobPromises);
    const jobs = jobResults
      .filter(r => r.data)
      .map(r => r.data);
    
    if (jobs.length > 0) setBookmarkedJobs(jobs);
  }

  // 북마크한 이력서
  const { data: bookmarkedResumesData } = await supabase
    .from('bookmarks')
    .select('candidate_id')
    .eq('user_id', userId)
    .not('candidate_id', 'is', null);

  if (bookmarkedResumesData && bookmarkedResumesData.length > 0) {
    const resumePromises = bookmarkedResumesData.map(b => 
      supabase
        .from('candidate')
        .select('*')
        .eq('id', b.candidate_id)
        .single()
    );
    
    const resumeResults = await Promise.all(resumePromises);
    const resumes = resumeResults
      .filter(r => r.data)
      .map(r => r.data);
    
    if (resumes.length > 0) setBookmarkedResumes(resumes);
  }

    setLoading(false);
  };

  const deleteJob = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('job')
      .delete()
      .eq('id', id);

    if (error) {
      alert('삭제 실패');
    } else {
      alert('삭제되었습니다!');
      fetchMyData(user.id);
    }
  };

  const deleteResume = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('candidate')
      .delete()
      .eq('id', id);

    if (error) {
      alert('삭제 실패');
    } else {
      alert('삭제되었습니다!');
      fetchMyData(user.id);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">마이페이지</h1>
            <p className="text-gray-600 mt-2">{user?.email}</p>
          </div>
          <Link href="/" className="text-purple-600 hover:underline">
            ← 홈으로
          </Link>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'jobs'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              내가 등록한 구인 공고 ({myJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('resumes')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'resumes'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              내가 등록한 이력서 ({myResumes.length})
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'bookmarks'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              북마크 ({bookmarkedJobs.length + bookmarkedResumes.length})
            </button>
          </div>
        </div>

        {/* 내용 */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : activeTab === 'jobs' ? (
          myJobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <p className="text-gray-500 mb-4">등록한 구인 공고가 없습니다</p>
              <Link href="/post-job">
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  구인 공고 등록하기
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {myJobs.map((job) => (
                  <div key={job.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                        <div className="flex gap-4 text-sm text-gray-600 mb-3">
                          <span>📍 {job.location}</span>
                          <span>🧘 {job.yoga_style}</span>
                          {job.salary && <span>💰 {job.salary}</span>}
                        </div>
                        <p className="text-gray-600 text-sm">
                          등록일: {new Date(job.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${job.id}`}>
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                            보기
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : activeTab === 'resumes' ? (
          myResumes.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <p className="text-gray-500 mb-4">등록한 이력서가 없습니다</p>
              <Link href="/post-resume">
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  이력서 등록하기
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {myResumes.map((resume) => (
                  <div key={resume.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{resume.name}</h3>
                        <div className="flex gap-4 text-sm text-gray-600 mb-3">
                          <span>📍 {resume.location}</span>
                          <span>🧘 {resume.yoga_styles}</span>
                          {resume.experience_years && <span>⏱ {resume.experience_years}</span>}
                        </div>
                        <p className="text-gray-600 text-sm">
                          등록일: {new Date(resume.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/resumes/${resume.id}`}>
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                            보기
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteResume(resume.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : activeTab === 'bookmarks' ? (
          <div className="space-y-6">
            {/* 북마크한 구인 공고 */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">북마크한 구인 공고</h2>
              {bookmarkedJobs.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                  <p className="text-gray-500">북마크한 구인 공고가 없습니다</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {bookmarkedJobs.map((job) => (
                      <div key={job.id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                            <div className="flex gap-4 text-sm text-gray-600 mb-3">
                              <span>📍 {job.location}</span>
                              <span>🧘 {job.yoga_style}</span>
                            </div>
                          </div>
                          <Link href={`/jobs/${job.id}`}>
                            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                              보기
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 북마크한 이력서 */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">북마크한 강사</h2>
              {bookmarkedResumes.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                  <p className="text-gray-500">북마크한 강사가 없습니다</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {bookmarkedResumes.map((resume) => (
                      <div key={resume.id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{resume.name}</h3>
                            <div className="flex gap-4 text-sm text-gray-600 mb-3">
                              <span>📍 {resume.location}</span>
                              <span>🧘 {resume.yoga_styles}</span>
                            </div>
                          </div>
                          <Link href={`/resumes/${resume.id}`}>
                            <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                              보기
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}