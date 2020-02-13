FROM node:12 as builder

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY . /home/node

RUN npm ci && npm run build

# ---

FROM node:12

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/dist/ /home/node/dist/

RUN npm ci

CMD ["node", "dist/server.js"]