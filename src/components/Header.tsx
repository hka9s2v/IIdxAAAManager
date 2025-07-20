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
                IIDX BPI Manager
              </h1>
            </Link>
          </div>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* ナビゲーションリンクを削除 */}
          </nav>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
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
    </header>
  );
} 