'use client';

import Link from 'next/link';
import { AirplaneAnimated } from '@/components/icons/AirplaneAnimated';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface HeaderProps {
  variant?: 'user' | 'admin';
}

export function Header({ variant = 'user' }: HeaderProps) {
  const { t } = useI18n();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b backdrop-blur-sm',
        variant === 'admin'
          ? 'bg-slate-900/95 border-slate-700'
          : 'bg-white/95 border-slate-100 shadow-sm'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/user" className="flex items-center gap-2.5 shrink-0" aria-label="SkyRoute Finder home">
          <AirplaneAnimated size={36} animate="hover" />
          <div className="hidden sm:block">
            <span className={cn('text-lg font-bold', variant === 'admin' ? 'text-white' : 'text-sky-700')}>
              SkyRoute
            </span>
            <span className={cn('text-lg font-light', variant === 'admin' ? 'text-slate-300' : 'text-slate-500')}>
              {' '}Finder
            </span>
          </div>
        </Link>

        {/* Nav */}
        {variant === 'user' && (
          <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
            <NavLink href="/user">{t.nav.search}</NavLink>
            <NavLink href="/user/saved">{t.nav.saved}</NavLink>
            <NavLink href="/user/favorites">{t.nav.favorites}</NavLink>
          </nav>
        )}

        {variant === 'admin' && (
          <nav className="hidden sm:flex items-center gap-1">
            <AdminNavLink href="/admin">{t.admin.dashboard}</AdminNavLink>
            <AdminNavLink href="/admin/providers">{t.admin.providers}</AdminNavLink>
            <AdminNavLink href="/admin/logs">{t.admin.logs}</AdminNavLink>
            <AdminNavLink href="/admin/settings">{t.admin.settings}</AdminNavLink>
          </nav>
        )}

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {variant === 'user' && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded"
            >
              {t.nav.admin}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 transition-colors font-medium"
    >
      {children}
    </Link>
  );
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors font-medium"
    >
      {children}
    </Link>
  );
}
