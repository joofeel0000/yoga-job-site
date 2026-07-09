'use client';

import { supabase } from '@/lib/supabase';
import { createContactNotification } from '@/lib/notifications';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const AVATAR_IMGS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
];

function avatarImg(id) {
  if (!id) return AVATAR_IMGS[0];
  const code = [...String(id)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_IMGS[code % AVATAR_IMGS.length];
}

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
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    if (u && id) {
      checkBookmark(u.id);
      checkContact(u.id);
    }
    fetchContactCount();
  };

  const checkBookmark = async (userId) => {
    const { data } = await supabase.from('bookmarks').select('*').eq('user_id', userId).eq('candidate_id', id).maybeSingle();
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
    const { data } = await supabase.from('applications').select('*').eq('user_id', userId).eq('candidate_id', id).maybeSingle();
    setHasContacted(!!data);
  };

  const fetchContactCount = async () => {
    const { count } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('candidate_id', id);
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
      const { error } = await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('candidate_id', id);
      if (!error) setIsBookmarked(false);
    } else {
      const { error } = await supabase.from('bookmarks').insert([{ user_id: user.id, job_id: null, candidate_id: id }]);
      if (!error) setIsBookmarked(true);
    }
  };

  if (loading || !resume) {
    return (
      <main style={{ minHeight: '100vh', background: '#F4F1E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9A9382', fontSize: 14 }}>{loading ? '불러오는 중...' : '이력서를 찾을 수 없습니다'}</p>
      </main>
    );
  }

  const styles = (resume.yoga_styles || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean);

  return (
    <main style={{ minHeight: '100vh', background: '#F4F1E9' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <Link href="/resumes" className="inline-flex items-center gap-1 text-[13px] text-[#76705F] mb-5 no-underline">
          ← 강사 목록
        </Link>

        {/* 프로필 헤더 */}
        <div className="bg-white rounded-[18px] border border-[#E3DDD0] p-5 sm:p-8 mb-4">
          <div className="flex flex-col sm:flex-row gap-5 sm:items-start">
            {/* 아바타 */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border-[3px] border-[#E3DDD0] relative self-start">
              <Image src={avatarImg(resume.id)} alt={resume.name} fill sizes="96px" style={{ objectFit: 'cover' }} />
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#23211C' }}>{resume.name}</h1>
                <div className="flex items-center gap-1">
                  <span style={{ color: '#C2922F', fontSize: 14 }}>★</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#26241D' }}>4.8</span>
                </div>
              </div>
              {resume.location && (
                <p style={{ fontSize: 13, color: '#9A9382', marginBottom: 10 }}>📍 {resume.location}</p>
              )}
              {styles.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {styles.map(s => (
                    <span key={s} style={{ fontSize: 12, color: '#76705F', background: '#F4F1E9', padding: '3px 10px', borderRadius: 8, border: '1px solid #E3DDD0' }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <button onClick={handleContact} disabled={hasContacted}
                className="flex-1 sm:flex-none"
                style={{
                  padding: '11px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                  background: hasContacted ? '#E3DDD0' : '#23211C',
                  color: hasContacted ? '#9A9382' : '#fff',
                  border: 'none', cursor: hasContacted ? 'not-allowed' : 'pointer',
                }}>
                {hasContacted ? '✓ 연락 완료' : '연락하기'}
              </button>
              <button onClick={toggleBookmark}
                className="flex-1 sm:flex-none"
                style={{
                  padding: '10px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                  background: isBookmarked ? '#FDF3E3' : 'transparent',
                  color: isBookmarked ? '#C2922F' : '#76705F',
                  border: `1px solid ${isBookmarked ? '#C2922F' : '#E3DDD0'}`, cursor: 'pointer',
                }}>
                {isBookmarked ? '♥ 저장됨' : '♡ 저장'}
              </button>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: '평점', value: '4.8 ★' },
            { label: '경력', value: resume.experience_years || '—' },
            { label: '연락', value: `${contactCount}건` },
            { label: '등록일', value: new Date(resume.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E3DDD0', padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#23211C', marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#9A9382' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* 내용 섹션 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {resume.introduction && (
            <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0', padding: '24px 20px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#23211C', marginBottom: 14 }}>자기소개</h2>
              <p style={{ fontSize: 14, color: '#4A4740', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{resume.introduction}</p>
            </section>
          )}

          {styles.length > 0 && (
            <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0', padding: '24px 20px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#23211C', marginBottom: 14 }}>전문 분야</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {styles.map(s => (
                  <span key={s} style={{ fontSize: 13, color: '#23211C', background: '#F4F1E9', padding: '6px 14px', borderRadius: 10, border: '1px solid #E3DDD0', fontWeight: 500 }}>
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {resume.experience_years && (
            <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0', padding: '24px 20px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#23211C', marginBottom: 14 }}>경력 및 자격</h2>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 3, height: 40, borderRadius: 2, background: '#C2922F', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#23211C' }}>요가 강사 경력</p>
                  <p style={{ fontSize: 13, color: '#76705F', marginTop: 2 }}>{resume.experience_years}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {showContactModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#23211C', marginBottom: 6 }}>연락하기</h3>
            <p style={{ fontSize: 13, color: '#76705F', marginBottom: 20 }}>채용 제안이나 문의 사항을 작성해주세요</p>
            <textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)}
              placeholder="메시지를 입력해주세요" rows={4}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #E3DDD0', borderRadius: 10, fontSize: 14, color: '#23211C', background: '#F4F1E9', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowContactModal(false); setContactMessage(''); }}
                style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, background: '#F4F1E9', color: '#76705F', border: 'none', cursor: 'pointer' }}>
                취소
              </button>
              <button onClick={submitContact}
                style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#23211C', color: '#fff', border: 'none', cursor: 'pointer' }}>
                제출
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
