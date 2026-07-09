'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageUpload from '@/app/components/ImageUpload';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const POSITION_LABELS = {
  home_top:         '메인 슬라이드 배너',
  home_strip:       '메인 와이드 배너',
  home_bottom:      '메인 스폰서 카드',
  jobs_top:         '구인공고 사이드바 (구)',
  jobs_sidebar:     '구인공고 사이드바 (최대 10개)',
  jobs_bottom:      '구인공고 하단 스폰서',
  resumes_top:      '강사찾기 사이드바 (구)',
  resumes_sidebar:  '강사찾기 사이드바 (최대 10개)',
  resumes_bottom:   '강사찾기 하단 스폰서',
  community_top:    '커뮤니티 상단',
  property_top:     '매물정보 상단',
  property_strip:   '매물정보 띠배너',
  community_strip:  '커뮤니티 띠배너',
};

const POSITION_SIZES = {
  home_top:         '히어로 슬롯 (4:3)',
  home_strip:       '1200×160px',
  home_bottom:      '380×200px (3열)',
  jobs_top:         '176px 사이드바',
  jobs_sidebar:     '176×100px × 최대 10개',
  jobs_bottom:      '380×180px (3열)',
  resumes_top:      '176px 사이드바',
  resumes_sidebar:  '176×100px × 최대 10개',
  resumes_bottom:   '380×180px (3열)',
  community_top:    '1200×140px',
  property_top:     '1200×140px',
  property_strip:   '1200×160px',
  community_strip:  '1200×160px',
};

const BLANK_BANNER = {
  title: '', image_url: '', link_url: '', position: 'home_top',
  starts_at: '', ends_at: '', display_order: 0, is_active: true,
};

