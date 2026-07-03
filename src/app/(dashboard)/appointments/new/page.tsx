'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Doctor = { id: string; full_name: string; specialty: string };
type Patient = { id: string; full_name: string };

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patient_id: searchParams.get('patient_id') || '',
    doctor_id: '',
    scheduled_at: '',
    duration_minutes: '30',
    notes: '',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: u } = await supabase.from('users').select('clinic_id').eq('auth_id', user.id).single();
        if (u?.clinic_id) setClinicId(u.clinic_id);
      }
      const [{ data: d }, { data: p }] = await Promise.all([
        supabase.from('users').select('id, full_name, specialty').eq('role', 'doctor'),
        supabase.from('patients').select('id, full_name').order('full_name'),
      ]);
      setDoctors(d || []);
      setPatients(p || []);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patient_id || !form.scheduled_at) {
      setError('المريض والوقت مطلوبان');
      return;
    }
    if (!clinicId) { setError('تعذر تحديد العيادة'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('appointments').insert([{
      patient_id: form.patient_id,
      doctor_id: form.doctor_id || null,
      clinic_id: clinicId,
      scheduled_at: form.scheduled_at,
      duration_minutes: parseInt(form.duration_minutes),
      notes: form.notes,
      status: 'scheduled',
    }]);
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push('/appointments');
  }

  return (
    <div className="max-w-xl">
      <Link href="/appointments" className="text-sm text-green-600 hover:underline mb-4 inline-block">← المواعيد</Link>
      <h1 className="text-2xl font-bold text-green-700 mb-6">موعد جديد</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <Field label="المريض *">
          <select className={input} value={form.patient_id} onChange={(e) => set('patient_id', e.target.value)}>
            <option value="">-- اختر المريض --</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </Field>

        <Field label="الدكتور">
          <select className={input} value={form.doctor_id} onChange={(e) => set('doctor_id', e.target.value)}>
            <option value="">-- اختر الدكتور --</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}{d.specialty ? ` (${d.specialty})` : ''}</option>)}
          </select>
        </Field>

        <Field label="التاريخ والوقت *">
          <input type="datetime-local" className={input} value={form.scheduled_at} onChange={(e) => set('scheduled_at', e.target.value)} />
        </Field>

        <Field label="مدة الموعد (دقيقة)">
          <select className={input} value={form.duration_minutes} onChange={(e) => set('duration_minutes', e.target.value)}>
            <option value="15">15 دقيقة</option>
            <option value="30">30 دقيقة</option>
            <option value="45">45 دقيقة</option>
            <option value="60">ساعة</option>
          </select>
        </Field>

        <Field label="ملاحظات">
          <textarea className={input} rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="أي تفاصيل إضافية..." />
        </Field>

        <button type="submit" disabled={loading || !clinicId}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
          {loading ? 'جاري الحفظ...' : 'حجز الموعد'}
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
