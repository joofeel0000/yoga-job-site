'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getMessages, sendMessage, markMessagesAsRead } from '@/lib/chat';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChatRoomPage({ params }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const chatRoomId = params.id;

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
      markMessagesAsRead(chatRoomId);
      
      // 실시간 구독
      const channel = supabase
        .channel(`chat-room-${chatRoomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_room_id=eq.${chatRoomId}`
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, chatRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('로그인이 필요합니다');
      router.push('/login?redirect=chat');
      return;
    }

    setUser(user);
    
    // 채팅방 정보와 상대방 정보 가져오기
    const { data: room } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', chatRoomId)
      .single();
    
    if (room) {
      const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', otherUserId)
        .single();
      
      setOtherUser(profile || { email: '알 수 없음' });
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await getMessages(chatRoomId);
    
    if (!error && data) {
      setMessages(data);
    }
    
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    const { error } = await sendMessage(chatRoomId, newMessage.trim());
    
    if (!error) {
      setNewMessage('');
    } else {
      alert('메시지 전송 실패');
    }
    
    setSending(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <button className="text-gray-600 hover:text-gray-800">
                ← 뒤로
              </button>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">
              {otherUser?.name || otherUser?.email || '채팅'}
            </h1>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">첫 메시지를 보내보세요! 👋</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isMine
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMine ? 'text-purple-200' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? '전송 중...' : '전송'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}