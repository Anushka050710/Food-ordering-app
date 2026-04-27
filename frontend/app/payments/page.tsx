'use client';
import { useQuery, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { GET_PAYMENT_METHODS, ADD_PAYMENT_METHOD, UPDATE_PAYMENT_METHOD, DELETE_PAYMENT_METHOD, GET_USERS } from '@/lib/graphql/queries';
import { getUser, canManagePayments } from '@/lib/auth';

export default function PaymentsPage() {
  const router = useRouter();
  const user = getUser();
  const { data, loading, refetch } = useQuery(GET_PAYMENT_METHODS);
  const { data: usersData } = useQuery(GET_USERS);
  const [addPm] = useMutation(ADD_PAYMENT_METHOD);
  const [updatePm] = useMutation(UPDATE_PAYMENT_METHOD);
  const [deletePm] = useMutation(DELETE_PAYMENT_METHOD);
  const [form, setForm] = useState({ userId: '', type: 'Credit Card', last4: '', expiryDate: '', isDefault: false });
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user && !canManagePayments(user.role)) router.replace('/dashboard');
  }, [user, router]);

  if (!user || !canManagePayments(user.role)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updatePm({ variables: { id: editing, ...form } });
        setMsg('Payment method updated');
        setEditing(null);
      } else {
        await addPm({ variables: form });
        setMsg('Payment method added');
      }
      setForm({ userId: '', type: 'Credit Card', last4: '', expiryDate: '', isDefault: false });
      refetch();
    } catch (e: any) { setMsg(e.message); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleEdit = (pm: any) => {
    setEditing(pm.id);
    setForm({ userId: pm.userId, type: pm.type, last4: pm.last4, expiryDate: pm.expiryDate, isDefault: pm.isDefault });
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePm({ variables: { id } });
      setMsg('Payment method deleted');
      refetch();
    } catch (e: any) { setMsg(e.message); }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment Methods</h1>
        {msg && <div className="mb-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm">{msg}</div>}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">{editing ? 'Edit' : 'Add'} Payment Method</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} required>
              <option value="">Select User</option>
              {usersData?.users?.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>Credit Card</option>
              <option>Debit Card</option>
              <option>UPI</option>
              <option>Net Banking</option>
            </select>
            <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Last 4 digits" maxLength={4} value={form.last4} onChange={e => setForm({ ...form, last4: e.target.value })} required />
            <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Expiry (MM/YY)" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} required />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
              Set as default
            </label>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                {editing ? 'Update' : 'Add'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm({ userId: '', type: 'Credit Card', last4: '', expiryDate: '', isDefault: false }); }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {loading && <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>}
        <div className="space-y-3">
          {data?.paymentMethods?.map((pm: any) => (
            <div key={pm.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{pm.type} •••• {pm.last4}</p>
                <p className="text-gray-400 text-sm">Expires {pm.expiryDate} {pm.isDefault && <span className="text-green-600 font-semibold">• Default</span>}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(pm)} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 text-sm font-medium rounded-lg transition-colors">Edit</button>
                <button onClick={() => handleDelete(pm.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
