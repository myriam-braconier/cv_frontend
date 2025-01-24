import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from "@/config/constants";

interface Permission {
  id: number;
  name: string;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('🚫 Aucun token trouvé');
          setPermissions([]);
          setLoading(false);
          return;
        }
        
        console.log('✅ Token trouvé:', token.substring(0, 20) + '...');
        console.log('🔄 Tentative de requête vers:', `${API_URL}/api/users/permissions`);
        
        // Définition de config ici
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          withCredentials: true
        };

        const response = await axios.get(`${API_URL}/api/users/permissions`, config);
        console.log('📥 Réponse brute:', response.data);
        
        if (response.data && response.data.permissions) {
          const perms = response.data.permissions.map((p: Permission) => p.name);
          console.log('✨ Permissions parsées:', perms);
          setPermissions(perms);
        } else {
          console.warn('⚠️ Format de réponse inattendu:', response.data);
          setPermissions([]);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('❌ Erreur Axios:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          setError(`Erreur: ${error.response?.data?.message || error.message}`);
        } else {
          console.error('❌ Erreur non-Axios:', error);
          setError('Erreur inattendue lors de la récupération des permissions');
        }
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (loading) return false;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    console.log('Current user permissions:', permissions);
    console.log('Checking for permissions:', requiredPermissions);
    if (loading) return false;
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (loading) return false;
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    error
  };
};