import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import AgentLayout from '@/components/admin/AgentLayout';
import AgentDashboard from '@/components/admin/AgentDashboard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function AgentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['agent', 'developer']} redirectTo="/auth">
      <ProfileCompletionGuard>
        <ErrorBoundary>
          <AgentLayout>
            <AgentDashboard />
          </AgentLayout>
        </ErrorBoundary>
      </ProfileCompletionGuard>
    </ProtectedRoute>
  );
}
