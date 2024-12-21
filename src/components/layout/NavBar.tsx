"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface User {
    username: string;
    role: string;  // Ajout de role qui était utilisé mais pas dans l'interface
}

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);  // Ajout de l'état manquant
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Vérifier l'état initial de l'authentification
        const checkAuth = () => {
            const username = localStorage.getItem('username');
            const role = localStorage.getItem('userRole');
            if (username && role) {
                setUser({ username, role });
            } else {
                setUser(null);
            }
        };

        // Vérifier au chargement
        checkAuth();

        // Écouter les changements
        const handleAuthChange = () => checkAuth();
        window.addEventListener('usernameUpdated', handleAuthChange);
        
        return () => {
            window.removeEventListener('usernameUpdated', handleAuthChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        setUser(null);
        router.push("/login");
        // Émettre l'événement pour informer les autres composants
        window.dispatchEvent(new Event('usernameUpdated'));
    };


	return (
		<nav className="bg-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo and main links */}
					<div className="flex items-center">
						<Link href="/" className="flex-shrink-0">
							<Image
								src="../public/images/globe.svg"
								alt="logo"
								width={100}
								height={100}
							/>
						</Link>
						<div className="hidden md:block">
							<div className="ml-10 flex items-baseline space-x-4">
								<Link
									href="/synthetisers"
									className={`${
										pathname === "/synthList"
											? "bg-gray-900 text-white"
											: "text-gray-300 hover:bg-gray-700 hover:text-white"
									} px-3 py-2 rounded-md text-sm font-medium`}
								>
									Synthétiseurs
								</Link>
								{user && (
									<Link
										href="/favorites"
										className={`${
											pathname === "/favorites"
												? "bg-gray-900 text-white"
												: "text-gray-300 hover:bg-gray-700 hover:text-white"
										} px-3 py-2 rounded-md text-sm font-medium`}
									>
										Favoris
									</Link>
								)}
							</div>
						</div>
					</div>

					{/* Auth Buttons */}
					<div className="hidden md:block">
						<div className="ml-4 flex items-center md:ml-6">
							{user ? (
								<>
									<span className="text-gray-300 mr-4">
										Bienvenue, {user.username}
									</span>
									<button
										onClick={handleLogout}
										className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
									>
										Déconnexion
									</button>
								</>
							) : (
								<>
									<Link
										href="/login"
										className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
									>
										Connexion
									</Link>
									<Link
										href="/register"
										className="bg-indigo-500 text-white hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium ml-2"
									>
										Inscription
									</Link>
								</>
							)}
						</div>
					</div>

					{/* Mobile Menu remains the same but with user condition */}
					<div className="md:hidden flex items-center">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
						>
							<span className="sr-only">Main Menu</span>
							{!isOpen ? (
								<svg
									className="block h-6 w-6"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							) : (
								<svg
									className="block h-6 w-6"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Menu with user condition */}
			{isOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						<Link
							href="/"
							className={`${
								pathname === "synthList"
									? "bg-gray-900 text-white"
									: "text-gray-300 hover:bg-gray-700 hover:text-white"
							} block px-3 py-2 rounded-md text-base font-medium`}
						>
							Synthétiseurs
						</Link>
						{user ? (
							<>
								<Link
									href="/favorites"
									className={`${
										pathname === "/favorites"
											? "bg-gray-900 text-white"
											: "text-gray-300 hover:bg-gray-700 hover:text-white"
									} block px-3 py-2 rounded-md text-base font-medium`}
								>
									Favoris
								</Link>
								<span className="block px-3 py-2 text-gray-300">
									{user.username}
								</span>
								<button
									onClick={handleLogout}
									className="text-gray-300 hover:bg-gray-700 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
								>
									Déconnexion
								</button>
							</>
						) : (
							<>
								<Link
									href="/login"
									className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
								>
									Connexion
								</Link>
								<Link
									href="/register"
									className="bg-indigo-500 text-white hover:bg-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
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
