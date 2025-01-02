"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface User {
    username?: string;
    email?: string;
    role?: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Définir handleLogout avec useCallback
    const handleLogout = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include'
                });
            }
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            router.push('/');
        }
    }, [router]);

    // Définir loadUserData avec useCallback
    const loadUserData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const response = await fetch(`${API_URL}/auth/verify`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    handleLogout();
                    return;
                }

                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                }
            }
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            handleLogout();
        }
    }, [handleLogout]);

    // useEffect pour charger les données utilisateur
    useEffect(() => {
        loadUserData();
    }, [pathname, loadUserData]);



	return (
		<nav className="bg-transparent text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					{/* Logo et liens principaux */}
					<div className="flex items-center">
						<Link href="/" className="flex-shrink-0">
							<Image
								src="/images/sound.gif"
								alt="Logo"
								width={32}
								height={32}
								className="rounded-full"
							/>
						</Link>
						<div className="hidden md:block ml-10">
							<div className="flex items-baseline space-x-4">
								<Link
									href="/synthetisers"
									className="hover:bg-gray-700 px-3 py-2 rounded-md"
								>
									Synthétiseurs
								</Link>
								<Link
									href="/auctions"
									className="hover:bg-gray-700 px-3 py-2 rounded-md"
								>
									Tableau d&apos;enchères
								</Link>
							</div>
						</div>
					</div>

					{/* Menu utilisateur */}
					<div className="hidden md:block">
						<div className="flex items-center">
							{user ? (
								<div className="flex items-center space-x-4">
									<span className="text-gray-300">
										Bienvenue,{" "}
										{user.username ||
											user.email?.split("@")[0] ||
											"Utilisateur"}
									</span>
									<button
										onClick={handleLogout}
										className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md"
									>
										Déconnexion
									</button>
								</div>
							) : (
								<div className="space-x-4">
									<Link
										href="/login"
										className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md"
									>
										Connexion
									</Link>
									<Link
										href="/register"
										className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md"
									>
										Inscription
									</Link>
								</div>
							)}
						</div>
					</div>

					{/* Bouton menu mobile */}
					<div className="md:hidden">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
						>
							<span className="sr-only">Ouvrir le menu</span>
							{/* Icône menu */}
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								{isOpen ? (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								) : (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16m-7 6h7"
									/>
								)}
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Menu mobile */}
			{isOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1">
						<Link
							href="/synthetisers"
							className="block hover:bg-gray-700 px-3 py-2 rounded-md"
						>
							Synthétiseurs
						</Link>
						{user ? (
							<>
								<span className="block px-3 py-2 text-gray-300">
									Bienvenue,{" "}
									{user.username || user.email?.split("@")[0] || "Utilisateur"}
								</span>
								<button
									onClick={handleLogout}
									className="w-full text-left hover:bg-gray-700 px-3 py-2 rounded-md"
								>
									Déconnexion
								</button>
							</>
						) : (
							<>
								<Link
									href="/login"
									className="block hover:bg-gray-700 px-3 py-2 rounded-md"
								>
									Connexion
								</Link>
								<Link
									href="/register"
									className="block hover:bg-gray-700 px-3 py-2 rounded-md"
								>
									Inscription
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);

}
