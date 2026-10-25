'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const res = await api.forgotPassword({ email });
    setLoading(false);

    if (res.success) {
      const emailDelivery = (res as any).data?.emailDelivery;
      let targetUrl = `/verify-reset-otp?email=${encodeURIComponent(email)}`;
      if (emailDelivery && !emailDelivery.sent) {
        if (emailDelivery.fallbackOtp) {
          targetUrl += `&code=${encodeURIComponent(emailDelivery.fallbackOtp)}`;
        }
        if (emailDelivery.reason) {
          targetUrl += `&reason=${encodeURIComponent(emailDelivery.reason)}`;
        }
      }
      router.push(targetUrl);
    } else {
      setErrorMessage(res.error?.message || 'Failed to dispatch recovery instructions.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-studio-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-studio-200 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-red-600 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-studio-900 tracking-tight">Recover Password</h1>
          <p className="text-xs sm:text-sm text-studio-500 mt-1">
            Enter your registered email address and we will dispatch a 6-digit recovery OTP.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-studio-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-studio-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-studio-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Sending Code...</span>
            ) : (
              <>
                <span>Send Recovery Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-studio-100 text-center">
          <Link
            href="/login"
            className="text-xs font-semibold text-studio-600 hover:text-studio-900 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
