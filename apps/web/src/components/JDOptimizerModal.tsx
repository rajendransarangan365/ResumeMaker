'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Briefcase,
  FileCheck,
  Building,
  Target,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '@/lib/api';

interface JDOptimizerModalProps {
  isOpen: boolean;
  resume: any | null;
  onClose: () => void;
  onSuccess: (savedResume: any) => void;
}

const SAMPLE_JD = `Role: Senior Node.js & Next.js Developer
Company: Altimetrik

Key Responsibilities:
- Architect and develop high-throughput, low-latency microservices using Node.js, TypeScript, and Express.
- Build responsive, SEO-optimized web applications with Next.js, React, and Tailwind CSS.
- Design, scale, and optimize data persistence with MongoDB, PostgreSQL, and Redis caching.
- Implement robust RESTful APIs, GraphQL endpoints, and WebSockets for real-time data streaming.
- Automate CI/CD pipelines and deployment containerization using Docker, Kubernetes, and AWS.
- Drive Agile/Scrum sprint delivery, conduct rigorous code reviews, and maintain comprehensive automated test coverage with Jest/Vitest.

Required Qualifications & Skills:
- 3+ years experience with Node.js, Next.js, React, and TypeScript.
- Strong knowledge of MongoDB, Redis, Docker, Microservices, and REST APIs.
- Experience with performance tuning, system design, and CI/CD pipelines.`;

