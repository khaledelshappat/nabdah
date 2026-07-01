'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewVisitPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [form, setForm] = useState({
    chief_complaint: '',
    diagnosis: '',
    notes: '',
    doctor_id: '',
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    weight: '',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    supabase
      .from('users')
      .select('id, full_name, specialty')
      .eq('role', 'doctor')
      .then(({ data }) => setDoctors(data || []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.chief_complaint) { setError('الشكوى الرئيسية مطلوبة'); return; }
    setLoading(true);
    setError('');
    const vitals = {
      blood_pressure: form.blood_pressure,
      heart_rate: form.heart_rate,
      temperature: form.temperature,
      weight: form.weight,
    };
    const { error: err } = await supabase.from('visits').insert([{
      patient_id: params.id,
      doctor_id: form.doctor_id || null,
      chief_complaint: form.chief_complaint,
      diagnosis: form.diagnosis,
      notes: form.notes,
      vitals,
    }]);
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push(`/patients/${params.id}`);
  }

  return (
    <div className="max-w-2xl">
      <Link href={`/patients/${params.id}`} className="text-sm text-green-600 hover:underline mb-4 inline-block">← العودة للمريض</Link>
      <h1 className="text-2xl font-bold text-green-700 mb-6">تسجيل زيارة جديدة</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <Field label="الشكوى الرئيسية *">
          <textarea className={input} rows={2} value={form.chief_complaint}
            onChange={(e) => set('chief_complaint', e.target.value)}
            placeholder="مثال: ألم في الصدر منذ يومين" />
        </Field>

        <Field label="التشخيص">
          <textarea className={input} rows={2} value={form.diagnosis}
            onChange={(e) => set('diagnosis', e.target.value)}
            placeholder="مثال: التهاب رئوي" />
        </Field>

        <Field label="الدكتور المعالج">
          <select className={input} value={form.doctor_id} onChange={(e) => set('doctor_id', e.target.value)}>
            <option value="">-- اختر الدكتور --</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.full_name} {d.specialty ? `(${d.specialty})` : ''}</option>
            ))}
          </select>
        </Field>

        <p className="text-sm font-semibold text-gray-600 pt-2">العلامات الحيوية (اختياري)</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="ضغط الدم">
            <input className={input} value={form.blood_pressure}
              onChange={(e) => set('blood_pressure', e.target.value)}
              placeholder="120/80" />
          </Field>
          <Field label="معدل النبض">
            <input className={input} value={form.heart_rate}
              onChange={(e) => set('heart_rate', e.target.value)}
              placeholder="72 نبضة/دقيقة" />
          </Field>
          <Field label="درجة الحرارة">
            <input className={input} value={form.temperature}
              onChange={(e) => set('temperature', e.target.value)}
              placeholder="37.0°م" />
          </Field>
          <Field label="الوزن (كجم)">
            <input className={input} value={form.weight}
              onChange={(e) => set('weight', e.target.value)}
              placeholder="70" />
          </Field>
        </div>

        <Field label="ملاحظات">
          <textarea className={input} rows={3} value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="أي ملاحظات إضافية..." />
        </Field>

        <button type="submit" disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
          {loading ? 'جاري الحفظ...' : 'حفظ الزيارة'}
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
