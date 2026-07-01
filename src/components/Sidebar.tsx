'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: '🏥' },
  { href: '/patients', label: 'المرضى', icon: '👥' },
  { href: '/appointments', label: 'المواعيد', icon: '📅' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white shadow-md flex flex-col">
      <div className="p-5 border-b">
        <h1 className="text-xl font-bold text-green-700">نبضة</h1>
        <p className="text-xs text-gray-400 mt-1">Nabdah Clinic System</p>
      </div>
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
    </aside>
  );
}
