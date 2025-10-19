FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-alpine
WORKDIR /app


RUN apk add --no-cache python3 py3-pip py3-pyflakes py3-pylint

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

COPY --from=builder --chown=nextjs:nodejs /app/types ./types
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib

COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json ./

RUN npm ci --only=production && npm install -g tsx

USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production

ENTRYPOINT ["./entrypoint.sh"]

CMD ["tsx", "server.js"]