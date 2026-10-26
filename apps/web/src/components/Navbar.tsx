'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api, getAuthToken } from '@/lib/api';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setUserDropdownOpen(false);
    router.push('/login');
  };

  // Primary visible links on desktop
  const primaryNavLinks = [
    { href: '/resumes', label: 'Resumes', icon: FileText },
    { href: '/profile', label: 'Candidate Profile', icon: User },
    { href: '/resumes/tailor', label: 'Tailor to JD', icon: Target },
    { href: '/templates', label: 'Templates', icon: Layout },
  ];

  // Secondary links in "More" dropdown
  const secondaryNavLinks = [
    { href: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/resumes/import', label: 'Import Resume (PDF/Word)', icon: Upload },
    { href: '/ai-usage', label: 'AI Usage & Credits', icon: BarChart2 },
  ];

  const isAuthPage = [
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/verify-reset-otp',
  ].includes(pathname);

  // In active resume editor on mobile view, hide the bulky site navbar to give maximum height to Word Mobile mode
  const isInnerResumeEditor = pathname.startsWith('/resumes/') && pathname !== '/resumes' && pathname !== '/resumes/new' && pathname !== '/resumes/import' && pathname !== '/resumes/tailor';

  if (isInnerResumeEditor) {
    return (
      <header className="hidden md:block sticky top-0 z-40 w-full border-b border-studio-200/90 bg-white/95 backdrop-blur-md transition-all overflow-hidden">
        <div className="mx-auto flex h-13 max-w-7xl items-center justify-between px-4 sm:px-6 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-studio-900 group">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-studio-900">
              ATS Resume Studio
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {primaryNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-2xs'
                      : 'text-studio-600 hover:text-studio-900 hover:bg-studio-100/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {currentUser && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-studio-600 bg-studio-100 px-2.5 py-1 rounded-full border border-studio-200">
                {currentUser.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-studio-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>
    );
  }

  const initials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-studio-200/90 bg-white/95 backdrop-blur-md shadow-2xs overflow-hidden">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 min-w-0 gap-2">
        {/* Brand Logo */}
        <Link href={currentUser ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-600 text-white shadow-sm group-hover:shadow transition-all group-hover:scale-105">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold tracking-tight text-studio-900 leading-tight whitespace-nowrap">
              ATS Resume Studio
            </span>
            <span className="text-[10px] text-studio-400 font-medium hidden sm:block whitespace-nowrap">
              Intelligent ATS Optimizer
            </span>
          </div>
        </Link>

        {/* Center Navigation for Authenticated User */}
        {!isAuthPage && currentUser && (
          <>
            <nav className="hidden lg:flex items-center gap-1 bg-studio-100/60 p-1 rounded-xl border border-studio-200/60">
              {primaryNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-white text-brand-700 shadow-xs'
                        : 'text-studio-600 hover:text-studio-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-studio-500" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* "More" Dropdown Menu */}
              <div className="relative" ref={moreDropdownRef}>
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    secondaryNavLinks.some((l) => pathname === l.href)
                      ? 'bg-white text-brand-700 shadow-xs'
                      : 'text-studio-600 hover:text-studio-900 hover:bg-white/60'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className="w-3 h-3 text-studio-400" />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-studio-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {secondaryNavLinks.map((sLink) => {
                      const SIcon = sLink.icon;
                      const isSubActive = pathname === sLink.href;
                      return (
                        <Link
                          key={sLink.href}
                          href={sLink.href}
                          onClick={() => setMoreDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                            isSubActive
                              ? 'bg-brand-50 text-brand-700 font-bold'
                              : 'text-studio-700 hover:bg-studio-50 hover:text-studio-900'
                          }`}
                        >
                          <SIcon className="w-4 h-4 text-studio-500" />
                          <span>{sLink.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* Right: User Avatar & Actions */}
            <div className="hidden lg:flex items-center gap-3 relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-studio-200 hover:border-studio-300 hover:bg-studio-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  {initials}
                </div>
                <span className="text-xs font-semibold text-studio-800 max-w-[120px] truncate">
                  {currentUser.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-studio-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-xl border border-studio-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-studio-100">
                    <p className="text-xs font-bold text-studio-900 truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-studio-500 font-mono truncate">{currentUser.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-studio-700 hover:bg-studio-50 font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-studio-400" />
                    <span>Candidate Profile</span>
                  </Link>

                  <Link
                    href="/ai-usage"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-studio-700 hover:bg-studio-50 font-medium"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-studio-400" />
                    <span>AI Usage & Quota</span>
                  </Link>

                  <div className="pt-1 border-t border-studio-100">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile / Tablet Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-studio-600 hover:text-studio-900 hover:bg-studio-100 transition-colors ml-auto"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </>
        )}

        {/* Guest Nav */}
        {!isAuthPage && !currentUser && (
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <Link
              href="/templates"
              className="hidden sm:inline-block text-xs font-semibold text-studio-600 hover:text-studio-900 py-1.5 px-3 rounded-lg hover:bg-studio-100 transition-colors"
            >
              Templates (15)
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-studio-700 hover:text-brand-600 py-1.5 px-3 rounded-lg border border-studio-200 hover:bg-studio-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 py-1.5 px-3.5 rounded-lg shadow-xs hover:shadow transition-all whitespace-nowrap"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-studio-600 hover:text-studio-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && !isAuthPage && (
        <div className="lg:hidden border-b border-studio-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150 max-h-[80dvh] overflow-y-auto overflow-x-hidden">
          {currentUser ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-studio-50 rounded-xl mb-3 border border-studio-100">
                <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-studio-900 truncate">{currentUser.fullName}</p>
                  <p className="text-xs text-studio-500 font-mono truncate">{currentUser.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                {[...primaryNavLinks, ...secondaryNavLinks].map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-bold'
                          : 'text-studio-700 hover:bg-studio-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-studio-500" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-studio-100 mt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
