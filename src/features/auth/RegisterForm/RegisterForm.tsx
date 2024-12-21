"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [hasInstrument, setHasInstrument] = useState<boolean | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            setLoading(false);
            return;
        }

        if (hasInstrument === null) {
            setError("Veuillez indiquer si vous possédez un instrument");
            setLoading(false);
            return;
        }

        try {
            const roleId = hasInstrument ? 4 : 1; // 2 pour creator, 1 pour user

            const response = await axios.post("http://localhost:4000/auth/register", {
                username,
                email,
                password,
                has_instrument: hasInstrument,
                roleId: roleId // Attribution dynamique du rôle
            });

            if (response.status === 201) {
                router.push("/login");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Erreur:', error.response?.data);
                setError(error.response?.data?.message || "Erreur lors de l'inscription");
            } else {
                setError("Une erreur inattendue est survenue");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <form onSubmit={handleRegister} className="mt-8 space-y-6">
            <div className="rounded-md -space-y-px">
                <div className="mb-4">
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                        Nom d&apos;utilisateur
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                        Confirmer le mot de passe
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Possédez-vous un instrument ?
                    </label>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="hasInstrument"
                                checked={hasInstrument === true}
                                onChange={() => setHasInstrument(true)}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Oui</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="hasInstrument"
                                checked={hasInstrument === false}
                                onChange={() => setHasInstrument(false)}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Non</span>
                        </label>
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className={`w-full ${
                    loading 
                        ? "bg-gray-400" 
                        : "bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                } text-white py-2 rounded transition-colors duration-200`}
            >
                {loading ? "Chargement..." : "S'inscrire"}
            </button>
        </form>
    );
}