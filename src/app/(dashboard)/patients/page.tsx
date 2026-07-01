'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Patient = { id: string; full_name: string; phone: string; national_id: string; gender: string; date_of_birth: string; };

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase.from('patients').select('id,full_name,phone,national_id,gender,date_of_birth').order('full_name');
      if (search) q = q.ilike('full_name', `%${search}%`);
      const { data } = await q;
      setPatients(data || []);
      setLoading(false);
    }
    load();
  }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">المرضى</h1>
        <Link href="/patients/new" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
          + مريض جديد
        </Link>
      </div>
      <input
        type="text"
        placeholder="ابحث باسم المريض..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 border rounded-lg p-3 text-right bg-white"
      />
      {loading ? (
        <p className="text-gray-400 text-center py-8">جاري التحميل...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-3">الاسم</th>
                <th className="p-3">الهاتف</th>
                <th className="p-3">الرقم القومي</th>
                <th className="p-3">الجنس</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-6 text-gray-400">لا يوجد مرضى</td></tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.full_name}</td>
                    <td className="p-3 text-gray-600">{p.phone}</td>
                    <td className="p-3 text-gray-600">{p.national_id}</td>
                    <td className="p-3 text-gray-600">{p.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                    <td className="p-3">
                      <Link href={`/patients/${p.id}`} className="text-green-600 hover:underline text-sm">
                        عرض الملف
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
