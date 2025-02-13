FROM node:20-slim

WORKDIR /app

# npmを使用してpnpmをグローバルにインストール
RUN npm install -g pnpm

# パッケージファイルをコピー
COPY package.json pnpm-lock.yaml* ./

# 依存関係のインストール
RUN pnpm install --force

# アプリケーションのソースコードをコピー
COPY . .

COPY postcss.config.js  ./

# 開発サーバーのポートを公開
EXPOSE 3000

# Next.jsの開発サーバーがホストからアクセス可能になるように設定
ENV HOSTNAME "0.0.0.0"

# 開発サーバーを起動
CMD ["pnpm", "dev"]
