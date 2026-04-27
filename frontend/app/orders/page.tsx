'use client';
import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { GET_ORDERS, CHECKOUT, CANCEL_ORDER, GET_PAYMENT_METHODS } from '@/lib/graphql/queries';
import { getUser, canCheckout, canCancel } from '@/lib/auth';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export default function OrdersPage() {
  const user = getUser();
  const { data, loading, refetch } = useQuery(GET_ORDERS);
  const { data: pmData } = useQuery(GET_PAYMENT_METHODS);
  const [checkout, { loading: checkingOut }] = useMutation(CHECKOUT);
  const [cancelOrder, { loading: cancelling }] = useMutation(CANCEL_ORDER);
  const [selectedPm, setSelectedPm] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');

  const currency = user?.country === 'INDIA' ? '₹' : '$';

  const handleCheckout = async (orderId: string) => {
    const pmId = selectedPm[orderId];
    if (!pmId) { setMsg('Select a payment method first'); return; }
    try {
      await checkout({ variables: { orderId, paymentMethodId: pmId } });
      setMsg('Order confirmed!');
      refetch();
    } catch (e: any) { setMsg(e.message); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder({ variables: { orderId } });
      setMsg('Order cancelled.');
      refetch();
    } catch (e: any) { setMsg(e.message); }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>
        {msg && <div className="mb-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm">{msg}</div>}
        {loading && <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />)}</div>}
        {data?.orders?.length === 0 && <p className="text-gray-400 text-center py-16">No orders yet. Go order some food!</p>}
        <div className="space-y-4">
          {data?.orders?.map((order: any) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800">{order.restaurant.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                  {user?.role !== 'MEMBER' && <p className="text-gray-500 text-xs mt-0.5">by {order.user.name}</p>}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>{order.status}</span>
              </div>
              <div className="space-y-1 mb-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span>{item.menuItem.name} × {item.quantity}</span>
                    <span>{currency}{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-bold text-gray-800">{currency}{order.totalAmount.toFixed(2)}</span>
                {order.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    {canCheckout(user?.role || '') && pmData?.paymentMethods?.length > 0 && (
                      <>
                        <select
                          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
                          value={selectedPm[order.id] || ''}
                          onChange={e => setSelectedPm(p => ({ ...p, [order.id]: e.target.value }))}
                        >
                          <option value="">Select payment</option>
                          {pmData.paymentMethods.map((pm: any) => (
                            <option key={pm.id} value={pm.id}>{pm.type} •••• {pm.last4}</option>
                          ))}
                        </select>
                        <button onClick={() => handleCheckout(order.id)} disabled={checkingOut} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                          Checkout
                        </button>
                      </>
                    )}
                    {canCancel(user?.role || '') && (
                      <button onClick={() => handleCancel(order.id)} disabled={cancelling} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
