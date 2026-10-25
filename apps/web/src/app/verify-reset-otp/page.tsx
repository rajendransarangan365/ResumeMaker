'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

function VerifyResetOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const initialCode = searchParams.get('code') || '';
  const initialReason = searchParams.get('reason') || '';

  const [otp, setOtp] = useState(
    initialCode && initialCode.length === 6 ? initialCode.split('') : ['', '', '', '', '', '']
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deliveryWarning] = useState(initialReason);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      document.getElementById('reset-otp-5')?.focus();
      return;
    }

    const clean = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 5) {
      document.getElementById(`reset-otp-${index + 1}`)?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the recovery code.');
      return;
    }

    setLoading(true);
    const res = await api.verifyResetOtp({ email, otp: fullOtp });
    setLoading(false);

    if (res.success && res.data?.resetToken) {
      router.push(`/reset-password?token=${encodeURIComponent(res.data.resetToken)}`);
    } else {
      setErrorMessage(res.error?.message || 'Invalid or expired recovery code.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-studio-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-studio-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-red-600 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-studio-900 tracking-tight">Verify Recovery Code</h1>
          <p className="text-xs text-studio-500 mt-1">
            Enter the 6-digit recovery code sent to <span className="font-semibold text-studio-800">{email}</span>
          </p>
        </div>

        {deliveryWarning && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Email Delivery Notice:</span>
            </p>
            <p className="text-amber-700 leading-relaxed mb-2 font-mono text-[11px] bg-amber-100/60 p-1.5 rounded">
              {deliveryWarning}
            </p>
            <p className="text-amber-700 text-[11px] leading-relaxed">
              If using Gmail SMTP, verify your 16-character Google App Password in Render. For immediate access, your recovery code has been auto-filled below!
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`reset-otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                className="w-11 h-14 sm:w-12 sm:h-14 text-center font-bold text-xl rounded-lg border border-studio-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white text-studio-900"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>Verifying...</span> : <><span>Verify Code</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-studio-100 text-center">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-studio-600 hover:text-studio-900 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Resend or Change Email</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyResetOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-studio-500">Loading...</div>}>
      <VerifyResetOtpContent />
    </Suspense>
  );
}
