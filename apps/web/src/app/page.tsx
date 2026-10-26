'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Upload,
  Target,
  Layout,
  CheckCircle,
  Download,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { getAuthToken } from '@/lib/api';

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      // Automatically redirect logged-in user to their dashboard
      router.replace('/dashboard');
    } else {
      setIsAuthenticated(false);
    }
  }, [router]);

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-studio-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Next-Generation ATS Intelligence & Verification</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-studio-900 max-w-4xl mx-auto leading-tight">
            Build Resumes That Pass <span className="text-brand-600">Applicant Tracking Systems</span> With 100% Integrity
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-studio-600 max-w-2xl mx-auto leading-relaxed">
            Import existing documents, complete missing details, optimize truthful bullet points with Google Gemini, match against real job descriptions, and export pixel-perfect A4 PDFs and editable Word documents.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/resumes"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-studio-100 text-studio-800 font-semibold text-base border border-studio-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span>My Resumes</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <Sparkles className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-studio-100 text-studio-800 font-semibold text-base border border-studio-200 transition-colors flex items-center justify-center"
                >
                  Sign In to Studio
                </Link>
              </>
            )}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-studio-500">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Hallucination Guardrails</span>
            </span>
            <span className="flex items-center gap-1.5 text-studio-600">
              <CheckCircle className="w-4 h-4 text-brand-600" />
              <span>15 ATS-Tested Templates</span>
            </span>
            <span className="flex items-center gap-1.5 text-studio-600">
              <Download className="w-4 h-4 text-brand-600" />
              <span>Native DOCX & Selectable PDF</span>
            </span>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section className="py-16 sm:py-20 bg-studio-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-studio-900 tracking-tight">
              Engineered for Employment Success
            </h2>
            <p className="mt-3 text-studio-600 text-sm sm:text-base">
              A comprehensive document intelligence studio designed for freshers, engineers, executives, and career changers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-studio-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-studio-900 mb-2">Multi-Format Ingestion</h3>
              <p className="text-xs sm:text-sm text-studio-600 leading-relaxed">
                Upload PDF, DOCX, TXT, or images. The parser extracts text and structures data into a verified candidate profile while preserving unclassified snippets.
              </p>
            </div>

            <div className="rounded-xl border border-studio-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-studio-900 mb-2">Job Description Matcher</h3>
              <p className="text-xs sm:text-sm text-studio-600 leading-relaxed">
                Compare your profile against actual job requirements. Inspect supported competencies and uncover missing keywords without fabricating fake history.
              </p>
            </div>

            <div className="rounded-xl border border-studio-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Layout className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-studio-900 mb-2">15 ATS Templates</h3>
              <p className="text-xs sm:text-sm text-studio-600 leading-relaxed">
                Switch seamlessly between 15 verified layouts. Zero data loss when changing designs. Dynamic section ordering and clean omission of empty fields.
              </p>
            </div>

            <div className="rounded-xl border border-studio-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-studio-900 mb-2">A4 Page Balancing</h3>
              <p className="text-xs sm:text-sm text-studio-600 leading-relaxed">
                Real-time layout metrics detect orphan headings, split bullet points, and awkward spillover pages. Export authentic DOCX and selectable PDF.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
