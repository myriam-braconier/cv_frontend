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
    <div className="flex items-baseline space-x-8 "  >
      <NavLink href="/synthetisers">Synthétiseurs</NavLink>
      <NavLink href="/auctions">Enchères</NavLink>
      <NavLink href="/about">A propos</NavLink>
    </div>
  );

  const renderUserMenu = () => (
    <div className="flex items-center space-x-4">
      <span className="text-red-600">
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
    <div className="space-x-4 text-center">
      <Link
        href="/login"
        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-black transition-colors duration-200"
      >
        Connexion
      </Link>
      <Link
        href="/register"
        className="bg-white hover:bg-gray-800 px-3 py-2 rounded-md text-black hover:text-white transition-colors duration-200"
      >
        Inscription
      </Link>
    </div>
  );

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logosound.jpg"
                alt="Logo CV"
                width={48}
                height={48}
                className="rounded-full"
                priority
              />
              <span className="text-xl font-bold ml-8">Concrete Vibes</span>
            </Link>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex md:items-center md:justify-between md:flex-grow ml-6">
            <div className="flex-1">
              {renderNavLinks()}
            </div>
            <div className="ml-4">
              {user ? renderUserMenu() : renderAuthButtons()}
            </div>
          </div>

          {/* Menu burger pour mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-700"
            >
              <span className="sr-only">Menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
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
                    d="M4 6h16M4 12h16M4 18h16"
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLinks()}
            <div className="pt-4 pb-3 border-t border-gray-700">
              {user ? renderUserMenu() : renderAuthButtons()}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}