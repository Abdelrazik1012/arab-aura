# ══════════════════════════════════════════════════════════
# Arab Aura Backend - Multi-Stage Production Dockerfile
# ══════════════════════════════════════════════════════════

# ── Stage 1: Build & Compile TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

# نسخ ملفات الحزم لتثبيت الاعتماديات مع كاش فعال
COPY package*.json tsconfig.json ./

RUN npm ci

# نسخ كود المصدر وبناء مشروع TypeScript
COPY src/ ./src/
RUN npm run build

# ── Stage 2: Lean Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# إضافة مستخدم غير جذري (non-root) للأمان
RUN addgroup -S nodejs -g 1001 && \
    adduser -S nodeuser -u 1001 -G nodejs

# نسخ ملفات الاعتماديات وتثبيت حزم الإنتاج فقط
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# نسخ ملفات JavaScript المجمعة من مرحلة البناء
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist

# نسخ مجلد src/utils لو أردنا تشغيل seed لاحقاً
COPY --from=builder --chown=nodeuser:nodejs /app/src/utils ./src/utils
COPY --from=builder --chown=nodeuser:nodejs /app/tsconfig.json ./

USER nodeuser

EXPOSE 8000

# التحقق الدوري من صحة السيرفر
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/health || exit 1

CMD ["node", "dist/server.js"]
