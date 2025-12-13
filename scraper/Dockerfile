# Dockerfile for scraper service, running with bun main.ts
FROM node:20-bullseye-slim
RUN npm install -g bun
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
CMD ["sh", "-c", "bun main.ts"]