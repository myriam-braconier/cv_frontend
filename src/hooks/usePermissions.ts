import { useState, useEffect } from 'react';
import axios from 'axios';

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
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          withCredentials: true
        };

        console.log('🚀 Requête vers /api/users/permissions');
        
        // URL corrigée pour correspondre à la route définie dans app.js
        const response = await axios.get('/api/users/permissions', config);
        
        console.log('📥 Réponse reçue:', response.data);
        
        if (response.data && response.data.success && response.data.permissions) {
          const perms = response.data.permissions.map((p: Permission) => p.name);
          console.log('✨ Permissions extraites:', perms);
          setPermissions(perms);
        } else {
          console.warn('⚠️ Format de réponse inattendu:', response.data);
          setPermissions([]);
        }
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des permissions:');
        
        if (axios.isAxiosError(error)) {
          console.error('Type: Erreur Axios');
          console.error('Message:', error.message);
          console.error('URL:', error.config?.url);
          
          if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Status Text:', error.response.statusText);
            console.error('Response Data:', error.response.data);
            
            // Messages d'erreur plus spécifiques
            if (error.response.status === 401) {
              setError('Token expiré ou invalide. Veuillez vous reconnecter.');
              // Optionnel: rediriger vers login ou clear token
              // localStorage.removeItem('token');
            } else if (error.response.status === 403) {
              setError('Accès refusé. Permissions insuffisantes.');
            } else if (error.response.status === 404) {
              setError('Endpoint des permissions non trouvé.');
            } else {
              setError(`Erreur ${error.response.status}: ${error.response.data?.error || error.response.statusText}`);
            }
          } else if (error.request) {
            console.error('Pas de réponse du serveur');
            setError('Pas de réponse du serveur. Vérifiez votre connexion.');
          } else {
            console.error('Erreur de configuration:', error.message);
            setError(`Erreur de configuration: ${error.message}`);
          }
        } else {
          console.error('Type: Erreur non-Axios');
          console.error('Error object:', error);
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
    const result = permissions.includes(permission);
    console.log(`🔍 hasPermission("${permission}"):`, result);
    return result;
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    console.log('🔍 hasAnyPermission check:');
    console.log('  Current user permissions:', permissions);
    console.log('  Required permissions:', requiredPermissions);
    
    if (loading) {
      console.log('  Result: false (still loading)');
      return false;
    }
    
    const result = requiredPermissions.some(permission => hasPermission(permission));
    console.log('  Result:', result);
    return result;
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    console.log('🔍 hasAllPermissions check:');
    console.log('  Current user permissions:', permissions);
    console.log('  Required permissions:', requiredPermissions);
    
    if (loading) {
      console.log('  Result: false (still loading)');
      return false;
    }
    
    const result = requiredPermissions.every(permission => hasPermission(permission));
    console.log('  Result:', result);
    return result;
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