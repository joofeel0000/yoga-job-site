'use client';

import { supabase } from '@/lib/supabase';
import { createContactNotification } from '@/lib/notifications';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ResumeDetail() {
  const params = useParams();
  const id = params.id;
  const [resume, setResume] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasContacted, setHasContacted] = useState(false);
  const [contactCount, setContactCount] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    checkUser();
    fetchResume();
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user && id) {
      checkBookmark(user.id);
      checkContact(user.id);
    }
    fetchContactCount();
  };

  const checkBookmark = async (userId) => {
    const { data } = await supabase.from('bookmarks').select('*')
      .eq('user_id', userId).eq('candidate_id', id).maybeSingle();
    setIsBookmarked(!!data);
  };

  const fetchResume = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('candidate').select('*').eq('id', id).single();
    if (error) console.error('에러:', error);
    else setResume(data);
    setLoading(false);
  };

  const checkContact = async (userId) => {
    const { data } = await supabase.from('applications').select('*')
      .eq('user_id', userId).eq('candidate_id', id).maybeSingle();
    setHasContacted(!!data);
  };

  const fetchContactCount = async () => {
    const { count } = await supabase.from('applications')
      .select('*', { count: 'exact', head: true }).eq('candidate_id', id);
    setContactCount(count || 0);
  };

  const handleContact = () => {
    if (!user) { alert('로그인이 필요합니다'); return; }
    if (hasContacted) { alert('이미 연락하셨습니다'); return; }
    setShowContactModal(true);
  };

  const submitContact = async () => {
    const { data: contactData, error } = await supabase.from('applications')
      .insert([{ user_id: user.id, job_id: null, candidate_id: id, message: contactMessage }])
      .select().single();

    if (!error) {
      if (resume.user_id && contactData)
        await createContactNotification(resume.user_id, resume.name, contactData.id);
      alert('연락이 완료되었습니다!');
      setHasContacted(true);
      setShowContactModal(false);
      setContactMessage('');
      fetchContactCount();
    } else {
      alert('연락 실패: ' + error.message);
    }
  };

  const toggleBookmark = async () => {
    if (!user) { alert('로그인이 필요합니다'); return; }
    if (isBookmarked) {
      const { error } = await supabase.from('bookmarks').delete()
        .eq('user_id', user.id).eq('candidate_id', id);
      if (!error) { setIsBookmarked(false); alert('북마크가 해제되었습니다'); }
    } else {
      const { error } = await supabase.from('bookmarks')
        .insert([{ user_id: user.id, job_id: null, candidate_id: id }]);
      if (!error) { setIsBookmarked(true); alert('북마크에 추가되었습니다'); }
    }
  };

  if (loading || !resume) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
        <div className="max-w-4xl mx-auto px-8 py-16 text-center">
          <div className="text-4xl mb-4 animate-pulse">🌺</div>
          <p className="text-stone-400 text-sm">
            {loading ? '불러오는 중...' : '이력서를 찾을 수 없습니다'}
          </p>
          {!loading && (
            <Link href="/resumes" className="mt-4 inline-block text-green-700 hover:text-green-800 text-sm font-medium">
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
          <Link href="/resumes" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
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

          {/* 프로필 */}
          <div className="flex items-start gap-6 mb-8">
            {resume.photo_url && (
              <img
                src={resume.photo_url}
                alt={resume.name}
                className="w-28 h-28 rounded-full object-cover ring-2 ring-stone-100 shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-stone-800 mb-1">{resume.name}</h1>
              <p className="text-stone-500">📍 {resume.location}</p>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 bg-stone-50 rounded-2xl">
            <div>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">전문 분야</p>
              <p className="text-base font-semibold text-stone-800">🌿 {resume.yoga_styles}</p>
            </div>
            {resume.experience_years && (
              <div>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">경력</p>
                <p className="text-base font-semibold text-stone-800">⏱ {resume.experience_years}</p>
              </div>
            )}
            {resume.certifications && (
              <div className="md:col-span-2">
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">자격증</p>
                <p className="text-base font-semibold text-stone-800">🏆 {resume.certifications}</p>
              </div>
            )}
          </div>

          {/* 자기소개 */}
          {resume.introduction && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-stone-700 mb-3">자기소개</h2>
              <p className="text-stone-600 whitespace-pre-wrap leading-relaxed text-sm">
                {resume.introduction}
              </p>
            </div>
          )}

          {/* 등록일 */}
          <div className="border-t border-stone-100 pt-5 mb-6">
            <p className="text-stone-300 text-xs">
              등록일: {new Date(resume.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* 연락 수 */}
          <div className="p-4 bg-amber-50 rounded-2xl mb-4 text-center">
            <p className="text-stone-600 text-sm">
              💌 <span className="font-bold text-amber-600">{contactCount}개</span>의 센터에서 연락했습니다
            </p>
          </div>

          {/* 연락 버튼 */}
          <button
            onClick={handleContact}
            disabled={hasContacted}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition ${
              hasContacted
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95'
            }`}
          >
            {hasContacted ? '✓ 연락 완료' : '연락하기'}
          </button>
        </div>
      </div>

      {/* 연락 모달 */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-stone-800 mb-2">연락하기</h3>
            <p className="text-stone-500 text-sm mb-5">간단한 메시지를 남겨주세요</p>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="채용 제안이나 문의 사항을 작성해주세요"
              className="w-full h-32 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm mb-5 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowContactModal(false); setContactMessage(''); }}
                className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition font-semibold text-sm"
              >
                취소
              </button>
              <button
                onClick={submitContact}
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-semibold text-sm"
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
