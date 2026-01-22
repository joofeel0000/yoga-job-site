'use client';

import { supabase } from '@/lib/supabase';
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
  const [hasContacted, setHasContacted] = useState(false);  // ← 추가
const [contactCount, setContactCount] = useState(0);  // ← 추가
const [showContactModal, setShowContactModal] = useState(false);  // ← 추가
const [contactMessage, setContactMessage] = useState('');  // ← 추가

  useEffect(() => {
    checkUser();
    fetchResume();
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user && id) {
      checkBookmark(user.id);
      checkContact(user.id);  // ← 추가
    }
    
    fetchContactCount();  // ← 추가
  };

  const checkBookmark = async (userId) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('candidate_id', id)  // ← 수정
      .maybeSingle();
    
    if (error) {
      console.log('북마크 체크 에러:', error);
    }
    setIsBookmarked(!!data);
  };

  const fetchResume = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('candidate')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('에러:', error);
    } else {
      setResume(data);
    }
    setLoading(false);
  };

  const checkContact = async (userId) => {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .eq('candidate_id', id)
      .maybeSingle();
    
    setHasContacted(!!data);
  };

  const fetchContactCount = async () => {
    const { count, error } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', id);
    
    setContactCount(count || 0);
  };

  const handleContact = async () => {
    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }
    
    if (hasContacted) {
      alert('이미 연락하셨습니다');
      return;
    }
    
    setShowContactModal(true);
  };

  const submitContact = async () => {
    const { error } = await supabase
      .from('applications')
      .insert([{
        user_id: user.id,
        job_id: null,
        candidate_id: id,
        message: contactMessage
      }]);

    if (!error) {
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
    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('candidate_id', id);  // ← 수정

      if (!error) {
        setIsBookmarked(false);
        alert('북마크가 해제되었습니다');
      } else {
        alert('북마크 해제 실패: ' + error.message);
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert([{
          user_id: user.id,
          job_id: null,
          candidate_id: id  // ← 수정
        }]);

      if (!error) {
        setIsBookmarked(true);
        alert('북마크에 추가되었습니다');
      } else {
        alert('북마크 추가 실패: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500 py-20">로딩 중...</p>
        </div>
      </main>
    );
  }

  if (!resume) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 mb-4">이력서를 찾을 수 없습니다</p>
            <Link href="/resumes" className="text-indigo-600 hover:underline">
              ← 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 & 북마크 */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/resumes" className="text-indigo-600 hover:underline">
            ← 목록으로 돌아가기
          </Link>
          {user && (
            <button
              onClick={toggleBookmark}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                isBookmarked
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isBookmarked ? '⭐ 북마크 해제' : '☆ 북마크'}
            </button>
          )}
        </div>

        {/* 상세 내용 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 프로필 사진 & 이름 */}
          <div className="flex items-start gap-6 mb-8">
            {resume.photo_url && (
              <img
                src={resume.photo_url}
                alt={resume.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {resume.name}
              </h1>
              <p className="text-xl text-gray-600">{resume.location}</p>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 bg-indigo-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">🧘 전문 분야</p>
              <p className="text-lg font-semibold text-gray-800">{resume.yoga_styles}</p>
            </div>

            {resume.experience_years && (
              <div>
                <p className="text-sm text-gray-600 mb-1">⏱ 경력</p>
                <p className="text-lg font-semibold text-gray-800">{resume.experience_years}</p>
              </div>
            )}

            {resume.certifications && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">📜 자격증</p>
                <p className="text-lg font-semibold text-gray-800">{resume.certifications}</p>
              </div>
            )}
          </div>

          {/* 소개 */}
          {resume.introduction && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">자기소개</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {resume.introduction}
                </p>
              </div>
            </div>
          )}

          {/* 등록일 */}
          <div className="border-t pt-6">
            <p className="text-gray-400 text-sm">
              등록일: {new Date(resume.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* 연락 수 */}
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
            <p className="text-center text-gray-700">
              💌 <span className="font-bold text-indigo-600">{contactCount}개</span>의 센터에서 연락했습니다
            </p>
          </div>

          {/* 연락하기 버튼 */}
          <div className="mt-4">
            <button
              onClick={handleContact}
              disabled={hasContacted}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                hasContacted
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {hasContacted ? '✓ 연락 완료' : '연락하기'}
            </button>
          </div>

          {/* 연락 모달 */}
          {showContactModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">연락하기</h3>
                <p className="text-gray-600 mb-4">간단한 메시지를 남겨주세요</p>
                
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="채용 제안이나 문의 사항을 작성해주세요"
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowContactModal(false);
                      setContactMessage('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={submitContact}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    제출
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}