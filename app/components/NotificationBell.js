'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // 30초마다 알림 새로고침
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    fetchNotifications();
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowDropdown(false);

    // 알림 타입에 따라 페이지 이동
    if (notification.type === 'application' || notification.type === 'contact') {
      router.push('/mypage?tab=received');
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* 알림 벨 아이콘 */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* 읽지 않은 알림 카운터 */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {showDropdown && (
        <>
          {/* 오버레이 (클릭하면 닫기) */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* 드롭다운 메뉴 */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">알림</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  모두 읽음
                </button>
              )}
            </div>

            {/* 알림 목록 */}
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  로딩 중...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  알림이 없습니다
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* 아이콘 */}
                      <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                        !notification.is_read ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          !notification.is_read
                            ? 'font-semibold text-gray-800'
                            : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 푸터 */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50 text-center">
                <Link
                  href="/mypage?tab=received"
                  onClick={() => setShowDropdown(false)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  모든 알림 보기
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// 시간 포맷 함수
function formatTimestamp(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = Math.floor((now - date) / 1000); // 초 단위

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  });
}