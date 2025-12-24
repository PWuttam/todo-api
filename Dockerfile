# 開発用 Dockerfile（dev）
FROM node:20-alpine

# curl と jq を追加（smoke test 用）
RUN apk add --no-cache curl jq

# 作業ディレクトリ
WORKDIR /app

# package.json を先にコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードを全部コピー
COPY . .

# ポート解放
EXPOSE 3000

# 開発モードで起動（ホットリロード前提）
CMD ["npm", "start"]