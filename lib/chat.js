import { supabase } from '@/lib/supabase';

// 채팅방 찾기 또는 생성
export async function getOrCreateChatRoom(otherUserId, jobId = null, candidateId = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // 기존 채팅방 찾기
  const { data: existingRoom } = await supabase
    .from('chat_rooms')
    .select('*')
    .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
    .single();

  if (existingRoom) {
    return { data: existingRoom, error: null };
  }

  // 새 채팅방 생성
  const { data: newRoom, error } = await supabase
    .from('chat_rooms')
    .insert({
      user1_id: user.id,
      user2_id: otherUserId,
      job_id: jobId,
      candidate_id: candidateId
    })
    .select()
    .single();

  return { data: newRoom, error };
}

// 메시지 전송
export async function sendMessage(chatRoomId, message) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_room_id: chatRoomId,
      sender_id: user.id,
      message: message
    })
    .select()
    .single();

  // 채팅방의 last_message 업데이트
  if (!error) {
    await supabase
      .from('chat_rooms')
      .update({
        last_message: message,
        last_message_at: new Date().toISOString()
      })
      .eq('id', chatRoomId);
  }

  return { data, error };
}

// 채팅방 목록 가져오기
export async function getChatRooms() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  return { data, error };
}

// 메시지 목록 가져오기
export async function getMessages(chatRoomId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_room_id', chatRoomId)
    .order('created_at', { ascending: true });

  return { data, error };
}

// 메시지 읽음 표시
export async function markMessagesAsRead(chatRoomId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('chat_room_id', chatRoomId)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  return { error };
}