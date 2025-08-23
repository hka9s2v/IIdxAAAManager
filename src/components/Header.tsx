'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserAvatar } from './UserAvatar';
import { AuthButton } from './AuthButton';

export function Header() {
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // DBからユーザー情報を取得（認証済みの場合のみ）
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/user/profile?userId=${session.user.id}`);
        const result = await response.json();
        if (result.success && result.user) {
          setUserInfo(result.user);
          setUserAvatarUrl(result.user.avatarUrl);
        }
      } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
      }
    };

    fetchUserInfo();
  }, [session]);

  // マスタDB更新処理
  const handleUpdateDatabase = async () => {
    setIsUpdating(true);
    setShowUpdateModal(false);
    
    try {
      // BPI-dataからデータを取得
      const bpiResponse = await fetch('/api/bpi-data');
      const bpiData = await bpiResponse.json();
      
      if (bpiData.success && bpiData.data) {
        // songs APIに送信
        const songsResponse = await fetch('/api/songs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bpiData.data),
        });
        
        const result = await songsResponse.json();
        
        if (songsResponse.ok) {
          alert(`データベース更新完了: ${result.message}`);
          // ページをリロードしてデータを更新
          window.location.reload();
        } else {
          throw new Error(result.error || 'データベース更新に失敗しました');
        }
      } else {
        throw new Error('BPIデータの取得に失敗しました');
      }
    } catch (error) {
      console.error('データベース更新エラー:', error);
      alert(`エラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・タイトル */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BPI</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                IIDX11/12鳥難易度表
              </h1>
            </Link>
          </div>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            {/* このサイトについて（マスタDB更新ボタンの左） */}
            <Link 
              href="/about"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              このサイトについて
            </Link>
            
            {/* マスタDB更新ボタン（ログイン済みの場合のみ表示） */}
            {session && (
              <button
                onClick={() => setShowUpdateModal(true)}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
              >
                {isUpdating ? '更新中...' : 'マスタDB更新'}
              </button>
            )}
            
            {session ? (
              <Link 
                href="/profile"
                className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <UserAvatar 
                  size="sm" 
                  username={userInfo?.username || ''}
                  avatarUrl={userAvatarUrl}
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {userInfo?.displayName || userInfo?.username || ''}
                </span>
              </Link>
            ) : null}
            <AuthButton />
          </div>
        </div>
      </div>

      {/* モバイルナビゲーション */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50">
        <div className="px-4 py-3 space-y-1">
          {/* モバイルナビゲーションリンクを削除 */}
        </div>
      </div>

      {/* 確認モーダル */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              マスタデータベース更新
            </h2>
            <p className="text-gray-700 mb-6">
              最大数分時間がかかりますが、よろしいですか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdateDatabase}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                実行
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 