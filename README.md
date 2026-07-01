# نبضة — Nabdah

> نظام إدارة عيادات متعددة التخصصات — ملف موحد لكل مريض

## ما هي نبضة؟
Nabdah هي SaaS متخصصة لعيادات متعددة التخصصات في مصر. تجمع كل دكتور في عيادة واحدة حول ملف موحد لكل مريض.

## الميزات الأساسية (MVP)

| الصفحة | الوظيفة |
|------|------|
| `/dashboard` | لوحة تحكم مع إحصائيات |
| `/patients` | قائمة مرضى مع بحث فوري |
| `/patients/new` | إضافة مريض جديد |
| `/patients/[id]` | ملف 360 — زيارات ، أدوية ، تحاليل |
| `/appointments` | مواعيد اليوم مع فلتر التاريخ |
| `/appointments/new` | حجز موعد جديد |

## التكنولوجيا
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Cairo font (RTL عربي)
- **Backend / DB**: Supabase (PostgreSQL + Auth + RLS)
- **State**: React hooks (useState, useEffect)

## التشغيل محلياً

```bash
git clone https://github.com/khaledelshappat/nabdah.git
cd nabdah
npm install
```

أنشئ `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
# افتح http://localhost:3000
```

## خطة التطوير

- **Phase 1** ✔️ — MVP Core (Patient 360 + مواعيد)
- **Phase 2** — تسجيل دخول بالدور (Admin / Doctor / Receptionist)
- **Phase 3** — إشعارات WhatsApp + تكامل e-Receipt
- **Phase 4** — تطبيق موبايل + بوابة مريض

---
تطوير: [@khaledelshappat](https://github.com/khaledelshappat)
