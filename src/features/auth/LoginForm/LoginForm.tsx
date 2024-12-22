import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/axios';
import { AxiosError } from 'axios';

// Event émetteur global pour la mise à jour du nom d'utilisateur
const updateUsername = () => {
    const event = new Event('usernameUpdated');
    window.dispatchEvent(event);
};

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.token) {
                // Sauvegarder les données essentielles
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.username);
                
                // Mettre à jour axios
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                // Émettre l'événement pour mettre à jour la navbar
                updateUsername();
                
                // Rediriger
                router.push('/');
            }
        } catch (err) {
            setError(err instanceof AxiosError ? 
                err.response?.data?.message || "Erreur de connexion" 
                : "Erreur inattendue"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="appearance-none rounded-t-md relative block w-full px-3 py-2 border"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        required
                        className="appearance-none rounded-b-md relative block w-full px-3 py-2 border"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {error && (
                <div className="text-red-600 text-center">{error}</div>
            )}

            <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
            >
                {isLoading ? "Connexion..." : "Se connecter"}
            </button>
        </form>
    );
}