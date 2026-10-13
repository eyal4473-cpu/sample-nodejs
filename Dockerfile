FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY app.js ./

USER node
ENV PORT=8080
EXPOSE 8080

CMD ["node", "app.js"]
