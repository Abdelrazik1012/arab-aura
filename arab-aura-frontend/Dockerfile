# ══════════════════════════════════════════════════════════
# Arab Aura Frontend - Multi-Stage Production Dockerfile
# ══════════════════════════════════════════════════════════

# ── Stage 1: Build & Compile React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# نسخ ملفات الاعتماديات وتثبيتها
COPY package*.json tsconfig*.json vite.config.ts ./

RUN npm ci

# نسخ ملفات المصدر
COPY index.html ./
COPY public/ ./public/
COPY src/ ./src/

# متغير بناء رابط الـ API (يمكن تمريره وقت البناء)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# بناء المشروع الإنتاجي
RUN npm run build

# ── Stage 2: Nginx Web Server for High-Performance Serving
FROM nginx:1.27-alpine AS runner

# حذف الإعداد الافتراضي لـ Nginx ونسخ إعداداتنا المخصصة
RUN rm -rf /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

# نسخ المخرجات المجمعة من مرحلة البناء
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# التحقق من صحة عمل Nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