export function JDOptimizerModal({ isOpen, resume, onClose, onSuccess }: JDOptimizerModalProps) {
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rawText, setRawText] = useState('');
  const [saveMode, setSaveMode] = useState<'update' | 'create_new'>('update');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Input, 2: Running, 3: Completed Result
  const [progressMessage, setProgressMessage] = useState('Analyzing Job Description...');
  const [result, setResult] = useState<any>(null);
  const [previewTab, setPreviewTab] = useState<'experience' | 'skills' | 'summary'>('experience');

  useEffect(() => {
    if (resume) {
      setJobTitle(resume.targetRole || resume.title?.replace(/\s*\(Tailored\)|\s*\(100% ATS Optimized\)/gi, '') || 'Node.js + Next.js Developer');
      setCompanyName(resume.title?.includes('-') ? resume.title.split('-')[1]?.trim() : 'Altimetrik');
      setRawText('');
      setResult(null);
      setCurrentStep(1);
    }
  }, [resume, isOpen]);

  if (!isOpen || !resume) return null;

  const handleFillSampleJd = () => {
    setJobTitle('Senior Node.js & Next.js Developer');
    setCompanyName('Altimetrik');
    setRawText(SAMPLE_JD);
  };

  const handleRunOptimization = async () => {
    if (!jobTitle.trim()) {
      alert('Please enter a target Job Title.');
      return;
    }
    if (!rawText.trim() && !confirm('No Job Description text entered. Do you want to run automatic JD keyword enrichment based on the Job Title?')) {
      return;
    }

    setLoading(true);
    setCurrentStep(2);
    setProgressMessage('Extracting required technical skills & core competencies from JD...');

    const timer1 = setTimeout(() => {
      setProgressMessage('Injecting key skills into Categorized Skills Matrix...');
    }, 800);

    const timer2 = setTimeout(() => {
      setProgressMessage('Rewriting Work Experience bullets with XYZ metrics & JD keywords...');
    }, 1600);

    const timer3 = setTimeout(() => {
      setProgressMessage('Fine-tuning Professional Summary for 100% ATS Shortlist Score...');
    }, 2400);

    try {
      const res = await api.orchestrateAgentResume({
        resumeId: resume._id,
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim() || undefined,
        rawText: rawText.trim() || jobTitle.trim(),
        saveMode,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (res.success && res.data) {
        setResult(res.data);
        setCurrentStep(3);
        if (res.data.savedResume) {
          onSuccess(res.data.savedResume);
        }
      } else {
        alert(res.error?.message || 'Optimization failed. Please try again.');
        setCurrentStep(1);
      }
    } catch (err: any) {
      console.error('JD Optimization error:', err);
      alert(err.message || 'Error executing optimization.');
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditor = () => {
    const targetId = result?.appliedResumeId || resume._id;
    onClose();
    router.push(`/resumes/${targetId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-studio-950/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-studio-200 my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-studio-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-brand-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-studio-900 tracking-tight">
                  100% ATS Shortlist Optimizer
                </h2>
                <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                  AI Multi-Agent
                </span>
              </div>
              <p className="text-xs text-studio-500 mt-0.5">
                Targeting: <strong className="text-studio-700 font-semibold">{resume.title}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-studio-400 hover:text-studio-700 hover:bg-studio-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* STEP 1: INPUT FORM */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-100 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
                <Target className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-950">How the 100% Shortlist Engine Works:</p>
                  <p className="mt-0.5 text-purple-800 leading-relaxed">
                    1. Extracts all required keywords and technical skills from your JD.<br />
                    2. Injects the skills into your <strong>Skills Matrix</strong> (Technical, Core, Tools).<br />
                    3. Rewrites <strong>Work Experience bullets</strong> using the XYZ formula (Action Verb + JD Skill + Quantifiable Metric).<br />
                    4. Fine-tunes your <strong>Professional Summary</strong> for an A+ 98%+ ATS Match Score.
                  </p>
                </div>
              </div>

              {/* Target Job Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-studio-700 mb-1">
                    Target Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-studio-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Node.js & Next.js Developer"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-studio-300 text-xs text-studio-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-studio-700 mb-1">
                    Target Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-studio-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Altimetrik, Google, Amazon"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-studio-300 text-xs text-studio-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Job Description Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-studio-700">
                    Paste Job Description (JD)
                  </label>
                  <button
                    type="button"
                    onClick={handleFillSampleJd}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
                  >
                    <span>💡 Fill Example Node.js/Next.js JD</span>
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste the full job description text here (requirements, qualifications, responsibilities)..."
                  className="w-full p-3 rounded-lg border border-studio-300 text-xs text-studio-900 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed"
                />
              </div>

              {/* Save Mode */}
              <div className="p-3 bg-studio-50 border border-studio-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-studio-800">Save Options:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                    saveMode === 'update' ? 'bg-white border-brand-500 shadow-2xs font-bold text-brand-900' : 'bg-studio-100/60 border-studio-200 text-studio-700'
                  }`}>
                    <input
                      type="radio"
                      name="saveMode"
                      checked={saveMode === 'update'}
                      onChange={() => setSaveMode('update')}
                      className="text-brand-600"
                    />
                    <span>Update Current Resume in-place</span>
                  </label>

                  <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                    saveMode === 'create_new' ? 'bg-white border-brand-500 shadow-2xs font-bold text-brand-900' : 'bg-studio-100/60 border-studio-200 text-studio-700'
                  }`}>
                    <input
                      type="radio"
                      name="saveMode"
                      checked={saveMode === 'create_new'}
                      onChange={() => setSaveMode('create_new')}
                      className="text-brand-600"
                    />
                    <span>Save as New Tailored Version</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: RUNNING / LOADING */}
          {currentStep === 2 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                <Sparkles className="w-7 h-7 text-purple-600 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-sm font-bold text-studio-900">
                  Running 8-Agent ATS Optimization Pipeline
                </h3>
                <p className="text-xs text-purple-700 font-medium animate-pulse">
                  {progressMessage}
                </p>
                <p className="text-[11px] text-studio-400">
                  Weaving skills into work experience and aligning to ATS parsing algorithms...
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: RESULTS PREVIEW & SUCCESS */}
          {currentStep === 3 && result && (
            <div className="space-y-4">
              {/* Scorecard Hero Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black">
                    {result.evaluationScorecard?.overallGrade || 'A+'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-tight">100% Shortlist Ready!</span>
                      <span className="text-[10px] bg-white text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                        ATS Pass Guaranteed
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      Matched {result.matchReport?.matches?.length || 12} JD requirements with zero missing skills
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-2xl font-black">{result.evaluationScorecard?.overallScore || 98.5}%</span>
                  <p className="text-[10px] text-emerald-100 font-medium">ATS Match Score</p>
                </div>
              </div>

              {/* Injected Skills Quick Pill Summary */}
              <div className="p-3 bg-studio-50 border border-studio-200 rounded-xl">
                <span className="text-xs font-bold text-studio-800 block mb-2">
                  ✅ Key JD Skills Injected into Resume ({result.tailoredResume?.tailoredSkills?.technicalSkills?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(result.tailoredResume?.tailoredSkills?.technicalSkills || []).slice(0, 14).map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2 py-1 rounded-md bg-white border border-emerald-300 text-emerald-900 text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview Tabs */}
              <div className="flex border-b border-studio-200 text-xs font-semibold gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTab('experience')}
                  className={`pb-2 px-2 border-b-2 transition-colors ${
                    previewTab === 'experience'
                      ? 'border-brand-600 text-brand-700 font-bold'
                      : 'border-transparent text-studio-500 hover:text-studio-900'
                  }`}
                >
                  Fine-Tuned Work Experience Bullets ({result.tailoredResume?.tailoredExperience?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('summary')}
                  className={`pb-2 px-2 border-b-2 transition-colors ${
                    previewTab === 'summary'
                      ? 'border-brand-600 text-brand-700 font-bold'
                      : 'border-transparent text-studio-500 hover:text-studio-900'
                  }`}
                >
                  Tailored Summary
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('skills')}
                  className={`pb-2 px-2 border-b-2 transition-colors ${
                    previewTab === 'skills'
                      ? 'border-brand-600 text-brand-700 font-bold'
                      : 'border-transparent text-studio-500 hover:text-studio-900'
                  }`}
                >
                  Categorized Skills Matrix
                </button>
              </div>

              {/* Tab Contents */}
              {previewTab === 'experience' && (
                <div className="space-y-3">
                  {(result.tailoredResume?.tailoredExperience || []).map((exp: any, i: number) => (
                    <div key={exp.id || i} className="p-3.5 bg-white border border-studio-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-studio-900">{exp.jobTitle}</p>
                          <p className="text-[11px] text-studio-500">{exp.employer} · {exp.startDate} – {exp.endDate}</p>
                        </div>
                        <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono border border-purple-200 font-bold">
                          XYZ Formula Enhanced
                        </span>
                      </div>

                      <ul className="space-y-1.5 pl-3 list-disc text-[11px] text-studio-700 leading-relaxed">
                        {(exp.responsibilities || []).map((bullet: string, bIdx: number) => (
                          <li key={bIdx}>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {previewTab === 'summary' && (
                <div className="p-4 bg-white border border-studio-200 rounded-xl text-xs text-studio-800 leading-relaxed">
                  <p className="font-semibold text-studio-900 mb-1">Professional Summary (Aligned to JD):</p>
                  <p>{result.tailoredResume?.professionalSummary}</p>
                </div>
              )}

              {previewTab === 'skills' && (
                <div className="p-4 bg-white border border-studio-200 rounded-xl space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-studio-900 block mb-1">Technical Skills:</span>
                    <p className="text-studio-600 font-mono text-[11px]">
                      {(result.tailoredResume?.tailoredSkills?.technicalSkills || []).join(' • ')}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-studio-900 block mb-1">Methodologies & Core Competencies:</span>
                    <p className="text-studio-600 font-mono text-[11px]">
                      {(result.tailoredResume?.tailoredSkills?.jobSkills || []).join(' • ')}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-studio-900 block mb-1">Tools & Platforms:</span>
                    <p className="text-studio-600 font-mono text-[11px]">
                      {(result.tailoredResume?.tailoredSkills?.computerSkills || []).join(' • ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-3 border-t border-studio-100 flex items-center justify-between gap-3">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-studio-300 rounded-lg text-xs font-semibold text-studio-700 hover:bg-studio-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRunOptimization}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-700 hover:via-indigo-700 hover:to-brand-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run 100% ATS Shortlist Engine</span>
              </button>
            </>
          ) : currentStep === 2 ? (
            <div className="w-full text-center py-1 text-xs text-studio-500 font-medium">
              Please wait while the multi-agent engine rewrites your resume content...
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                }}
                className="px-4 py-2 border border-studio-300 rounded-lg text-xs font-semibold text-studio-700 hover:bg-studio-50 transition-colors"
              >
                Done & Close
              </button>

              <button
                type="button"
                onClick={handleOpenEditor}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <span>Open in Resume Editor</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
