"use client";
import { Suspense } from 'react';
import LoginForm from '@/features/auth/LoginForm/LoginForm';  // Correction de l'import
import BackgroundRotator from '@/components/BackgroundRotator';







export default function LoginPage() {
  const images = [
    '/images/login.jpg',
    // autres images...
  ];
  
  return (
    <div className="relative min-h-screen flex items-center justify-center">


       {/* Background en premier avec z-index négatif */}
       <div className="absolute inset-0 z-0">
        <BackgroundRotator images={images} />
      </div>

      {/* Contenu du formulaire avec z-index positif */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8" >
        <h2 className="z+10 mt-6 text-center text-3xl font-extrabold text-white z-100">
          Connexion
        </h2>
        <Suspense fallback={<div>Loading...</div>}>
        <BackgroundRotator images={images} />
        <LoginForm />
        </Suspense>
      </div>
      </div>
    </div>
  );
}