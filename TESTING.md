# 🧪 Arab Aura (عرب أورا) - Testing & Quality Assurance Manual

> **Document Version:** 1.0.0  
> **Status:** Approved Production Standard  
> **Author:** Lead QA & Automation Architect  
> **Scope:** Full-Stack Web, Micro-Hub Neighborhood Logistics, AI Pipeline & Mobile Web  

---

## 📑 جدول المحتويات (Table of Contents)
1. [نظرة عامة وفلسفة الاختبار (Overview & Testing Philosophy)](#1-overview--testing-philosophy)
2. [هرم الاختبار وتوزيع الطبقات (Testing Pyramid)](#2-testing-pyramid)
3. [إعداد البيئة والمتطلبات (Environment Setup & Prerequisites)](#3-environment-setup--prerequisites)
4. [شجرة ملفات الاختبار (Test Suite Directory Tree)](#4-test-suite-directory-tree)
5. [أوامر التشغيل السريع (Execution Commands)](#5-execution-commands)
6. [دليل المحاكاة (Mocking Guide: AI & Payment Gateways)](#6-mocking-guide-ai--payment-gateways)
7. [مصفوفة الأجهزة واللغات (Multi-Platform Matrix)](#7-multi-platform-matrix)
8. [التكامل المستمر والنشر التلقائي (CI/CD Integration)](#8-cicd-integration)
9. [معايير المساهمة وضبط الجودة (Contribution & Quality Gates)](#9-contribution--quality-gates)

---

## 1. Overview & Testing Philosophy

تم تصميم منظومة الاختبارات لمنصة **عرب أورا (Arab Aura)** وفق أعلى معايير الجودة والاعتمادية للمنصات التجارية واللوجستية التشاركية. تركز فلسفتنا على:
- **حماية المسارات والصلاحيات (Zero-Trust RBAC):** ضمان العزل الكامل بين أدوار النظام الستة (عميل `user`، بائع `seller`، سائق `driver`، مجمع شحنات `collector`، مدير النظام `admin`).
- **سلامة المعاملات المالية (Financial Settlement Integrity):** التحقق الدقيق من حساب عمولة التوصيل الثابتة بحي 6 أكتوبر (35 ج.م)، توزيع مستحقات الكابتن (25 ج.م)، وتصفية أرباح التاجر (92%)، وصفرية رصيد المحفظة للحسابات الجديدة لمنع الاستنزاف المالي.
- **اعتمادية الذكاء الاصطناعي (AI Resiliency):** اختبار صمود محركات المقاسات المصرية وتحليل الأقمشة ضد انقطاع الشبكة، نفاد الحصة (HTTP 429)، وحالات الصور الفاسدة عبر محركات fallback فورية.
- **التوافق البصري الشامل (Visual & Localization Matrix):** التوافق الكامل مع اتجاه اللغة العربية من اليمين لليسار (`dir="rtl"`)، خطوط `IBM Plex Sans Arabic`، والوضع الليلي/النهاري عبر كافة مقاسات الشاشات (Mobile 360px-414px, Tablet 768px-820px, Desktop 1024px-1920px).

---

## 2. Testing Pyramid

تتبع المنصة التوزيع القياسي لهرم الاختبار:

```text
       /\
      /  \      10% Playwright E2E & Visual Regression Tests
     /----\     (Cross-Browser, Matrix Viewports, Multi-Role Journeys)
    /      \
   /--------\   20% Integration & Feature Tests (Supertest / React Testing Library)
  /          \  (Order Lifecycle, Doorstep OTP, Cart Checkout, Auth & Wallets)
 /------------\ 
/              \ 70% Unit Tests (Vitest & PHPUnit / Pest compatibility)
---------------- (RBAC Guards, Egyptian BMI Calculations, Fabric Care, Contexts)
```

---

## 3. Environment Setup & Prerequisites

### المتطلبات الأساسية (Prerequisites):
- **Node.js:** الإصدار 20.x أو 22.x LTS
- **npm:** الإصدار 10.x أو أحدث
- **Google Chrome / Chromium:** لاختبارات المتصفح وأدوات Playwright

### إعداد ملفات البيئة للاختبار (`.env.test`):

في مجلد الباك إند (`arab-aura-backend/.env.test`):
```env
PORT=8000
NODE_ENV=test
JWT_SECRET=super_secure_test_jwt_secret_key_arab_aura_2026
MONGODB_URI=mongodb://localhost:27017/arab_aura_test
GEMINI_API_KEY=mock-gemini-test-key
```

في مجلد الفرونت إند (`arab-aura-frontend/.env.test`):
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 4. Test Suite Directory Tree

```text
arab-aura/
├── .github/
│   └── workflows/
│       └── test.yml                # CI/CD Automated Test Pipeline
├── playwright.config.ts            # Playwright Multi-Device Matrix Configuration
├── TESTING.md                      # Official QA Documentation
├── arab-aura-backend/
│   ├── vitest.config.ts            # Backend Vitest Runner Config
│   └── tests/
│       ├── unit/
│       │   ├── rbac.test.ts        # RBAC Token & Role Verification (6 tests)
│       │   └── aiPipeline.test.ts  # Egyptian Sizing, Cotton Care & Fallbacks (5 tests)
│       ├── feature/
│       │   ├── authAndWallet.test.ts  # Username auto-derivation & Wallets (4 tests)
│       │   └── orderLifecycle.test.ts # Neighborhood Fee (35 EGP) & OTP flow (3 tests)
│       └── pest/
│           └── OrderAndRbacTest.php   # PHPUnit / Pest Cross-Stack Specification
├── arab-aura-frontend/
│   ├── vite.config.ts              # Configured with Vitest & JSDOM globals
│   └── tests/
│       ├── unit/
│       │   ├── ThemeContext.test.tsx    # Dark/Light Mode state persistence (3 tests)
│       │   ├── LanguageContext.test.tsx # Arabic RTL / English LTR context (2 tests)
│       │   └── aiService.test.ts        # Outfit match & Skin undertone logic (3 tests)
│       └── components/
│           └── CartCheckout.test.tsx    # Neighborhood Shipping & Wallet checks (3 tests)
└── tests/
    └── e2e/
        ├── customer-journey.spec.ts  # Storefront browsing, Cart, Checkout & OTP
        ├── seller-journey.spec.ts    # Dashboard KPIs, Dynamic 7-Day Chart, AI Insights
        ├── driver-journey.spec.ts    # Doorstep Delivery & 4-Digit OTP Settlement (+25 EGP)
        └── responsive-visual.spec.ts # Responsive Breakpoints, RTL/LTR, Dark Theme
```

---

## 5. Execution Commands

### ⚡ تشغيل الاختبارات الشاملة للمنصة (All Suites):
```bash
# تشغيل كافة اختبارات الباك إند والفرونت إند من المجلد الرئيسي
npm test
```

### 🔙 تشغيل اختبارات الباك إند فقط (Backend Tests):
```bash
cd arab-aura-backend
npm test

# تشغيل ملف مخصص مع مراقبة التعديلات (Watch Mode):
npx vitest tests/unit/rbac.test.ts --watch
```

### 🎨 تشغيل اختبارات الفرونت إند فقط (Frontend Tests):
```bash
cd arab-aura-frontend
npm test

# فحص كود التغطية (Coverage Report):
npm test -- --coverage
```

### 🎭 تشغيل اختبارات Playwright E2E:
```bash
# تشغيل كافة مصفوفات الأجهزة في الخلفية
npx playwright test

# تشغيل واجهة المستخدم التفاعلية (UI Mode) للمعاينة الحية:
npx playwright test --ui

# تشغيل بروجكت محدد (مثال: آيفون 14 باللغة العربية والوضع الليلي):
npx playwright test --project=Mobile-iPhone14-RTL-Dark
```

---

## 6. Mocking Guide (AI & Payment Gateways)

### 🤖 محاكاة محرك الذكاء الاصطناعي (Gemini AI Vision):
في بيئة الاختبار، يتم تجنب استهلاك حصة الـ API عبر الاعتماد على الـ Mock Services التلقائية:
```typescript
import { vi } from "vitest";

// محاكاة استجابة نموذج التوصيات الذكية للأقمشة المصرية
vi.spyOn(aiService, "analyzeFabricCare").mockResolvedValue({
  cottonType: "Giza 94 Extra-Long Staple",
  washInstructionsAr: "غسيل بالماء البارد أقل من 30 درجة مئوية مع تجنب المبيضات الكيميائية",
  ecoScore: 98
});
```

### 💳 محاكاة بوابات الدفع (InstaPay & Vodafone Cash):
- **إنستا باي (InstaPay):** يتم التحقق من صحة عنوان الدفع اللحظي (IPA) بنمط `username@instapay`.
- **محافظ المحمول (Vodafone Cash):** يتم التحقق من النمط المصري للهاتف المحمول `^01[0125][0-9]{8}$`.
- **المحفظة الرقمية الداخلية (Arab Aura Wallet):** يتم التحقق من أن الحساب الجديد رصيده 0.00 ج.م، ورفض الدفع في حال عدم كفاية الرصيد برسالة خطأ محددة.

---

## 7. Multi-Platform Matrix

تم تكوين ملف `playwright.config.ts` لاختبار المنصة على مصفوفة شاملة تشمل 7 بيئات تشغيل:

| اسم البروجكت (Project Name) | نوع الجهاز (Device) | العرض × الارتفاع | اللغة والاتجاه | الثيم الافتراضي |
|:---|:---|:---:|:---:|:---:|
| `Desktop-Chrome-RTL-Dark` | Desktop Chrome | 1920 × 1080 | ar-EG (RTL) | Dark Mode |
| `Desktop-Chrome-LTR-Light` | Desktop Chrome | 1440 × 900 | en-US (LTR) | Light Mode |
| `Tablet-iPad-RTL-Light` | iPad Mini | 768 × 1024 | ar-EG (RTL) | Light Mode |
| `Tablet-Air-LTR-Dark` | iPad Pro 11 | 820 × 1180 | en-US (LTR) | Dark Mode |
| `Mobile-iPhone14-RTL-Dark` | iPhone 14 | 390 × 844 | ar-EG (RTL) | Dark Mode |
| `Mobile-Pixel7-RTL-Light` | Google Pixel 7 | 412 × 915 | ar-EG (RTL) | Light Mode |
| `Mobile-Compact-LTR-Light` | iPhone SE | 375 × 667 | en-US (LTR) | Light Mode |

---

## 8. CI/CD Integration

تتولى منصة **GitHub Actions** عبر سير العمل `.github/workflows/test.yml` فحص كل Pull Request أو Push على فرع `main` وفق الخطوات التالية:
1. **وظيفة اختبارات الباك إند:** فحص الـ RBAC، دورة حياة الطلبات، وسلامة التوثيق.
2. **وظيفة اختبارات الفرونت إند:** فحص التوافق مع JSDOM، استجابة السلة، وتبديل الثيم واللغة، مع التأكد من نجاح أمر البناء الإنتاجي (`npm run build`).
3. **وظيفة اختبارات Playwright E2E:** تشغيل محاكاة رحلة العميل والبائع والسائق على خوادم أوبونتو السحابية ورفع تقرير الفحص التفاعلي كـ Artifact.

---

## 9. Contribution & Quality Gates

لضمان سلامة الكود واستمرارية عمل المنصة بنسبة 100%:
- يُحظر دمج أي كود لا يجتاز كافة اختبارات Vitest بنسبة نجاح 100%.
- يجب إضافة اختبار وحدة (Unit Test) عند إنشاء أي Controller جديد أو مسار API جديد.
- يجب التأكد من عدم وجود أي تداخل في عناصر واجهة المستخدم عند عرضها في شاشة الهاتف الصغير (375px) وعدم حدوث أي تمرير أفقي غير مقصود (`overflow-x`).
- الحفاظ التام على أصول الخط العربي الموحد `IBM Plex Sans Arabic`.
