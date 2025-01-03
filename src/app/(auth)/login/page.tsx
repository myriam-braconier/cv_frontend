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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-md w-full space-y-8" >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Connexion
        </h2>
        <Suspense fallback={<div>Loading...</div>}>
        <BackgroundRotator images={images} />
        <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}