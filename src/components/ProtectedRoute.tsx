import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserApprovalStatus } from '@/hooks/useUserApproval';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: approvalStatus, isLoading: approvalLoading } = useUserApprovalStatus(user?.id);

  if (loading || approvalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">caricamento...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is approved
  if (approvalStatus && !approvalStatus.approved) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}
