# syntax=docker/dockerfile:1

# Next.js + Prisma 用の開発向けコンテナ
# - Node 20 LTS を使用（Next 15/Prisma 6 と相性良）
# - Alpine で Prisma の実行に必要な openssl を追加
FROM node:20-alpine

# 作業ディレクトリ
WORKDIR /usr/src/app

# Prisma/Next 実行に必要な OS 依存を追加（軽量）
RUN apk add --no-cache openssl

# 依存関係のインストール
# package-lock.json が存在すれば npm ci を使用
COPY package*.json ./
RUN npm ci || npm install

# Prisma Client を先に生成（スキーマがない場合はスキップ）
COPY prisma ./prisma
RUN npx prisma generate || echo "skip prisma generate"

# アプリのソースコードをコピー
COPY . .

# Next dev をコンテナ内から外部アクセス可能に（HMR 安定化のための環境変数も）
ENV HOST=0.0.0.0 \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1 \
    WATCHPACK_POLLING=true \
    CHOKIDAR_USEPOLLING=true

# Next.js のポート
EXPOSE 3000

# 開発サーバを起動（-H/-p を明示）
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
