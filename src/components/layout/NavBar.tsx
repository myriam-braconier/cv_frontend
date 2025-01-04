"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

type UserType = {
	username?: string;
	email?: string;
	role?: string[];
} | null;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const NavLink = ({
	href,
	children,
	className = "",
}: {
	href: `/${string}` | "/"; // Type strict pour les chemins d'URL
	children: React.ReactNode;
	className?: string;
}) => (
	<Link
		href={href}
		className={`px-3 py-2 rounded-md transition-colors duration-200 hover:bg-gray-700/50 ${className}`}
	>
		{children}
	</Link>
);

const Navbar = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [user, setUser] = useState<UserType>(null);
	const router = useRouter();
	const pathname = usePathname();

	const handleLogout = useCallback(async () => {
		try {
			const token = localStorage.getItem("token");
			if (token) {
				await fetch(`${API_URL}/auth/logout`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					credentials: "include",
				});
			}
		} catch (error) {
			console.error("Erreur lors de la déconnexion:", error);
		} finally {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			setUser(null);
			router.push("/");
		}
	}, [router]);

	const loadUserData = useCallback(async () => {
		try {
			const token = localStorage.getItem("token");
			if (token) {
				const response = await fetch(`${API_URL}/auth/verify`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					credentials: "include",
				});

				if (!response.ok) {
					handleLogout();
					return;
				}

				const storedUser = localStorage.getItem("user");
				if (storedUser) {
					setUser(JSON.parse(storedUser));
				}
			}
		} catch (error) {
			console.error("Erreur lors du chargement des données:", error);
			handleLogout();
		}
	}, [handleLogout]);

	useEffect(() => {
		loadUserData();
	}, [pathname, loadUserData]);

	const renderNavLinks = () => (
		<div className="flex items-baseline space-x-4">
			<NavLink href="/synthetisers">Synthétiseurs</NavLink>
			<NavLink href="/auctions">Tableau d&apos;enchères</NavLink>
		</div>
	);

	const renderUserMenu = () => (
		<div className="flex items-center space-x-4">
			<span className="text-red-600">
				Bienvenue,{" "}
				{user?.username || user?.email?.split("@")[0] || "Utilisateur"}
			</span>
			<button
				onClick={handleLogout}
				className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-black transition-colors duration-200"
			>
				Déconnexion
			</button>
		</div>
	);

	const renderAuthButtons = () => (
		<div className="space-x-4">
			<Link
				href="/login"
				className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-black transition-colors duration-200"
			>
				Connexion
			</Link>
			<Link
				href="/register"
				className="bg-black hover:bg-gray-800 px-3 py-2 rounded-md transition-colors duration-200"
			>
				Inscription
			</Link>
		</div>
	);

	return (
		<nav className="bg-transparent/80 backdrop-blur-sm text-red-500 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					<div className="flex items-center">
						<Link href="/" className="flex-shrink-0">
							<Image
								src="/images/logosound.jpg"
								alt="Logo"
								width={48}
								height={48}
								sizes="(max-width: 768px) 40px, 48px"
								className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full object-cover hover:opacity-80 transition-opacity duration-200"
								priority
							/>
						</Link>
						<div className="hidden md:block ml-10">{renderNavLinks()}</div>
					</div>
					<div className="hidden md:block">
						{user ? renderUserMenu() : renderAuthButtons()}
					</div>
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="md:hidden p-2 rounded-md hover:bg-gray-700/50 focus:outline-none transition-colors duration-200"
						aria-label="Menu"
					>
						<svg
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Menu mobile */}
			{isOpen && (
				<div className="md:hidden fixed top-16 left-0 right-0 bg-black/90 backdrop-blur-sm z-50">
					<div className="p-4 flex flex-col gap-4 text-center">
						<NavLink
							href="/synthetisers"
							className="block py-2 hover:bg-gray-700/50 rounded-md px-3"
						>
							Synthétiseurs
						</NavLink>
						<NavLink
							href="/auctions"
							className="block py-2 hover:bg-gray-700/50 rounded-md px-3"
						>
							Tableau d&apos;enchères
						</NavLink>
						
						{user ? (
							<>
								<div className="px-3 py-2">
									<span className="text-gray-300">
										Bienvenue{" "}
										<span className="font-medium text-white">
											{user.username ||
												user.email?.split("@")[0] ||
												"Utilisateur"}
										</span>
									</span>
								</div>
								<button
									onClick={handleLogout}
									className="text-left px-3 py-2 hover:bg-gray-700/50 rounded-md"
								>
									Déconnexion
								</button>
							</>
						) : (
							<div className="space-y-2">
								<Link
									href="/login"
									className="block bg-red-500 hover:bg-red-700 px-3 py-2 rounded-md text-black text-center"
								>
									Connexion
								</Link>
								<Link
									href="/register"
									className="block bg-black hover:bg-gray-800 px-3 py-2 rounded-md text-center border border-gray-700"
								>
									Inscription
								</Link>
							</div>
						)}
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
