'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Patient = {
  id: string; full_name: string; phone: string;
  national_id: string; gender: string; date_of_birth: string;
  blood_type: string; chronic_conditions: string; allergies: string;
  created_at: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('patients')
      .select('id,full_name,phone,national_id,gender,date_of_birth,blood_type,chronic_conditions,allergies,created_at', { count: 'exact' })
      .order('full_name');
    if (search.trim()) q = q.ilike('full_name', `%${search.trim()}%`);
    const { data, count } = await q.limit(50);
    setPatients(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function age(dob: string) {
    if (!dob) return null;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المرضى</h1>
          {!loading && <p className="text-sm text-gray-400">إجمالي: {total} مريض</p>}
        </div>
        <Link href="/patients/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
          + مريض جديد
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم المريض..."
          className="w-full border rounded-xl p-3 pr-10 text-right bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">جاري التحميل...</p>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <p className="text-gray-400 mb-3">{search ? 'لا توجد نتائج' : 'لا يوجد مرضى بعد'}</p>
          <Link href="/patients/new" className="text-green-600 hover:underline text-sm">+ أضف مريضاً</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y">
          {patients.map((p) => (
            <Link key={p.id} href={`/patients/${p.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-800">{p.full_name}</p>
                  {p.blood_type && (
                    <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{p.blood_type}</span>
                  )}
                  {p.gender && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {p.gender === 'male' ? 'ذكر' : 'أنثى'}
                    </span>
                  )}
                  {age(p.date_of_birth) && (
                    <span className="text-xs text-gray-400">{age(p.date_of_birth)} سنة</span>
                  )}
                </div>
                <div className="flex gap-3 mt-1 flex-wrap">
                  {p.phone && <p className="text-sm text-gray-500">{p.phone}</p>}
                  {p.chronic_conditions && (
                    <p className="text-xs text-orange-500">⚠️ {p.chronic_conditions}</p>
                  )}
                  {p.allergies && (
                    <p className="text-xs text-red-400">🚫 {p.allergies}</p>
                  )}
                </div>
              </div>
              <span className="text-green-500 text-lg mr-2">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
