'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    national_id: '',
    date_of_birth: '',
    gender: 'male',
    blood_type: '',
    allergies: '',
    chronic_conditions: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      setError('الاسم والهاتف مطلوبان');
      return;
    }
    setLoading(true);
    setError('');
    // clinic_id hardcoded for MVP — will come from auth session later
    const { data, error: err } = await supabase
      .from('patients')
      .insert([{ ...form, clinic_id: (await supabase.from('clinics').select('id').limit(1).single()).data?.id }])
      .select()
      .single();
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push(`/patients/${data.id}`);
  }

  return (
    <div className="max-w-xl">
      <Link href="/patients" className="text-sm text-green-600 hover:underline mb-4 inline-block">← العودة</Link>
      <h1 className="text-2xl font-bold text-green-700 mb-6">مريض جديد</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <Field label="الاسم بالكامل *">
          <input className={input} value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="مثال: أحمد محمد علي" />
        </Field>

        <Field label="رقم الهاتف *">
          <input className={input} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="01xxxxxxxxx" />
        </Field>

        <Field label="الرقم القومي">
          <input className={input} value={form.national_id} onChange={(e) => set('national_id', e.target.value)} placeholder="14 رقم" maxLength={14} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="تاريخ الميلاد">
            <input type="date" className={input} value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
          </Field>
          <Field label="الجنس">
            <select className={input} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </Field>
        </div>

        <Field label="فصيلة الدم">
          <select className={input} value={form.blood_type} onChange={(e) => set('blood_type', e.target.value)}>
            <option value="">غير معروف</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>

        <Field label="حساسية">
          <input className={input} value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="مثال: بنسلين" />
        </Field>

        <Field label="أمراض مزمنة">
          <input className={input} value={form.chronic_conditions} onChange={(e) => set('chronic_conditions', e.target.value)} placeholder="مثال: سكري، ضغط" />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ المريض'}
        </button>
      </form>
    </div>
  );
}

const input = 'w-full border rounded-lg p-2.5 text-right bg-white focus:outline-none focus:ring-2 focus:ring-green-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
