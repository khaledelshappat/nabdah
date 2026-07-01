'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Appointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  status: string;
  patients: { full_name: string } | null;
  users: { full_name: string } | null;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('appointments')
        .select('id,appointment_date,start_time,status,patients(full_name),users(full_name)')
        .eq('appointment_date', date)
        .order('start_time');
      setAppointments((data as any) || []);
      setLoading(false);
    }
    load();
  }, [date]);

  const statusLabel: Record<string, string> = {
    scheduled: 'مجدول',
    confirmed: 'مؤكد',
    completed: 'منتهي',
    cancelled: 'ملغي',
    no_show: 'لم يحضر',
  };

  const statusColor: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">المواعيد</h1>
        <Link href="/appointments/new" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
          + موعد جديد
        </Link>
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mb-4 border rounded-lg p-2 bg-white"
      />

      {loading ? (
        <p className="text-gray-400 text-center py-8">جاري التحميل...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-3">الوقت</th>
                <th className="p-3">المريض</th>
                <th className="p-3">الدكتور</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan={4} className="text-center p-6 text-gray-400">لا توجد مواعيد لهذا اليوم</td></tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{a.start_time?.slice(0, 5)}</td>
                    <td className="p-3">{a.patients?.full_name || '—'}</td>
                    <td className="p-3 text-gray-600">د. {a.users?.full_name || '—'}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor[a.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabel[a.status] || a.status}
                      </span>
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
