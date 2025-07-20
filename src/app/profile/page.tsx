'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserAvatar } from '@/components/UserAvatar';
import { useBpiDataDB } from '@/hooks/useBpiDataDB';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { songs, userScores, loading } = useBpiDataDB();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    displayName: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 認証チェック
  useEffect(() => {
    if (status === 'loading') return; // ローディング中は何もしない
    if (!session) {
      router.push('/auth/login');
      return;
    }
  }, [session, status, router]);

  // ローディング中または未認証の場合
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return null; // リダイレクト中は何も表示しない
  }

  const userId = session.user.id;

  // DBからユーザー情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/user/profile?userId=${userId}`);
        const result = await response.json();
        if (result.success && result.user) {
          setUserInfo(result.user);
          setAvatarUrl(result.user.avatarUrl);
          setEditForm({
            username: result.user.username,
            email: result.user.email,
            displayName: result.user.displayName || '',
          });
        }
      } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
      }
    };

    fetchUserInfo();
  }, [userId]);

  // アバターURLをDBに保存
  const saveAvatarUrl = async (url: string) => {
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          avatarUrl: url,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAvatarUrl(url);
      } else {
        console.error('アバターURL保存エラー:', result.error);
      }
    } catch (error) {
      console.error('アバターURL保存エラー:', error);
    }
  };

  // ユーザー情報を更新
  const updateUserInfo = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          username: editForm.username,
          email: editForm.email,
          displayName: editForm.displayName,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setUserInfo(result.user);
        alert('ユーザー情報が更新されました');
      } else {
        alert(`更新に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('ユーザー情報更新エラー:', error);
      alert('更新に失敗しました');
    }
  };

  // パスワード変更
  const updatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('新しいパスワードが一致しません');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('パスワードは6文字以上で入力してください');
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setIsPasswordModalOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        alert('パスワードが変更されました');
      } else {
        alert(`パスワード変更に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('パスワード変更エラー:', error);
      alert('パスワード変更に失敗しました');
    }
  };

  // アバターアップロード処理
  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    
    try {
      // 1. 署名付きURLを取得
      const urlResponse = await fetch('/api/get-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          userId: userId.toString(),
        }),
      });

      const urlResult = await urlResponse.json();

      if (!urlResult.success) {
        alert(`署名付きURLの取得に失敗しました: ${urlResult.error}`);
        return;
      }

      // 2. 署名付きURLを使用してS3に直接アップロード
      const uploadResponse = await fetch(urlResult.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (uploadResponse.ok) {
        // 3. DBにアバターURLを保存
        await saveAvatarUrl(urlResult.avatarUrl);
        alert('アバター画像が更新されました');
      } else {
        // 詳細なエラー情報を取得
        const errorText = await uploadResponse.text();
        console.error('S3 Upload Error:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          headers: Object.fromEntries(uploadResponse.headers.entries()),
          body: errorText
        });
        alert(`アップロードに失敗しました (${uploadResponse.status}): ${errorText}`);
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  // ファイル選択処理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  // プロフィール画像クリック
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // 統計計算
  const getStats = () => {
    // レベル11の統計
    const lv11Songs = songs.filter(s => s.level === 11);
    const lv11AaaSongs = lv11Songs.filter(s => userScores[s.id]?.grade === 'AAA');
    const lv11AaaRate = lv11Songs.length > 0 ? (lv11AaaSongs.length / lv11Songs.length * 100).toFixed(1) : '0.0';
    const lv11Untori = lv11Songs.length - lv11AaaSongs.length;

    // レベル12の統計
    const lv12Songs = songs.filter(s => s.level === 12);
    const lv12AaaSongs = lv12Songs.filter(s => userScores[s.id]?.grade === 'AAA');
    const lv12AaaRate = lv12Songs.length > 0 ? (lv12AaaSongs.length / lv12Songs.length * 100).toFixed(1) : '0.0';
    const lv12Untori = lv12Songs.length - lv12AaaSongs.length;

    return {
      lv11AaaRate,
      lv11Untori,
      lv12AaaRate,
      lv12Untori,
    };
  };

  const stats = getStats();

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* プロフィールヘッダー */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* アバター（クリック可能・プラスアイコン付き） */}
            <div className="relative cursor-pointer" onClick={handleAvatarClick}>
              <UserAvatar 
                size="xl" 
                username={userInfo.username}
                avatarUrl={avatarUrl}
              />
              {/* プラスアイコン */}
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              {/* アップロード中の表示 */}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="text-white text-sm">アップロード中...</div>
                </div>
              )}
            </div>
            
            {/* ユーザー情報 */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {userInfo.displayName || userInfo.username}
              </h1>
              <p className="text-lg text-gray-600">@{userInfo.username}</p>
              <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
                <span>登録日: {new Date(userInfo.createdAt).toLocaleDateString()}</span>
                <span>メール: {userInfo.email}</span>
              </div>
              
              {/* 簡易統計 */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.lv11AaaRate}%</div>
                  <div className="text-sm text-gray-600">LV11 AAA率</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.lv11Untori}</div>
                  <div className="text-sm text-gray-600">LV11未鳥数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.lv12AaaRate}%</div>
                  <div className="text-sm text-gray-600">LV12 AAA率</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.lv12Untori}</div>
                  <div className="text-sm text-gray-600">LV12未鳥数</div>
                </div>
              </div>
            </div>

            {/* トップ画面遷移ボタンのみ */}
            <div>
              <Link 
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>トップに戻る</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* プロフィール編集フォーム */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">プロフィール編集</h3>
          
          <div className="space-y-4">
            {/* ユーザー名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ユーザー名
              </label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                placeholder={userInfo.username}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* 表示名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表示名
              </label>
              <input
                type="text"
                value={editForm.displayName}
                onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                placeholder={userInfo.displayName || '未設定'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder={userInfo.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* パスワード変更ボタン */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left text-gray-600"
              >
                パスワードを変更する
              </button>
            </div>

            {/* 保存ボタン */}
            <div className="pt-4">
              <button
                onClick={updateUserInfo}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                変更を保存
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* パスワード変更モーダル */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">パスワード変更</h3>
            
            <div className="space-y-4">
              {/* 現在のパスワード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現在のパスワード
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {/* 新しいパスワード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいパスワード
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {/* パスワード確認 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいパスワード（確認）
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {/* ボタン */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={updatePassword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  変更する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 