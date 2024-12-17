"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/');
        return;
      }

      const user = JSON.parse(userStr);
      if (user?.role !== 'admin') {
        router.push('/');
      }
    };

    checkAdminStatus();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
}