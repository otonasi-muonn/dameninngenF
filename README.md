
# 今日のダメ人間度管理アプリ (仮)

ユーザーが自身の「ダメ人間エピソード」を投稿し、他者からの「いいね」によってランキング化されるWebアプリケーションです。日常のちょっとした失敗や『ダメ』な出来事を、エンターテイメントとして共有し、共感し合う文化を作ることを目指します。

# デプロイリンク
https://dameninngen-f.vercel.app/

# デモ動画リンク
https://www.youtube.com/watch?v=LrC0rg_8XJU
# figmaリンク
https://www.figma.com/board/GmU7ZczVLSdMux3xB5BrAs/02-5%E6%9C%9Fphase02_%E3%83%8F%E3%83%83%E3%82%AB%E3%82%BD%E3%83%B3team_f?node-id=0-1&p=f&t=0AvNEqSwtwFAtIUx-0
---
## ✨ 機能一覧 (MVP)
- **ユーザー認証機能:** メールアドレスとパスワードによる登録・ログイン
   - あ
 
- **エピソード投稿機能:** 200文字以内のエピソードを投稿
   - あ
- **エピソード一覧表示:** 全ユーザーの投稿をタイムライン形式で表示
　  - あ 
- **いいね機能:** 各投稿に「いいね」を追加・削除
   - あ 
- **TDN表示機能:** 直近24時間で最も「いいね」が多かった投稿をトップに表示
  - あ 
---
## 機能一覧(まとめ)
- **ログイン画面**
- **ホーム画面**
- **投稿画面**
- **TDN画面**
- **ユーザ一覧画面**
- **プロフィール画面**

## 🛠️ 技術スタック

- **Frontend:** Next.js (App Router), React, TypeScript
- **Backend:** Next.js (API Routes)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **ORM:** Prisma
- **Deployment:** Vercel
- **開発環境:** Docker

---

## 🚀 開発環境のセットアップ

このプロジェクトはDockerを使用して開発環境を完全に統一しています。以下の手順でセットアップしてください。

