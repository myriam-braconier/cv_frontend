"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

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
  href: `/${string}` | "/";
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

export default function Navbar() {
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
        
        if (response.ok) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [pathname, loadUserData]);

  const renderNavLinks = () => (
    <div className="flex items-baseline space-x-4">
      <NavLink href="/synthetisers">Synthétiseurs</NavLink>
      <NavLink href="/auctions">Tableau d&apos;enchères</NavLink>
      <NavLink href="/about">A propos</NavLink>
    </div>
  );

  const renderUserMenu = () => (
    <div className="flex items-center space-x-4">
      <span className="text-red-600">
        Bienvenue, {user?.username || user?.email?.split("@")[0] || "Utilisateur"}
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
        className="bg-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors duration-200"
      >
        Inscription
      </Link>
    </div>
  );

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              Concrete Vibes
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-4">
            {renderNavLinks()}
            {user ? renderUserMenu() : renderAuthButtons()}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icône menu */}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLinks()}
            <div className="pt-4">
              {user ? renderUserMenu() : renderAuthButtons()}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}