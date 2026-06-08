'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getChatRooms } from '@/lib/chat';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('로그인이 필요합니다');
      router.push('/login?redirect=chat');
      return;
    }

    setUser(user);
    fetchChatRooms(user);
  };

  const fetchChatRooms = async (currentUser) => {
    setLoading(true);
    const { data, error } = await getChatRooms();

    if (!error && data) {
      const roomsWithUsers = await Promise.all(
        data.map(async (room) => {
          const otherUserId = room.user1_id === currentUser?.id ? room.user2_id : room.user1_id;

          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', otherUserId)
            .single();

          return {
            ...room,
            otherUser: profile || { email: '알 수 없음' }
          };
        })
      );

      setChatRooms(roomsWithUsers);
    }

    setLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-stone-800">💬 채팅</h1>
          <Link href="/" className="text-green-700 hover:text-green-800 font-medium text-sm transition-colors">
            ← 홈으로
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl animate-pulse mb-3">💬</div>
            <p className="text-stone-400 text-sm">로딩 중...</p>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-stone-400 text-sm mb-6">아직 채팅 내역이 없습니다</p>
            <Link href="/jobs">
              <button className="px-6 py-3 bg-green-700 text-white rounded-full hover:bg-green-800 transition font-semibold text-sm">
                구인 공고 보러가기
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-stone-100">
              {chatRooms.map((room) => (
                <Link key={room.id} href={`/chat/${room.id}`}>
                  <div className="p-6 hover:bg-stone-50 cursor-pointer transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-stone-800 mb-1">
                          {room.otherUser.name || room.otherUser.email}
                        </h3>
                        <p className="text-stone-500 text-sm line-clamp-1">
                          {room.last_message || '메시지 없음'}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-stone-400">
                          {formatDate(room.last_message_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
