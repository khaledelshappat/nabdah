'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: '🏥' },
  { href: '/patients', label: 'المرضى', icon: '👥' },
  { href: '/appointments', label: 'المواعيد', icon: '📅' },
];

type UserProfile = {
  full_name: string;
  role: string;
  specialty?: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase
        .from('users')
        .select('full_name, role, specialty')
        .eq('auth_id', authUser.id)
        .single();
      if (data) setUser(data);
    }
    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const roleLabel: Record<string, string> = {
    admin: 'مدير عيادة',
    doctor: 'دكتور',
    receptionist: 'ريسيشن',
  };

  return (
    <aside className="w-64 min-h-screen bg-white shadow-md flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b">
        <h1 className="text-xl font-bold text-green-700">نبضة</h1>
        <p className="text-xs text-gray-400 mt-0.5">Nabdah Clinic System</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t">
        {user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-800 truncate">{user.full_name}</p>
            <p className="text-xs text-gray-400">
              {roleLabel[user.role] || user.role}
              {user.specialty ? ` — ${user.specialty}` : ''}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>تسجيل خروج</span>
        </button>
      </div>
    </aside>
  );
}
