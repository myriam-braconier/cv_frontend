"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_URL } from '@/config/constants';

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [hasInstrument, setHasInstrument] = useState<boolean>(false); // Ajout du state pour has_instrument
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

        try {
            const roleId = hasInstrument ? 5 : 2; // 5 pour owner, 1 pour user
            console.log('Role ID attribué:', roleId); // Pour déboguer
            const response = await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password,
                has_instrument: hasInstrument,
                roleId
            });

            if (response.status === 201) {
                router.push(`${API_URL}/login`);
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
                    <label htmlFor="username" className="block mb-2">Nom d&apos;utilisateur</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block mb-2">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block mb-2">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block mb-2">Confirmer le mot de passe</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                {/* Ajout du sélecteur has_instrument */}
                <div className="mb-4">
                    <label className="block mb-2">Possédez-vous un instrument ?</label>
                    <div className="flex gap-4">
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
                <div className="text-red-500 text-center">{error}</div>
            )}

            <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white py-2 rounded`}
            >
                {loading ? "Chargement..." : "S'inscrire"}
            </button>
        </form>
    );
}