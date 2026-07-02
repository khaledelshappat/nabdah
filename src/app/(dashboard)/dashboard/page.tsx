'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({ patients: 0, todayAppts: 0, totalVisits: 0, totalMeds: 0 });
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [todayAppts, setTodayAppts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const [{ count: p }, { count: a }, { count: v }, { count: m }, { data: rp }, { data: ta }] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('scheduled_at', today).lt('scheduled_at', today + 'T23:59:59'),
        supabase.from('visits').select('*', { count: 'exact', head: true }),
        supabase.from('medications').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('patients').select('id, full_name, phone, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('appointments').select('*, patients(full_name), users(full_name)').gte('scheduled_at', today).lt('scheduled_at', today + 'T23:59:59').order('scheduled_at').limit(10),
      ]);
      setStats({ patients: p || 0, todayAppts: a || 0, totalVisits: v || 0, totalMeds: m || 0 });
      setRecentPatients(rp || []);
      setTodayAppts(ta || []);
    }
    load();
  }, []);

  const statCards = [
    { label: 'إجمالي المرضى', value: stats.patients, color: 'bg-green-50 text-green-700', icon: '👥', href: '/patients' },
    { label: 'مواعيد اليوم', value: stats.todayAppts, color: 'bg-blue-50 text-blue-700', icon: '📅', href: '/appointments' },
    { label: 'إجمالي الزيارات', value: stats.totalVisits, color: 'bg-purple-50 text-purple-700', icon: '🏥', href: '/patients' },
    { label: 'أدوية نشطة', value: stats.totalMeds, color: 'bg-orange-50 text-orange-700', icon: '💊', href: '/patients' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}
            className={`${s.color} rounded-xl p-4 flex flex-col gap-2 hover:opacity-90 transition-opacity`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today Appointments */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">مواعيد اليوم</h2>
            <Link href="/appointments/new" className="text-sm text-green-600 hover:underline">+ موعد جديد</Link>
          </div>
          {todayAppts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">لا توجد مواعيد اليوم</p>
          ) : (
            <div className="space-y-2">
              {todayAppts.map((a) => (
                <div key={a.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{a.patients?.full_name}</p>
                    <p className="text-xs text-gray-500">{a.users?.full_name && `د. ${a.users.full_name}`}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(a.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">آخر المرضى المسجلين</h2>
            <Link href="/patients/new" className="text-sm text-green-600 hover:underline">+ مريض جديد</Link>
          </div>
          {recentPatients.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">لا يوجد مرضى بعد</p>
          ) : (
            <div className="space-y-2">
              {recentPatients.map((p) => (
                <Link key={p.id} href={`/patients/${p.id}`}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <p className="text-sm font-medium">{p.full_name}</p>
                    <p className="text-xs text-gray-500">{p.phone}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('ar-EG')}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-gray-800 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/patients/new" className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100">
            <span className="text-2xl">👤</span>
            <span className="text-sm font-medium text-green-700">مريض جديد</span>
          </Link>
          <Link href="/appointments/new" className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100">
            <span className="text-2xl">📅</span>
            <span className="text-sm font-medium text-blue-700">موعد جديد</span>
          </Link>
          <Link href="/patients" className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100">
            <span className="text-2xl">🔍</span>
            <span className="text-sm font-medium text-purple-700">بحث مريض</span>
          </Link>
          <Link href="/appointments" className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl hover:bg-orange-100">
            <span className="text-2xl">📄</span>
            <span className="text-sm font-medium text-orange-700">كل المواعيد</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
