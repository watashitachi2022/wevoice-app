# We Voice

声でつながる、地域共創プラットフォーム。子育て世代・地域住民が、近くの地域団体・サークル・支援拠点を検索・発見できるアプリです。掲載無料・ログイン不要。

## 技術スタック

- Next.js 15（App Router / TypeScript）+ Tailwind CSS v4
- Supabase（Postgres / Auth / Storage）
- Leaflet + OpenStreetMap（react-leaflet）
- ホスティング: Vercel

## セットアップ

1. 依存関係のインストール

   ```bash
   npm install
   ```

2. `.env.local` を作成（値はSupabaseダッシュボード → Settings → API keys）

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...        # サーバー専用・絶対に公開しない
   # プレビュー保護（任意）
   BASIC_AUTH_USER=...
   BASIC_AUTH_PASSWORD=...
   ```

3. データベースの初期化（Supabase SQL Editor で実行）

   - `supabase/migrations/0001_init.sql`（スキーマ + RLS）
   - `supabase/seed.sql`（タグ10種 + 仮団体20件）

4. 初期管理者の作成

   - Supabaseダッシュボード → Authentication → Add user（メール+パスワード）
   - SQL Editor で `insert into admin_users (id, name, role) values ('<AuthユーザーのUUID>', '管理者名', 'owner');`

5. 起動

   ```bash
   npm run dev
   ```

## 検証

```bash
npm run verify:rls   # RLS検証（Publishableキーで非公開データに到達できないこと）
```

手動E2Eチェックリスト: [docs/checklist.md](docs/checklist.md)

## 主要ディレクトリ

```
src/app/              公開ページ（トップ / org/[id] / apply / privacy 等）
src/app/admin/        管理画面（要ログイン: 申請承認・団体編集）
src/app/api/geocode/  国土地理院ジオコーディングAPIプロキシ
src/components/       UIコンポーネント（地図・カード・詳細パネル）
src/lib/              Supabaseクライアント・地域定数・バリデーション
supabase/             マイグレーション・seed
scripts/              RLS検証スクリプト
```
