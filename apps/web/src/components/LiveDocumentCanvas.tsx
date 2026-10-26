'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ICandidateProfile, IResumeVersion } from '@ats/shared-types';
import { generateResumeHtml } from '@ats/resume-renderer/client';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Smartphone,
  FileText,
  RotateCcw,
} from 'lucide-react';

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
  // View mode: 'mobile-flow' (Word Mobile style full-width readable text) or 'page-layout' (A4 print layout)
  const [viewMode, setViewMode] = useState<'mobile-flow' | 'page-layout'>('mobile-flow');
  const [mobileHeight, setMobileHeight] = useState<number>(1000);

  const isA4 = resume.formatting.pageSize === 'A4';
  const widthMm = isA4 ? 210 : 215.9;
  const heightMm = isA4 ? 297 : 279.4;

  // Approx pixel dimensions at 96 DPI
  const widthPx = Math.round(widthMm * 3.7795); // ~794px
  const heightPx = Math.round(heightMm * 3.7795); // ~1123px

  // Generate HTML for Mobile Flow (Word Mobile app style)
  const htmlMobileContent = useMemo(() => {
    return generateResumeHtml(profile, resume, { embedded: true, mobileReflow: true });
  }, [profile, resume]);

  // Generate HTML for A4 Page Print Layout
  const htmlPrintContent = useMemo(() => {
    return generateResumeHtml(profile, resume, { embedded: true, mobileReflow: false });
  }, [profile, resume]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-fit document zoom to available canvas width on mount and on sidebar resize
  useEffect(() => {
    const autoFit = () => {
      if (!containerRef.current) return;
      const available = containerRef.current.clientWidth - 32;
      if (available > 100) {
        const optimalZoom = Math.min(1.0, Math.max(0.35, Number((available / widthPx).toFixed(2))));
        onZoomChange(optimalZoom);
      }
    };

    // Run after layout stabilizes
    const timer = setTimeout(autoFit, 80);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(() => {
        autoFit();
      });
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', autoFit);
    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', autoFit);
    };
  }, [widthPx]);

  // Default to mobile-flow on small screens, page-layout on desktop
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setViewMode('mobile-flow');
      } else {
        setViewMode('page-layout');
      }
    }
  }, []);

  const handleFitToWidth = () => {
    if (containerRef.current) {
      const available = containerRef.current.clientWidth - 32;
      const fitZoom = Math.min(1.2, Math.max(0.35, Number((available / widthPx).toFixed(2))));
      onZoomChange(fitZoom);
    }
  };

  const scaledW = Math.round(widthPx * zoomLevel);
  const scaledH = Math.round(heightPx * zoomLevel);

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full min-w-0 max-w-full">
      {/* Top Toolbar: View Mode Switcher + Zoom Controls */}
      <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4 px-1">
        {/* Word Mobile View vs Page Layout Toggle */}
        <div className="inline-flex items-center rounded-lg bg-studio-200/70 p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('mobile-flow')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              viewMode === 'mobile-flow'
                ? 'bg-white text-studio-900 shadow-xs'
                : 'text-studio-600 hover:text-studio-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-brand-600" />
            <span>Mobile View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('page-layout')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              viewMode === 'page-layout'
                ? 'bg-white text-studio-900 shadow-xs'
                : 'text-studio-600 hover:text-studio-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-brand-600" />
            <span>A4 Page View</span>
          </button>
        </div>

        {/* Zoom Controls (Active in Page Layout mode) */}
        {viewMode === 'page-layout' ? (
          <div className="flex items-center gap-1 bg-white border border-studio-200 shadow-xs rounded-lg px-2 py-1 text-xs text-studio-600">
            <button
              onClick={() => onZoomChange(Math.max(0.35, Number((zoomLevel - 0.1).toFixed(2))))}
              className="p-1 hover:bg-studio-100 rounded text-studio-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono w-10 text-center font-semibold text-[11px]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(1.5, Number((zoomLevel + 0.1).toFixed(2))))}
              className="p-1 hover:bg-studio-100 rounded text-studio-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-studio-200 mx-0.5" />
            <button
              onClick={handleFitToWidth}
              className="p-1 hover:bg-studio-100 rounded text-studio-700 flex items-center gap-1"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="text-[10px] font-semibold">Fit</span>
            </button>
            <button
              onClick={() => onZoomChange(1.0)}
              className="p-1 hover:bg-studio-100 rounded text-studio-700 flex items-center gap-0.5"
              title="Reset 100%"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[10px]">100%</span>
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-studio-500 font-medium">
            100% Readable Continuous Flow
          </span>
        )}
      </div>

      {/* View Mode 1: Word Mobile Continuous Flow (Full Width, Zero Shrinking, 100% Readable) */}
      {viewMode === 'mobile-flow' ? (
        <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl border border-studio-200 overflow-hidden transition-all">
          <iframe
            srcDoc={htmlMobileContent}
            title="Resume Mobile Flow Preview"
            className="w-full border-0 pointer-events-auto bg-white"
            style={{
              height: `${mobileHeight}px`,
              minHeight: '650px',
            }}
            onLoad={(e) => {
              try {
                const doc = e.currentTarget.contentWindow?.document;
                if (doc && doc.body) {
                  const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
                  if (h > 200) {
                    setMobileHeight(h + 30);
                  }
                }
              } catch (err) {
                // Ignore cross-origin error if any
              }
            }}
          />
        </div>
      ) : (
        /* View Mode 2: A4 Scaled Page Layout (Exact Dimensions, No Right-Side Void) */
        <div className="w-full flex justify-center overflow-x-auto pb-4">
          <div
            className="relative overflow-hidden shadow-2xl rounded-md bg-white border border-studio-300 flex-shrink-0 transition-all"
            style={{
              width: `${scaledW}px`,
              height: `${scaledH}px`,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: `${widthPx}px`,
                height: `${heightPx}px`,
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
              }}
            >
              <iframe
                srcDoc={htmlPrintContent}
                title="Resume Page Preview"
                className="w-full h-full border-0 pointer-events-auto bg-white"
                style={{
                  width: `${widthPx}px`,
                  height: `${heightPx}px`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
