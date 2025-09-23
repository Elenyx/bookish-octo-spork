### Server Dockerfile (multi-stage)
FROM node:20-alpine AS builder
WORKDIR /app

# install build deps
COPY package.json package-lock.json ./
RUN npm ci --production=false

# copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# copy built artifacts and production deps
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./
RUN npm ci --production

EXPOSE 3000
CMD ["node", "dist/index.js"]
