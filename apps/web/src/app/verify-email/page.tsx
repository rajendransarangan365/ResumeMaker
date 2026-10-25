'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MailCheck, RefreshCw, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [expirySeconds, setExpirySeconds] = useState(300);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of full 6 digits
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextInput = document.getElementById(`otp-input-5`);
      nextInput?.focus();
      return;
    }

    const cleanValue = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    // Auto-advance focus
    if (cleanValue && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    const res = await api.verifyEmail({ email, otp: fullOtp });
    setLoading(false);

    if (res.success) {
      setSuccessMessage('Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 1500);
    } else {
      setErrorMessage(res.error?.message || 'Verification failed.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    setSuccessMessage('');
    const res = await api.resendVerification({ email });
    if (res.success) {
      setResendCooldown(60);
      setExpirySeconds(300);
      setSuccessMessage('A fresh verification code has been dispatched to your email.');
    } else {
      setErrorMessage(res.error?.message || 'Failed to resend code.');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-studio-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-studio-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mb-3">
            <MailCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-studio-900 tracking-tight">Verify Your Email</h1>
          <p className="text-xs text-studio-500 mt-1">
            We sent a 6-digit confirmation code to:
          </p>
          <div className="mt-1 flex items-center justify-center gap-2">
            {!isEditingEmail ? (
              <>
                <span className="font-semibold text-sm text-studio-800">{email}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="text-xs text-brand-600 hover:text-brand-700 underline"
                >
                  Edit
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(false)}
                  className="text-xs bg-studio-200 px-2 py-1 rounded"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>


        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-14 sm:w-12 sm:h-14 text-center font-bold text-xl rounded-lg border border-studio-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white text-studio-900"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-studio-500">
            <span>
              Expires in: <strong className="text-studio-700 font-mono">{formatTime(expirySeconds)}</strong>
            </span>
            <button
              type="button"
              disabled={resendCooldown > 0}
              onClick={handleResend}
              className="text-brand-600 hover:text-brand-700 font-medium disabled:text-studio-400 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? '' : 'animate-spin-slow'}`} />
              <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Verify & Activate Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-studio-500">Loading verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
