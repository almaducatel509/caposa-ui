import AxiosInstance from "./axiosInstance";

export async function login(username: string, password: string) {
  // CRITICAL: Check if we're on client side before doing anything
  if (typeof window === 'undefined') {
    throw new Error('Login can only be called on client side');
  }

  try {
    const res = await AxiosInstance.post('token/', { 
      username, 
      password 
    });
    
    const { access, refresh } = res.data;
    
    // Safe to use localStorage here since we checked above
    localStorage.setItem('token', access);
    localStorage.setItem('refresh', refresh);
    
    return res.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    window.location.href = '/login';
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
