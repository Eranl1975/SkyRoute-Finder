'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

function AdminDeniedBanner() {
  const params = useSearchParams();
  if (!params.get('admin_denied')) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800">
      🔒 Admin access requires the secret key.
      Go to: <code className="font-mono bg-amber-100 px-1 rounded">/admin?secret=YOUR_ADMIN_SECRET</code>
    </div>
  );
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#f0f9ff]">
      <Header variant="user" />
      <Suspense>
        <AdminDeniedBanner />
      </Suspense>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
