import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';
import { useAuth } from "@/hooks/useAuth";


export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login(email, password);
            
            // Get the callback URL if it exists
            const callbackUrl = searchParams.get('callbackUrl');
            // Redirect to callback URL or home
            router.push(callbackUrl || `/`);
            
        } catch (err) {
            setError(
                err instanceof AxiosError 
                    ? err.response?.data?.message || "Erreur de connexion"
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
                        className="appearance-none rounded-t-md relative block w-full px-3 py-2 border text-black"
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
                        className="appearance-none rounded-b-md relative block w-full px-3 py-2 border text-black"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {error && (
                <div className="text-red-600 text-center">{error}</div>
            )}

            <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-900/50 hover:bg-blue-800 disabled:opacity-50"
                disabled={isLoading}
            >
                {isLoading ? "Connexion..." : "Se connecter"}
            </button>
        </form>
    );
}