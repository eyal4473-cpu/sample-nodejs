FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get upgrade -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
        /usr/local/lib/node_modules \
        /usr/local/bin/npm \
        /usr/local/bin/npx \
        /usr/local/bin/corepack

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY app.js ./

USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node", "app.js"]
