'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const POSITION_LABELS = {
  home_top:       '메인 상단 (슬라이드 캐러셀)',
  home_strip:     '메인 와이드 배너 (160px)',
  home_bottom:    '메인 스폰서 카드 (3열 그리드)',
  jobs_top:       '구인공고 우측 사이드바',
  jobs_bottom:    '구인공고 하단 스폰서 카드',
  resumes_top:    '강사찾기 우측 사이드바',
  resumes_bottom: '강사찾기 하단 스폰서 카드',
  community_top:  '커뮤니티 상단 와이드 배너',
  property_top:   '매물정보 상단 와이드 배너',
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
  const [statsPeriod, setStatsPeriod] = useState(7);

  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerForm, setBannerForm] = useState(BLANK_BANNER);

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

    const [jobsRes, resumesRes, usersRes, bannersRes, clicksRes] = await Promise.all([
      supabase.from('job').select('*').order('created_at', { ascending: false }),
      supabase.from('candidate').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('banners').select('*').order('position').order('display_order'),
      supabase.from('banner_clicks').select('banner_id, event_type, clicked_at').order('clicked_at', { ascending: false }),
    ]);

    if (jobsRes.data)    setJobs(jobsRes.data);
    if (resumesRes.data) setResumes(resumesRes.data);
    if (usersRes.data)   setUsers(usersRes.data);
    if (bannersRes.data) setBanners(bannersRes.data);
    if (clicksRes.data)  setBannerClicks(clicksRes.data);

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

  const toggleBannerActive = async (id, isActive) => {
    const { error } = await supabase.from('banners').update({ is_active: !isActive }).eq('id', id);
    if (error) alert('변경 실패');
    else fetchAllData();
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
            <p className="text-sm text-[#9A9382]">구인공고·이력서·회원·배너 광고를 관리합니다</p>
          </div>
          <Link href="/" className="text-[#23211C] hover:text-black font-medium text-sm transition-colors">
            ← 홈으로
          </Link>
        </div>

        {/* 탭 */}
        <div className="card mb-6">
          <div className="flex border-b border-stone-100">
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
            <button onClick={() => setActiveTab('banners')}
              className={`flex-1 py-4 px-6 font-semibold transition text-sm ${activeTab === 'banners' ? 'text-[#23211C] border-b-2 border-[#23211C]' : 'text-stone-500 hover:text-stone-700'}`}>
              배너 광고 ({banners.length})
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
                        <button onClick={() => deleteJob(job.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )

        ) : activeTab === 'resumes' ? (
          resumes.length === 0 ? (
            <div className="card-empty">
              <p className="text-stone-400 text-sm">등록된 이력서가 없습니다</p>
            </div>
          ) : (
            <div className="card">
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
                        <button onClick={() => deleteResume(resume.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )

        ) : activeTab === 'users' ? (
          users.length === 0 ? (
            <div className="card-empty">
              <p className="text-stone-400 text-sm">등록된 회원이 없습니다</p>
            </div>
          ) : (
            <div className="card">
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
          )

        ) : activeTab === 'banners' ? (
          <div className="space-y-6">

            {/* 통계 섹션 */}
            {(() => {
              const since = new Date(Date.now() - statsPeriod * 86400000).toISOString();
              const periodClicks = bannerClicks.filter(c => c.clicked_at >= since);
              const statsMap = {};
              periodClicks.forEach(c => {
                if (!statsMap[c.banner_id]) statsMap[c.banner_id] = { views: 0, clicks: 0 };
                if (c.event_type === 'view')  statsMap[c.banner_id].views++;
                if (c.event_type === 'click') statsMap[c.banner_id].clicks++;
              });
              const hasStats = banners.some(b => statsMap[b.id]);
              return (
                <div className="card">
                  <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
                    <p className="text-sm font-semibold text-stone-700">📊 배너 통계</p>
                    <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
                      {[7, 30].map(d => (
                        <button key={d} onClick={() => setStatsPeriod(d)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition ${statsPeriod === d ? 'bg-[#23211C] text-white' : 'text-stone-500'}`}>
                          최근 {d}일
                        </button>
                      ))}
                    </div>
                  </div>
                  {!hasStats ? (
                    <div className="px-6 py-8 text-center text-stone-400 text-sm">
                      해당 기간의 통계 데이터가 없습니다
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px]">
                        <thead className="bg-stone-50 border-b border-stone-100">
                          <tr>
                            <th className={thClass}>배너</th>
                            <th className={thClass}>위치</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wide">노출수</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wide">클릭수</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wide">CTR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {banners.map(b => {
                            const s = statsMap[b.id] || { views: 0, clicks: 0 };
                            const ctr = s.views > 0 ? ((s.clicks / s.views) * 100).toFixed(1) : '0.0';
                            return (
                              <tr key={b.id} className="hover:bg-stone-50">
                                <td className={tdClass}>
                                  <div className="flex items-center gap-3">
                                    <img src={b.image_url} alt={b.title}
                                      className="w-14 h-8 object-cover rounded-lg border border-stone-100 shrink-0"
                                      onError={e => { e.target.style.display = 'none'; }} />
                                    <span className="font-medium truncate max-w-[160px]">{b.title}</span>
                                  </div>
                                </td>
                                <td className={tdSubClass}>
                                  <span className="px-2 py-1 bg-[#EAE7DE] text-[#23211C] rounded-full text-xs font-medium whitespace-nowrap">
                                    {POSITION_LABELS[b.position] || b.position}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-semibold text-stone-700">{s.views.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-sm font-semibold text-[#23211C]">{s.clicks.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                  <span className={`text-sm font-bold ${parseFloat(ctr) >= 1 ? 'text-[#16A34A]' : 'text-stone-500'}`}>
                                    {ctr}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 등록/수정 폼 */}
            {showBannerForm && (
              <div className="bg-white rounded-2xl border border-[#E3DDD0] shadow-sm p-6">
                <h2 className="text-base font-bold text-stone-800 mb-5">
                  {editingBannerId ? '배너 수정' : '새 배너 등록'}
                </h2>
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
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>이미지 URL *</label>
                    <input type="url" placeholder="https://example.com/banner.jpg"
                      value={bannerForm.image_url}
                      onChange={(e) => setBannerForm(f => ({ ...f, image_url: e.target.value }))}
                      className={inputClass} />
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
                    <input type="checkbox" id="is_active"
                      checked={bannerForm.is_active}
                      onChange={(e) => setBannerForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 accent-[#23211C]" />
                    <label htmlFor="is_active" className="text-sm font-medium text-stone-700">활성화</label>
                  </div>
                </div>

                {/* 이미지 미리보기 */}
                {bannerForm.image_url && (
                  <div className="mt-5">
                    <p className={labelClass}>이미지 미리보기</p>
                    <img src={bannerForm.image_url} alt="미리보기"
                      className="max-h-28 w-full object-cover rounded-xl border border-stone-100"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
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
            )}

            {/* 배너 목록 */}
            <div className="card">
              <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
                <p className="text-sm font-semibold text-stone-700">배너 목록</p>
                {!showBannerForm && (
                  <button onClick={startNewBanner}
                    className="px-4 py-2 bg-[#23211C] text-white text-xs rounded-full hover:bg-black transition font-semibold">
                    + 새 배너 등록
                  </button>
                )}
              </div>

              {banners.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-stone-400 text-sm">등록된 배너가 없습니다</p>
                  <p className="text-stone-300 text-xs mt-1">위 버튼으로 첫 배너를 등록해보세요</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-stone-50 border-b border-stone-100">
                      <tr>
                        <th className={thClass}>제목</th>
                        <th className={thClass}>위치</th>
                        <th className={thClass}>상태</th>
                        <th className={thClass}>노출 기간</th>
                        <th className={thClass}>순서</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase tracking-wide">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {banners.map((banner) => (
                        <tr key={banner.id} className="hover:bg-stone-50 transition">
                          <td className={tdClass}>
                            <div className="flex items-center gap-3">
                              <img src={banner.image_url} alt={banner.title}
                                className="w-14 h-8 object-cover rounded-lg border border-stone-100 shrink-0"
                                onError={(e) => { e.target.style.display = 'none'; }} />
                              <span className="font-medium truncate max-w-[150px]">{banner.title}</span>
                            </div>
                          </td>
                          <td className={tdSubClass}>
                            <span className="px-2 py-1 bg-[#EAE7DE] text-[#23211C] rounded-full text-xs font-medium whitespace-nowrap">
                              {POSITION_LABELS[banner.position] || banner.position}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              banner.is_active ? 'bg-[#EAE7DE] text-[#23211C]' : 'bg-stone-100 text-stone-500'
                            }`}>
                              {banner.is_active ? '활성' : '비활성'}
                            </span>
                          </td>
                          <td className={tdSubClass}>
                            <div className="text-xs space-y-0.5">
                              {banner.starts_at
                                ? <p>시작: {new Date(banner.starts_at).toLocaleDateString('ko-KR')}</p>
                                : null}
                              {banner.ends_at
                                ? <p>종료: {new Date(banner.ends_at).toLocaleDateString('ko-KR')}</p>
                                : null}
                              {!banner.starts_at && !banner.ends_at
                                ? <p className="text-stone-300">기간 제한 없음</p>
                                : null}
                            </div>
                          </td>
                          <td className={tdSubClass}>{banner.display_order}</td>
                          <td className="px-6 py-4 text-center space-x-1.5 whitespace-nowrap">
                            <button onClick={() => toggleBannerActive(banner.id, banner.is_active)}
                              className={`px-3 py-1 text-white text-xs rounded-full transition font-semibold ${
                                banner.is_active
                                  ? 'bg-stone-400 hover:bg-stone-500'
                                  : 'bg-[#23211C] hover:bg-[#23211C]'
                              }`}>
                              {banner.is_active ? '비활성화' : '활성화'}
                            </button>
                            <button onClick={() => startEditBanner(banner)}
                              className="px-3 py-1 bg-[#23211C] text-white text-xs rounded-full hover:bg-black transition font-semibold">
                              수정
                            </button>
                            <button onClick={() => deleteBanner(banner.id)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition font-semibold">
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        ) : null}
      </div>
    </main>
  );
}
