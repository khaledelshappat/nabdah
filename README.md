# نبضة — Nabdah

> نظام إدارة عيادات متعددة التخصصات — ملف موحد لكل مريض

## ما هي نبضة؟

Nabdah هي SaaS متخصصة لعيادات متعددة التخصصات في مصر، تجمع كل دكتور في عيادة واحدة حول ملف موحد لكل مريض.

**الـ USP:** “أول نظام في مصر يخلي كل دكتور يشوف الصورة الكاملة للمريض”

---

## الميزات الأساسية (MVP Phase 1)

| الصفحة | الوظيفة |
|---|---|
| `/dashboard` | لوحة تحكم مع إحصائيات حية |
| `/patients` | قائمة مرضى مع بحث فوري وعدد |
| `/patients/new` | إضافة مريض جديد |
| `/patients/[id]` | ملف 360 — زيارات ، أدوية ، تحاليل |
| `/patients/[id]/visits/new` | تسجيل زيارة جديدة مع علامات حيوية |
| `/patients/[id]/medications/new` | إضافة دواء جديد |
| `/appointments` | مواعيد اليوم / القادمة / الكل |
| `/appointments/new` | حجز موعد جديد |

---

## التقنيات

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Styling:** Tailwind CSS (RTL عربي)
- **Language:** TypeScript

---

## تشغيل المشروع

```bash
# 1. استنسخ المستودع
cd nabdah

# 2. ثبت الحزم
npm install

# 3. أنشئ ملف .env.local
cp .env.example .env.local
# أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. شغّل محلياً
npm run dev
```

---

## قاعدة البيانات

نفذ ملف `supabase/schema.sql` في SQL Editor في لوحة Supabase:

```sql
-- الجداول: clinics, users, patients, appointments,
--         visits, medications, lab_results, referrals
```

---

## الصلاحيات (Roles)

| الدور | الصلاحيات |
|---|---|
| `admin` | إدارة كاملة للعيادة |
| `doctor` | عرض وتسجيل ملفات مرضاه |
| `receptionist` | حجز المواعيد وإضافة المرضى |

---

## خارطة الطريق

- [x] Phase 0: البنية (Supabase + Next.js + Auth)
- [x] Phase 1: MVP Core (Dashboard + مرضى + مواعيد + ملف 360)
- [ ] Phase 2: بوابة المريض + إشعارات WhatsApp
- [ ] Phase 3: تكامل التحاليل + تطبيق جوال
- [ ] Phase 4: توسع متعدد العيادات + تقارير

---

**التسعير:** يبدأ من 1,000 جنيه/شهر للعيادة الواحدة.
