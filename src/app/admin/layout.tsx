import { Header } from '@/components/layout/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-950">
      <Header variant="admin" />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-800">
        SkyRoute Finder — Admin Panel
      </footer>
    </div>
  );
}
