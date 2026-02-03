import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/common/LoadingState';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['super_admin', 'admin', 'support', 'finance', 'operations']);

      setIsAdmin(roles && roles.length > 0);
      setCheckingRole(false);
    };

    if (!isLoading) {
      checkAdminRole();
    }
  }, [user, isLoading]);

  if (isLoading || checkingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState message="Verifying admin access..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/auth" replace />;
  }

  return <>{children}</>;
}
