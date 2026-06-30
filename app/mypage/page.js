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
  const [myApplications, setMyApplications] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [myContacts, setMyContacts] = useState([]);
  const [receivedContacts, setReceivedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    // URL에서 탭 정보 읽기
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    
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

    // 내가 지원한 공고들
    const { data: myAppsData } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .not('job_id', 'is', null)
      .order('created_at', { ascending: false });
    
    if (myAppsData && myAppsData.length > 0) {
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
      
      setMyApplications(appsWithJobs);
    } else {
      setMyApplications([]);
    }

    // 내 공고에 온 지원들
    if (jobsData && jobsData.length > 0) {
      const jobIds = jobsData.map(j => j.id);
      const { data: receivedAppsData } = await supabase
        .from('applications')
        .select('*')
        .in('job_id', jobIds)
        .not('job_id', 'is', null)
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

    // 내가 연락한 이력서들
    const { data: myContactsData } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .not('candidate_id', 'is', null)
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

    // 내 이력서에 온 연락들
    if (resumesData && resumesData.length > 0) {
      const resumeIds = resumesData.map(r => r.id);
      const { data: receivedContactsData } = await supabase
        .from('applications')
        .select('*')
        .in('candidate_id', resumeIds)
        .not('candidate_id', 'is', null)
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
      window.location.href = "/mypage?tab=" + activeTab;
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
      window.location.href = "/mypage?tab=" + activeTab;
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F1E9]">
      <div className="mx-auto" style={{ maxWidth: 1200, padding: '32px 24px' }}>
        <div className="bg-white rounded-2xl border border-[#E3DDD0] shadow-sm p-6 mb-6 flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-[#26241D] tracking-[-0.02em]">마이페이지</h1>
            <p className="text-[#76705F] text-sm mt-1">{user?.email}</p>
          </div>
          <div className="flex gap-2 items-center">
            <Link href="/profile" className="inline-flex items-center px-4 py-2.5 bg-[#23211C] text-white text-sm font-bold rounded-xl hover:bg-black transition">
              프로필 설정 →
            </Link>
            <Link href="/" className="inline-flex items-center px-4 py-2.5 bg-white text-[#23211C] text-sm font-bold rounded-xl border border-[#E3DDD0] hover:bg-[#EFEBE1] transition">
              ← 홈으로
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-[#E3DDD0] p-5">
            <p className="text-[28px] font-extrabold text-[#23211C] leading-none tracking-[-0.02em]">{myJobs.length}</p>
            <p className="text-[13px] text-[#76705F] mt-2">내 구인공고</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E3DDD0] p-5">
            <p className="text-[28px] font-extrabold text-[#23211C] leading-none tracking-[-0.02em]">{myResumes.length}</p>
            <p className="text-[13px] text-[#76705F] mt-2">내 이력서</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E3DDD0] p-5">
            <p className="text-[28px] font-extrabold text-[#23211C] leading-none tracking-[-0.02em]">{bookmarkedJobs.length + bookmarkedResumes.length}</p>
            <p className="text-[13px] text-[#76705F] mt-2">북마크</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E3DDD0] p-5">
            <p className="text-[28px] font-extrabold text-[#23211C] leading-none tracking-[-0.02em]">{receivedApplications.length + receivedContacts.length}</p>
            <p className="text-[13px] text-[#76705F] mt-2">받은 지원·연락</p>
          </div>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-2xl border border-[#E3DDD0] shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-[#F0ECE2] min-w-max">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 py-4 px-4 font-semibold transition whitespace-nowrap text-sm ${
                activeTab === 'jobs'
                  ? 'text-[#23211C] border-b-2 border-[#23211C]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              내 구인공고 ({myJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('resumes')}
              className={`flex-1 py-4 px-4 font-semibold transition whitespace-nowrap text-sm ${
                activeTab === 'resumes'
                  ? 'text-[#23211C] border-b-2 border-[#23211C]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              내 이력서 ({myResumes.length})
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 py-4 px-4 font-semibold transition whitespace-nowrap text-sm ${
                activeTab === 'bookmarks'
                  ? 'text-[#23211C] border-b-2 border-[#23211C]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              북마크 ({bookmarkedJobs.length + bookmarkedResumes.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-4 px-4 font-semibold transition whitespace-nowrap text-sm ${
                activeTab === 'applications'
                  ? 'text-[#23211C] border-b-2 border-[#23211C]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              내 지원내역 ({myApplications.length + myContacts.length})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-4 px-4 font-semibold transition whitespace-nowrap text-sm ${
                activeTab === 'received'
                  ? 'text-[#23211C] border-b-2 border-[#23211C]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              받은 지원/연락 ({receivedApplications.length + receivedContacts.length})
            </button>
          </div>
        </div>

        {/* 내용 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#23211C] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-stone-400 text-sm">불러오는 중...</p>
          </div>
        ) : activeTab === 'jobs' ? (
          myJobs.length === 0 ? (
            <div className="card-empty">
              <p className="text-stone-400 mb-4 text-sm">등록한 구인 공고가 없습니다</p>
              <Link href="/post-job">
                <button className="px-6 py-3 bg-[#23211C] text-white rounded-full hover:bg-black transition text-sm font-semibold">
                  구인 공고 등록하기
                </button>
              </Link>
            </div>
          ) : (
            <div className="card">
              <div className="divide-y divide-[#F0ECE2]">
                {myJobs.map((job) => {
                  const statusBadge = getStatusBadge(job.status, job.expires_at);
                  
                  return (
                    <div key={job.id} className="p-5 hover:bg-[#FAF8F2] transition">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-[17px] font-bold text-[#26241D]">{job.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                              {statusBadge.icon} {statusBadge.text}
                            </span>
                          </div>
                          <div className="flex gap-3 text-[13px] text-[#76705F] mb-3 flex-wrap">
                            <span>📍 {job.location}</span>
                            <span>🌿 {job.yoga_style}</span>
                            {job.salary && <span>💰 {job.salary}</span>}
                          </div>
                          <p className="text-stone-400 text-sm">
                            등록일: {new Date(job.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center shrink-0">
                          <Link href={`/jobs/${job.id}`}>
                            <button className="btn-primary">
                              보기
                            </button>
                          </Link>
                          
                          {job.status !== 'closed' ? (
                            <>
                              <button
                                onClick={async () => {
                                  if (confirm('공고를 마감하시겠습니까?')) {
                                    const { error } = await closeJob(job.id);
                                    if (!error) {
                                      alert('공고가 마감되었습니다');
                                      window.location.href = '/mypage?tab=' + activeTab;
                                    } else {
                                      alert('마감 실패: ' + error);
                                    }
                                  }
                                }}
                                className="btn-secondary"
                              >
                                마감
                              </button>
                              <button
                                onClick={async () => {
                                  const { error } = await extendJobExpiry(job.id, 30);
                                  if (!error) {
                                    alert('만료일이 30일 연장되었습니다');
                                    window.location.href = '/mypage?tab=' + activeTab;
                                  } else {
                                    alert('연장 실패: ' + error);
                                  }
                                }}
                                className="btn-secondary"
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
                                  window.location.href = '/mypage?tab=' + activeTab;
                                } else {
                                  alert('다시 열기 실패: ' + error);
                                }
                              }}
                              className="btn-secondary"
                            >
                              다시 열기
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="btn-danger"
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
            <div className="card-empty">
              <p className="text-stone-400 mb-4 text-sm">등록한 이력서가 없습니다</p>
              <Link href="/post-resume">
                <button className="px-6 py-3 bg-[#23211C] text-white rounded-full hover:bg-black transition text-sm font-semibold">
                  이력서 등록하기
                </button>
              </Link>
            </div>
          ) : (
            <div className="card">
              <div className="divide-y divide-[#F0ECE2]">
                {myResumes.map((resume) => {
                  const statusBadge = getStatusBadge(resume.status, resume.expires_at);
                  
                  return (
                    <div key={resume.id} className="p-5 hover:bg-[#FAF8F2] transition">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-[17px] font-bold text-[#26241D]">{resume.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                              {statusBadge.icon} {statusBadge.text}
                            </span>
                          </div>
                          <div className="flex gap-3 text-[13px] text-[#76705F] mb-3 flex-wrap">
                            <span>📍 {resume.location}</span>
                            <span>🌿 {resume.yoga_styles}</span>
                          </div>
                          <p className="text-stone-400 text-sm">
                            등록일: {new Date(resume.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center shrink-0">
                          <Link href={`/resumes/${resume.id}`}>
                            <button className="btn-primary">
                              보기
                            </button>
                          </Link>
                          
                          {resume.status !== 'closed' ? (
                            <>
                              <button
                                onClick={async () => {
                                  if (confirm('이력서를 마감하시겠습니까?')) {
                                    const { error } = await closeResume(resume.id);
                                    if (!error) {
                                      alert('이력서가 마감되었습니다');
                                      window.location.href = "/mypage?tab=" + activeTab;
                                    } else {
                                      alert('마감 실패: ' + error);
                                    }
                                  }
                                }}
                                className="btn-secondary"
                              >
                                마감
                              </button>
                              <button
                                onClick={async () => {
                                  const { error } = await extendResumeExpiry(resume.id, 30);
                                  if (!error) {
                                    alert('만료일이 30일 연장되었습니다');
                                    window.location.href = "/mypage?tab=" + activeTab;
                                  } else {
                                    alert('연장 실패: ' + error);
                                  }
                                }}
                                className="btn-secondary"
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
                                  window.location.href = "/mypage?tab=" + activeTab;
                                } else {
                                  alert('다시 열기 실패: ' + error);
                                }
                              }}
                              className="btn-secondary"
                            >
                              다시 열기
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteResume(resume.id)}
                            className="btn-danger"
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
            <div>
              <h2 className="text-xl font-bold text-stone-800 mb-4">북마크한 구인 공고</h2>
              {bookmarkedJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E3DDD0] p-8 text-center">
                  <p className="text-stone-400 text-sm">북마크한 구인 공고가 없습니다</p>
                </div>
              ) : (
                <div className="card">
                  <div className="divide-y divide-[#F0ECE2]">
                    {bookmarkedJobs.map((job) => (
                      <div key={job.id} className="p-5 hover:bg-[#FAF8F2] transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-stone-800 mb-2">{job.title}</h3>
                            <div className="flex gap-4 text-sm text-stone-500 mb-3">
                              <span>📍 {job.location}</span>
                              <span>🌿 {job.yoga_style}</span>
                            </div>
                          </div>
                          <Link href={`/jobs/${job.id}`}>
                            <button className="px-4 py-2 bg-[#23211C] text-white rounded-full hover:bg-black transition text-sm font-semibold">
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

            <div>
              <h2 className="text-xl font-bold text-stone-800 mb-4">북마크한 강사</h2>
              {bookmarkedResumes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E3DDD0] p-8 text-center">
                  <p className="text-stone-400 text-sm">북마크한 강사가 없습니다</p>
                </div>
              ) : (
                <div className="card">
                  <div className="divide-y divide-[#F0ECE2]">
                    {bookmarkedResumes.map((resume) => (
                      <div key={resume.id} className="p-5 hover:bg-[#FAF8F2] transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-stone-800 mb-2">{resume.name}</h3>
                            <div className="flex gap-4 text-sm text-stone-500 mb-3">
                              <span>📍 {resume.location}</span>
                              <span>🌺 {resume.yoga_styles}</span>
                            </div>
                          </div>
                          <Link href={`/resumes/${resume.id}`}>
                            <button className="px-4 py-2 bg-[#23211C] text-white rounded-full hover:bg-black transition text-sm font-semibold">
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
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-stone-800 mb-4">내가 지원한 공고</h2>
              {myApplications.length === 0 ? (
                <div className="card-empty">
                  <p className="text-stone-400 text-sm">아직 지원한 공고가 없습니다</p>
                </div>
              ) : (
                <div className="card">
                  <div className="divide-y divide-[#F0ECE2]">
                    {myApplications.map((app) => (
                      <div key={app.id} className="p-5 hover:bg-[#FAF8F2] transition">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="text-lg font-bold text-stone-800">
                                {app.job?.title || '삭제된 공고'}
                              </h3>
                              <span className="px-3 py-1 bg-[#EAE7DE] text-[#23211C] rounded-full text-xs font-semibold">
                                지원 완료
                              </span>
                            </div>
                            {app.job && (
                              <div className="flex gap-3 text-[13px] text-[#76705F] mb-3 flex-wrap">
                                <span>📍 {app.job.location}</span>
                                <span>🌿 {app.job.yoga_style}</span>
                              </div>
                            )}
                            <div className="bg-stone-50 p-4 rounded-xl mb-3">
                              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">내 메시지</p>
                              <p className="text-sm text-stone-600">{app.message || '메시지 없음'}</p>
                            </div>
                            <p className="text-stone-400 text-xs">
                              지원일: {new Date(app.created_at).toLocaleDateString('ko-KR')} {new Date(app.created_at).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                          </div>
                          {app.job && (
                            <Link href={`/jobs/${app.job.id}`}>
                              <button className="btn-primary">
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
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-800 mb-4">내가 연락한 강사</h2>
              {myContacts.length === 0 ? (
                <div className="card-empty">
                  <p className="text-stone-400 text-sm">아직 연락한 강사가 없습니다</p>
                </div>
              ) : (
                <div className="card">
                  <div className="divide-y divide-[#F0ECE2]">
                    {myContacts.map((contact) => (
                      <div key={contact.id} className="p-5 hover:bg-[#FAF8F2] transition">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="text-lg font-bold text-stone-800">
                                {contact.candidate?.name || '삭제된 이력서'}
                              </h3>
                              <span className="px-3 py-1 bg-[#EAE7DE] text-[#23211C] rounded-full text-xs font-semibold">
                                연락 완료
                              </span>
                            </div>
                            {contact.candidate && (
                              <div className="flex gap-3 text-[13px] text-[#76705F] mb-3 flex-wrap">
                                <span>📍 {contact.candidate.location}</span>
                                <span>🌺 {contact.candidate.yoga_styles}</span>
                              </div>
                            )}
                            <div className="bg-stone-50 p-4 rounded-xl mb-3">
                              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">내 메시지</p>
                              <p className="text-sm text-stone-600">{contact.message || '메시지 없음'}</p>
                            </div>
                            <p className="text-stone-400 text-xs">
                              연락일: {new Date(contact.created_at).toLocaleDateString('ko-KR')} {new Date(contact.created_at).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                          </div>
                          {contact.candidate && (
                            <Link href={`/resumes/${contact.candidate.id}`}>
                              <button className="btn-primary">
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
          </div>
        ) : activeTab === 'received' ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-stone-800 mb-4">내 공고에 온 지원</h2>
              {receivedApplications.length === 0 ? (
                <div className="card-empty">
                  <p className="text-stone-400 text-sm">아직 받은 지원이 없습니다</p>
                </div>
              ) : (
                <div className="card">
                  <div className="divide-y divide-[#F0ECE2]">
                    {receivedApplications.map((app) => (
                      <div key={app.id} className="p-5 hover:bg-[#FAF8F2] transition">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="px-3 py-1 bg-[#EAE7DE] text-[#23211C] rounded-full text-xs font-semibold">
                                새 지원!
                              </span>
                              <h3 className="text-lg font-bold text-stone-800">
                                {app.job?.title || '삭제된 공고'}
                              </h3>
                            </div>
                            <div className="bg-[#F0ECE2] p-4 rounded-xl mb-3">
                              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">지원자 메시지</p>
                              <p className="text-sm text-stone-600">{app.message || '메시지 없음'}</p>
                            </div>
                            <p className="text-stone-400 text-xs">
                              지원일: {new Date(app.created_at).toLocaleDateString('ko-KR')} {new Date(app.created_at).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                          </div>
                          {app.job && (
                            <Link href={`/jobs/${app.job.id}`}>
                              <button className="btn-primary">
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
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-800 mb-4">내 이력서에 온 연락</h2>
              {receivedContacts.length === 0 ? (
                <div className="card-empty">
                  <p className="text-stone-400 text-sm">아직 받은 연락이 없습니다</p>
                </div>
              ) : (
                <div className="card">
                  <div className="divide-y divide-[#F0ECE2]">
                    {receivedContacts.map((contact) => (
                      <div key={contact.id} className="p-5 hover:bg-[#FAF8F2] transition">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="px-3 py-1 bg-[#EAE7DE] text-[#23211C] rounded-full text-xs font-semibold">
                                새 연락!
                              </span>
                              <h3 className="text-lg font-bold text-stone-800">
                                {contact.candidate?.name || '삭제된 이력서'}
                              </h3>
                            </div>
                            <div className="bg-[#F0ECE2] p-4 rounded-xl mb-3">
                              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">채용자 메시지</p>
                              <p className="text-sm text-stone-600">{contact.message || '메시지 없음'}</p>
                            </div>
                            <p className="text-stone-400 text-xs">
                              연락일: {new Date(contact.created_at).toLocaleDateString('ko-KR')} {new Date(contact.created_at).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                          </div>
                          {contact.candidate && (
                            <Link href={`/resumes/${contact.candidate.id}`}>
                              <button className="btn-primary">
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
          </div>
        ) : null}
      </div>
    </main>
  );
}