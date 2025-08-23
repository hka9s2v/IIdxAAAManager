'use client';

import Link from 'next/link';
import { ScrollToTop } from '@/components/ScrollToTop';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* ホームに戻るボタン */}
          <div className="mb-6">
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              ← ホームに戻る
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            このサイトについて
          </h1>

          <div className="space-y-8">
            {/* サイト概要 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                IIDX11/12鳥難易度表とは
              </h2>
              <p className="text-gray-700 leading-relaxed">
                beatmania IIDX の ☆11/☆12 楽曲における BPI を基準とした
                難易度表を提供するサイトです。
              </p>
            </section>

            {/* BPI計算式について */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                BPI (Beat Power Indicator) について
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本サイトで使用されているBPIの計算式は、以下のサイトの仕様に準拠しています：
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <a 
                  href="http://norimiso.web.fc2.com/aboutBPI.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-medium break-all"
                >
                  http://norimiso.web.fc2.com/aboutBPI.html
                </a>
              </div>
            </section>

            {/* データソースについて */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                楽曲マスタデータについて
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                楽曲のマスタデータは、
                以下記載のAPI経由で取得しています：
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <a 
                  href="https://docs2.poyashi.me/other/repositories/#proxypoyashime" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 underline font-medium break-all"
                >
                  https://docs2.poyashi.me/other/repositories/#proxypoyashime
                </a>
              </div>
              <p className="text-gray-600 text-sm mt-3">
                ※ マスタデータを更新したい場合、ホーム画面右上の「マスタDB更新」ボタンを押してください。
              </p>
            </section>

            {/* 使い方 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                使い方
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">1. ユーザー登録・ログイン</h3>
                  <p className="text-gray-700 text-sm">
                    スコア管理機能を利用するには、まずユーザー登録を行ってください。
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">2. スコア記録</h3>
                  <p className="text-gray-700 text-sm">
                    楽曲カードをクリックして、達成したスコアを記録できます。
                  </p>
                </div>
              </div>
            </section>

            {/* 免責事項 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                免責事項
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• 本サイトの情報は参考目的で提供されており、正確性を保証するものではありません</li>
                  <li>• BPI値は統計データに基づく推定値であり、公式な指標ではありません</li>
                  <li>• サービスの利用により発生した損害について、当サイトは一切の責任を負いません</li>
                  <li>• 予告なくサービス内容を変更・停止する場合があります</li>
                </ul>
              </div>
            </section>


          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
}
