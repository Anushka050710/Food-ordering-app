import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  country: 'INDIA' | 'AMERICA';
}

export function getUser(): User | null {
  try {
    const u = Cookies.get('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: User) {
  Cookies.set('token', token, { expires: 7 });
  Cookies.set('user', JSON.stringify(user), { expires: 7 });
}

export function clearAuth() {
  Cookies.remove('token');
  Cookies.remove('user');
}

export function canCheckout(role: string) {
  return role === 'ADMIN' || role === 'MANAGER';
}

export function canCancel(role: string) {
  return role === 'ADMIN' || role === 'MANAGER';
}

export function canManagePayments(role: string) {
  return role === 'ADMIN';
}
