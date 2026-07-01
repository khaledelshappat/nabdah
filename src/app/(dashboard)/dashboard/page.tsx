'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({ patients: 0, todayAppts: 0 });

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const [{ count: p }, { count: a }] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', today),
      ]);
      setStats({ patients: p || 0, todayAppts: a || 0 });
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-700 mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard icon="👥" title="إجمالي المرضى" value={stats.patients} />
        <StatCard icon="📅" title="مواعيد اليوم" value={stats.todayAppts} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <QuickLink href="/patients" label="عرض قائمة المرضى" icon="👥" />
        <QuickLink href="/appointments" label="عرض المواعيد" icon="📅" />
        <QuickLink href="/patients/new" label="إضافة مريض جديد" icon="➕" />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: string; title: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl shadow p-4 flex items-center gap-3 hover:bg-green-50 transition-colors">
      <span>{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}
