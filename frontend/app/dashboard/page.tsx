'use client';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { GET_RESTAURANTS } from '@/lib/graphql/queries';
import { getUser } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const { data, loading, error } = useQuery(GET_RESTAURANTS);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  const countryFlag: Record<string, string> = { INDIA: '🇮🇳', AMERICA: '🇺🇸' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Restaurants</h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing restaurants in {countryFlag[user.country]} {user.country === 'INDIA' ? 'India' : 'America'}
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm h-64 animate-pulse" />
            ))}
          </div>
        )}

        {error && <p className="text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error.message}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.restaurants?.map((r: any) => (
            <div key={r.id} onClick={() => router.push(`/dashboard/${r.id}`)}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow group">
              <div className="h-48 bg-gray-100 overflow-hidden">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🍴</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-bold text-gray-800 text-lg">{r.name}</h2>
                <p className="text-gray-500 text-sm">{r.cuisine}</p>
                <p className="text-gray-400 text-xs mt-1">{r.menuItems?.length} items on menu</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
