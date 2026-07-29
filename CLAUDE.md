# We Voice アプリ開発ルール

- 子育て世代向けの地域団体検索アプリ（Next.js 15 + Supabase + Vercel）。全体像は `開発計画.md`、セットアップは `README.md` を参照。
- **開発フロー**: main へ直接コミットしない。修正用ブランチを作成 → コミット → push → `gh pr create` でPR作成まで行う（マージは唐沢さんが実施）。
- **デプロイ**: GitHub連携は未接続（オーナーのVercel App承認待ち）。マージ後に main を最新化して `npx vercel deploy --prod --scope izu-tech` で手動デプロイする。詳細は `docs/deployment.md`。
- 公開URL: `https://wevoice-app-indol.vercel.app`（Basic認証あり）。
- DBスキーマ変更は `supabase/migrations/` にファイルを追加し `supabase db push`。適用後は必ず `npm run verify:rls` を実行する。
- リリース前の手動確認は `docs/checklist.md` に従う。
