import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AgentLayout from '@/components/admin/AgentLayout';
import AgentDashboard from '@/components/admin/AgentDashboard';

export default function AgentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['agent']} redirectTo="/auth">
      <AgentLayout>
        <AgentDashboard />
      </AgentLayout>
    </ProtectedRoute>
  );
}
