import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#f0f9ff]">
      <Header variant="user" />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
