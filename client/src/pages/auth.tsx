import AuthWrapper from '@/components/auth/AuthWrapper';
import Dashboard from './dashboard';

export default function AuthPage() {
  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  );
}