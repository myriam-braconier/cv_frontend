"use client";

import RegisterForm from '@/features/auth/RegisterForm';
import BackgroundRotator from "@/components/BackgroundRotator";


export default function RegisterPage() {
  const images = [
    "/images/login2.webp",
		"/images/login.webp",
		
		
	];
  return (
    <main className="min-h-screen relative">
      {/* Background en premier avec z-index négatif */}
      <div className="fixed inset-0 -z-10">
        <BackgroundRotator images={images} />
      </div>

      
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white bg-black/50 p-4 rounded-lg backdrop-blur-sm">
            Inscription
          </h2>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}