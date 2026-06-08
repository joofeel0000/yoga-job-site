'use client';

import { supabase } from '@/lib/supabase';
import { createApplicationNotification } from '@/lib/notifications';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function JobDetail() {
  const params = useParams();
  const id = params.id;
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicantCount, setApplicantCount] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    checkUser();
    fetchJob();

    const handleFocus = () => fetchApplicantCount();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user && id) {
      checkBookmark(user.id);
      checkApplication(user.id);
    }
    fetchApplicantCount();
  };

  const checkBookmark = async (userId) => {
    const { data } = await supabase.from('bookmarks').select('*')
      .eq('user_id', userId).eq('job_id', id).maybeSingle();
    setIsBookmarked(!!data);
  };

  const fetchJob = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('job').select('*').eq('id', id).single();
    if (error) console.error('에러:', error);
    else setJob(data);
    setLoading(false);
  };

  const checkApplication = async (userId) => {
    const { data } = await supabase.from('applications').select('*')
      .eq('user_id', userId).eq('job_id', id).maybeSingle();
    setHasApplied(!!data);
  };

  const fetchApplicantCount = async () => {
    const { count } = await supabase.from('applications')
      .select('*', { count: 'exact', head: true }).eq('job_id', id);
    setApplicantCount(count || 0);
  };

  const handleApply = () => {
    if (!user) { alert('로그인이 필요합니다'); return; }
    if (hasApplied) { alert('이미 지원하셨습니다'); return; }
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    const { data: applicationData, error } = await supabase.from('applications')
      .insert([{ user_id: user.id, job_id: id, candidate_id: null, message: applyMessage }])
      .select().single();

    if (!error) {
      if (job.user_id && applicationData)
        await createApplicationNotification(job.user_id, job.title, applicationData.id);
      alert('지원이 완료되었습니다!');
      setHasApplied(true);
      setShowApplyModal(false);
      setApplyMessage('');
      fetchApplicantCount();
    } else {
      alert('지원 실패: ' + error.message);
    }
  };

  const toggleBookmark = async () => {
    if (!user) { alert('로그인이 필요합니다'); return; }
    if (isBookmarked) {
      const { error } = await supabase.from('bookmarks').delete()
        .eq('user_id', user.id).eq('job_id', id);
      if (!error) { setIsBookmarked(false); alert('북마크가 해제되었습니다'); }
    } else {
      const { error } = await supabase.from('bookmarks')
        .insert([{ user_id: user.id, job_id: id, candidate_id: null }]);
      if (!error) { setIsBookmarked(true); alert('북마크에 추가되었습니다'); }
    }
  };

  if (!job) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
        <div className="max-w-4xl mx-auto px-8 py-16 text-center">
          <div className="text-4xl mb-4 animate-pulse">🌿</div>
          <p className="text-stone-400 text-sm">
            {loading ? '불러오는 중...' : '공고를 찾을 수 없습니다'}
          </p>
          {!loading && (
            <Link href="/jobs" className="mt-4 inline-block text-green-700 hover:text-green-800 text-sm font-medium">
              ← 목록으로 돌아가기
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* 상단 */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/jobs" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
            ← 목록으로
          </Link>
          {user && (
            <button
              onClick={toggleBookmark}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                isBookmarked
                  ? 'bg-yellow-400 text-white hover:bg-yellow-500'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isBookmarked ? '⭐ 북마크 해제' : '☆ 북마크'}
            </button>
          )}
        </div>

        {/* 상세 카드 */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-7 leading-snug">{job.title}</h1>

          {/* 기본 정보 */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 bg-stone-50 rounded-2xl">
            <div>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">지역</p>
              <p className="text-base font-semibold text-stone-800">📍 {job.location}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">요가 종류</p>
              <p className="text-base font-semibold text-stone-800">🌿 {job.yoga_style}</p>
            </div>
            {job.experience && (
              <div>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">필요 경력</p>
                <p className="text-base font-semibold text-stone-800">📊 {job.experience}</p>
              </div>
            )}
            {job.salary && (
              <div>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">급여</p>
                <p className="text-base font-semibold text-stone-800">💰 {job.salary}</p>
              </div>
            )}
          </div>

          {/* 상세 설명 */}
          {job.description && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-stone-700 mb-3">상세 설명</h2>
              <p className="text-stone-600 whitespace-pre-wrap leading-relaxed text-sm">
                {job.description}
              </p>
            </div>
          )}

          {/* 등록일 */}
          <div className="border-t border-stone-100 pt-5 mb-6">
            <p className="text-stone-300 text-xs">
              등록일: {new Date(job.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* 지원자 수 */}
          <div className="p-4 bg-emerald-50 rounded-2xl mb-4 text-center">
            <p className="text-stone-600 text-sm">
              👥 <span className="font-bold text-green-700">{applicantCount}명</span>이 지원했습니다
            </p>
          </div>

          {/* 지원 버튼 */}
          <button
            onClick={handleApply}
            disabled={hasApplied}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition ${
              hasApplied
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-green-700 text-white hover:bg-green-800 active:scale-95'
            }`}
          >
            {hasApplied ? '✓ 지원 완료' : '지원하기'}
          </button>
        </div>
      </div>

      {/* 지원 모달 */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-stone-800 mb-2">지원하기</h3>
            <p className="text-stone-500 text-sm mb-5">간단한 메시지를 남겨주세요</p>
            <textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="자기소개나 지원 동기를 작성해주세요"
              className="w-full h-32 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm mb-5 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowApplyModal(false); setApplyMessage(''); }}
                className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition font-semibold text-sm"
              >
                취소
              </button>
              <button
                onClick={submitApplication}
                className="flex-1 py-3 bg-green-700 text-white rounded-xl hover:bg-green-800 transition font-semibold text-sm"
              >
                제출
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
