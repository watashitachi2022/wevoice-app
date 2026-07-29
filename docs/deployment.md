# デプロイ・開発フロー ルール

最終更新: 2026-07-29

## 現在のデプロイ方式（暫定: CLIデプロイ）

リポジトリのオーナー（watashitachi2022）がVercelのGitHub App連携を承認するまでは、
**Vercel CLIによる手動デプロイ**で運用する。push しても自動デプロイはされない。

- Vercelプロジェクト: **izu-tech チーム / `wevoice-app`**
- 公開URL: `https://wevoice-app-indol.vercel.app`
- プレビュー保護: middleware による Basic認証（`wevoice` / `2r8R6szv6jFn`。既存アプリと同一）

### デプロイ手順

1. main を最新化する（PRマージ後に実施すること。作業ツリーの状態がそのままデプロイされるため、
   未マージの変更が混ざらないよう必ず main から行う）

   ```bash
   git checkout main && git pull
   ```

2. 本番デプロイ

   ```bash
   npx vercel deploy --prod --scope izu-tech
   ```

### 環境変数

Vercel（Production / Preview 両方）に設定済み。変更時は `npx vercel env` で管理する。

| 変数 | 備考 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | |
| `SUPABASE_SECRET_KEY` | Sensitive |
| `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` | Sensitive。本番公開時に削除してBasic認証を解除する |
| `NEXT_PUBLIC_APP_URL` | 現在は `https://wevoice-app-indol.vercel.app`。独自ドメイン設定時に更新 |

## 開発フロー（2026-07-29以降）

main への直接コミットはしない。**必ず修正用ブランチを作成し、push して Pull Request を作成する。**

1. `git checkout main && git pull`
2. `git checkout -b <type>/<内容>`（例: `fix/map-pin-size`, `feat/csv-export`, `docs/...`）
3. 変更・コミット（コミットメッセージは日本語でよい）
4. `git push -u origin <ブランチ名>`
5. `gh pr create` でPR作成（レビュー・マージは唐沢さんが実施）
6. マージ後、上記のデプロイ手順で反映

## GitHub App承認後の切り替え（TODO）

オーナーがVercel GitHub Appのインストールを承認したら:

1. Vercelの `wevoice-app` プロジェクト設定 → Git で `watashitachi2022/wevoice-app` を接続
2. 以降は「mainへのマージ＝本番自動デプロイ」「PR＝プレビューデプロイ自動発行」になる
3. このドキュメントのCLIデプロイ手順を「緊急時の手動手段」に格下げして更新する
