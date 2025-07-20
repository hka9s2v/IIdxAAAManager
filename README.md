# IIDX BPI Manager

IIDXのBPI（Beat Point Index）管理システム。楽曲ごとのスコアとグレードを管理し、BPI値による目標設定をサポートします。

## 機能

- 楽曲データの表示・管理
- ユーザースコア（グレード）の登録・更新
- BPI値による並び替え・フィルタリング
- レベル別フィルタリング（★11、★12）
- グレード分布の可視化

## 技術スタック

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **認証**: 将来実装予定（NextAuth.js）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定します：

```env
# データベース接続
DATABASE_URL="postgresql://username:password@localhost:5432/iidx_bpi_manager?schema=public"

# NextAuth.js設定
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-secret-at-least-32-characters-long"
```

### 3. データベースの初期化

```bash
# Prismaクライアントの生成
npm run db:generate

# データベーススキーマの作成
npm run db:push

# 初期データの投入
npm run db:seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションにアクセスできます。

## データベーススキーマ

### テーブル構成

- **users**: ユーザー情報（認証機能）
- **songs**: 楽曲マスターデータ（score89フィールド含む）
- **user_scores**: ユーザーの楽曲スコア・グレード

### 主要なリレーション

```
User (1) -> (N) UserScore (N) -> (1) Song
```

## API エンドポイント

### 楽曲関連

- `GET /api/songs?level={level}` - 楽曲一覧取得
- `POST /api/songs` - 楽曲データの一括インポート

### ユーザースコア関連

- `GET /api/user-scores` - ユーザースコア一覧取得
- `POST /api/user-scores` - ユーザースコア登録・更新
- `DELETE /api/user-scores?songId={songId}` - ユーザースコア削除

### 認証関連

- `POST /api/auth/register` - ユーザー登録

### その他

- `GET /api/bpi-data` - 外部BPIデータ取得（マスターデータ更新用）

## 開発用コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プロダクション起動
npm start

# リント
npm run lint

# データベース関連
npm run db:generate  # Prismaクライアント生成
npm run db:push      # スキーマをデータベースに反映
npm run db:migrate   # マイグレーション実行
npm run db:seed      # シードデータ投入
npm run db:studio    # Prisma Studio起動
```

## デプロイ

### Vercel + NeonDB

本番環境用の環境変数をVercelで設定：

```env
# Vercel Environment Variables
DATABASE_URL="postgresql://username:password@host.neon.tech/dbname?sslmode=require"
NEXTAUTH_SECRET="production-secret-key-32-characters-long"
# NEXTAUTH_URL は Vercel が自動設定
```

## 今後の実装予定

- [ ] スコア履歴管理
- [ ] ランプ（クリア状況）管理
- [ ] 統計・分析機能
- [ ] インポート・エクスポート機能
- [ ] PWA対応
