'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewMedicationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
    is_active: true,
  });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.medication_name) { setError('اسم الدواء مطلوب'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('medications').insert([{
      patient_id: params.id,
      medication_name: form.medication_name,
      dosage: form.dosage,
      frequency: form.frequency,
      duration: form.duration,
      notes: form.notes,
      is_active: form.is_active,
      prescribed_at: new Date().toISOString(),
    }]);
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push(`/patients/${params.id}?tab=meds`);
  }

  return (
    <div className="max-w-xl">
      <Link href={`/patients/${params.id}`} className="text-sm text-green-600 hover:underline mb-4 inline-block">← العودة للمريض</Link>
      <h1 className="text-2xl font-bold text-green-700 mb-6">إضافة دواء جديد</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <Field label="اسم الدواء *">
          <input className={input} value={form.medication_name}
            onChange={(e) => set('medication_name', e.target.value)}
            placeholder="مثال: أموكسيسيلين 500 مج" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="الجرعة">
            <input className={input} value={form.dosage}
              onChange={(e) => set('dosage', e.target.value)}
              placeholder="مثال: 500 مج" />
          </Field>
          <Field label="التكرار">
            <select className={input} value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
              <option value="">اختر...</option>
              <option value="مرة يوميا">مرة يوميا</option>
              <option value="مرتين يوميا">مرتين يوميا</option>
              <option value="3 مرات يوميا">3 مرات يوميا</option>
              <option value="4 مرات يوميا">4 مرات يوميا</option>
              <option value="عند الحاجة">عند الحاجة</option>
            </select>
          </Field>
        </div>

        <Field label="مدة العلاج">
          <input className={input} value={form.duration}
            onChange={(e) => set('duration', e.target.value)}
            placeholder="مثال: 7 أيام أو مستمر" />
        </Field>

        <Field label="ملاحظات">
          <textarea className={input} rows={3} value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="مثال: يؤخذ بعد الأكل..." />
        </Field>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="is_active" checked={form.is_active}
            onChange={(e) => set('is_active', e.target.checked)}
            className="w-4 h-4 text-green-600" />
          <label htmlFor="is_active" className="text-sm text-gray-700">الدواء نشط حالياً</label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'جاري الحفظ...' : 'حفظ الدواء'}
        </button>
      </form>
    </div>
  );
}

const input = 'w-full border rounded-lg p-2.5 text-right bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
