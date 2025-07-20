# Deployment Guide

## Vercel + NeonDB デプロイ手順

### 1. NeonDB セットアップ

1. [Neon Console](https://console.neon.tech/) でアカウント作成
2. 新しいプロジェクトを作成
3. データベース接続文字列を取得
   - 形式: `postgresql://username:password@host/database?sslmode=require`

### 2. Vercel セットアップ

1. [Vercel Console](https://vercel.com/) でアカウント作成
2. GitHubリポジトリをインポート
3. 環境変数を設定:

#### 必要な環境変数:
```
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
NEXTAUTH_SECRET=your-production-secret-here
```

### 3. デプロイ手順

1. **ローカルでの準備**:
   ```bash
   # 依存関係の確認
   npm install
   
   # ビルドテスト
   npm run build
   
   # マイグレーションファイルの生成
   npm run db:migrate
   ```

2. **Vercelにデプロイ**:
   ```bash
   # Vercel CLIインストール（初回のみ）
   npm i -g vercel
   
   # デプロイ実行
   vercel --prod
   ```

3. **データベースマイグレーション**:
   ```bash
   # プロダクションデータベースにマイグレーション適用
   DATABASE_URL="your-neon-db-url" npm run db:migrate:prod
   ```

### 4. 環境変数の設定

#### ローカル開発用 (.env.local):
```env
DATABASE_URL="postgresql://ttk@localhost:5432/iidx_bpi_manager?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-local-secret"
SESSION_COOKIE_NAME="iidx-session"
```

#### プロダクション用 (Vercel環境変数):
```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
NEXTAUTH_SECRET="your-production-secret"
SESSION_COOKIE_NAME="iidx-session-prod"
```

### 5. 初期データの投入

プロダクションデータベースに初期データを投入:

```bash
# 一時的にプロダクションDBのURLを使用
DATABASE_URL="your-neon-db-url" npm run db:seed
```

### 6. 確認事項

- [ ] NeonDBデータベースが作成されている
- [ ] Vercelプロジェクトが作成されている
- [ ] 環境変数が正しく設定されている
- [ ] データベースマイグレーションが適用されている
- [ ] 初期データが投入されている
- [ ] アプリケーションが正常に動作している

### 7. トラブルシューティング

#### データベース接続エラー:
- NeonDBの接続文字列が正しいか確認
- `sslmode=require`が含まれているか確認

#### ビルドエラー:
- `npm run build`でローカルビルドを確認
- TypeScriptエラーがないか確認

#### 環境変数エラー:
- Vercelの環境変数設定を確認
- 環境変数名が正しいか確認