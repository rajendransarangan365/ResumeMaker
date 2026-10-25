'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  User,
  Sparkles,
  Upload,
  Layout,
  BarChart2,
  LogOut,
  Menu,
  X,
  Target,
} from 'lucide-react';
import { api } from '@/lib/api';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    api.getMe().then((res) => {
      if (res.success && res.data) {
        setCurrentUser(res.data.user);
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: FileText },
    { href: '/resumes', label: 'Resumes', icon: FileText },
    { href: '/profile', label: 'Candidate Profile', icon: User },
    { href: '/resumes/import', label: 'Import Resume', icon: Upload },
    { href: '/resumes/tailor', label: 'Tailor to JD', icon: Target },
    { href: '/templates', label: 'Templates', icon: Layout },
    { href: '/ai-usage', label: 'AI Usage', icon: BarChart2 },
  ];

  // Don't show full navigation on auth pages
  const isAuthPage = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/verify-reset-otp'].includes(pathname);

  return (
    <header className="studio-navbar">
      <div className="studio-navbar__container">
        <Link href={currentUser ? '/dashboard' : '/'} className="studio-navbar__logo">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-studio-900">
            ATS Resume Studio
          </span>
        </Link>

        {!isAuthPage && currentUser && (
          <>
            <nav className="studio-navbar__nav">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`studio-navbar__link flex items-center gap-1.5 ${
                      isActive ? 'studio-navbar__link--active' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <span className="text-xs font-medium text-studio-500 bg-studio-100 py-1 px-2.5 rounded-full">
                {currentUser.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-studio-600 hover:text-red-600 flex items-center gap-1 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden touch-target text-studio-600 hover:text-studio-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </>
        )}

        {!isAuthPage && !currentUser && (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-studio-700 hover:text-brand-600 transition-colors py-2 px-3"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors py-2 px-4 rounded-lg shadow-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && !isAuthPage && currentUser && (
        <div className="md:hidden border-b border-studio-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="py-2 px-3 border-b border-studio-100 mb-2">
            <p className="text-xs text-studio-500">Signed in as</p>
            <p className="text-sm font-semibold text-studio-900">{currentUser.fullName}</p>
            <p className="text-xs text-studio-400">{currentUser.email}</p>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-studio-700 hover:bg-studio-50 hover:text-studio-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-studio-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
