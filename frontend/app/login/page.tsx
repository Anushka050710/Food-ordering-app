'use client';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { LOGIN, REGISTER } from '@/lib/graphql/queries';
import { setAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'MEMBER', country: 'INDIA' });
  const [error, setError] = useState('');

  const [login, { loading: loginLoading }] = useMutation(LOGIN);
  const [register, { loading: regLoading }] = useMutation(REGISTER);

  const loading = loginLoading || regLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        const { data } = await register({ variables: { input: form } });
        setAuth(data.register.token, data.register.user);
      } else {
        const { data } = await login({ variables: { input: { email: form.email, password: form.password } } });
        setAuth(data.login.token, data.login.user);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-800">FoodOrder</h1>
          <p className="text-gray-500 text-sm mt-1">Role-based food ordering platform</p>
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button onClick={() => setIsRegister(false)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isRegister ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>Sign In</button>
          <button onClick={() => setIsRegister(true)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isRegister ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          )}
          <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input type="password" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          {isRegister && (
            <>
              <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="MEMBER">Member</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
                <option value="INDIA">🇮🇳 India</option>
                <option value="AMERICA">🇺🇸 America</option>
              </select>
            </>
          )}
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Demo accounts (password: password123)</p>
          <p>admin@india.com · manager@india.com · member@india.com</p>
          <p>admin@america.com · manager@america.com · member@america.com</p>
        </div>
      </div>
    </div>
  );
}
