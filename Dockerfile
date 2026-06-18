FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN corepack enable && pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "exec", "vite", "--host", "0.0.0.0", "--port", "5173"]
