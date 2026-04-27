'use client';
import { useQuery } from '@apollo/client';
import { AI_RECOMMENDATIONS } from '../lib/graphql/queries';
import Link from 'next/link';

interface RecommendedRestaurant {
  name: string;
  reason: string;
}
interface RecommendedDish {
  name: string;
  restaurant: string;
  reason: string;
}

export default function AiRecommendations() {
  const { data, loading, error } = useQuery(AI_RECOMMENDATIONS);

  if (loading) return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-5 border border-orange-100">
      <div className="flex items-center gap-2 text-orange-600 font-semibold mb-3">✨ AI Recommendations</div>
      <p className="text-gray-400 text-sm animate-pulse">Personalizing recommendations for you...</p>
    </div>
  );

  if (error || !data?.aiRecommendations) return null;

  let parsed: { restaurants: RecommendedRestaurant[]; dishes: RecommendedDish[] };
  try {
    parsed = JSON.parse(data.aiRecommendations);
  } catch {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-5 border border-orange-100">
      <div className="flex items-center gap-2 text-orange-600 font-semibold mb-4 text-lg">
        ✨ AI Recommendations For You
      </div>

      {parsed.restaurants?.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Top Restaurants</h3>
          <div className="space-y-2">
            {parsed.restaurants.map((r, i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-2.5 flex items-start gap-2 shadow-sm">
                <span className="text-orange-400 mt-0.5">🍽️</span>
                <div>
                  <span className="font-medium text-gray-800">{r.name}</span>
                  <p className="text-xs text-gray-500">{r.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed.dishes?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Dishes You Might Love</h3>
          <div className="flex flex-wrap gap-2">
            {parsed.dishes.map((d, i) => (
              <div key={i} className="bg-white rounded-xl px-3 py-2 shadow-sm border border-orange-100">
                <span className="font-medium text-gray-800 text-sm">🌟 {d.name}</span>
                <p className="text-xs text-gray-400">{d.restaurant}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
        <span>🤖</span> Powered by Gemini AI · Based on your order history
      </p>
    </div>
  );
}