### 1. 必要なもの

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Visual Studio Code](https://code.visualstudio.com/)
- VS Code拡張機能: [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### 2. セットアップ手順

1.  **リポジトリをクローン**
    ```bash
    git clone [リポジトリのURL]
    cd [リポジトリ名]
    ```

2.  **`.env` ファイルの作成**
    プロジェクトのルートディレクトリに `.env` という名前のファイルを作成し、チームで共有されているSupabaseの接続情報を貼り付けてください。

    ```env
    # .env

    # SupabaseのTransaction poolerの接続文字列
    DATABASE_URL="postgresql://postgres.xvjqexnmqmptascctads:[YOUR-PASSWORD]@[aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require](https://aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require)"

    # SupabaseのAPI情報
    NEXT_PUBLIC_SUPABASE_URL="[https://xvjqexnmqmptascctads.supabase.co](https://xvjqexnmqmptascctads.supabase.co)"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="ここに共有されたanonキーを貼り付け"
    ```
    **※ `[YOUR-PASSWORD]` を正しいパスワードに書き換えるのを忘れないでください。**

3.  **Dockerコンテナの起動 (推奨: VS Code)**
    VS Codeでこのプロジェクトフォルダを開き、左下に表示される緑色の `><` アイコンをクリックして、**「Reopen in Container (コンテナーで再度開く)」** を選択します。
    
    ![Reopen in Container](https://code.visualstudio.com/assets/docs/devcontainers/containers/remote-in-container.png)
    
    これにより、VS Codeが自動でDockerコンテナをビルドし、その中で開発できる状態になります。

    *(代替案: ターミナルで `docker-compose up -d --build` を実行することでも起動できます)*

4.  **データベースの同期 (初回のみ)**
    コンテナの起動が完了したら、VS Code内で新しいターミナルを開き (Ctrl+`@`)、以下のコマンドを実行してデータベースのスキーマを同期します。

    ```bash
    npx prisma db push
    ```
    「Your database is now in sync...」と表示されれば成功です。

5.  **完了！**
    開発サーバーが自動で起動しています。ブラウザで **`http://localhost:3000`** にアクセスして、アプリが表示されればセットアップ完了です！

---

## 📜 利用可能なスクリプト

- `npm run dev`: 開発サーバーを起動します。
- `npm run build`: 本番用のビルドを生成します。
- `npm run start`: 本番サーバーを起動します。
- `npm run lint`: ESLintでコードをチェックします。

```
## 📁 ディレクトリ構成
dame_ningen/
├── .github/                        # GitHub関連の設定
│   ├── CONTRIBUTING.md            # コントリビューションガイド
│   ├── pull_request_template.md  # PRテンプレート
│   └── ISSUE_TEMPLATE/            # Issue用テンプレート
│       ├── bug.yml                # バグ報告用
│       └── feature.yml            # 機能リクエスト用
│
├── .next/                         # Next.jsビルド成果物（自動生成）
│
├── docs/                          # プロジェクトドキュメント
│
├── node_modules/                  # npmパッケージ（自動生成）
│
├── prisma/                        # データベース設定
│   └── schema.prisma              # Prismaスキーマ定義（User, Episode, Like, Comment等）
│
├── public/                        # 静的ファイル（画像、アイコン等）
│   ├── next.svg                   # Next.jsロゴ
│   ├── vercel.svg                 # Vercelロゴ
│   └── *.svg                      # その他のSVGアイコン
│
├── scripts/                       # 開発・デプロイ用スクリプト
│
├── src/                           # ソースコードのメインディレクトリ
│   ├── app/                       # Next.js App Router（アプリケーションの心臓部）
│   │   ├── page.tsx               # ホームページ（診断機能のメイン画面）
│   │   ├── layout.tsx             # 全ページ共通のレイアウト
│   │   ├── globals.css            # グローバルスタイル
│   │   │
│   │   ├── (pages)/               # ページコンポーネント（パスに影響しないルートグループ）
│   │   │   ├── episodes/          # 投稿一覧・詳細ページ
│   │   │   │   └── page.tsx       # /episodes - 全ユーザーの投稿一覧
│   │   │   ├── login/             # ログインページ
│   │   │   │   └── page.tsx       # /login - ログインフォーム
│   │   │   ├── register/          # 新規登録ページ
│   │   │   │   └── page.tsx       # /register - ユーザー登録フォーム
│   │   │   ├── profile/           # プロフィールページ
│   │   │   │   └── page.tsx       # /profile - 自分のプロフィール表示・編集
│   │   │   ├── tdn/               # TDN（ダメ人間度）関連ページ
│   │   │   │   └── page.tsx       # /tdn - TDN詳細情報
│   │   │   └── user/              # ユーザー関連ページ
│   │   │       ├── page.tsx       # /user - 全ユーザー一覧
│   │   │       └── [id]/          # 動的ルート
│   │   │           └── page.tsx   # /user/[id] - 特定ユーザーのプロフィール
│   │   │
│   │   └── api/                   # APIエンドポイント（サーバーサイドロジック）
│   │       ├── activity/          # アクティビティ関連API
│   │       │   └── route.ts       # GET /api/activity - 自分のアクティビティデータ取得
│   │       ├── auth/              # 認証関連API
│   │       │   ├── login/         
│   │       │   │   └── route.ts   # POST /api/auth/login - ログイン処理
│   │       │   └── register/
│   │       │       └── route.ts   # POST /api/auth/register - 新規ユーザー登録
│   │       ├── comments/          # コメント関連API
│   │       │   └── [comment_id]/
│   │       │       └── route.ts   # DELETE /api/comments/[id] - コメント削除
│   │       ├── diagnose/          # 診断関連API
│   │       │   └── route.ts       # POST /api/diagnose - AI診断実行
│   │       ├── diagnosis-history/ # 診断履歴関連API
│   │       │   └── route.ts       # GET /api/diagnosis-history - 診断履歴取得
│   │       ├── episodes/          # 投稿関連API
│   │       │   ├── route.ts       # GET/POST /api/episodes - 投稿一覧取得・新規投稿
│   │       │   └── [episode_id]/  
│   │       │       ├── route.ts   # DELETE /api/episodes/[id] - 投稿削除
│   │       │       └── comments/
│   │       │           └── route.ts # GET/POST /api/episodes/[id]/comments - コメント取得・投稿
│   │       ├── follow-count/      # フォロー数関連API
│   │       │   └── route.ts       # POST /api/follow-count - フォロー・アンフォロー
│   │       ├── profile/           # プロフィール関連API
│   │       │   └── route.ts       # GET/POST /api/profile - プロフィール取得・更新
│   │       ├── tdn/               # TDN関連API
│   │       │   ├── route.ts       # GET /api/tdn - TDN情報取得
│   │       │   └── history/
│   │       │       └── route.ts   # GET /api/tdn/history - TDN履歴取得
│   │       └── user/              # ユーザー関連API
│   │           └── [id]/
│   │               ├── route.ts   # GET /api/user/[id] - 特定ユーザー情報取得
│   │               └── activity/
│   │                   └── route.ts # GET /api/user/[id]/activity - 特定ユーザーのアクティビティ取得
│   │
│   ├── components/                # 再利用可能なUIコンポーネント
│   │   ├── layout/                # レイアウト用コンポーネント
│   │   │   ├── Header.tsx         # ヘッダー（ナビゲーション）
│   │   │   └── Footer.tsx         # フッター
│   │   └── ui/                    # UI部品
│   │       ├── ActivityCalendar.tsx      # GitHubスタイルのアクティビティカレンダー
│   │       ├── CommentSection.tsx        # コメント表示・投稿セクション
│   │       ├── DameningenDiagnosis.tsx   # ダメ人間度診断フォーム
│   │       ├── DiagnosisHistory.tsx      # 診断履歴表示コンポーネント
│   │       ├── EpisodeSearchList.tsx     # エピソード検索・一覧表示
│   │       ├── FollowButton.tsx          # フォロー/アンフォローボタン
│   │       ├── LikeButton.tsx            # いいねボタン
│   │       └── PostForm.tsx              # 投稿フォーム
│   │
│   ├── lib/                       # 共通ヘルパー関数・ユーティリティ
│   │   ├── apiResponse.ts         # 統一されたAPIレスポンス生成関数
│   │   ├── auth.ts                # 認証関連ヘルパー（ユーザー取得、権限チェック等）
│   │   ├── constants.ts           # アプリケーション全体の定数定義
│   │   ├── prisma.ts              # Prismaクライアントのシングルトンインスタンス
│   │   ├── rank.ts                # ランク計算ロジック（いいね数に基づく）
│   │   └── rateLimit.ts           # レート制限ロジック（DoS攻撃対策）
│   │
│   └── utils/                     # ユーティリティ関数
│       └── date.ts                # 日付フォーマット関数
│
├── .dockerignore                  # Dockerビルド時の除外ファイル指定
├── .env                           # 環境変数（DB接続情報、APIキー等）※gitignore対象
├── .gitignore                     # Git管理除外ファイル指定
├── docker-compose.yml             # Docker Compose設定（開発環境構築用）
├── Dockerfile                     # Dockerイメージビルド設定
├── eslint.config.mjs              # ESLint設定（コード品質チェック）
├── next-env.d.ts                  # Next.js型定義（自動生成）
├── next.config.ts                 # Next.js設定ファイル
├── package.json                   # npmパッケージ・スクリプト定義
├── postcss.config.mjs             # PostCSS設定（Tailwind CSS用）
├── README.md                      # プロジェクト説明書
└── tsconfig.json                  # TypeScript設定
```
