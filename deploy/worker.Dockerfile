FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --include=dev
COPY --chown=node:node scripts/worker ./scripts/worker
COPY --chown=node:node app/lib/intelligence ./app/lib/intelligence
USER node
ENV NODE_ENV=production
CMD ["node", "--import", "tsx", "scripts/worker/run.ts"]
