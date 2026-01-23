'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  closeJob, 
  reopenJob, 
  extendJobExpiry,
  closeResume,
  reopenResume,
  extendResumeExpiry,
  getStatusBadge 
} from '@/lib/expiry';

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [myResumes, setMyResumes] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [bookmarkedResumes, setBookmarkedResumes] = useState([]);
  const [myApplications, setMyApplications] = useState([]); // 내가 지원한 공고
  const [receivedApplications, setReceivedApplications] = useState([]); // 내 공고에 온 지원
  const [myContacts, setMyContacts] = useState([]); // 내가 연락한 이력서
  const [receivedContacts, setReceivedContacts] = useState([]); // 내 이력서에 온 연락
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

    // 🆕 내가 지원한 공고들 (구인 공고만 - job_id가 있는 것)
    console.log('🔍 내 지원 내역 조회 시작. userId:', userId);
    
    const { data: myAppsData, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .not('job_id', 'is', null)  // job_id가 NULL이 아닌 것만
      .order('created_at', { ascending: false });
    
    console.log('✅ 지원 내역 조회 결과:', myAppsData);
    console.log('❌ 에러:', appsError);
    
    if (myAppsData && myAppsData.length > 0) {
      // 각 지원에 대한 공고 정보를 별도로 가져오기
      const appsWithJobs = await Promise.all(
        myAppsData.map(async (app) => {
          const { data: jobData } = await supabase
            .from('job')
            .select('*')
            .eq('id', app.job_id)
            .single();
          
          return {
            ...app,
            job: jobData
          };
        })
      );
      
      console.log('✅ 공고 정보와 함께:', appsWithJobs);
      setMyApplications(appsWithJobs);
    } else {
      setMyApplications([]);
    }

    // 🆕 내 공고에 온 지원들 (job_id가 있는 것만)
    if (jobsData && jobsData.length > 0) {
      const jobIds = jobsData.map(j => j.id);
      const { data: receivedAppsData } = await supabase
        .from('applications')
        .select('*')
        .in('job_id', jobIds)
        .not('job_id', 'is', null)  // job_id가 NULL이 아닌 것만
        .order('created_at', { ascending: false });
      
      if (receivedAppsData && receivedAppsData.length > 0) {
        const appsWithJobs = await Promise.all(
          receivedAppsData.map(async (app) => {
            const { data: jobData } = await supabase
              .from('job')
              .select('*')
              .eq('id', app.job_id)
              .single();
            
            return {
              ...app,
              job: jobData
            };
          })
        );
        setReceivedApplications(appsWithJobs);
      }
    }

    // 🆕 내가 연락한 이력서들 (applications 테이블, candidate_id가 있는 것만)
    const { data: myContactsData } = await supabase
      .from('applications')  // contacts → applications로 변경
      .select('*')
      .eq('user_id', userId)
      .not('candidate_id', 'is', null)  // candidate_id가 NULL이 아닌 것만
      .order('created_at', { ascending: false });
    
    if (myContactsData && myContactsData.length > 0) {
      const contactsWithResumes = await Promise.all(
        myContactsData.map(async (contact) => {
          const { data: candidateData } = await supabase
            .from('candidate')
            .select('*')
            .eq('id', contact.candidate_id)
            .single();
          
          return {
            ...contact,
            candidate: candidateData
          };
        })
      );
      setMyContacts(contactsWithResumes);
    } else {
      setMyContacts([]);
    }

    // 🆕 내 이력서에 온 연락들 (applications 테이블, candidate_id가 있는 것만)
    if (resumesData && resumesData.length > 0) {
      const resumeIds = resumesData.map(r => r.id);
      const { data: receivedContactsData } = await supabase
        .from('applications')  // contacts → applications로 변경
        .select('*')
        .in('candidate_id', resumeIds)
        .not('candidate_id', 'is', null)  // candidate_id가 NULL이 아닌 것만
        .order('created_at', { ascending: false });
      
      if (receivedContactsData && receivedContactsData.length > 0) {
        const contactsWithResumes = await Promise.all(
          receivedContactsData.map(async (contact) => {
            const { data: candidateData } = await supabase
              .from('candidate')
              .select('*')
              .eq('id', contact.candidate_id)
              .single();
            
            return {
              ...contact,
              candidate: candidateData
            };
          })
        );
        setReceivedContacts(contactsWithResumes);
      }
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
          <div className="flex gap-4">
            <Link href="/profile" className="text-purple-600 hover:underline">
              프로필 설정 →
            </Link>
            <Link href="/" className="text-purple-600 hover:underline">
              ← 홈으로
            </Link>
          </div>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-xl shadow mb-6 overflow-x-auto">
          <div className="flex border-b min-w-max">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 py-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'jobs'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              내 구인공고 ({myJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('resumes')}
              className={`flex-1 py-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'resumes'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              내 이력서 ({myResumes.length})
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 py-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'bookmarks'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              북마크 ({bookmarkedJobs.length + bookmarkedResumes.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'applications'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              내 지원내역 ({myApplications.length + myContacts.length})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'received'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              받은 지원/연락 ({receivedApplications.length + receivedContacts.length})
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
                {myJobs.map((job) => {
                  const statusBadge = getStatusBadge(job.status, job.expires_at);
                  
                  return (
                    <div key={job.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                              {statusBadge.icon} {statusBadge.text}
                            </span>
                          </div>
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
                          
                          {/* 상태별 버튼 */}
                          {job.status === 'active' ? (
                            <>
                              <button
                                onClick={async () => {
                                  if (confirm('공고를 마감하시겠습니까?')) {
                                    const { error } = await closeJob(job.id);
                                    if (!error) {
                                      alert('공고가 마감되었습니다');
                                      fetchMyData(user.id);
                                    }
                                  }
                                }}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                              >
                                마감
                              </button>
                              <button
                                onClick={async () => {
                                  const { error } = await extendJobExpiry(job.id, 30);
                                  if (!error) {
                                    alert('만료일이 30일 연장되었습니다');
                                    fetchMyData(user.id);
                                  }
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                              >
                                연장
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={async () => {
                                const { error } = await reopenJob(job.id);
                                if (!error) {
                                  alert('공고가 다시 열렸습니다');
                                  fetchMyData(user.id);
                                }
                              }}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                              다시 열기
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                {myResumes.map((resume) => {
                  const statusBadge = getStatusBadge(resume.status, resume.expires_at);
                  
                  return (
                    <div key={resume.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{resume.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                              {statusBadge.icon} {statusBadge.text}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600 mb-3">
                            <span>📍 {resume.location}</span>
                            <span>🧘 {resume.yoga_styles}</span>
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
                          
                          {resume.status === 'active' ? (
                            <>
                              <button
                                onClick={async () => {
                                  if (confirm('이력서를 마감하시겠습니까?')) {
                                    const { error } = await closeResume(resume.id);
                                    if (!error) {
                                      alert('이력서가 마감되었습니다');
                                      fetchMyData(user.id);
                                    }
                                  }
                                }}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                              >
                                마감
                              </button>
                              <button
                                onClick={async () => {
                                  const { error } = await extendResumeExpiry(resume.id, 30);
                                  if (!error) {
                                    alert('만료일이 30일 연장되었습니다');
                                    fetchMyData(user.id);
                                  }
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                              >
                                연장
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={async () => {
                                const { error } = await reopenResume(resume.id);
                                if (!error) {
                                  alert('이력서가 다시 열렸습니다');
                                  fetchMyData(user.id);
                                }
                              }}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                              다시 열기
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteResume(resume.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
        ) : activeTab === 'applications' ? (
          /* 🆕 내가 지원한 공고들 */
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">내가 지원한 공고</h2>
            {myApplications.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500">아직 지원한 공고가 없습니다</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {myApplications.map((app) => (
                    <div key={app.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">
                              {app.job?.title || '삭제된 공고'}
                            </h3>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              지원 완료
                            </span>
                          </div>
                          {app.job && (
                            <div className="flex gap-4 text-sm text-gray-600 mb-3">
                              <span>📍 {app.job.location}</span>
                              <span>🧘 {app.job.yoga_style}</span>
                            </div>
                          )}
                          <div className="bg-gray-50 p-4 rounded-lg mb-3">
                            <p className="text-sm text-gray-700 font-semibold mb-1">내 메시지:</p>
                            <p className="text-sm text-gray-600">{app.message || '메시지 없음'}</p>
                          </div>
                          <p className="text-gray-500 text-sm">
                            지원일: {new Date(app.created_at).toLocaleDateString('ko-KR')} {new Date(app.created_at).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                          </p>
                        </div>
                        {app.job && (
                          <Link href={`/jobs/${app.job.id}`}>
                            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                              공고 보기
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 내가 연락한 이력서들 */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">내가 연락한 강사</h2>
            {myContacts.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500">아직 연락한 강사가 없습니다</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {myContacts.map((contact) => (
                    <div key={contact.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">
                              {contact.candidate?.name || '삭제된 이력서'}
                            </h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              연락 완료
                            </span>
                          </div>
                          {contact.candidate && (
                            <div className="flex gap-4 text-sm text-gray-600 mb-3">
                              <span>📍 {contact.candidate.location}</span>
                              <span>🧘 {contact.candidate.yoga_styles}</span>
                            </div>
                          )}
                          <div className="bg-gray-50 p-4 rounded-lg mb-3">
                            <p className="text-sm text-gray-700 font-semibold mb-1">내 메시지:</p>
                            <p className="text-sm text-gray-600">{contact.message || '메시지 없음'}</p>
                          </div>
                          <p className="text-gray-500 text-sm">
                            연락일: {new Date(contact.created_at).toLocaleDateString('ko-KR')} {new Date(contact.created_at).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                          </p>
                        </div>
                        {contact.candidate && (
                          <Link href={`/resumes/${contact.candidate.id}`}>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                              이력서 보기
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'received' ? (
          /* 🆕 받은 지원/연락 */
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">내 공고에 온 지원</h2>
            {receivedApplications.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500">아직 받은 지원이 없습니다</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {receivedApplications.map((app) => (
                    <div key={app.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                              새 지원!
                            </span>
                            <h3 className="text-xl font-bold text-gray-800">
                              {app.job?.title || '삭제된 공고'}
                            </h3>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg mb-3">
                            <p className="text-sm text-gray-700 font-semibold mb-1">지원자 메시지:</p>
                            <p className="text-sm text-gray-600">{app.message || '메시지 없음'}</p>
                          </div>
                          <p className="text-gray-500 text-sm">
                            지원일: {new Date(app.created_at).toLocaleDateString('ko-KR')} {new Date(app.created_at).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                          </p>
                        </div>
                        {app.job && (
                          <Link href={`/jobs/${app.job.id}`}>
                            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                              공고 보기
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 내 이력서에 온 연락 */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">내 이력서에 온 연락</h2>
            {receivedContacts.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500">아직 받은 연락이 없습니다</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {receivedContacts.map((contact) => (
                    <div key={contact.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                              새 연락!
                            </span>
                            <h3 className="text-xl font-bold text-gray-800">
                              {contact.candidate?.name || '삭제된 이력서'}
                            </h3>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg mb-3">
                            <p className="text-sm text-gray-700 font-semibold mb-1">채용자 메시지:</p>
                            <p className="text-sm text-gray-600">{contact.message || '메시지 없음'}</p>
                          </div>
                          <p className="text-gray-500 text-sm">
                            연락일: {new Date(contact.created_at).toLocaleDateString('ko-KR')} {new Date(contact.created_at).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                          </p>
                        </div>
                        {contact.candidate && (
                          <Link href={`/resumes/${contact.candidate.id}`}>
                            <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                              이력서 보기
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}