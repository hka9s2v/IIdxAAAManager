# IIDX BPI Manager

Beatmania IIDX の BPI を管理するWebアプリケーション

## 🚀 技術スタック

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3 (アバター画像)

## 📋 前提条件

- Node.js 18+ 
- PostgreSQL 12+
- npm または yarn

## 🛠️ セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成して以下の環境変数を設定してください：

```bash
# データベース接続URL（ローカル開発用）
DATABASE_URL="postgresql://username:password@localhost:5432/iidx_manager?schema=public"

# NextAuth.js用の設定
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3設定（アバター画像アップロード用）
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key" 
AWS_REGION="ap-northeast-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

⚠️ **重要**: DATABASE_URLが設定されていない場合、データベース接続エラーが発生します。

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd IIdxAAAManager
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   `.env`ファイルを作成:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/iidx_bpi_manager"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # AWS S3 (オプション - アバターアップロード用)
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_REGION="ap-northeast-1"
   AWS_S3_BUCKET="your-s3-bucket-name"
   ```

4. **データベースのセットアップ**
   ```bash
   # PostgreSQLデータベースを作成
   createdb iidx_bpi_manager
   
   # Prismaマイグレーション実行
   npx prisma migrate dev
   
   # 初期データ投入（オプション）
   npm run db:seed
   ```

## 🏃‍♂️ 起動方法

### 開発環境
```bash
npm run dev
```
http://localhost:3000 でアクセス可能

### 本番環境
```bash
npm run build
npm start
```

## 📝 利用可能なスクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm start` - プロダクションサーバー起動
- `npm run lint` - ESLintによるコード検査
- `npm run db:generate` - Prisma Client生成
- `npm run db:push` - スキーマをデータベースに反映
- `npm run db:migrate` - マイグレーション実行
- `npm run db:seed` - 初期データ投入
- `npm run db:studio` - Prisma Studio起動

## 🗄️ データベーススキーマ

主要テーブル:
- `users` - ユーザー情報
- `songs` - 楽曲マスター
- `user_scores` - ユーザースコア
- `aaa_bpi` - AAA BPI計算値

## 📚 主要機能

- ユーザー登録・認証
- BPIスコア管理
- 楽曲データ管理
- アバター画像アップロード
- スコア統計表示

## 🔒 セキュリティ

- パスワードはbcryptでハッシュ化
- JWT認証
- CSRF保護
- 入力値検証

## 📄 ライセンス

Private Project