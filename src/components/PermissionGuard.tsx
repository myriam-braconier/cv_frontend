// components/PermissionGuard.tsx
import { ReactNode, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  permissions: string[];
  children: ReactNode;
  type?: 'all' | 'any';
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

export const PermissionGuard = ({
  permissions,
  children,
  type = 'any',
  fallback = null,
  loadingComponent = <div>Chargement...</div>
}: PermissionGuardProps) => {
  const { hasAllPermissions, hasAnyPermission, loading } = usePermissions();

  // Calculer hasAccess une seule fois avec useMemo
  const hasAccess = useMemo(() => {
    return type === 'all'
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }, [type, permissions, hasAllPermissions, hasAnyPermission]);

  // Log pour le développement
  if (process.env.NODE_ENV === 'development') {
    console.log('PermissionGuard:', {
      permissions,
      type,
      loading,
      hasAccess,
    });
  }

  // Afficher le composant de chargement si nécessaire
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // Retourner les enfants ou le fallback selon les permissions
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};