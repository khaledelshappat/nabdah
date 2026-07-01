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
        supabase.from('visits').select('*').eq('patient_id', params.id).order('created_at', { ascending: false }),
        supabase.from('medications').select('*').eq('patient_id', params.id).order('prescribed_at', { ascending: false }),
        supabase.from('lab_results').select('*').eq('patient_id', params.id).order('test_date', { ascending: false }),
      ]);
      setPatient(p);
      setVisits(v || []);
      setMeds(m || []);
      setLabs(l || []);
    }
    load();
  }, [params.id]);

  if (!patient) return <div className="p-6 text-gray-400">جاري التحميل...</div>;

  return (
    <div>
      <Link href="/patients" className="text-sm text-green-600 hover:underline mb-4 inline-block">← العودة للمرضى</Link>

      {/* Patient Header */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{patient.full_name}</h1>
            <div className="flex gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              <span>📞 {patient.phone}</span>
              {patient.national_id && <span>🇪🇬 {patient.national_id}</span>}
              {patient.blood_type && <span>🩸 {patient.blood_type}</span>}
              <span>{patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
            </div>
          </div>
          <Link href={`/appointments/new?patient=${params.id}`} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
            + حجز موعد
          </Link>
        </div>
        {patient.allergies && (
          <div className="mt-3 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
            ⚠️ حساسية: {patient.allergies}
          </div>
        )}
        {patient.chronic_conditions && (
          <div className="mt-2 bg-yellow-50 text-yellow-800 text-sm px-3 py-2 rounded-lg">
            📌 أمراض مزمنة: {patient.chronic_conditions}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['visits', 'meds', 'labs'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === t ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
            }`}
          >
            {t === 'visits' ? 'زيارات' : t === 'meds' ? 'أدوية' : 'تحاليل'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow p-5">
        {tab === 'visits' && (
          <div className="space-y-4">
            {visits.length === 0 ? <p className="text-gray-400 text-sm">لا توجد زيارات</p> : visits.map((v) => (
              <div key={v.id} className="border-r-4 border-green-500 pr-3">
                <p className="font-medium text-gray-800">{v.chief_complaint || 'بدون شكوى محددة'}</p>
                {v.diagnosis && <p className="text-sm text-gray-600">التشخيص: {v.diagnosis}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(v.created_at).toLocaleDateString('ar-EG')}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'meds' && (
          <div className="space-y-3">
            {meds.length === 0 ? <p className="text-gray-400 text-sm">لا توجد أدوية</p> : meds.map((m) => (
              <div key={m.id} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{m.medication_name}</p>
                  <p className="text-sm text-gray-500">{m.dosage} — {m.frequency}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full h-fit ${
                  m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>{m.is_active ? 'جارٍ' : 'منتهي'}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'labs' && (
          <div className="space-y-3">
            {labs.length === 0 ? <p className="text-gray-400 text-sm">لا توجد تحاليل</p> : labs.map((l) => (
              <div key={l.id} className="border-b pb-2">
                <p className="font-medium">{l.test_name}</p>
                <p className="text-sm text-gray-500">{l.result} {l.unit}</p>
                <p className="text-xs text-gray-400">{new Date(l.test_date).toLocaleDateString('ar-EG')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
