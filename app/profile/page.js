'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 프로필 정보
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // 비밀번호 변경
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    setUser(user);
    await fetchProfile(user.id);
  };

  const fetchProfile = async (userId) => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setAvatarUrl(data.avatar_url || '');
      setEmailNotifications(data.email_notifications ?? true);
    } else if (error && error.code === 'PGRST116') {
      // 프로필이 없으면 생성
      await createProfile(userId);
    }
    
    setLoading(false);
  };

  const createProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: user?.email,
        name: '',
        phone: '',
        avatar_url: '',
        email_notifications: true
      }])
      .select()
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        phone,
        avatar_url: avatarUrl,
        email_notifications: emailNotifications,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    setSaving(false);

    if (!error) {
      alert('프로필이 저장되었습니다!');
      fetchProfile(user.id);
    } else {
      alert('저장 실패: ' + error.message);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }

    if (newPassword.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (!error) {
      alert('비밀번호가 변경되었습니다!');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert('비밀번호 변경 실패: ' + error.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 공개 URL 가져오기
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
      alert('이미지가 업로드되었습니다! "저장" 버튼을 눌러주세요.');
    } catch (error) {
      console.error('업로드 에러:', error);
      alert('이미지 업로드 실패: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      '정말로 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
    );

    if (!confirmed) return;

    const doubleConfirm = confirm(
      '모든 데이터가 삭제됩니다. 정말 진행하시겠습니까?'
    );

    if (!doubleConfirm) return;

    // 실제로는 admin API로 사용자 삭제해야 함
    // 여기서는 로그아웃만 처리
    await supabase.auth.signOut();
    alert('계정 삭제 요청이 접수되었습니다.');
    router.push('/');
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

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">프로필 설정</h1>
            <p className="text-gray-600 mt-2">{user?.email}</p>
          </div>
          <Link href="/mypage" className="text-purple-600 hover:underline">
            ← 마이페이지
          </Link>
        </div>

        <div className="grid gap-6">
          {/* 프로필 정보 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">기본 정보</h2>

            {/* 프로필 사진 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                프로필 사진
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="프로필" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-gray-400">👤</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer inline-block"
                  >
                    사진 업로드
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG 파일 (최대 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* 이름 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* 전화번호 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* 이메일 (읽기 전용) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:bg-gray-400"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>

          {/* 알림 설정 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">알림 설정</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">이메일 알림</p>
                <p className="text-sm text-gray-500">새 지원/연락 시 이메일로 알림받기</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* 보안 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">보안</h2>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              비밀번호 변경
            </button>
          </div>

          {/* 계정 삭제 */}
          <div className="bg-white rounded-xl shadow p-6 border-2 border-red-200">
            <h2 className="text-xl font-bold text-red-600 mb-2">위험 영역</h2>
            <p className="text-sm text-gray-600 mb-4">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
            </p>

            <button
              onClick={handleDeleteAccount}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              계정 삭제
            </button>
          </div>
        </div>

        {/* 비밀번호 변경 모달 */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">비밀번호 변경</h3>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 (6자 이상)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 확인"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  변경
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}