const toDatetimeLocal = (ts) => ts ? new Date(ts).toISOString().slice(0, 16) : '';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [users, setUsers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bannerClicks, setBannerClicks] = useState([]);

  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsBanner, setStatsBanner] = useState(null);
  const [statsData, setStatsData] = useState([]);
  const [statsPeriod, setStatsPeriod] = useState('7d');
  const [statsLoading, setStatsLoading] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerForm, setBannerForm] = useState(BLANK_BANNER);
  const [properties, setProperties] = useState([]);
  const [posts, setPosts] = useState([]);
  const [editModal, setEditModal] = useState(null); // { type, data }
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (showBannerForm || showStatsModal || editModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showBannerForm, showStatsModal, editModal]);

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

    const [jobsRes, resumesRes, usersRes, bannersRes, clicksRes, propsRes, postsRes] = await Promise.all([
      supabase.from('job').select('*').order('created_at', { ascending: false }),
      supabase.from('candidate').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('banners').select('*').order('position').order('display_order'),
      supabase.from('banner_clicks').select('banner_id, event_type, clicked_at').order('clicked_at', { ascending: false }),
      supabase.from('property').select('*').order('created_at', { ascending: false }),
      supabase.from('community_posts').select('*').order('created_at', { ascending: false }),
    ]);

    if (jobsRes.data)    setJobs(jobsRes.data);
    if (resumesRes.data) setResumes(resumesRes.data);
    if (usersRes.data)   setUsers(usersRes.data);
    if (bannersRes.data) setBanners(bannersRes.data);
    if (clicksRes.data)  setBannerClicks(clicksRes.data);
    if (propsRes.data)   setProperties(propsRes.data);
    if (postsRes.data)   setPosts(postsRes.data);

    setLoading(false);
  };

  // --- Job / Resume / User ---
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
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) alert('변경 실패');
    else { alert('권한이 변경되었습니다!'); fetchAllData(); }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!confirm(`정말 ${userEmail} 사용자를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다!`)) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) alert('삭제 실패: 인증 사용자는 Supabase Dashboard에서 삭제해야 합니다.');
    else { alert('프로필이 삭제되었습니다!'); fetchAllData(); }
  };

  const deleteProperty = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('property').delete().eq('id', id);
    if (error) alert('삭제 실패');
    else { alert('삭제되었습니다!'); fetchAllData(); }
  };

  const deletePost = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('community_posts').delete().eq('id', id);
    if (error) alert('삭제 실패');
    else { alert('삭제되었습니다!'); fetchAllData(); }
  };

  // --- Edit Modal ---
  const openEditModal = (type, data) => {
    setEditModal({ type, data });
    setEditForm({ ...data });
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editModal) return;
    setEditSaving(true);
    const { type } = editModal;
    let error;

    if (type === 'job') {
      ({ error } = await supabase.from('job').update({
        title:       editForm.title,
        location:    editForm.location,
        yoga_style:  editForm.yoga_style,
        experience:  editForm.experience,
        salary:      editForm.salary,
        description: editForm.description,
        status:      editForm.status,
        image_url:   editForm.image_url || null,
      }).eq('id', editModal.data.id));
    } else if (type === 'resume') {
      const { data: updatedRows, error: resumeErr } = await supabase.from('candidate').update({
        name:             editForm.name,
        location:         editForm.location,
        yoga_styles:      editForm.yoga_styles,
        experience_years: editForm.experience_years,
        introduction:     editForm.introduction,
        status:           editForm.status,
        photo_url:        editForm.photo_url || null,
      }).eq('id', editModal.data.id).select();
      error = resumeErr || (Array.isArray(updatedRows) && updatedRows.length === 0
        ? { message: '업데이트된 행 없음 — Supabase RLS 정책 확인 필요' }
        : null);
    } else if (type === 'user') {
      ({ error } = await supabase.from('profiles').update({
        name:  editForm.name,
        email: editForm.email,
        role:  editForm.role,
      }).eq('id', editModal.data.id));
    } else if (type === 'property') {
      ({ error } = await supabase.from('property').update({
        title:         editForm.title,
        property_type: editForm.property_type,
        location:      editForm.location,
        area:          editForm.area,
        price:         editForm.price,
        description:   editForm.description,
        contact:       editForm.contact,
        status:        editForm.status,
      }).eq('id', editModal.data.id));
    } else if (type === 'post') {
      ({ error } = await supabase.from('community_posts').update({
        title:    editForm.title,
        content:  editForm.content,
        category: editForm.category,
      }).eq('id', editModal.data.id));
    }

    setEditSaving(false);
    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      alert('저장되었습니다!');
      closeEditModal();
      fetchAllData();
    }
  };

  // --- Banner ---
  const resetBannerForm = () => {
    setBannerForm(BLANK_BANNER);
    setEditingBannerId(null);
  };

  const startNewBanner = () => {
    resetBannerForm();
    setShowBannerForm(true);
  };

  const startEditBanner = (banner) => {
    setBannerForm({
      title:         banner.title,
      image_url:     banner.image_url,
      link_url:      banner.link_url || '',
      position:      banner.position,
      starts_at:     toDatetimeLocal(banner.starts_at),
      ends_at:       toDatetimeLocal(banner.ends_at),
      display_order: banner.display_order,
      is_active:     banner.is_active,
    });
    setEditingBannerId(banner.id);
    setShowBannerForm(true);
  };

  const cancelBannerForm = () => {
    setShowBannerForm(false);
    resetBannerForm();
  };

  const saveBanner = async () => {
    if (!bannerForm.title.trim() || !bannerForm.image_url.trim()) {
      alert('제목과 이미지 URL은 필수입니다');
      return;
    }

    const payload = {
      title:         bannerForm.title.trim(),
      image_url:     bannerForm.image_url.trim(),
      link_url:      bannerForm.link_url.trim() || null,
      position:      bannerForm.position,
      starts_at:     bannerForm.starts_at?.trim() || null,
      ends_at:       bannerForm.ends_at?.trim()   || null,
      display_order: Number(bannerForm.display_order),
      is_active:     bannerForm.is_active,
    };

    const { error } = editingBannerId
      ? await supabase.from('banners').update(payload).eq('id', editingBannerId)
      : await supabase.from('banners').insert(payload);

    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      alert(editingBannerId ? '배너가 수정되었습니다!' : '배너가 등록되었습니다!');
      cancelBannerForm();
      fetchAllData();
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm('이 배너를 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) alert('삭제 실패');
    else { alert('삭제되었습니다!'); fetchAllData(); }
  };

  const approveBanner = async (id) => {
    const { error } = await supabase.from('banners').update({ is_active: true }).eq('id', id);
    if (error) alert('승인 실패: ' + error.message);
    else fetchAllData();
  };

  const rejectBanner = async (id) => {
    if (!confirm('이 신청을 거절하시겠습니까?\n해당 배너 데이터가 삭제됩니다.')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) alert('거절 실패: ' + error.message);
    else fetchAllData();
  };

  const toggleBannerActive = async (id, isActive) => {
    const { error } = await supabase.from('banners').update({ is_active: !isActive }).eq('id', id);
    if (error) alert('변경 실패');
    else fetchAllData();
  };

  // --- Banner Stats ---
  const fetchBannerStats = async (bannerId, period) => {
    setStatsLoading(true);
    let query = supabase
      .from('banner_clicks')
      .select('event_type, clicked_at, device_type, referrer, page_url')
      .eq('banner_id', bannerId)
      .order('clicked_at', { ascending: true });

    if (period !== 'all') {
      const days = period === 'today' ? 1 : period === '7d' ? 7 : 30;
      const since = new Date(Date.now() - days * 86400000).toISOString();
      query = query.gte('clicked_at', since);
    }
    const { data } = await query;
    setStatsData(data || []);
    setStatsLoading(false);
  };

  const openBannerStats = (banner) => {
    setStatsBanner(banner);
    setStatsPeriod('7d');
    setShowStatsModal(true);
    fetchBannerStats(banner.id, '7d');
  };

  const closeStatsModal = () => {
    setShowStatsModal(false);
    setStatsBanner(null);
    setStatsData([]);
  };

  const changeStatsPeriod = (period) => {
    setStatsPeriod(period);
    if (statsBanner) fetchBannerStats(statsBanner.id, period);
  };

  // --- Style helpers ---
  const thClass    = "px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wide";
  const tdClass    = "px-6 py-4 text-sm text-stone-800";
  const tdSubClass = "px-6 py-4 text-sm text-stone-500";
  const inputClass = "input-base";
  const labelClass = "label-field";

  return (
    <main className="page-root">
      <div className="content-wrap">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-[#23211C] mb-1">관리자 페이지</h1>
            <p className="text-sm text-[#9A9382]">구인공고·이력서·회원·매물·커뮤니티·배너를 관리합니다</p>
          </div>
          <Link href="/" className="text-[#23211C] hover:text-black font-medium text-sm transition-colors">
            ← 홈으로
          </Link>
        </div>

        {/* 탭 */}
        <div className="card mb-6">
          <div className="flex border-b border-stone-100 overflow-x-auto">
            <button onClick={() => setActiveTab('jobs')}
              className={`flex-1 py-4 px-6 font-semibold transition text-sm ${activeTab === 'jobs' ? 'text-[#23211C] border-b-2 border-[#23211C]' : 'text-stone-500 hover:text-stone-700'}`}>
              구인 공고 ({jobs.length})
            </button>
            <button onClick={() => setActiveTab('resumes')}
              className={`flex-1 py-4 px-6 font-semibold transition text-sm ${activeTab === 'resumes' ? 'text-[#23211C] border-b-2 border-[#23211C]' : 'text-stone-500 hover:text-stone-700'}`}>
              이력서 ({resumes.length})
            </button>
            <button onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 px-6 font-semibold transition text-sm ${activeTab === 'users' ? 'text-[#23211C] border-b-2 border-[#23211C]' : 'text-stone-500 hover:text-stone-700'}`}>
              회원 관리 ({users.length})
            </button>
            <button onClick={() => setActiveTab('property')}
              className={`flex-1 py-4 px-6 font-semibold transition text-sm ${activeTab === 'property' ? 'text-[#23211C] border-b-2 border-[#23211C]' : 'text-stone-500 hover:text-stone-700'}`}>
              매물정보 ({properties.length})
            </button>
            <button onClick={() => setActiveTab('community')}
              className={`flex-1 py-4 px-6 font-semibold transition text-sm ${activeTab === 'community' ? 'text-[#23211C] border-b-2 border-[#23211C]' : 'text-stone-500 hover:text-stone-700'}`}>
              커뮤니티 ({posts.length})
            </button>
            <button onClick={() => setActiveTab('banners')}
              className={`flex-1 py-4 px-6 font-semibold transition text-sm ${activeTab === 'banners' ? 'text-[#23211C] border-b-2 border-[#23211C]' : 'text-stone-500 hover:text-stone-700'}`}>
              배너 광고 ({banners.length})
              {banners.filter(b => !b.is_active && b.user_id).length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-[18px] h-[18px] bg-amber-500 text-white rounded-full text-[9px] font-bold align-middle">
                  {banners.filter(b => !b.is_active && b.user_id).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="state-center">
            <div className="text-3xl animate-pulse mb-3">🌿</div>
            <p className="text-stone-400 text-sm">로딩 중...</p>
          </div>

        ) : activeTab === 'jobs' ? (
          jobs.length === 0 ? (
            <div className="card-empty">
              <p className="text-stone-400 text-sm">등록된 공고가 없습니다</p>
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
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
                          <button className="btn-pill-sm">보기</button>
                        </Link>
                        <button onClick={() => openEditModal('job', job)}
                          className="px-3 py-1 bg-[#EAE7DE] text-[#23211C] text-xs rounded-full hover:bg-[#DDD9CE] transition font-semibold">수정</button>
                        <button onClick={() => deleteJob(job.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )

        ) : activeTab === 'resumes' ? (
          resumes.length === 0 ? (
            <div className="card-empty">
              <p className="text-stone-400 text-sm">등록된 이력서가 없습니다</p>
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
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
                          <button className="btn-pill-sm">보기</button>
                        </Link>
                        <button onClick={() => openEditModal('resume', resume)}
                          className="px-3 py-1 bg-[#EAE7DE] text-[#23211C] text-xs rounded-full hover:bg-[#DDD9CE] transition font-semibold">수정</button>
                        <button onClick={() => deleteResume(resume.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )

        ) : activeTab === 'users' ? (
          users.length === 0 ? (
            <div className="card-empty">
              <p className="text-stone-400 text-sm">등록된 회원이 없습니다</p>
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
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
                          u.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {u.role === 'admin' ? '🔧 관리자' : '👤 일반 회원'}
                        </span>
                      </td>
                      <td className={tdSubClass}>{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button onClick={() => openEditModal('user', u)}
                          className="px-3 py-1 bg-[#EAE7DE] text-[#23211C] text-xs rounded-full hover:bg-[#DDD9CE] transition font-semibold">수정</button>
                        <button onClick={() => toggleUserRole(u.id, u.role)}
                          className={`px-3 py-1 text-white text-xs rounded-full transition font-semibold ${
                            u.role === 'admin' ? 'bg-stone-500 hover:bg-stone-600' : 'bg-orange-500 hover:bg-orange-600'
                          }`}>
                          {u.role === 'admin' ? '일반 회원으로' : '관리자로'}
                        </button>
                        <button onClick={() => deleteUser(u.id, u.email)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )

        ) : activeTab === 'property' ? (
          properties.length === 0 ? (
            <div className="card-empty">
              <p className="text-stone-400 text-sm">등록된 매물이 없습니다</p>
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className={thClass}>제목</th>
                    <th className={thClass}>유형</th>
                    <th className={thClass}>지역</th>
                    <th className={thClass}>금액</th>
                    <th className={thClass}>등록일</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase tracking-wide">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-stone-50 transition">
                      <td className={tdClass}>{prop.title}</td>
                      <td className={tdSubClass}>{prop.property_type}</td>
                      <td className={tdSubClass}>{prop.location}</td>
                      <td className={tdSubClass}>{prop.price}</td>
                      <td className={tdSubClass}>{new Date(prop.created_at).toLocaleDateString('ko-KR')}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <Link href={`/property/${prop.id}`}>
                          <button className="btn-pill-sm">보기</button>
                        </Link>
                        <button onClick={() => openEditModal('property', prop)}
                          className="px-3 py-1 bg-[#EAE7DE] text-[#23211C] text-xs rounded-full hover:bg-[#DDD9CE] transition font-semibold">수정</button>
                        <button onClick={() => deleteProperty(prop.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )

        ) : activeTab === 'community' ? (
          posts.length === 0 ? (
            <div className="card-empty">
              <p className="text-stone-400 text-sm">등록된 게시글이 없습니다</p>
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className={thClass}>제목</th>
                    <th className={thClass}>카테고리</th>
                    <th className={thClass}>작성자</th>
                    <th className={thClass}>조회</th>
                    <th className={thClass}>등록일</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase tracking-wide">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-stone-50 transition">
                      <td className={tdClass}>{post.title}</td>
                      <td className={tdSubClass}>{post.category}</td>
                      <td className={tdSubClass}>{post.author_email}</td>
                      <td className={tdSubClass}>{post.views || 0}</td>
                      <td className={tdSubClass}>{new Date(post.created_at).toLocaleDateString('ko-KR')}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <Link href={`/community/${post.id}`}>
                          <button className="btn-pill-sm">보기</button>
                        </Link>
                        <button onClick={() => openEditModal('post', post)}
                          className="px-3 py-1 bg-[#EAE7DE] text-[#23211C] text-xs rounded-full hover:bg-[#DDD9CE] transition font-semibold">수정</button>
                        <button onClick={() => deletePost(post.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )

        ) : activeTab === 'banners' ? (
          (() => {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const thisMonthClicks = bannerClicks.filter(c => c.event_type === 'click' && c.clicked_at >= monthStart).length;
            const activeCount = banners.filter(b => b.is_active).length;
            const pendingBanners = banners.filter(b => !b.is_active && b.user_id);
            const managedBanners = banners.filter(b => b.is_active || !b.user_id);

            const grouped = {};
            managedBanners.forEach(b => {
              if (!grouped[b.position]) grouped[b.position] = [];
              grouped[b.position].push(b);
            });
            const orderedPositions = Object.keys(POSITION_LABELS).filter(p => grouped[p]);

            const pendingGrouped = {};
            pendingBanners.forEach(b => {
              if (!pendingGrouped[b.position]) pendingGrouped[b.position] = [];
              pendingGrouped[b.position].push(b);
            });

            return (
              <div className="space-y-6">

                {/* ── 요약 통계 카드 ──────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: '전체 배너', value: banners.length, icon: '🖼️', bg: '#EAE7DE', fg: '#23211C' },
                    { label: '활성 배너', value: activeCount, icon: '✅', bg: '#DCFCE7', fg: '#16A34A' },
                    {
                      label: '대기 신청', value: pendingBanners.length, icon: '📬',
                      bg: pendingBanners.length > 0 ? '#FEF3C7' : '#F4F1E9',
                      fg: pendingBanners.length > 0 ? '#D97706' : '#9A9382',
                    },
                    { label: '이번 달 클릭', value: thisMonthClicks.toLocaleString(), icon: '👆', bg: '#EDE9FE', fg: '#7C3AED' },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg }} className="rounded-2xl p-5">
                      <div className="text-xl mb-2">{s.icon}</div>
                      <div style={{ color: s.fg }} className="text-[28px] font-extrabold tracking-tight leading-none">{s.value}</div>
                      <div className="text-[13px] text-[#9A9382] mt-1.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* ── 새 배너 등록 버튼 ──────────────────────── */}
                <div className="flex justify-end">
                  <button onClick={startNewBanner}
                    className="px-5 py-2.5 bg-[#23211C] text-white text-sm rounded-full hover:bg-black transition font-semibold">
                    + 새 배너 등록
                  </button>
                </div>

                {/* ── 광고 신청 검토 ─────────────────────────── */}
                {pendingBanners.length > 0 && (
                  <div className="border border-amber-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 bg-amber-50 border-b border-amber-100">
                      <span className="text-base">📬</span>
                      <p className="text-sm font-bold text-amber-800">광고 신청 검토</p>
                      <span className="px-2.5 py-0.5 bg-amber-400 text-white rounded-full text-xs font-bold">
                        {pendingBanners.length}건 대기
                      </span>
                    </div>
                    <div className="p-5 space-y-6 bg-white">
                      {Object.entries(pendingGrouped).map(([pos, items]) => (
                        <div key={pos}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                              {POSITION_LABELS[pos] || pos}
                            </span>
                            {POSITION_SIZES[pos] && (
                              <span className="text-xs text-stone-400">{POSITION_SIZES[pos]}</span>
                            )}
                          </div>
                          <div className="space-y-3">
                            {items.map(b => (
                              <div key={b.id} className="flex gap-4 items-start bg-[#FAFAF8] rounded-xl p-4 border border-[#F0ECE2]">
                                <div className="w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-stone-100">
                                  <img src={b.image_url} alt={b.title}
                                    className="w-full h-full object-cover"
                                    onError={e => { e.target.parentElement.style.background = '#F4F1E9'; e.target.style.display = 'none'; }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[#23211C] text-sm truncate">{b.title}</p>
                                  {b.link_url && (
                                    <p className="text-xs text-stone-400 truncate mt-0.5">{b.link_url}</p>
                                  )}
                                  <div className="flex gap-3 mt-2 text-xs text-stone-500 flex-wrap">
                                    {b.starts_at && <span>시작: {new Date(b.starts_at).toLocaleDateString('ko-KR')}</span>}
                                    {b.ends_at && <span>종료: {new Date(b.ends_at).toLocaleDateString('ko-KR')}</span>}
                                    {!b.starts_at && !b.ends_at && <span className="text-stone-300">기간 미지정</span>}
                                  </div>
                                  {b.notes && (
                                    <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">{b.notes}</p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1.5 shrink-0">
                                  <button onClick={() => approveBanner(b.id)}
                                    className="px-4 py-1.5 bg-[#16A34A] text-white text-xs rounded-full hover:bg-[#15803D] transition font-bold whitespace-nowrap">
                                    ✓ 승인
                                  </button>
                                  <button onClick={() => startEditBanner(b)}
                                    className="px-4 py-1.5 bg-[#23211C] text-white text-xs rounded-full hover:bg-black transition font-semibold whitespace-nowrap">
                                    수정
                                  </button>
                                  <button onClick={() => rejectBanner(b.id)}
                                    className="px-4 py-1.5 bg-red-50 text-red-500 text-xs rounded-full hover:bg-red-100 transition font-semibold border border-red-200 whitespace-nowrap">
                                    ✕ 거절
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 위치별 배너 목록 ───────────────────────── */}
                {banners.length === 0 ? (
                  <div className="bg-white border border-[#E3DDD0] rounded-2xl p-12 text-center">
                    <p className="text-stone-400 text-sm">등록된 배너가 없습니다</p>
                    <p className="text-stone-300 text-xs mt-1">위 버튼으로 첫 배너를 등록해보세요</p>
                  </div>
                ) : orderedPositions.length > 0 ? (
                  <div className="space-y-4">
                    {orderedPositions.map(pos => {
                      const items = grouped[pos];
                      const posActiveCount = items.filter(b => b.is_active).length;
                      return (
                        <div key={pos} className="bg-white border border-[#E3DDD0] rounded-2xl overflow-hidden">
                          {/* 위치 헤더 */}
                          <div className="flex items-center gap-3 px-6 py-3.5 bg-[#F4F1E9] border-b border-[#E3DDD0]">
                            <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                              <span className="font-bold text-[#23211C] text-sm">{POSITION_LABELS[pos]}</span>
                              <span className="text-stone-300">·</span>
                              <span className="text-[12px] text-stone-400 font-mono">{pos}</span>
                              {POSITION_SIZES[pos] && (
                                <>
                                  <span className="text-stone-300">·</span>
                                  <span className="text-[12px] text-stone-400">{POSITION_SIZES[pos]}</span>
                                </>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                              posActiveCount > 0 ? 'bg-[#23211C] text-white' : 'bg-stone-200 text-stone-500'
                            }`}>
                              활성 {posActiveCount}개
                            </span>
                          </div>

                          {/* 배너 카드 목록 */}
                          <div className="divide-y divide-[#F4F1E9]">
                            {items.map(banner => (
                              <div key={banner.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAF8F2] transition-colors">
                                {/* 썸네일 */}
                                <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-100">
                                  <img src={banner.image_url} alt={banner.title}
                                    className="w-full h-full object-cover"
                                    onError={e => { e.target.parentElement.style.background = '#F4F1E9'; e.target.style.display = 'none'; }} />
                                </div>

                                {/* 정보 */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-[#23211C] text-sm truncate">{banner.title}</p>
                                  <div className="flex gap-3 mt-1 text-xs text-stone-400 flex-wrap">
                                    <span>순서 {banner.display_order}</span>
                                    {banner.starts_at && <span>시작 {new Date(banner.starts_at).toLocaleDateString('ko-KR')}</span>}
                                    {banner.ends_at && <span>종료 {new Date(banner.ends_at).toLocaleDateString('ko-KR')}</span>}
                                    {!banner.starts_at && !banner.ends_at && <span>무기한</span>}
                                  </div>
                                </div>

                                {/* 활성 토글 */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs text-stone-400 w-10 text-right">
                                    {banner.is_active ? '활성' : '비활성'}
                                  </span>
                                  <button
                                    onClick={() => toggleBannerActive(banner.id, banner.is_active)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                                      banner.is_active ? 'bg-[#23211C]' : 'bg-stone-200'
                                    }`}
                                  >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                      banner.is_active ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                  </button>
                                </div>

                                {/* 통계/수정/삭제 */}
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => openBannerStats(banner)}
                                    className="px-3 py-1.5 bg-[#EDE9FE] text-[#7C3AED] text-xs rounded-lg hover:bg-purple-100 transition font-semibold">
                                    통계
                                  </button>
                                  <button onClick={() => startEditBanner(banner)}
                                    className="px-3 py-1.5 bg-[#EAE7DE] text-[#23211C] text-xs rounded-lg hover:bg-[#DDD9CE] transition font-semibold">
                                    수정
                                  </button>
                                  <button onClick={() => deleteBanner(banner.id)}
                                    className="px-3 py-1.5 bg-red-50 text-red-500 text-xs rounded-lg hover:bg-red-100 transition font-semibold">
                                    삭제
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

              </div>
            );
          })()

        ) : null}
      </div>
      {/* ── 배너 상세 통계 모달 ─────────────────────────────── */}
      {showStatsModal && statsBanner && (() => {
        const clicks  = statsData.filter(r => r.event_type === 'click');
        const views   = statsData.filter(r => r.event_type === 'view');
        const ctr     = views.length > 0 ? ((clicks.length / views.length) * 100).toFixed(1) : '0.0';

        // 일별 추이
        const dailyMap = {};
        statsData.forEach(r => {
          const d = r.clicked_at.slice(0, 10);
          if (!dailyMap[d]) dailyMap[d] = { date: d, 노출: 0, 클릭: 0 };
          if (r.event_type === 'view')  dailyMap[d].노출++;
          if (r.event_type === 'click') dailyMap[d].클릭++;
        });
        const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

        // 기기별 파이
        const deviceMap = {};
        clicks.forEach(r => { const k = r.device_type || 'unknown'; deviceMap[k] = (deviceMap[k] || 0) + 1; });
        const DEVICE_LABEL = { mobile: '모바일', desktop: '데스크탑', tablet: '태블릿', unknown: '기타' };
        const DEVICE_COLOR = { mobile: '#7C3AED', desktop: '#23211C', tablet: '#6B7280', unknown: '#D1D5DB' };
        const devicePie = Object.entries(deviceMap).map(([k, v]) => ({ name: DEVICE_LABEL[k] || k, value: v, color: DEVICE_COLOR[k] || '#D1D5DB' }));

        // 시간대별 바
        const hourly = Array.from({ length: 24 }, (_, h) => ({ 시간: `${h}시`, 클릭: 0 }));
        clicks.forEach(r => { hourly[new Date(r.clicked_at).getHours()].클릭++; });

        // 유입 경로
        const refMap = {};
        clicks.forEach(r => { const k = r.referrer || r.page_url || '직접'; refMap[k] = (refMap[k] || 0) + 1; });
        const refList = Object.entries(refMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

        return (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeStatsModal} />
            <div
              className="absolute inset-0 overflow-y-auto flex items-start justify-center p-4 pt-8"
              onClick={e => { if (e.target === e.currentTarget) closeStatsModal(); }}
            >
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl z-10 my-4">

                {/* 헤더 */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-[#E3DDD0]">
                  <div>
                    <h2 className="text-base font-bold text-[#23211C]">{statsBanner.title} — 상세 통계</h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {POSITION_LABELS[statsBanner.position]} · {POSITION_SIZES[statsBanner.position]}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
                      {[['today','오늘'],['7d','7일'],['30d','30일'],['all','전체']].map(([v, l]) => (
                        <button key={v} onClick={() => changeStatsPeriod(v)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition ${statsPeriod === v ? 'bg-[#23211C] text-white' : 'text-stone-500 hover:text-stone-700'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                    <button onClick={closeStatsModal}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F4F1E9] transition text-stone-400 hover:text-[#23211C] text-sm font-bold">
                      ✕
                    </button>
                  </div>
                </div>

                {statsLoading ? (
                  <div className="py-20 text-center">
                    <div className="text-2xl animate-pulse mb-2">📊</div>
                    <p className="text-stone-400 text-sm">통계 로딩 중...</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-5">

                    {/* 요약 수치 */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: '총 노출', value: views.length.toLocaleString(), bg: '#EAE7DE', fg: '#23211C' },
                        { label: '총 클릭', value: clicks.length.toLocaleString(), bg: '#DCFCE7', fg: '#16A34A' },
                        { label: 'CTR', value: `${ctr}%`, bg: '#EDE9FE', fg: '#7C3AED' },
                        { label: '데이터 건수', value: statsData.length.toLocaleString(), bg: '#F4F1E9', fg: '#9A9382' },
                      ].map(s => (
                        <div key={s.label} style={{ background: s.bg }} className="rounded-xl p-4">
                          <div style={{ color: s.fg }} className="text-2xl font-extrabold tracking-tight leading-none">{s.value}</div>
                          <div className="text-xs text-stone-400 mt-1.5">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* 일별 추이 + 기기별 */}
                    <div className="grid grid-cols-[1fr_200px] gap-4">
                      <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#F0ECE2]">
                        <p className="text-xs font-semibold text-stone-500 mb-3">일별 노출 / 클릭 추이</p>
                        {dailyData.length === 0 ? (
                          <div className="h-36 flex items-center justify-center text-stone-300 text-sm">데이터 없음</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={144}>
                            <LineChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Line type="monotone" dataKey="노출" stroke="#C4BEB0" strokeWidth={1.5} dot={false} />
                              <Line type="monotone" dataKey="클릭" stroke="#23211C" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#F0ECE2]">
                        <p className="text-xs font-semibold text-stone-500 mb-2">기기별 클릭</p>
                        {devicePie.length === 0 ? (
                          <div className="h-36 flex items-center justify-center text-stone-300 text-sm">데이터 없음</div>
                        ) : (
                          <>
                            <PieChart width={168} height={110}>
                              <Pie data={devicePie} cx={84} cy={55} innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                                {devicePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                              </Pie>
                              <Tooltip formatter={(v, n) => [v + '건', n]} />
                            </PieChart>
                            <div className="space-y-1 mt-1">
                              {devicePie.map(d => (
                                <div key={d.name} className="flex items-center gap-2 text-xs">
                                  <span style={{ background: d.color }} className="w-2 h-2 rounded-full shrink-0" />
                                  <span className="text-stone-600 flex-1">{d.name}</span>
                                  <span className="font-semibold text-stone-700">{d.value}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 시간대별 */}
                    <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#F0ECE2]">
                      <p className="text-xs font-semibold text-stone-500 mb-3">시간대별 클릭 분포</p>
                      <ResponsiveContainer width="100%" height={110}>
                        <BarChart data={hourly} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
                          <XAxis dataKey="시간" tick={{ fontSize: 9 }} interval={3} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="클릭" fill="#23211C" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 유입 경로 */}
                    {refList.length > 0 && (
                      <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#F0ECE2]">
                        <p className="text-xs font-semibold text-stone-500 mb-3">유입 경로 (클릭 기준)</p>
                        <div className="space-y-2">
                          {refList.map(([ref, count]) => (
                            <div key={ref} className="flex items-center gap-3">
                              <p className="text-xs text-stone-600 flex-1 truncate">{ref}</p>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-20 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: clicks.length > 0 ? `${(count / clicks.length) * 100}%` : '0%' }}
                                    className="h-full bg-[#23211C] rounded-full"
                                  />
                                </div>
                                <span className="text-xs font-semibold text-stone-700 w-5 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 데이터 수정 모달 ─────────────────────────────── */}
      {editModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEditModal} />
          <div className="absolute inset-0 overflow-y-auto flex items-start justify-center p-4 pt-10"
            onClick={e => { if (e.target === e.currentTarget) closeEditModal(); }}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 my-4">

              {/* 헤더 */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E3DDD0]">
                <h2 className="text-base font-bold text-[#23211C]">
                  {{ job: '구인공고 수정', resume: '이력서 수정', user: '회원 수정', property: '매물 수정', post: '게시글 수정' }[editModal.type]}
                </h2>
                <button onClick={closeEditModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F4F1E9] transition text-stone-400 hover:text-[#23211C] text-sm font-bold shrink-0">
                  ✕
                </button>
              </div>

              {/* 폼 바디 */}
              <div className="p-6">
                {editModal.type === 'job' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelClass}>회사/스튜디오 로고</label>
                      <ImageUpload
                        bucket="jobs"
                        value={editForm.image_url || ''}
                        onChange={(url) => setEditForm(f => ({...f, image_url: url}))}
                        hint="로고 이미지 (선택사항)"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>제목 *</label>
                      <input type="text" value={editForm.title || ''} onChange={e => setEditForm(f => ({...f, title: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>지역</label>
                      <input type="text" value={editForm.location || ''} onChange={e => setEditForm(f => ({...f, location: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>요가 스타일</label>
                      <input type="text" value={editForm.yoga_style || ''} onChange={e => setEditForm(f => ({...f, yoga_style: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>경력</label>
                      <input type="text" value={editForm.experience || ''} onChange={e => setEditForm(f => ({...f, experience: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>급여</label>
                      <input type="text" value={editForm.salary || ''} onChange={e => setEditForm(f => ({...f, salary: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>상태</label>
                      <select value={editForm.status || 'active'} onChange={e => setEditForm(f => ({...f, status: e.target.value}))} className={inputClass}>
                        <option value="active">활성 (active)</option>
                        <option value="closed">마감 (closed)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>설명</label>
                      <textarea rows={5} value={editForm.description || ''} onChange={e => setEditForm(f => ({...f, description: e.target.value}))} className={`${inputClass} resize-y`} />
                    </div>
                  </div>
                )}

                {editModal.type === 'resume' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelClass}>프로필 사진</label>
                      <ImageUpload
                        bucket="avatars"
                        value={editForm.photo_url || ''}
                        onChange={(url) => setEditForm(f => ({...f, photo_url: url}))}
                        hint="프로필 사진"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>이름 *</label>
                      <input type="text" value={editForm.name || ''} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>지역</label>
                      <input type="text" value={editForm.location || ''} onChange={e => setEditForm(f => ({...f, location: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>요가 스타일</label>
                      <input type="text" value={editForm.yoga_styles || ''} onChange={e => setEditForm(f => ({...f, yoga_styles: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>경력 (년수)</label>
                      <input type="text" value={editForm.experience_years || ''} onChange={e => setEditForm(f => ({...f, experience_years: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>상태</label>
                      <select value={editForm.status || 'active'} onChange={e => setEditForm(f => ({...f, status: e.target.value}))} className={inputClass}>
                        <option value="active">활성 (active)</option>
                        <option value="closed">마감 (closed)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>자기소개</label>
                      <textarea rows={5} value={editForm.introduction || ''} onChange={e => setEditForm(f => ({...f, introduction: e.target.value}))} className={`${inputClass} resize-y`} />
                    </div>
                  </div>
                )}

                {editModal.type === 'user' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>이름</label>
                      <input type="text" value={editForm.name || ''} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>이메일</label>
                      <input type="email" value={editForm.email || ''} onChange={e => setEditForm(f => ({...f, email: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>역할</label>
                      <select value={editForm.role || 'user'} onChange={e => setEditForm(f => ({...f, role: e.target.value}))} className={inputClass}>
                        <option value="user">일반 회원 (user)</option>
                        <option value="admin">관리자 (admin)</option>
                      </select>
                    </div>
                  </div>
                )}

                {editModal.type === 'property' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelClass}>제목 *</label>
                      <input type="text" value={editForm.title || ''} onChange={e => setEditForm(f => ({...f, title: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>유형</label>
                      <select value={editForm.property_type || '임대'} onChange={e => setEditForm(f => ({...f, property_type: e.target.value}))} className={inputClass}>
                        <option value="임대">임대</option>
                        <option value="매매">매매</option>
                        <option value="양도">양도</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>지역</label>
                      <input type="text" value={editForm.location || ''} onChange={e => setEditForm(f => ({...f, location: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>면적</label>
                      <input type="text" value={editForm.area || ''} onChange={e => setEditForm(f => ({...f, area: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>금액</label>
                      <input type="text" value={editForm.price || ''} onChange={e => setEditForm(f => ({...f, price: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>연락처</label>
                      <input type="text" value={editForm.contact || ''} onChange={e => setEditForm(f => ({...f, contact: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>상태</label>
                      <select value={editForm.status || 'active'} onChange={e => setEditForm(f => ({...f, status: e.target.value}))} className={inputClass}>
                        <option value="active">활성 (active)</option>
                        <option value="closed">마감 (closed)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>설명</label>
                      <textarea rows={5} value={editForm.description || ''} onChange={e => setEditForm(f => ({...f, description: e.target.value}))} className={`${inputClass} resize-y`} />
                    </div>
                  </div>
                )}

                {editModal.type === 'post' && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>카테고리</label>
                      <select value={editForm.category || '자유게시판'} onChange={e => setEditForm(f => ({...f, category: e.target.value}))} className={inputClass}>
                        {['자유게시판', '강사Q&A', '노하우', '후기', '요가정보'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>제목 *</label>
                      <input type="text" value={editForm.title || ''} onChange={e => setEditForm(f => ({...f, title: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>내용 *</label>
                      <textarea rows={8} value={editForm.content || ''} onChange={e => setEditForm(f => ({...f, content: e.target.value}))} className={`${inputClass} resize-y`} />
                    </div>
                  </div>
                )}
              </div>

              {/* 푸터 */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E3DDD0] bg-[#FAFAF8] rounded-b-2xl">
                <button onClick={closeEditModal}
                  className="px-5 py-2 bg-stone-100 text-stone-600 text-sm rounded-full hover:bg-stone-200 transition font-semibold">
                  취소
                </button>
                <button onClick={saveEdit} disabled={editSaving}
                  className="px-5 py-2 bg-[#23211C] text-white text-sm rounded-full hover:bg-black transition font-semibold disabled:opacity-60">
                  {editSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 배너 등록/수정 모달 ─────────────────────────────── */}
      {showBannerForm && (
        <div className="fixed inset-0 z-50">
          {/* 백드롭 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelBannerForm}
          />

          {/* 스크롤 래퍼 */}
          <div
            className="absolute inset-0 overflow-y-auto flex items-start justify-center p-4 pt-10"
            onClick={(e) => { if (e.target === e.currentTarget) cancelBannerForm(); }}
          >

          {/* 모달 카드 */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 my-4">

            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E3DDD0]">
              <div>
                <h2 className="text-base font-bold text-[#23211C]">
                  {editingBannerId ? '배너 수정' : '새 배너 등록'}
                </h2>
                {editingBannerId && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    {POSITION_LABELS[bannerForm.position]} — {POSITION_SIZES[bannerForm.position]}
                  </p>
                )}
              </div>
              <button
                onClick={cancelBannerForm}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F4F1E9] transition text-stone-400 hover:text-[#23211C] text-sm font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            {/* 폼 바디 */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>제목 *</label>
                  <input type="text" placeholder="배너 제목"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm(f => ({ ...f, title: e.target.value }))}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>위치 *</label>
                  <select value={bannerForm.position}
                    onChange={(e) => setBannerForm(f => ({ ...f, position: e.target.value }))}
                    className={inputClass}>
                    {Object.entries(POSITION_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label} — {POSITION_SIZES[val] || ''}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>이미지 *</label>
                  <ImageUpload
                    bucket="banners"
                    value={bannerForm.image_url}
                    onChange={(url) => setBannerForm(f => ({ ...f, image_url: url }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>링크 URL</label>
                  <input type="url" placeholder="https://example.com (클릭 시 이동, 선택 사항)"
                    value={bannerForm.link_url}
                    onChange={(e) => setBannerForm(f => ({ ...f, link_url: e.target.value }))}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>노출 시작일</label>
                  <div className="flex gap-2">
                    <input type="datetime-local"
                      value={bannerForm.starts_at}
                      onChange={(e) => setBannerForm(f => ({ ...f, starts_at: e.target.value }))}
                      className={inputClass} />
                    {bannerForm.starts_at && (
                      <button type="button"
                        onClick={() => setBannerForm(f => ({ ...f, starts_at: '' }))}
                        className="px-3 py-2 bg-stone-100 text-stone-500 rounded-xl hover:bg-stone-200 transition text-xs shrink-0 font-medium">
                        지우기
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-1">비워두면 즉시 노출</p>
                </div>
                <div>
                  <label className={labelClass}>노출 종료일</label>
                  <div className="flex gap-2">
                    <input type="datetime-local"
                      value={bannerForm.ends_at}
                      onChange={(e) => setBannerForm(f => ({ ...f, ends_at: e.target.value }))}
                      className={inputClass} />
                    {bannerForm.ends_at && (
                      <button type="button"
                        onClick={() => setBannerForm(f => ({ ...f, ends_at: '' }))}
                        className="px-3 py-2 bg-stone-100 text-stone-500 rounded-xl hover:bg-stone-200 transition text-xs shrink-0 font-medium">
                        지우기
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-1">비워두면 무기한 노출</p>
                </div>
                <div>
                  <label className={labelClass}>노출 순서 (낮을수록 먼저)</label>
                  <input type="number" min="0"
                    value={bannerForm.display_order}
                    onChange={(e) => setBannerForm(f => ({ ...f, display_order: e.target.value }))}
                    className={inputClass} />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <input type="checkbox" id="modal_is_active"
                    checked={bannerForm.is_active}
                    onChange={(e) => setBannerForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4 accent-[#23211C]" />
                  <label htmlFor="modal_is_active" className="text-sm font-medium text-stone-700">활성화</label>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E3DDD0] bg-[#FAFAF8] rounded-b-2xl">
              <button onClick={cancelBannerForm}
                className="px-5 py-2 bg-stone-100 text-stone-600 text-sm rounded-full hover:bg-stone-200 transition font-semibold">
                취소
              </button>
              <button onClick={saveBanner}
                className="px-5 py-2 bg-[#23211C] text-white text-sm rounded-full hover:bg-black transition font-semibold">
                {editingBannerId ? '수정 저장' : '등록하기'}
              </button>
            </div>
          </div>
          </div>{/* 스크롤 래퍼 end */}
        </div>
      )}
    </main>
  );
}
