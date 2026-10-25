'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TEMPLATE_LIST } from '@ats/template-registry';
import { FileText, ArrowRight, Sparkles, Check } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewResumePage() {
  const router = useRouter();
  const [title, setTitle] = useState('My ATS Resume');
  const [targetRole, setTargetRole] = useState('');
  const [targetCategory, setTargetCategory] = useState('Engineering & Tech');
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic-professional');
  const [loading, setLoading] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert(res.error?.message || 'Failed to create resume version.');
    }
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-studio-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-600" />
          <span>Create New Resume Version</span>
        </h1>
        <p className="text-xs sm:text-sm text-studio-500 mt-1">
          Branch a targeted resume version from your master candidate profile.
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        <div className="bg-white rounded-xl border border-studio-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-studio-900 border-b pb-2">Resume Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-studio-700 mb-1">Resume Version Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Staff Full Stack Engineer Resume"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-studio-700 mb-1">Target Job Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Lead Frontend Architect"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-studio-700 mb-1">Target Job Category</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-brand-500"
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

        {/* Template Selection */}
        <div className="bg-white rounded-xl border border-studio-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-studio-900 border-b pb-2 flex items-center justify-between">
            <span>Select ATS Template (15 Available)</span>
            <span className="text-xs font-normal text-studio-500">You can change templates anytime with zero data loss</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEMPLATE_LIST.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-studio-200 bg-white hover:border-studio-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-studio-900">{tmpl.displayName}</span>
                    {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                  </div>
                  <p className="text-[11px] text-studio-500 line-clamp-2">{tmpl.description}</p>
                  <span className="inline-block mt-2 text-[10px] bg-studio-100 text-studio-600 px-1.5 py-0.5 rounded font-mono">
                    {tmpl.defaultFormatting.fontFamily}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-studio-100 hover:bg-studio-200 text-studio-700 text-xs font-semibold rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <span>Creating...</span> : <><span>Open Studio Editor</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
