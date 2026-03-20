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
    fetchChatRooms();
  };

  const fetchChatRooms = async () => {
    setLoading(true);
    const { data, error } = await getChatRooms();
    
    if (!error && data) {
      // 각 채팅방의 상대방 정보 가져오기
      const roomsWithUsers = await Promise.all(
        data.map(async (room) => {
          const otherUserId = room.user1_id === user?.id ? room.user2_id : room.user1_id;
          
          // 상대방 프로필 정보 가져오기
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
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">💬 채팅</h1>
          <Link href="/" className="text-purple-600 hover:underline">
            ← 홈으로
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 mb-4">아직 채팅 내역이 없습니다</p>
            <Link href="/jobs">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                구인 공고 보러가기
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {chatRooms.map((room) => (
                <Link key={room.id} href={`/chat/${room.id}`}>
                  <div className="p-6 hover:bg-gray-50 cursor-pointer transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {room.otherUser.name || room.otherUser.email}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {room.last_message || '메시지 없음'}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500">
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