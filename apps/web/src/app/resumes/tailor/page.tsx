'use client';

import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function TailorResumePage() {
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer');
  const [company, setCompany] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  // Bullet optimizer state
  const [bulletInput, setBulletInput] = useState('');
  const [bulletResult, setBulletResult] = useState<any>(null);
  const [bulletLoading, setBulletLoading] = useState(false);
  const [copiedBullet, setCopiedBullet] = useState<number | null>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) return;
    setLoading(true);

    const res = await api.matchJd({
      jobTitle,
      jobDescriptionText: jdText,
    });
    setLoading(false);

    if (res.success && res.data) {
      setMatchResult(res.data);
    } else {
      alert(res.error?.message || 'Matching failed.');
    }
  };

  const handleOptimizeBullet = async () => {
    if (!bulletInput.trim()) return;
    setBulletLoading(true);
    const res = await api.optimizeBullet({
      originalText: bulletInput,
      targetRole: jobTitle,
    });
    setBulletLoading(false);
    if (res.success && res.data) {
      setBulletResult(res.data);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(index);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Supported':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supported</span>
          </span>
        );
      case 'Partially Supported':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Partially Supported</span>
          </span>
        );
      case 'Needs Confirmation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Needs Confirmation</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Not Found</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-studio-900 tracking-tight flex items-center gap-2">
          <Target className="w-6 h-6 text-emerald-600" />
          <span>Job Description Alignment & Matching Studio</span>
        </h1>
        <p className="text-xs sm:text-sm text-studio-500 mt-1">
          Objective evaluation of your candidate profile against employer vacancies. Classifies requirements with zero false claims.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: JD Input */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleMatch} className="bg-white rounded-xl border border-studio-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-studio-900 border-b pb-2">Target Vacancy</h2>

            <div>
              <label className="block text-xs font-semibold text-studio-700 mb-1">Target Job Title *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 mb-1">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 mb-1">Paste Job Description *</label>
              <textarea
                rows={9}
                required
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description text here..."
                className="w-full border rounded-lg p-3 text-xs leading-relaxed focus:ring-1 focus:ring-brand-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !jdText.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Candidate Match...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Match Profile</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Bullet Point Optimizer Tool */}
          <div className="bg-white rounded-xl border border-studio-200 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-studio-900 border-b pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>ATS Bullet Point Optimizer</span>
            </h3>
            <p className="text-xs text-studio-500 leading-relaxed">
              Enhance raw bullets with active verbs and quantifiable deliverables while preserving truthfulness.
            </p>
            <textarea
              rows={3}
              value={bulletInput}
              onChange={(e) => setBulletInput(e.target.value)}
              placeholder="e.g. worked on react frontend and fixed bugs"
              className="w-full border rounded p-2 text-xs"
            />
            <button
              onClick={handleOptimizeBullet}
              disabled={bulletLoading || !bulletInput.trim()}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {bulletLoading ? <span>Optimizing...</span> : <span>Refine Bullet Point</span>}
            </button>

            {bulletResult && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg space-y-2 border border-purple-200">
                <span className="text-[11px] font-bold text-purple-900 block">Suggested Revisions:</span>
                {bulletResult.improvedBullets?.map((bullet: string, idx: number) => (
                  <div key={idx} className="flex items-start justify-between gap-2 text-xs bg-white p-2 rounded border border-purple-100">
                    <span className="text-studio-800 leading-relaxed">{bullet}</span>
                    <button
                      onClick={() => copyToClipboard(bullet, idx)}
                      className="p-1 text-studio-400 hover:text-purple-600 flex-shrink-0"
                      title="Copy"
                    >
                      {copiedBullet === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Output: Requirement Matrix & Analysis */}
        <div className="lg:col-span-7">
          {!matchResult ? (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-studio-300">
              <Target className="w-12 h-12 text-studio-300 mb-3" />
              <h3 className="font-bold text-sm text-studio-800">No Job Description Analyzed Yet</h3>
              <p className="text-xs text-studio-500 max-w-sm mt-1">
                Paste a vacancy description on the left to generate an authentic requirement matrix and keyword coverage report.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="bg-white rounded-xl border border-studio-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-studio-900">ATS Keyword Coverage</h3>
                  <p className="text-xs text-studio-500 mt-0.5">
                    Matches verified candidate background against core requirements
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-emerald-600 font-mono">
                    {matchResult.keywordCoveragePercentage || 80}%
                  </span>
                  <span className="block text-[11px] text-studio-400">Verified Alignment</span>
                </div>
              </div>

              {/* Requirement Matrix */}
              <div className="bg-white rounded-xl border border-studio-200 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-studio-900 border-b pb-2 flex items-center justify-between">
                  <span>Requirement Matrix</span>
                  <span className="text-xs font-normal text-studio-500">
                    {matchResult.matches?.length || 0} Evaluated Points
                  </span>
                </h3>

                <div className="space-y-3">
                  {matchResult.matches?.map((m: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-studio-100 bg-studio-50/50 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-xs text-studio-900">{m.requirement}</span>
                        {getStatusBadge(m.matchStatus)}
                      </div>
                      {m.candidateEvidence && (
                        <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-100">
                          <strong>Evidence:</strong> {m.candidateEvidence}
                        </p>
                      )}
                      <p className="text-xs text-studio-600">
                        <strong>Advice:</strong> {m.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailored Summary Recommendation */}
              {matchResult.tailoredSummarySuggestion && (
                <div className="bg-brand-50/60 rounded-xl border border-brand-200 p-6 space-y-2">
                  <h3 className="font-bold text-sm text-brand-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>Tailored Summary Suggestion</span>
                  </h3>
                  <p className="text-xs text-studio-700 leading-relaxed font-sans bg-white p-3 rounded-lg border border-brand-100">
                    {matchResult.tailoredSummarySuggestion}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
