'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Changé de next/router à next/navigation

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Récupérer l'utilisateur du localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          router.push('/');
          return;
        }

        const user = JSON.parse(userStr);
        // Vérifier si l'utilisateur a le rôle admin
        if (user?.role === 'admin') {
          setIsAdmin(true);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut admin:', error);
        router.push('/');
      }
    };

    checkAdminStatus();
  }, [router]); // Ajout de router dans les dépendances

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord Administrateur</h1>
  
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Utilisateurs Totaux</h3>
            <p className="text-2xl font-bold">150</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Utilisateurs Actifs</h3>
            <p className="text-2xl font-bold text-green-600">125</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Nouveaux (30j)</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Rôles</h3>
            <p className="text-2xl font-bold">4</p>
          </div>
        </div>
  
        {/* Liste des Utilisateurs */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Liste des Utilisateurs</h2>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Ajouter un Utilisateur
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Exemple d'une ligne */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">1</td>
                  <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                  <td className="px-6 py-4 whitespace-nowrap">john@example.com</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Admin
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Actif
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Éditer</button>
                    <button className="text-red-600 hover:text-red-900">Supprimer</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default AdminDashboard;
