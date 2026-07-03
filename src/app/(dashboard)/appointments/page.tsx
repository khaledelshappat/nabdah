'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'مجدول', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'مكتمل', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
  no_show: { label: 'لم يحضر', color: 'bg-gray-100 text-gray-600' },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      let query = supabase
        .from('appointments')
        .select('*, patients(id, full_name, phone), users(full_name, specialty)')
        .order('scheduled_at', { ascending: true });

      if (filter === 'today') {
        query = query.gte('scheduled_at', today).lt('scheduled_at', today + 'T23:59:59');
      } else if (filter === 'upcoming') {
        query = query.gte('scheduled_at', new Date().toISOString());
      }

      const { data } = await query.limit(50);
      setAppointments(data || []);
      setLoading(false);
    }
    load();
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    await supabase.from('appointments').update({ status }).eq('id', id);
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">المواعيد</h1>
        <Link href="/appointments/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
          + موعد جديد
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['today', 'upcoming', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f === 'today' ? 'اليوم' : f === 'upcoming' ? 'القادمة' : 'الكل'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">جاري التحميل...</p>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <p className="text-gray-400 mb-3">لا توجد مواعيد</p>
          <Link href="/appointments/new" className="text-green-600 hover:underline text-sm">+ أضف موعداً</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right p-3 font-medium text-gray-600">المريض</th>
                <th className="text-right p-3 font-medium text-gray-600">الدكتور</th>
                <th className="text-right p-3 font-medium text-gray-600">التاريخ والوقت</th>
                <th className="text-right p-3 font-medium text-gray-600">الحالة</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <Link href={`/patients/${a.patients?.id}`} className="font-medium text-green-700 hover:underline">
                      {a.patients?.full_name}
                    </Link>
                    {a.patients?.phone && <p className="text-xs text-gray-400">{a.patients.phone}</p>}
                  </td>
                  <td className="p-3 text-gray-600">
                    {a.users ? `د. ${a.users.full_name}` : '—'}
                    {a.users?.specialty && <p className="text-xs text-gray-400">{a.users.specialty}</p>}
                  </td>
                  <td className="p-3 text-gray-600">
                    <p>{new Date(a.scheduled_at).toLocaleDateString('ar-EG')}</p>
                    <p className="text-xs text-gray-400">{new Date(a.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      STATUS_LABELS[a.status]?.color || 'bg-gray-100 text-gray-600'
                    }`}>{STATUS_LABELS[a.status]?.label || a.status}</span>
                  </td>
                  <td className="p-3">
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                      className="text-xs border rounded p-1 bg-white focus:outline-none">
                      <option value="scheduled">مجدول</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                      <option value="no_show">لم يحضر</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
