'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TEMPLATE_LIST } from '@ats/template-registry';
import { FileText, ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react';
import { api, getAuthToken } from '@/lib/api';

export default function NewResumePage() {
  const router = useRouter();
  const [title, setTitle] = useState('My ATS Resume');
  const [targetRole, setTargetRole] = useState('');
  const [targetCategory, setTargetCategory] = useState('Engineering & Tech');
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic-professional');
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    'Engineering & Tech',
    'Executive & General',
    'Corporate & Finance',
    'Entry Level',
    'Leadership & Senior',
    'Specialized',
    'Administration & Office',
    'Sales & Service',
  ];

  // Auth guard: Ensure session exists or redirect cleanly
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      api.getMe().then((res) => {
        if (!res.success) {
          router.push('/login?redirect=/resumes/new');
        } else {
          setAuthChecking(false);
        }
      });
    } else {
      setAuthChecking(false);
    }
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const res = await api.createResume({
      title,
      targetRole,
      targetCategory,
      templateId: selectedTemplateId,
    });
    setLoading(false);

    if (res.success && res.data?.resume) {
      router.push(`/resumes/${res.data.resume._id}`);
    } else {
      if (res.error?.code === 'UNAUTHORIZED' || res.error?.message?.toLowerCase().includes('authentication') || res.error?.message?.toLowerCase().includes('unauthorized')) {
        router.push('/login?redirect=/resumes/new');
      } else {
        setErrorMessage(res.error?.message || 'Failed to create resume version. Please try again.');
      }
    }
  };

  if (authChecking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-studio-500">Checking session credentials...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 sm:pb-12">
      {/* Top Navigation & Back Breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-studio-500">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-studio-200 text-studio-700 hover:text-brand-600 hover:border-brand-300 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-studio-300 hidden sm:inline">/</span>
          <span className="text-studio-700 font-semibold hidden sm:inline">New Resume Version</span>
        </div>

        <Link
          href="/templates"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 hidden sm:inline-flex items-center gap-1"
        >
          <span>View Template Gallery</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-studio-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-600" />
          <span>Create New Resume Version</span>
        </h1>
        <p className="text-xs sm:text-sm text-studio-500 mt-1">
          Branch a targeted resume version from your master candidate profile with zero data loss.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Resume Details Card */}
        <div className="bg-white rounded-xl border border-studio-200 p-4 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-studio-900 border-b border-studio-100 pb-2 flex items-center justify-between">
            <span>Resume Details</span>
            <span className="text-[11px] font-normal text-studio-400">Step 1 of 2</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-studio-700 mb-1">
                Resume Version Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer - Cloud ATS"
                className="w-full border border-studio-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-studio-700 mb-1">Target Job Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className="w-full border border-studio-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-studio-700 mb-1">Target Job Category</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full border border-studio-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Template Selection Card */}
        <div className="bg-white rounded-xl border border-studio-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="border-b border-studio-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h2 className="text-sm font-bold text-studio-900 flex items-center gap-2">
              <span>Select ATS Template</span>
              <span className="bg-brand-50 text-brand-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                15 Ready
              </span>
            </h2>
            <span className="text-[11px] text-studio-500">
              You can switch templates at any time with 100% data preservation
            </span>
          </div>

          {/* Scrollable Container on Mobile Viewports */}
          <div className="max-h-[380px] sm:max-h-[440px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TEMPLATE_LIST.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-xs'
                        : 'border-studio-200 bg-white hover:border-studio-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-studio-900">{tmpl.displayName}</span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-studio-300" />
                      )}
                    </div>
                    <p className="text-[11px] text-studio-500 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className="text-[10px] bg-studio-100 text-studio-700 px-2 py-0.5 rounded font-mono font-medium">
                        {tmpl.defaultFormatting.fontFamily}
                      </span>
                      <span className="text-[10px] text-studio-400 font-mono">
                        {tmpl.defaultFormatting.fontSizePt}pt
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Controls - Fixed Sticky on Mobile, Regular on Desktop */}
        <div className="fixed sm:static bottom-0 left-0 right-0 z-30 bg-white/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t sm:border-0 border-studio-200 px-4 py-3 sm:p-0 flex items-center justify-between sm:justify-end gap-3 shadow-lg sm:shadow-none">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2.5 bg-studio-100 hover:bg-studio-200 text-studio-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Creating Version...</span>
            ) : (
              <>
                <span>Open Studio Editor</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
