'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => signOut()}
          className="text-red-600 hover:text-red-700 transition-colors text-sm"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link
        href="/auth/login"
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
      >
        ログイン
      </Link>
      <Link
        href="/auth/register"
        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
      >
        新規登録
      </Link>
    </div>
  );
}