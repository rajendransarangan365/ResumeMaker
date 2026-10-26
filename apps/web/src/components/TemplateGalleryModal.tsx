'use client';

import React, { useState } from 'react';
import { TEMPLATE_LIST, getTemplateById } from '@ats/template-registry';
import { TemplateId } from '@ats/shared-types';
import { Check, X, ShieldCheck, Sparkles, LayoutTemplate, Palette, ArrowRight } from 'lucide-react';

interface TemplateGalleryModalProps {
  currentTemplateId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: TemplateId) => void;
}

export function TemplateGalleryModal({
  currentTemplateId,
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateGalleryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewedId, setPreviewedId] = useState<string>(currentTemplateId);

  if (!isOpen) return null;

  const categories = [
    'All',
    'Executive & General',
    'Engineering & Tech',
    'Entry Level',
    'Leadership & Senior',
    'Specialized',
  ];

  const filteredTemplates = TEMPLATE_LIST.filter(
    (t) => selectedCategory === 'All' || t.category.includes(selectedCategory)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-studio-950/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-studio-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-200 bg-gradient-to-r from-studio-50 to-white">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-studio-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>ATS-Friendly Template Library (15 Templates)</span>
            </h2>
            <p className="text-xs text-studio-500 mt-0.5">
              Select any design below. Your candidate details, projects, links, and experience map seamlessly without any loss of data.
            </p>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 text-studio-400 hover:text-studio-700 hover:bg-studio-100 rounded-lg transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-studio-100 bg-studio-50/80 overflow-x-auto scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-studio-600 hover:bg-studio-200/70 border border-studio-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Grid with Visual Mockup Previews */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-studio-50/30">
          {filteredTemplates.map((template) => {
            const isSelected = template.id === currentTemplateId;
            const accent = template.defaultFormatting.accentColor || '#1e293b';
            const isCentered = template.headerStyle === 'centered';
            const isSplit = template.headerStyle === 'split-accent';

            return (
              <div
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template.id);
                  setPreviewedId(template.id);
                }}
                className={`group relative flex flex-col justify-between rounded-xl border bg-white cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-brand-600 ring-2 ring-brand-500/30 shadow-md'
                    : 'border-studio-200 hover:border-brand-300'
                }`}
              >
                {/* Visual Document Mockup */}
                <div className="p-3.5 pb-2 bg-studio-100/60 rounded-t-xl border-b border-studio-100">
                  <div
                    className="w-full h-36 bg-white rounded-lg border border-studio-200/80 p-3 flex flex-col justify-between shadow-xs group-hover:border-brand-300 group-hover:shadow-sm transition-all relative overflow-hidden"
                    style={{
                      fontFamily: template.defaultFormatting.fontFamily,
                    }}
                  >
                    {/* Header Mockup */}
                    <div
                      className={`space-y-1 ${
                        isCentered
                          ? 'text-center items-center flex flex-col'
                          : isSplit
                          ? 'flex justify-between items-start'
                          : 'text-left'
                      }`}
                    >
                      <div>
                        {/* Name Bar */}
                        <div
                          className="h-2.5 rounded-xs w-28 mb-1"
                          style={{ backgroundColor: accent }}
                        />
                        {/* Headline */}
                        <div className="h-1 bg-slate-400/80 rounded-xs w-36 mb-1" />
                        {/* Contact Meta Line */}
                        <div
                          className={`flex gap-1 items-center ${
                            isCentered ? 'justify-center' : ''
                          }`}
                        >
                          <div className="h-1 bg-slate-300 rounded-xs w-12" />
                          <div className="w-0.5 h-0.5 bg-slate-400 rounded-full" />
                          <div className="h-1 bg-slate-300 rounded-xs w-14" />
                          <div className="w-0.5 h-0.5 bg-slate-400 rounded-full" />
                          <div className="h-1 bg-slate-300 rounded-xs w-10" />
                        </div>
                      </div>

                      {isSplit && (
                        <div
                          className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider"
                          style={{ backgroundColor: accent }}
                        >
                          Tech
                        </div>
                      )}
                    </div>

                    {/* Accent Divider Line */}
                    <div
                      className="w-full h-0.5 my-1.5 rounded-full"
                      style={{ backgroundColor: accent, opacity: 0.65 }}
                    />

                    {/* Section 1 Mockup (Summary / Experience) */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-1.5 w-16 rounded-xs"
                          style={{ backgroundColor: accent }}
                        />
                        <div className="h-0.5 flex-1 bg-slate-200" />
                      </div>
                      <div className="space-y-1 pl-1">
                        <div className="h-1 bg-slate-300/80 rounded-xs w-full" />
                        <div className="h-1 bg-slate-200/90 rounded-xs w-5/6" />
                      </div>
                    </div>

                    {/* Section 2 Mockup (Skills / Education) */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-1.5 w-14 rounded-xs"
                          style={{ backgroundColor: accent }}
                        />
                        <div className="h-0.5 flex-1 bg-slate-200" />
                      </div>
                      <div className="flex gap-1 pl-1">
                        <div className="h-1 bg-slate-300 rounded-xs w-10" />
                        <div className="h-1 bg-slate-300 rounded-xs w-14" />
                        <div className="h-1 bg-slate-300 rounded-xs w-12" />
                      </div>
                    </div>

                    {/* Top-Right Badge: Font & Layout */}
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs text-[10px] text-studio-700 px-1.5 py-0.5 rounded border border-studio-200 shadow-2xs font-mono">
                      {template.defaultFormatting.fontFamily}
                    </div>

                    {/* Active Checkmark Pill on Thumbnail */}
                    {isSelected && (
                      <div className="absolute bottom-2 right-2 bg-brand-600 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Details & Description */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-sm text-studio-900 group-hover:text-brand-600 transition-colors">
                        {template.displayName}
                      </h3>
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-xs shrink-0"
                        style={{ backgroundColor: accent }}
                        title={`Accent: ${accent}`}
                      />
                    </div>
                    <p className="text-xs text-studio-600 line-clamp-2 leading-relaxed mb-3">
                      {template.description}
                    </p>
                  </div>

                  {/* Metadata and Action */}
                  <div className="pt-2.5 border-t border-studio-100 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>ATS Score 100%</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(template.id);
                        onClose();
                      }}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-studio-100 hover:bg-brand-600 hover:text-white text-studio-700'
                      }`}
                    >
                      <span>{isSelected ? 'Applied' : 'Use Template'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-studio-200 bg-studio-50 flex items-center justify-between">
          <p className="text-xs text-studio-500 hidden sm:block">
            Tip: You can customize fonts, margins, line spacing, and accent colors anytime in the right sidebar.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs ml-auto"
          >
            Done & Return to Editor
          </button>
        </div>
      </div>
    </div>
  );
}
