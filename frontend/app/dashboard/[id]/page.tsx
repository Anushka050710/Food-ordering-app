'use client';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { GET_RESTAURANT, CREATE_ORDER } from '@/lib/graphql/queries';
import { getUser } from '@/lib/auth';

interface CartItem { menuItemId: string; name: string; price: number; quantity: number; }

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = getUser();
  const { data, loading } = useQuery(GET_RESTAURANT, { variables: { id } });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [createOrder, { loading: ordering }] = useMutation(CREATE_ORDER);
  const [success, setSuccess] = useState('');
  const [err, setErr] = useState('');

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id);
      if (existing) return prev.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) return prev.map(c => c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c);
      return prev.filter(c => c.menuItemId !== menuItemId);
    });
  };

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const placeOrder = async () => {
    setErr('');
    try {
      const items = cart.map(c => ({ menuItemId: c.menuItemId, quantity: c.quantity }));
      await createOrder({ variables: { restaurantId: id, items } });
      setCart([]);
      setSuccess('Order placed! Go to Orders to checkout.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const restaurant = data?.restaurant;
  const categories = [...new Set(restaurant?.menuItems?.map((m: any) => m.category) || [])];
  const currency = user?.country === 'INDIA' ? '₹' : '$';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && <div className="h-64 bg-white rounded-xl animate-pulse" />}
        {restaurant && (
          <div className="flex gap-8">
            {/* Menu */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">←</button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{restaurant.name}</h1>
                  <p className="text-gray-500 text-sm">{restaurant.cuisine}</p>
                </div>
              </div>

              {success && <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}
              {err && <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{err}</div>}

              {categories.map((cat: any) => (
                <div key={cat} className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{cat}</h2>
                  <div className="space-y-3">
                    {restaurant.menuItems.filter((m: any) => m.category === cat).map((item: any) => {
                      const cartItem = cart.find(c => c.menuItemId === item.id);
                      return (
                        <div key={item.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-gray-400 text-sm">{item.description}</p>
                            <p className="text-orange-600 font-semibold mt-1">{currency}{item.price}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {cartItem ? (
                              <>
                                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold hover:bg-orange-200 transition-colors">−</button>
                                <span className="w-6 text-center font-semibold">{cartItem.quantity}</span>
                                <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors">+</button>
                              </>
                            ) : (
                              <button onClick={() => addToCart(item)} className="px-4 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">Add</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Cart */}
            <div className="w-80 shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
                <h2 className="font-bold text-gray-800 mb-4">Your Cart</h2>
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">Add items to get started</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cart.map(c => (
                        <div key={c.menuItemId} className="flex justify-between text-sm">
                          <span className="text-gray-700">{c.name} × {c.quantity}</span>
                          <span className="font-medium">{currency}{(c.price * c.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-gray-800 mb-4">
                      <span>Total</span>
                      <span>{currency}{total.toFixed(2)}</span>
                    </div>
                    <button onClick={placeOrder} disabled={ordering} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                      {ordering ? 'Placing...' : 'Place Order'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
