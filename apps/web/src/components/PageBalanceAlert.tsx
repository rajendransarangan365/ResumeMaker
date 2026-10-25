'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { IPageLayoutMetrics } from '@ats/resume-renderer/client';

interface PageBalanceAlertProps {
  metrics: IPageLayoutMetrics | null;
}

export function PageBalanceAlert({ metrics }: PageBalanceAlertProps) {
  if (!metrics) return null;

  const hasWarnings = metrics.warnings && metrics.warnings.length > 0;

  return (
    <div
      className={`rounded-lg p-3 text-xs sm:text-sm border transition-all ${
        hasWarnings
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {hasWarnings ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          )}
          <span className="font-semibold">
            Estimated Length: {metrics.estimatedPages} {metrics.pageSize} Page
            {metrics.estimatedPages > 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-xs text-studio-500 font-mono">
          Content Height: ~{metrics.contentHeightPx}px (Limit: {metrics.pageHeightPx}px/page)
        </span>
      </div>

      {hasWarnings && (
        <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-amber-800">
          {metrics.warnings.map((w, idx) => (
            <li key={idx}>{w}</li>
          ))}
        </ul>
      )}

      {metrics.suggestions && metrics.suggestions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-start gap-1.5 text-xs text-studio-600">
          <Info className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
          <span>{metrics.suggestions.join(' ')}</span>
        </div>
      )}
    </div>
  );
}
