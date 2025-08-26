'use client';
import { useState, useEffect } from 'react';
import { User, Profile } from '@/features/users/types/types';
import { Synth, Post } from '@/features/synthetisers/types/synth';
import { UserCard } from '../cards';  // Import depuis l'index.ts



interface UsersListProps {
  users: (User & { 
    profile?: Profile;
    posts?: Post[];
  })[];
  synthetisers: { [key: number]: Synth };
}

export function UsersList({ users: initialUsers, synthetisers }: UsersListProps) {
  const [users, setUsers] = useState<(User & { posts?: Post[]; profile?: Profile })[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsersWithPosts = async () => {
      setIsLoading(true);
      try {
        console.log("Tentative de fetch à l'URL:", `/api/users/with-posts`);
        
        const response = await fetch(`/api/users/users-with-posts`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });

        // Log de la réponse de manière compatible TypeScript
        console.log("Statut de la réponse:", response.status);
        console.log("Headers:", {
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Détails de l\'erreur:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Données reçues:", data);

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Format de données incorrect:", data);
          throw new Error("Format de données incorrect reçu du serveur");
        }
      } catch (error) {
        console.error("Erreur complète:", error);
        setError(error instanceof Error ? error.message : 'Erreur lors du chargement des utilisateurs');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsersWithPosts();
  }, []);

  console.log("État actuel des users:", users);

  if (isLoading) {
    return <div className="text-center text-gray-500 p-4">Chargement des utilisateurs...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Erreur: {error}</p>
        <p className="text-sm mt-2">Veuillez rafraîchir la page ou contacter le support si le problème persiste.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          profile={user.profile}
          posts={user.posts || []}
          synthetisers={synthetisers}
          role={user.role} // Add this line assuming role is part of the user object
        />
      ))}
    </div>
  );
}