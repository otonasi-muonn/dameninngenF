はい、承知いたしました。
これまでの開発内容と、完成した素晴らしいDocker環境を元に、チームの誰もが迷わず開発をスタートできる`README.md`の全文を作成しました。

-----

````markdown
# 今日のダメ人間度管理アプリ (仮)

ユーザーが自身の「ダメ人間エピソード」を投稿し、他者からの「いいね」によってランキング化される育成系Webアプリケーションです。日常のちょっとした失敗や『ダメ』な出来事を、エンターテイメントとして共有し、共感し合う文化を作ることを目指します。

---

## ✨ 機能一覧 (MVP)

- **ユーザー認証機能:** メールアドレスとパスワードによる登録・ログイン
- **エピソード投稿機能:** 200文字以内のエピソードを投稿
- **エピソード一覧表示:** 全ユーザーの投稿をタイムライン形式で表示
- **いいね機能:** 各投稿に「いいね」を追加・削除
- **TDN表示機能:** 直近24時間で最も「いいね」が多かった投稿をトップに表示

---

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

---

## 📁 ディレクトリ構成
/
├── app/                  \# アプリケーションの心臓部
│   ├── \_components/      \# 共通UIコンポーネント
│   ├── (pages)/          \# UIページ
│   └── api/              \# APIロジック
├── lib/                  \# DB接続など共通のヘルパー関数
├── prisma/               \# Prismaのスキーマ定義
├── public/               \# 静的ファイル
├── scripts/              \# 開発用スクリプト
├── docker-compose.yml    \# Dockerの構成ファイル
└── Dockerfile            \# Dockerイメージの設計図