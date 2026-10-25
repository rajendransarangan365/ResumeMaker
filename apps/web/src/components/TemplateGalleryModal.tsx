'use client';

import React, { useState } from 'react';
import { TEMPLATE_LIST, getTemplateById } from '@ats/template-registry';
import { TemplateId } from '@ats/shared-types';
import { Check, X, ShieldCheck, Sparkles } from 'lucide-react';

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

  if (!isOpen) return null;

  const categories = ['All', 'Executive & General', 'Engineering & Tech', 'Entry Level', 'Leadership & Senior', 'Specialized'];

  const filteredTemplates = TEMPLATE_LIST.filter(
    (t) => selectedCategory === 'All' || t.category.includes(selectedCategory)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-studio-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-studio-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-200">
          <div>
            <h2 className="text-xl font-bold text-studio-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>ATS-Friendly Template Library (15 Templates)</span>
            </h2>
            <p className="text-xs text-studio-500 mt-0.5">
              All 15 templates map seamlessly to your verified candidate data without any loss of information.
            </p>
          </div>
          <button
            onClick={onClose}
            className="touch-target text-studio-400 hover:text-studio-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-studio-100 bg-studio-50 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-studio-600 hover:bg-studio-200 border border-studio-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const isSelected = template.id === currentTemplateId;
            return (
              <div
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template.id);
                  onClose();
                }}
                className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-brand-600 ring-2 ring-brand-500/30 bg-brand-50/40'
                    : 'border-studio-200 bg-white hover:border-studio-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-studio-900">{template.displayName}</h3>
                    {isSelected && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-studio-600 line-clamp-3 mb-3">{template.description}</p>
                </div>

                <div className="pt-3 border-t border-studio-100 flex items-center justify-between text-[11px] text-studio-500">
                  <span className="flex items-center gap-1 font-medium text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ATS Verified</span>
                  </span>
                  <span className="bg-studio-100 px-2 py-0.5 rounded text-studio-700 font-mono">
                    {template.defaultFormatting.fontFamily}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-studio-200 bg-studio-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-studio-200 hover:bg-studio-300 text-studio-800 rounded-lg text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
