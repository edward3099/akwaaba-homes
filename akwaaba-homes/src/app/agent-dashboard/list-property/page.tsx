import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AgentLayout from '@/components/admin/AgentLayout';
import PropertyListingForm from '@/components/admin/PropertyListingForm';

export default function ListPropertyPage() {
  return (
    <ProtectedRoute allowedRoles={['agent']} redirectTo="/auth">
      <AgentLayout>
        <PropertyListingForm />
      </AgentLayout>
    </ProtectedRoute>
  );
}
