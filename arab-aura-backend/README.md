# Arab Aura - Backend API Engine 🚀
### المنظومة الخلفية لمنصة "عرب أورا" للملابس المصرية والشحن المجمع بالحي (Micro-Hub Logistics)

---

## 🌟 نظرة عامة (Overview)
تم بناء هذا الباك إند وفق أعلى المعايير الهندسية المعاصرة ليعمل كـ **منظومة موحدة متكاملة (Unified Backend Engine)** تدعم بالتوازي:
1. **تطبيق الويب (Web React SPA)**
2. **تطبيقات الهواتف الذكية (Mobile Apps - React Native / Flutter)**
3. **أدوات الفحص والربط الخارجي (Postman / Mobile SDKs)**

---

## 🛠️ التقنيات المستخدمة (Tech Stack)
- **Runtime:** Node.js (v24+)
- **Language:** TypeScript
- **Framework:** Express.js (Modular Router Architecture)
- **Database & ODM:** MongoDB مع Mongoose
- **Authentication:** JWT (JSON Web Tokens) مع تشفير كلمات المرور بـ BcryptJS
- **Real-Time & Resilience:** In-Memory MongoDB Fallback مدمج للتشغيل الفوري بدون تثبيت يدوي، مع جاهزية الربط المباشر بـ MongoDB Atlas السحابي أو المحلي.

---

## 📱 ميزات جاهزة لتطبيقات الموبايل (Mobile-Ready Features)
- **FCM Push Notifications:** تسجيل `deviceToken` و `deviceType` لكل مستخدم.
- **Live Courier GPS Tracking:** تحديث إحداثيات الكابتن مباشرة عبر `/api/driver/location`.
- **Doorstep OTP Handover:** تأكيد الاستلام المباشر عند باب العميل بكود سري من 4 أرقام عبر `/api/orders/:id/verify-otp`.
- **Package Batching & Barcodes:** توليد وتتبع كود الحزم (`packageId`) والـ Barcode/QR Code لكباتن التوصيل والمشرفين.

---

## 📡 دليل المسارات البرمجية (API Endpoints Directory)

### 1. المصادقة والمستخدمين (Authentication) - `/api/auth`
- `POST /api/auth/register` - إنشاء حساب جديد (يدعم أدوار: `customer`, `seller`, `collector`, `driver`, `admin`).
- `POST /api/auth/login` - تسجيل الدخول والحصول على Bearer JWT Token.
- `GET /api/auth/me` - جلب الملف الشخصي للمستخدم الحالي.
- `POST /api/auth/device-token` - تسجيل توكن الموبايل لاستقبال الإشعارات اللحظية.

### 2. كتالوج الملابس والمنتجات (Products) - `/api/products`
- `GET /api/products` - استعراض المنتجات مع الفلترة والبحث بالاسم، البراند، السعر، والتصنيف.
- `GET /api/products/:id` - تفاصيل المنتج الكاملة.
- `POST /api/products` - إضافة منتج جديد (خاص بالتاجر والبراند).
- `PUT /api/products/:id` - تعديل بيانات المنتج.
- `DELETE /api/products/:id` - حذف منتج من الكتالوج.

### 3. الطلبات والشحن المجمع بالحي (Orders) - `/api/orders`
- `POST /api/orders` - إنشاء طلب جديد (للضيوف والمستخدمين) بتسعيرة الشحن المجمع بالحي (35 ج).
- `GET /api/orders/my-orders` - عرض طلبات المشتري الحالي.
- `GET /api/orders/:id` - تتبع مسار الشحنة وحالتها وبيانات الكابتن.
- `POST /api/orders/:id/verify-otp` - تأكيد الاستلام ودفع الأوردر بعد المعاينة بكود الـ OTP.
- `PUT /api/orders/:id/status` - تحديث حالة الشحنة.

### 4. مراكز التجميع بالأحياء (Micro-Hubs) - `/api/hubs`
- `GET /api/hubs` - عرض كافة المقرات النشطة (6 أكتوبر، الشيخ زايد، المنوفية).
- `GET /api/hubs/:code/packages` - عرض الحزم المجمعة داخل المركز.

### 5. لوحة التاجر والمصنع (Seller Portal) - `/api/seller`
- `GET /api/seller/metrics` - إحصائيات المبيعات، الأرباح، الشحنات، ونسبة المرتجعات.
- `GET /api/seller/products` - المنتجات التابعة للبراند الحالي.

### 6. كابتن التوصيل (Courier Logistics) - `/api/driver`
- `GET /api/driver/deliveries` - الشحنات المخصصة للكابتن على خريطة الحي.
- `PUT /api/driver/location` - إرسال إحداثيات GPS المباشرة من تطبيق الموبايل.

### 7. الذكاء الاصطناعي للسوق المصري (AI Fashion Engine) - `/api/ai`
- `POST /api/ai/product-insights` - تحليلات المنتجات، سرعة البيع، تناسق الأطقم، إرشادات غسيل وكي القطن، وحاسبة المقاس التفاعلية حسب الوزن والطول.
- `POST /api/ai/generate-post` - توليد نصوص وبوستات تسويقية جذابة للبراندات المصرية لنشرها على السوشيال ميديا.

---

## 🚀 كيفية التشغيل (Quick Start)

```bash
# الانتقال لمجلد الباك إند
cd arab-aura-backend

# تشغيل الخادم في وضع التطوير (يراقب أي تعديل تلقائياً)
npm run dev

# الرابط المحلي للباك إند:
http://localhost:8000/api
```
