'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Patient360({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [tab, setTab] = useState<'visits' | 'meds' | 'labs'>('visits');

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: v }, { data: m }, { data: l }] = await Promise.all([
        supabase.from('patients').select('*').eq('id', params.id).single(),
        supabase.from('visits').select('*, users(full_name,specialty)').eq('patient_id', params.id).order('created_at', { ascending: false }),
        supabase.from('medications').select('*').eq('patient_id', params.id).order('prescribed_at', { ascending: false }),
        supabase.from('lab_results').select('*').eq('patient_id', params.id).order('test_date', { ascending: false }),
      ]);
      setPatient(p); setVisits(v || []); setMeds(m || []); setLabs(l || []);
    }
    load();
  }, [params.id]);

  if (!patient) return <div className="p-8 text-center text-gray-400">جاري التحميل...</div>;

  const age = patient.date_of_birth
    ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/patients" className="text-sm text-green-600 hover:underline">← المرضى</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{patient.full_name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {age ? `${age} سنة • ` : ''}
            {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
            {patient.blood_type ? ` • ${patient.blood_type}` : ''}
            {patient.phone ? ` • ${patient.phone}` : ''}
          </p>
          {patient.chronic_conditions && <p className="text-sm text-orange-600 mt-1">⚠️ {patient.chronic_conditions}</p>}
          {patient.allergies && <p className="text-sm text-red-600">🚫 حساسية: {patient.allergies}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Link href={`/patients/${params.id}/visits/new`}
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 text-center">
            + زيارة جديدة
          </Link>
          <Link href={`/patients/${params.id}/medications/new`}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 text-center">
            + دواء جديد
          </Link>
          <Link href={`/appointments/new?patient_id=${params.id}`}
            className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 text-center">
            + موعد جديد
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="flex border-b">
          {(['visits', 'meds', 'labs'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'visits' ? `زيارات (${visits.length})` : t === 'meds' ? `أدوية (${meds.length})` : `تحاليل (${labs.length})`}
            </button>
          ))}
        </div>
        <div className="p-4 space-y-3">
          {tab === 'visits' && (
            visits.length === 0
              ? <p className="text-center text-gray-400 py-8">لا توجد زيارات مسجلة</p>
              : visits.map((v) => (
                <div key={v.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{v.chief_complaint}</p>
                      {v.diagnosis && <p className="text-sm text-gray-600 mt-1">التشخيص: {v.diagnosis}</p>}
                      {v.users && <p className="text-xs text-green-600 mt-1">د. {v.users.full_name}{v.users.specialty ? ` (${v.users.specialty})` : ''}</p>}
                      {v.vitals && Object.values(v.vitals).some(Boolean) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {v.vitals.blood_pressure && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">ضغط: {v.vitals.blood_pressure}</span>}
                          {v.vitals.heart_rate && <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded">نبض: {v.vitals.heart_rate}</span>}
                          {v.vitals.temperature && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">حرارة: {v.vitals.temperature}</span>}
                          {v.vitals.weight && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">وزن: {v.vitals.weight} كجم</span>}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 mr-2">{new Date(v.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                  {v.notes && <p className="text-sm text-gray-500 mt-2 border-t pt-2">{v.notes}</p>}
                </div>
              ))
          )}
          {tab === 'meds' && (
            meds.length === 0
              ? <p className="text-center text-gray-400 py-8">لا توجد أدوية مسجلة</p>
              : meds.map((m) => (
                <div key={m.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{m.medication_name}</p>
                    <p className="text-sm text-gray-600">{m.dosage} — {m.frequency}</p>
                    {m.notes && <p className="text-xs text-gray-400 mt-1">{m.notes}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{m.is_active ? 'نشط' : 'منتهي'}</span>
                </div>
              ))
          )}
          {tab === 'labs' && (
            labs.length === 0
              ? <p className="text-center text-gray-400 py-8">لا توجد تحاليل مسجلة</p>
              : labs.map((l) => (
                <div key={l.id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <p className="font-medium">{l.test_name}</p>
                    <span className="text-xs text-gray-400">{l.test_date ? new Date(l.test_date).toLocaleDateString('ar-EG') : ''}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{l.result} {l.unit}</p>
                  {l.reference_range && <p className="text-xs text-gray-400">المرجع: {l.reference_range}</p>}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
