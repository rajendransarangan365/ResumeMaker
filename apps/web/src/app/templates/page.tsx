'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TEMPLATE_LIST } from '@ats/template-registry';
import { Layout, ShieldCheck, ArrowRight, Check, Sparkles } from 'lucide-react';

export default function TemplatesGalleryPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Executive & General',
    'Engineering & Tech',
    'Entry Level',
    'Leadership & Senior',
    'Specialized',
    'Administration & Office',
    'Sales & Service',
  ];

  const filtered = TEMPLATE_LIST.filter(
    (t) => selectedCategory === 'All' || t.category.includes(selectedCategory)
  );

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-studio-900 tracking-tight flex items-center gap-2">
          <Layout className="w-6 h-6 text-brand-600" />
          <span>ATS-Compliant Template Gallery (15 Templates)</span>
        </h1>
        <p className="text-xs sm:text-sm text-studio-500 mt-1">
          Every template adheres to single-column ATS extraction standards, selectable typography, and verified reading hierarchy.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-studio-600 hover:bg-studio-100 border border-studio-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-studio-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  {t.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ATS Safe</span>
                </span>
              </div>

              <h3 className="font-bold text-base text-studio-900 mb-2">{t.displayName}</h3>
              <p className="text-xs text-studio-600 leading-relaxed mb-4">{t.description}</p>

              <div className="space-y-1 text-xs text-studio-500 bg-studio-50 p-3 rounded-lg mb-4">
                <div className="flex justify-between">
                  <span>Font Family:</span>
                  <span className="font-mono text-studio-800">{t.defaultFormatting.fontFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span>Header Style:</span>
                  <span className="capitalize text-studio-800">{t.headerStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Margins:</span>
                  <span className="text-studio-800">{t.defaultFormatting.marginsMm}mm</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-studio-100 flex items-center justify-between">
              <Link
                href={`/resumes/new?template=${t.id}`}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-lg text-center shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Use This Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
