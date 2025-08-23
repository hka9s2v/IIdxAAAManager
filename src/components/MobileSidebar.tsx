'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { UserAvatar } from './UserAvatar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: any;
  userAvatarUrl?: string;
  onUpdateDatabase: () => void;
  isUpdating: boolean;
}

export function MobileSidebar({ 
  isOpen, 
  onClose, 
  userInfo, 
  userAvatarUrl, 
  onUpdateDatabase, 
  isUpdating 
}: MobileSidebarProps) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    onClose();
  };

  const handleUpdateDatabase = () => {
    onUpdateDatabase();
    onClose();
  };

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ユーザー情報 */}
          {session && userInfo && (
            <div className="p-4 border-b border-gray-200">
              <Link 
                href="/profile"
                onClick={onClose}
                className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <UserAvatar 
                  size="md" 
                  username={userInfo.username || ''}
                  avatarUrl={userAvatarUrl}
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {userInfo.displayName || userInfo.username || ''}
                  </div>
                  <div className="text-sm text-gray-500">
                    プロフィールを見る
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* メニュー項目 */}
          <div className="flex-1 p-4 space-y-2">
            {/* このサイトについて */}
            <Link
              href="/about"
              onClick={onClose}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">このサイトについて</span>
            </Link>

            {/* マスタDB更新（ログイン済みのみ） */}
            {session && (
              <button
                onClick={handleUpdateDatabase}
                disabled={isUpdating}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-gray-700">
                  {isUpdating ? 'データベース更新中...' : 'マスタDB更新'}
                </span>
              </button>
            )}
          </div>

          {/* フッター（ログアウト） */}
          {session && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>ログアウト</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
