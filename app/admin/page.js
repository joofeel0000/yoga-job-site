'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      sessionStorage.setItem('loginRequired', 'true');
      window.location.href = '/login?redirect=admin';
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      alert('관리자 권한이 필요합니다');
      window.location.href = '/';
      return;
    }

    setUser(user);
    fetchAllData();
  };

  const fetchAllData = async () => {
    setLoading(true);

    const { data: jobsData } = await supabase
      .from('job')
      .select('*')
      .order('created_at', { ascending: false });

    if (jobsData) setJobs(jobsData);

    const { data: resumesData } = await supabase
      .from('candidate')
      .select('*')
      .order('created_at', { ascending: false });

    if (resumesData) setResumes(resumesData);

    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersData) setUsers(usersData);

    setLoading(false);
  };

  const deleteJob = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('job').delete().eq('id', id);

    if (error) alert('삭제 실패');
    else { alert('삭제되었습니다!'); fetchAllData(); }
  };

  const deleteResume = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('candidate').delete().eq('id', id);

    if (error) alert('삭제 실패');
    else { alert('삭제되었습니다!'); fetchAllData(); }
  };

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    if (!confirm(`이 사용자를 ${newRole === 'admin' ? '관리자' : '일반 회원'}으로 변경하시겠습니까?`)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) alert('변경 실패');
    else { alert('권한이 변경되었습니다!'); fetchAllData(); }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!confirm(`정말 ${userEmail} 사용자를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다!`)) return;

    const { error } = await supabase.from('profiles').delete().eq('id', userId);

    if (error) alert('삭제 실패: 인증 사용자는 Supabase Dashboard에서 삭제해야 합니다.');
    else { alert('프로필이 삭제되었습니다!'); fetchAllData(); }
  };

  const thClass = "px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wide";
  const tdClass = "px-6 py-4 text-sm text-stone-800";
  const tdSubClass = "px-6 py-4 text-sm text-stone-500";

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-stone-800">관리자 페이지</h1>
          <Link href="/" className="text-green-700 hover:text-green-800 font-medium text-sm transition-colors">
            ← 홈으로
          </Link>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-6">
          <div className="flex border-b border-stone-100">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 py-4 px-6 font-semibold transition text-sm ${
                activeTab === 'jobs'
                  ? 'text-green-700 border-b-2 border-green-700'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              구인 공고 ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('resumes')}
              className={`flex-1 py-4 px-6 font-semibold transition text-sm ${
                activeTab === 'resumes'
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              이력서 ({resumes.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 px-6 font-semibold transition text-sm ${
                activeTab === 'users'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              회원 관리 ({users.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-3xl animate-pulse mb-3">🌿</div>
            <p className="text-stone-400 text-sm">로딩 중...</p>
          </div>
        ) : activeTab === 'jobs' ? (
          jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
              <p className="text-stone-400 text-sm">등록된 공고가 없습니다</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className={thClass}>제목</th>
                    <th className={thClass}>지역</th>
                    <th className={thClass}>요가 종류</th>
                    <th className={thClass}>등록일</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase tracking-wide">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-stone-50 transition">
                      <td className={tdClass}>{job.title}</td>
                      <td className={tdSubClass}>{job.location}</td>
                      <td className={tdSubClass}>{job.yoga_style}</td>
                      <td className={tdSubClass}>{new Date(job.created_at).toLocaleDateString('ko-KR')}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <Link href={`/jobs/${job.id}`}>
                          <button className="px-3 py-1 bg-green-700 text-white text-xs rounded-full hover:bg-green-800 transition font-semibold">
                            보기
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'resumes' ? (
          resumes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
              <p className="text-stone-400 text-sm">등록된 이력서가 없습니다</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className={thClass}>이름</th>
                    <th className={thClass}>지역</th>
                    <th className={thClass}>요가 종류</th>
                    <th className={thClass}>경력</th>
                    <th className={thClass}>등록일</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase tracking-wide">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {resumes.map((resume) => (
                    <tr key={resume.id} className="hover:bg-stone-50 transition">
                      <td className={tdClass}>{resume.name}</td>
                      <td className={tdSubClass}>{resume.location}</td>
                      <td className={tdSubClass}>{resume.yoga_styles}</td>
                      <td className={tdSubClass}>{resume.experience_years || '-'}</td>
                      <td className={tdSubClass}>{new Date(resume.created_at).toLocaleDateString('ko-KR')}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <Link href={`/resumes/${resume.id}`}>
                          <button className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full hover:bg-amber-700 transition font-semibold">
                            보기
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteResume(resume.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'users' ? (
          users.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
              <p className="text-stone-400 text-sm">등록된 회원이 없습니다</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className={thClass}>이메일</th>
                    <th className={thClass}>권한</th>
                    <th className={thClass}>가입일</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase tracking-wide">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-50 transition">
                      <td className={tdClass}>{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {u.role === 'admin' ? '🔧 관리자' : '👤 일반 회원'}
                        </span>
                      </td>
                      <td className={tdSubClass}>{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => toggleUserRole(u.id, u.role)}
                          className={`px-3 py-1 text-white text-xs rounded-full transition font-semibold ${
                            u.role === 'admin'
                              ? 'bg-stone-500 hover:bg-stone-600'
                              : 'bg-orange-500 hover:bg-orange-600'
                          }`}
                        >
                          {u.role === 'admin' ? '일반 회원으로' : '관리자로'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id, u.email)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}
      </div>
    </main>
  );
}
