'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  FileText,
  Wand2,
  Sliders,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function TailorResumePage() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState('Node.js + Next.js Developer');
  const [company, setCompany] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [reconstructing, setReconstructing] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  // Existing resumes for tailoring target
  const [existingResumes, setExistingResumes] = useState<any[]>([]);
  const [targetMode, setTargetMode] = useState<'new' | 'existing'>('new');
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  // Bullet optimizer state
  const [bulletInput, setBulletInput] = useState('');
  const [bulletResult, setBulletResult] = useState<any>(null);
  const [bulletLoading, setBulletLoading] = useState(false);
  const [copiedBullet, setCopiedBullet] = useState<number | null>(null);

  useEffect(() => {
    api.getResumes().then((res) => {
      if (res.success && res.data?.resumes) {
        setExistingResumes(res.data.resumes);
        if (res.data.resumes.length > 0) {
          setSelectedResumeId(res.data.resumes[0].id || res.data.resumes[0]._id);
        }
      }
    });
  }, []);

  const handleMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      alert(res.error?.message || 'Matching evaluation failed.');
    }
  };

  const handleReconstructResume = async () => {
    if (!jdText.trim() || !jobTitle.trim()) {
      alert('Please provide a target job title and job description first.');
      return;
    }
    setReconstructing(true);

    try {
      const res = await api.reconstructResume({
        jobTitle,
        companyName: company || undefined,
        jobDescriptionText: jdText,
        existingResumeId: targetMode === 'existing' && selectedResumeId ? selectedResumeId : undefined,
      });

      if (res.success && res.data?.resumeId) {
        // Route immediately to the editor with the reconstructed resume
        router.push(`/resumes/${res.data.resumeId}`);
      } else {
        alert(res.error?.message || 'Failed to reconstruct resume.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during resume reconstruction.');
    } finally {
      setReconstructing(false);
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
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs font-medium text-studio-500">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-studio-200 text-studio-700 hover:text-brand-600 hover:border-brand-300 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-studio-300">/</span>
          <span className="text-studio-700 font-semibold">Tailor to Job Description</span>
        </div>

        <Link
          href="/resumes"
          className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My Resume Library ({existingResumes.length})</span>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-studio-900 tracking-tight flex items-center gap-2">
          <Target className="w-6 h-6 text-emerald-600" />
          <span>Job Description Alignment & Resume Reconstructor</span>
        </h1>
        <p className="text-xs sm:text-sm text-studio-500 mt-1">
          Evaluate keyword coverage, align your profile, and reconstruct a dedicated ATS-optimized resume tailored directly to this job description.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Job Description Input & Target Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleMatch} className="bg-white rounded-2xl border border-studio-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-studio-900 border-b border-studio-100 pb-2 flex items-center justify-between">
              <span>1. Target Vacancy Details</span>
              <span className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-bold">
                ATS Analyzer
              </span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-studio-700 mb-1">Target Job Title *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Node.js + Next.js Developer"
                className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm text-studio-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 mb-1">Company / Organization</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Altimetrik Chennai"
                className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm text-studio-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 mb-1">Paste Job Description *</label>
              <textarea
                rows={8}
                required
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the requirements, preferred skills, responsibilities from the job posting..."
                className="w-full border rounded-lg p-3 text-xs leading-relaxed focus:ring-1 focus:ring-brand-500 font-mono text-studio-800"
              />
            </div>

            {/* Reconstruct Target Mode (New vs Existing Resume) */}
            <div className="pt-2 border-t border-studio-100 space-y-2">
              <label className="block text-xs font-bold text-studio-800">Reconstruction Target</label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-studio-200 hover:bg-studio-50 cursor-pointer">
                  <input
                    type="radio"
                    name="targetMode"
                    value="new"
                    checked={targetMode === 'new'}
                    onChange={() => setTargetMode('new')}
                    className="text-brand-600"
                  />
                  <div>
                    <span className="font-bold text-studio-900 block">Create as New Tailored Resume</span>
                    <span className="text-[10px] text-studio-500">Keeps your existing master resumes untouched.</span>
                  </div>
                </label>

                {existingResumes.length > 0 && (
                  <label className="flex items-start gap-2 p-2 rounded-lg border border-studio-200 hover:bg-studio-50 cursor-pointer">
                    <input
                      type="radio"
                      name="targetMode"
                      value="existing"
                      checked={targetMode === 'existing'}
                      onChange={() => setTargetMode('existing')}
                      className="text-brand-600 mt-1"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-studio-900 block">Update Existing Resume</span>
                      <select
                        disabled={targetMode !== 'existing'}
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        className="mt-1 w-full border rounded px-2 py-1 text-xs bg-white disabled:bg-studio-100 text-studio-900"
                      >
                        {existingResumes.map((r) => (
                          <option key={r.id || r._id} value={r.id || r._id}>
                            {r.title} ({r.targetRole || 'General'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              {/* Primary: Direct Reconstruct Button */}
              <button
                type="button"
                onClick={handleReconstructResume}
                disabled={reconstructing || !jdText.trim()}
                className="w-full py-3 bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {reconstructing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Reconstructing Resume for {jobTitle}...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Reconstruct & Build Tailored Resume ↗</span>
                  </>
                )}
              </button>

              {/* Secondary: Check Keyword Alignment */}
              <button
                type="submit"
                disabled={loading || !jdText.trim()}
                className="w-full py-2 bg-studio-100 hover:bg-studio-200 text-studio-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-studio-500" />
                    <span>Evaluating Keywords...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Analyze & Evaluate Match Score</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Bullet Point Optimizer Tool */}
          <div className="bg-white rounded-2xl border border-studio-200 p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-studio-900 border-b border-studio-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>ATS Bullet Point Optimizer</span>
            </h3>
            <p className="text-xs text-studio-500 leading-relaxed">
              Enhance raw bullets with decisive action verbs and quantifiable deliverables tailored to {jobTitle}.
            </p>
            <textarea
              rows={3}
              value={bulletInput}
              onChange={(e) => setBulletInput(e.target.value)}
              placeholder="e.g. worked on next.js node.js rest apis and integrated database"
              className="w-full border rounded-lg p-2.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={handleOptimizeBullet}
              disabled={bulletLoading || !bulletInput.trim()}
              className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
            >
              {bulletLoading ? <span>Optimizing...</span> : <span>Refine Bullet Point</span>}
            </button>

            {bulletResult && (
              <div className="mt-3 p-3 bg-violet-50/70 rounded-xl space-y-2 border border-violet-200">
                <span className="text-[11px] font-bold text-violet-900 block">Suggested Revisions:</span>
                {bulletResult.improvedBullets?.map((bullet: string, idx: number) => (
                  <div key={idx} className="flex items-start justify-between gap-2 text-xs bg-white p-2 rounded-lg border border-violet-100 shadow-2xs">
                    <span className="text-studio-800 leading-relaxed">{bullet}</span>
                    <button
                      onClick={() => copyToClipboard(bullet, idx)}
                      className="p-1 text-studio-400 hover:text-violet-600 flex-shrink-0"
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

        {/* Right Column: Reconstruction Action Card & Requirement Matrix */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prominent Reconstruct Banner */}
          <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-studio-900 text-white rounded-2xl p-6 shadow-xl border border-brand-700/50 space-y-4 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-500/30 text-brand-200 border border-brand-400/30 text-[10px] font-bold uppercase tracking-wider">
                  AI Resume Reconstructor
                </span>
                <span className="text-xs text-brand-200">100% ATS Compliant</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Reconstruct Resume for &ldquo;{jobTitle}&rdquo;
              </h2>
              <p className="text-xs text-studio-300 leading-relaxed max-w-xl">
                Automatically adapts your verified profile: crafts an ATS-targeted headline, reconstructs your summary with high-priority job keywords, sorts your technical skills to match ATS scanners, and applies an ATS-certified template.
              </p>
            </div>

            <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleReconstructResume}
                disabled={reconstructing || !jdText.trim()}
                className="px-5 py-3 bg-white hover:bg-brand-50 text-brand-900 rounded-xl text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {reconstructing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
                    <span>Building Reconstructed Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>Build & Open in Resume Editor ↗</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-studio-400 text-center sm:text-left">
                {targetMode === 'new'
                  ? 'Will create a new tailored resume version'
                  : `Will update resume: ${existingResumes.find((r) => (r.id || r._id) === selectedResumeId)?.title || 'Selected'}`}
              </span>
            </div>

            {/* Background design glow */}
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-brand-600/20 rounded-full blur-2xl pointer-events-none" />
          </div>

          {!matchResult ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-studio-300">
              <Target className="w-12 h-12 text-studio-300 mb-3" />
              <h3 className="font-bold text-sm text-studio-800">Job Description Ready to Reconstruct</h3>
              <p className="text-xs text-studio-500 max-w-md mt-1 leading-relaxed">
                Click <strong>&ldquo;Reconstruct & Build Tailored Resume&rdquo;</strong> above to instantly generate your tailored resume, or click <strong>&ldquo;Analyze & Evaluate Match Score&rdquo;</strong> to inspect keyword coverage point-by-point.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="bg-white rounded-2xl border border-studio-200 p-6 shadow-sm flex items-center justify-between">
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
              <div className="bg-white rounded-2xl border border-studio-200 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-studio-900 border-b border-studio-100 pb-2 flex items-center justify-between">
                  <span>Requirement Matrix</span>
                  <span className="text-xs font-normal text-studio-500">
                    {matchResult.matches?.length || 0} Evaluated Points
                  </span>
                </h3>

                <div className="space-y-3">
                  {matchResult.matches?.map((m: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-studio-100 bg-studio-50/50 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-xs text-studio-900">{m.requirement}</span>
                        {getStatusBadge(m.matchStatus)}
                      </div>
                      {m.candidateEvidence && (
                        <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                          <strong>Evidence:</strong> {m.candidateEvidence}
                        </p>
                      )}
                      <p className="text-xs text-studio-600 leading-relaxed">
                        <strong>Advice:</strong> {m.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailored Summary Recommendation */}
              {matchResult.tailoredSummarySuggestion && (
                <div className="bg-brand-50/60 rounded-2xl border border-brand-200 p-6 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-brand-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <span>Tailored Summary Suggestion</span>
                    </h3>
                    <button
                      onClick={handleReconstructResume}
                      disabled={reconstructing}
                      className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    >
                      <span>Apply in Reconstructed Resume</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-studio-700 leading-relaxed font-sans bg-white p-3.5 rounded-xl border border-brand-100">
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
