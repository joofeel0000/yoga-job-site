'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function JobDetail() {
  const params = useParams();
  const id = params.id;  // ← 추가
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);  // ← 추가
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);  // ← 추가
const [applicantCount, setApplicantCount] = useState(0);  // ← 추가
const [showApplyModal, setShowApplyModal] = useState(false);  // ← 추가
const [applyMessage, setApplyMessage] = useState('');  // ← 추가

  useEffect(() => {
    checkUser();
    fetchJob();
    
    // 페이지가 다시 focus될 때마다 업데이트
    const handleFocus = () => {
      fetchApplicantCount();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user && id) {
      checkBookmark(user.id);
      checkApplication(user.id);  // ← 추가
    }
    
    fetchApplicantCount();  // ← 추가
  };

  const checkBookmark = async (userId) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('job_id', id)  // ← item_type, item_id 대신 job_id
      .maybeSingle();
    
    if (error) {
      console.log('북마크 체크 에러:', error);
    }
    setIsBookmarked(!!data);
  };

  const fetchJob = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('에러:', error);
    } else {
      setJob(data);
    }
    setLoading(false);
  };

  const checkApplication = async (userId) => {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .eq('job_id', id)
      .maybeSingle();
    
    setHasApplied(!!data);
  };

  const fetchApplicantCount = async () => {
    console.log('지원자 수 조회 중... job_id:', id);
    
    const { count, error } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', id);
    
    console.log('조회 결과 - count:', count, 'error:', error);
    
    setApplicantCount(count || 0);
  };

  const handleApply = async () => {
    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }
    
    if (hasApplied) {
      alert('이미 지원하셨습니다');
      return;
    }
    
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    const { error } = await supabase
      .from('applications')
      .insert([{
        user_id: user.id,
        job_id: id,
        candidate_id: null,
        message: applyMessage
      }]);

    if (!error) {
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
    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    if (isBookmarked) {
      // 북마크 삭제
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', id);  // ← 수정

      if (!error) {
        setIsBookmarked(false);
        alert('북마크가 해제되었습니다');
      } else {
        alert('북마크 해제 실패: ' + error.message);
      }
    } else {
      // 북마크 추가
      const { error } = await supabase
        .from('bookmarks')
        .insert([{
          user_id: user.id,
          job_id: id,  // ← 수정
          candidate_id: null
        }]);

      if (!error) {
        setIsBookmarked(true);
        alert('북마크에 추가되었습니다');
      } else {
        alert('북마크 추가 실패: ' + error.message);
      }
    }
  };

  if (!job) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 mb-4">공고를 찾을 수 없습니다</p>
            <Link href="/jobs" className="text-purple-600 hover:underline">
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
          <Link href="/jobs" className="text-purple-600 hover:underline">
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
          {/* 제목 */}
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            {job.title}
          </h1>

          {/* 기본 정보 */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 bg-purple-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">📍 지역</p>
              <p className="text-lg font-semibold text-gray-800">{job.location}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">🧘 요가 종류</p>
              <p className="text-lg font-semibold text-gray-800">{job.yoga_style}</p>
            </div>

            {job.experience && (
              <div>
                <p className="text-sm text-gray-600 mb-1">📊 필요 경력</p>
                <p className="text-lg font-semibold text-gray-800">{job.experience}</p>
              </div>
            )}

            {job.salary && (
              <div>
                <p className="text-sm text-gray-600 mb-1">💰 급여</p>
                <p className="text-lg font-semibold text-gray-800">{job.salary}</p>
              </div>
            )}
          </div>

          {/* 상세 설명 */}
          {job.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">상세 설명</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>
            </div>
          )}

          {/* 등록일 */}
          <div className="border-t pt-6">
            <p className="text-gray-400 text-sm">
              등록일: {new Date(job.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* 지원자 수 */}
          <div className="mt-8 p-4 bg-purple-50 rounded-lg">
            <p className="text-center text-gray-700">
              👥 <span className="font-bold text-purple-600">{applicantCount}명</span>이 지원했습니다
            </p>
          </div>

          {/* 지원 버튼 */}
          <div className="mt-4">
            <button
              onClick={handleApply}
              disabled={hasApplied}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                hasApplied
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {hasApplied ? '✓ 지원 완료' : '지원하기'}
            </button>
          </div>

          {/* 지원 모달 */}
          {showApplyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">지원하기</h3>
                <p className="text-gray-600 mb-4">간단한 메시지를 남겨주세요</p>
                
                <textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="자기소개나 지원 동기를 작성해주세요"
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setApplyMessage('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={submitApplication}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
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