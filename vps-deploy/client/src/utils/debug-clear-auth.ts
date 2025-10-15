// Debug utility to clear auth state
export function clearAuthState() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isAuthenticated');
  console.log('Auth state cleared from localStorage');
  window.location.reload();
}

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAuthState = clearAuthState;
}