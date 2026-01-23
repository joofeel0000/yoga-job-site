'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function NotificationDebugPage() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      fetchNotifications(user.id);
    }
  };

  const fetchNotifications = async (userId) => {
    console.log('🔍 알림 조회 시작. userId:', userId);
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('📊 조회 결과:', data);
    console.log('❌ 에러:', error);

    if (error) {
      setError(error.message);
    } else {
      setNotifications(data || []);
    }
  };

  const createTestNotification = async () => {
    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: user.id,
        type: 'application',
        item_id: 999,
        title: '테스트 알림',
        message: '이것은 테스트 알림입니다.',
        is_read: false
      }])
      .select();

    if (error) {
      alert('알림 생성 실패: ' + error.message);
      console.error('알림 생성 에러:', error);
    } else {
      alert('테스트 알림 생성 완료!');
      console.log('생성된 알림:', data);
      fetchNotifications(user.id);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">알림 기능 디버깅</h1>
        
        {user ? (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">현재 로그인 사용자:</p>
              <p className="text-sm">Email: {user.email}</p>
              <p className="text-sm">ID: {user.id}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  알림 테스트
                </h2>
                <button
                  onClick={createTestNotification}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  테스트 알림 생성
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                  <p className="text-red-700 font-semibold">에러 발생:</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <h3 className="text-lg font-semibold mb-3">
                내 알림 목록 ({notifications.length}개)
              </h3>

              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">알림이 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-lg border ${
                        notif.is_read
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{notif.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Type: {notif.type}</span>
                            <span>Item ID: {notif.item_id}</span>
                            <span>Read: {notif.is_read ? 'Yes' : 'No'}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.created_at).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">💡 체크리스트:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className={notifications.length >= 0 ? '✅' : '❌'}>
                    {notifications.length >= 0 ? '✅' : '❌'}
                  </span>
                  notifications 테이블에 접근 가능
                </li>
                <li className="flex items-center gap-2">
                  <span>🔍</span>
                  "테스트 알림 생성" 버튼 클릭해서 알림 생성해보기
                </li>
                <li className="flex items-center gap-2">
                  <span>🔔</span>
                  헤더에 알림 벨이 보이는지 확인
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 mb-4">로그인이 필요합니다</p>
            <a href="/login" className="text-blue-600 hover:underline">
              로그인하기
            </a>
          </div>
        )}
      </div>
    </main>
  );
}