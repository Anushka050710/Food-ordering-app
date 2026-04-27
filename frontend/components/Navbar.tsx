'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, clearAuth, canManagePayments } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) return null;

  const roleBadge: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    MEMBER: 'bg-green-100 text-green-700',
  };
  const countryFlag: Record<string, string> = { INDIA: '🇮🇳', AMERICA: '🇺🇸' };

  const navLink = (href: string, label: string) => (
    <Link href={href} className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${pathname.startsWith(href) ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'}`}>
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold text-orange-600">🍽️ FoodOrder</Link>
          <div className="flex items-center gap-1">
            {navLink('/dashboard', 'Restaurants')}
            {navLink('/orders', 'Orders')}
            {canManagePayments(user.role) && navLink('/payments', 'Payments')}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{countryFlag[user.country]} {user.name}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge[user.role]}`}>{user.role}</span>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">Logout</button>
        </div>
      </div>
    </nav>
  );
}
