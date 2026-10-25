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
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { api, getAuthToken } from '@/lib/api';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe().then((res) => {
        if (res.success && res.data) {
          setCurrentUser(res.data.user);
        } else {
          setCurrentUser(null);
        }
      });
    } else {
      setCurrentUser(null);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
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

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/templates', label: 'ATS Templates' },
  ];

  // Don't show full navigation on pure auth pages
  const isAuthPage = [
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/verify-reset-otp',
  ].includes(pathname);

  // Can go back if on a nested page
  const canGoBack = pathname !== '/' && pathname !== '/dashboard';

  return (
    <header className="studio-navbar">
      <div className="studio-navbar__container">
        {/* Left: Back / Forward Navigation & Brand Logo */}
        <div className="flex items-center gap-1 sm:gap-2">
          {canGoBack && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-1.5 rounded-lg border border-studio-200 hover:bg-studio-100 text-studio-600 hover:text-studio-900 transition-colors flex items-center justify-center touch-target"
                title="Go Back"
                aria-label="Go Back"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.history.forward();
                  }
                }}
                className="p-1.5 rounded-lg border border-studio-200 hover:bg-studio-100 text-studio-600 hover:text-studio-900 transition-colors flex items-center justify-center touch-target"
                title="Go Forward"
                aria-label="Go Forward"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          <Link href={currentUser ? '/dashboard' : '/'} className="studio-navbar__logo">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white shadow-sm flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-studio-900 whitespace-nowrap">
              ATS Resume Studio
            </span>
          </Link>
        </div>

        {/* Center/Right Nav for Authenticated User */}
        {!isAuthPage && currentUser && (
          <>
            <nav className="studio-navbar__nav">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
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
              <span className="text-xs font-semibold text-studio-700 bg-studio-100 py-1 px-2.5 rounded-full border border-studio-200">
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
              className="md:hidden touch-target text-studio-600 hover:text-studio-900 ml-auto"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </>
        )}

        {/* Right Nav for Guest / Logged-out User */}
        {!isAuthPage && !currentUser && (
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <Link
              href="/templates"
              className="hidden sm:inline-block text-xs font-medium text-studio-600 hover:text-studio-900 py-2 px-3"
            >
              Templates
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-studio-700 hover:text-brand-600 transition-colors py-1.5 px-3 rounded-lg border border-studio-200 sm:border-transparent hover:bg-studio-50"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors py-1.5 px-3.5 rounded-lg shadow-sm whitespace-nowrap"
            >
              Get Started
            </Link>

            {/* Mobile Menu Button for Guests */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden touch-target text-studio-600 hover:text-studio-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer (Works for Both Authenticated and Guest Users) */}
      {mobileMenuOpen && !isAuthPage && (
        <div className="md:hidden border-b border-studio-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
          {currentUser ? (
            <>
              <div className="py-2 px-3 border-b border-studio-100 mb-2">
                <p className="text-xs text-studio-500">Signed in as</p>
                <p className="text-sm font-bold text-studio-900">{currentUser.fullName}</p>
                <p className="text-xs text-studio-400 font-mono">{currentUser.email}</p>
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-studio-700 hover:bg-studio-50 hover:text-studio-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-studio-500" />
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
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 py-2">
              <Link
                href="/templates"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-studio-700 hover:bg-studio-50"
              >
                <span>Browse ATS Templates (15)</span>
                <ArrowRight className="w-4 h-4 text-studio-400" />
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-semibold rounded-lg border border-studio-300 text-studio-800 hover:bg-studio-50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
              >
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
