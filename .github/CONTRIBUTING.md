# コントリビューション ガイド

このリポジトリでの開発ルールをまとめます。GitHub に慣れていない方もここを見れば基本OKです。

## ブランチ命名規則
`<type>/<issue-number>-<slug>` 形式で作成します。

- type: feat | fix | chore | docs | refactor | test | ci
- issue-number: 対応する Issue 番号（例: 5）
- slug: 短い英語の説明（ハイフン区切り）

例: `chore/5-prisma-infra-setup`

## コミットメッセージ（Conventional Commits）
`<type>(<scope>): <short summary>` を基本にします。日本語OK。

- feat: 機能追加
- fix: バグ修正
- chore: 雑多な更新（設定・依存・ツール等）
- docs: ドキュメントのみ変更
- refactor: 仕様を変えないコード整理
- test: テスト追加・更新
- ci: CI設定

例: `chore(prisma): PgBouncer で接続安定化 (#5)`

## プルリクエスト（PR）
- タイトル: `<type>: <短い説明> (#<issue-number>)`
- 本文: 背景/変更点/確認方法/影響範囲/スクショ（必要あれば）
- PR テンプレートのチェックリストを埋める
- Issue を紐付ける（Closes #<番号>）

マージ方法は基本「Squash and merge」を推奨（履歴を綺麗に保つため）。

## 作業フロー（例）
1. Issue を立てる（目的・受入基準）
2. ブランチ作成 `git checkout -b chore/5-prisma-infra-setup`
3. 変更・コミット・プッシュ
4. PR 作成（テンプレに沿って記入、レビュー依頼）
5. CI 通過・レビューOKなら Squash でマージ → Issue Close

## Prisma / Supabase に関する注意
- `.env` はコミットしない（本リポジトリは `.env*` を ignore 済み）
- Supabase 直結(5432)が通らない環境があるため、PgBouncer（pooler）経由を基本とする
- Prisma の接続例:
  - 例: `postgresql://USER:PASSWORD@HOST:5432/DBNAME?pgbouncer=true&connection_limit=1&sslmode=require`
- スキーマ反映: `npx prisma db push`

## コードスタイル
- ESLint の指摘に従う
- フォーマットは Prettier/Next のデフォルト方針に準拠

## レビューの観点（参考）
- 動作確認方法が明記されているか
- 破壊的変更や移行手順があれば説明されているか
- セキュリティ情報（鍵/URL/秘密情報）が混入していないか
