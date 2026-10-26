'use client';

import React, { useMemo } from 'react';
import { ICandidateProfile, IResumeVersion } from '@ats/shared-types';
import { generateResumeHtml } from '@ats/resume-renderer/client';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface LiveDocumentCanvasProps {
  profile: ICandidateProfile;
  resume: IResumeVersion;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
}

export function LiveDocumentCanvas({
  profile,
  resume,
  zoomLevel,
  onZoomChange,
}: LiveDocumentCanvasProps) {
  const htmlContent = useMemo(() => {
    return generateResumeHtml(profile, resume);
  }, [profile, resume]);

  const isA4 = resume.formatting.pageSize === 'A4';
  const widthMm = isA4 ? 210 : 215.9;
  const heightMm = isA4 ? 297 : 279.4;

  // Approx pixel dimensions at 96 DPI
  const widthPx = Math.round(widthMm * 3.7795);
  const heightPx = Math.round(heightMm * 3.7795);

  // Auto-fit to mobile viewport on mobile load
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      const fitZoom = Math.min(1.0, Math.max(0.35, Number(((window.innerWidth - 24) / widthPx).toFixed(2))));
      onZoomChange(fitZoom);
    }
  }, [widthPx]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Zoom Toolbar */}
      <div className="flex items-center gap-2 mb-4 bg-white border border-studio-200 shadow-sm rounded-lg px-3 py-1.5 text-xs text-studio-600">
        <button
          onClick={() => onZoomChange(Math.max(0.5, Number((zoomLevel - 0.1).toFixed(1))))}
          className="p-1 hover:bg-studio-100 rounded text-studio-700"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="font-mono w-12 text-center font-medium">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => onZoomChange(Math.min(1.5, Number((zoomLevel + 0.1).toFixed(1))))}
          className="p-1 hover:bg-studio-100 rounded text-studio-700"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-studio-200 mx-1" />
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const fitZoom = Math.min(1.0, Math.max(0.35, Number(((window.innerWidth - 32) / widthPx).toFixed(2))));
              onZoomChange(fitZoom);
            }
          }}
          className="p-1 hover:bg-studio-100 rounded text-studio-700 flex items-center gap-1"
          title="Fit Canvas to Screen Width"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold">Fit</span>
        </button>
        <button
          onClick={() => onZoomChange(1.0)}
          className="p-1 hover:bg-studio-100 rounded text-studio-700 flex items-center gap-1"
          title="Reset Zoom to 100%"
        >
          <span className="text-[11px]">100%</span>
        </button>
      </div>

      {/* Scaled A4 Container */}
      <div
        className="transition-transform duration-150 origin-top shadow-xl rounded-md bg-white overflow-hidden border border-studio-300"
        style={{
          width: `${widthPx}px`,
          minHeight: `${heightPx}px`,
          transform: `scale(${zoomLevel})`,
          marginBottom: `${(zoomLevel - 1) * (heightPx / 2)}px`,
        }}
      >
        <iframe
          srcDoc={htmlContent}
          title="Resume Live Preview"
          className="w-full border-0 pointer-events-auto"
          style={{
            width: `${widthPx}px`,
            minHeight: `${heightPx}px`,
            height: '100%',
          }}
        />
      </div>
    </div>
  );
}
