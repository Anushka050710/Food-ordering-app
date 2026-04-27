'use client';
import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { AI_SEARCH } from '../lib/graphql/queries';
import { useRouter } from 'next/navigation';

interface SearchRestaurant {
  id: string;
  name: string;
  cuisine: string;
  matchReason: string;
}
interface SearchDish {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  price: number;
  matchReason: string;
}

export default function AiSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ restaurants: SearchRestaurant[]; dishes: SearchDish[] } | null>(null);
  const router = useRouter();

  const [aiSearch, { loading }] = useLazyQuery(AI_SEARCH);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const { data } = await aiSearch({ variables: { query } });
    if (data?.aiSearch) {
      try {
        setResults(JSON.parse(data.aiSearch));
      } catch {
        setResults(null);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Search bar */}
      <div className="flex gap-2 items-center bg-white rounded-2xl shadow-md px-4 py-3 border border-gray-100">
        <span className="text-xl">🔍</span>
        <input
          className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          placeholder='Try "spicy vegetarian food" or "cheap pasta under ₹200"...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Searching...' : 'AI Search'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-4 space-y-4">
          {results.restaurants?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Matching Restaurants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.restaurants.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => router.push(`/dashboard/${r.id}`)}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all"
                  >
                    <div className="font-semibold text-gray-800">{r.name}</div>
                    <div className="text-xs text-orange-500 mb-1">{r.cuisine}</div>
                    <div className="text-xs text-gray-500">{r.matchReason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.dishes?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Matching Dishes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.dishes.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => router.push(`/dashboard/${d.restaurantId}`)}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all"
                  >
                    <div className="font-semibold text-gray-800">{d.name}</div>
                    <div className="text-xs text-gray-500">{d.restaurantName} · ₹{d.price}</div>
                    <div className="text-xs text-gray-400 mt-1">{d.matchReason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.restaurants?.length === 0 && results.dishes?.length === 0 && (
            <p className="text-center text-gray-400 py-4">No matches found. Try a different search.</p>
          )}
        </div>
      )}
    </div>
  );
}
