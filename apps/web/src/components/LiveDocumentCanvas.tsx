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

  // Auto-fit to viewport on mobile / resize
  React.useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        const availableWidth = window.innerWidth - 24;
        const fitZoom = Math.min(1.0, Math.max(0.3, Number((availableWidth / widthPx).toFixed(2))));
        onZoomChange(fitZoom);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [widthPx]);

  const handleFitToWidth = () => {
    if (typeof window !== 'undefined') {
      const availableWidth = window.innerWidth < 640 ? window.innerWidth - 24 : Math.min(window.innerWidth - 100, 800);
      const fitZoom = Math.min(1.2, Math.max(0.3, Number((availableWidth / widthPx).toFixed(2))));
      onZoomChange(fitZoom);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-w-0 max-w-full overflow-hidden">
      {/* Zoom Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 bg-white border border-studio-200 shadow-sm rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-studio-600 max-w-full overflow-x-auto scrollbar-none">
        <button
          onClick={() => onZoomChange(Math.max(0.3, Number((zoomLevel - 0.1).toFixed(1))))}
          className="p-1 hover:bg-studio-100 rounded text-studio-700"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <span className="font-mono w-10 sm:w-12 text-center font-medium text-[11px] sm:text-xs">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => onZoomChange(Math.min(1.5, Number((zoomLevel + 0.1).toFixed(1))))}
          className="p-1 hover:bg-studio-100 rounded text-studio-700"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <div className="w-[1px] h-4 bg-studio-200 mx-0.5 sm:mx-1" />
        <button
          onClick={handleFitToWidth}
          className="p-1 hover:bg-studio-100 rounded text-studio-700 flex items-center gap-1"
          title="Fit Canvas to Screen Width"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="text-[10px] sm:text-[11px] font-semibold">Fit</span>
        </button>
        <button
          onClick={() => onZoomChange(1.0)}
          className="p-1 hover:bg-studio-100 rounded text-studio-700 flex items-center gap-1"
          title="Reset Zoom to 100%"
        >
          <span className="text-[10px] sm:text-[11px]">100%</span>
        </button>
      </div>

      {/* Outer Scaled Bounding Box Wrapper (Guarantees zero horizontal bleeding outside viewport) */}
      <div
        className="relative flex justify-center max-w-full overflow-hidden shadow-xl rounded-md bg-white border border-studio-300"
        style={{
          width: `${Math.round(widthPx * zoomLevel)}px`,
          height: `${Math.round(heightPx * zoomLevel)}px`,
          maxWidth: '100%',
        }}
      >
        <div
          className="origin-top-left overflow-hidden pointer-events-auto"
          style={{
            width: `${widthPx}px`,
            height: `${heightPx}px`,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            srcDoc={htmlContent}
            title="Resume Live Preview"
            className="w-full h-full border-0 pointer-events-auto bg-white"
            style={{
              width: `${widthPx}px`,
              height: `${heightPx}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
