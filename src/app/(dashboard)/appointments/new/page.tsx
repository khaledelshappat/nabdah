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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patient_id: searchParams.get('patient') || '',
    doctor_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    notes: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    async function load() {
      const [{ data: d }, { data: p }] = await Promise.all([
        supabase.from('users').select('id,full_name,specialty').eq('role', 'doctor'),
        supabase.from('patients').select('id,full_name').order('full_name').limit(100),
      ]);
      setDoctors(d || []);
      setPatients(p || []);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patient_id || !form.doctor_id) {
      setError('المريض والدكتور مطلوبان');
      return;
    }
    setLoading(true);
    setError('');
    const { data: clinic } = await supabase.from('clinics').select('id').limit(1).single();
    const { error: err } = await supabase.from('appointments').insert([{
      ...form,
      clinic_id: clinic?.id,
      status: 'scheduled',
    }]);
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push('/appointments');
  }

  return (
    <div className="max-w-xl">
      <Link href="/appointments" className="text-sm text-green-600 hover:underline mb-4 inline-block">← العودة</Link>
      <h1 className="text-2xl font-bold text-green-700 mb-6">موعد جديد</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <Field label="المريض *">
          <select className={input} value={form.patient_id} onChange={(e) => set('patient_id', e.target.value)}>
            <option value="">اختر مريض...</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </Field>

        <Field label="الدكتور *">
          <select className={input} value={form.doctor_id} onChange={(e) => set('doctor_id', e.target.value)}>
            <option value="">اختر دكتور...</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>د. {d.full_name} — {d.specialty}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="التاريخ">
            <input type="date" className={input} value={form.appointment_date} onChange={(e) => set('appointment_date', e.target.value)} />
          </Field>
          <Field label="الوقت">
            <input type="time" className={input} value={form.start_time} onChange={(e) => set('start_time', e.target.value)} />
          </Field>
        </div>

        <Field label="ملاحظات">
          <textarea className={input + ' h-20 resize-none'} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="أي تفاصيل إضافية..." />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'جاري الحجز...' : 'تأكيد الموعد'}
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
