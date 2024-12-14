'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username?: string;
  };
}

interface LoginError {
  message: string;
  statusCode: number;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Données de connexion:', { email, password });
    setError(null);
    setIsLoading(true);

    // Validation des champs
    if (!email.trim() || !password.trim()) {
      setError('Email et mot de passe requis');
      setIsLoading(false);
      return;
    }

    // Validation basique du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format d\'email invalide');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Envoi de la requête à:', 'http://localhost:4000/api/auth/login');
      const response = await axios.post<LoginResponse>(
        'http://localhost:4000/api/auth/login',
        { 
          email: email.trim(), 
          password: password.trim() 
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      console.log('Réponse du serveur:', response.data);

      if (response.data && response.data.token) {
        // Stockage sécurisé des données
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Nettoyage des états
        setEmail('');
        setPassword('');
        setError(null);
        
        // Redirection
        router.push('/');
      } else {
        throw new Error('Réponse invalide du serveur');
      }
      
    } catch (error) {
      console.error('Erreur complète:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<LoginError>;
        if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else if (axiosError.request) {
          setError('Erreur de connexion au serveur. Veuillez réessayer.');
        } else {
          setError('Erreur lors de la tentative de connexion');
        }
      } else {
        setError('Une erreur inattendue est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Connexion à votre compte</h3>
        
        {/* Affichage des erreurs */}
        {error && (
          <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block">Mot de passe</label>
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-900'
                }`}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
);
}
