'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Brain,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award,
  Briefcase,
  Layers,
  MessageSquare,
  Flame,
  Check,
  Copy,
} from 'lucide-react';
import { api } from '@/lib/api';

interface StretchedField {
  field: string;
  section: string;
  originalValue: string;
  enhancedValue: string;
  riskLevel: 'low' | 'medium' | 'high';
  interviewTip: string;
}

interface InterviewQuestion {
  question: string;
  suggestedAnswer: string;
  relatedField: string;
  category: 'behavioral' | 'technical' | 'experience' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface JobApplicationData {
  _id: string;
  jobTitle: string;
  companyName: string;
  status: string;
  atsScore: number;
  matchScore: number;
  stretchedFields?: StretchedField[];
  interviewPrepQuestions?: InterviewQuestion[];
  notes?: string;
  appliedDate?: string;
}

interface InterviewPrepModalProps {
  application: JobApplicationData;
  onClose: () => void;
  onUpdate?: (updatedApp: JobApplicationData) => void;
}

export default function InterviewPrepModal({
  application,
  onClose,
  onUpdate,
}: InterviewPrepModalProps) {
  const [activeTab, setActiveTab] = useState<'claims' | 'questions' | 'notes'>('claims');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentApp, setCurrentApp] = useState<JobApplicationData>(application);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const stretched = currentApp.stretchedFields || [];
  const questions = currentApp.interviewPrepQuestions || [];

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await api.generateInterviewPrep(currentApp._id);
      if (res.success && res.data?.application) {
        setCurrentApp(res.data.application);
        if (onUpdate) onUpdate(res.data.application);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate interview prep questions.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" /> High Scrutiny
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Moderate Stretch
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Low Risk
          </span>
        );
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'hard':
        return <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Hard</span>;
      case 'medium':
        return <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Easy</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Interview Defense & Claims Prep
                </h2>
                <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200 uppercase tracking-wide">
                  Shortlist Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Role: <span className="font-semibold text-slate-700">{currentApp.jobTitle}</span>
                {currentApp.companyName && (
                  <> at <span className="font-semibold text-slate-700">{currentApp.companyName}</span></>
                )}
                {' • '}
                <span className="text-indigo-600 font-semibold">{currentApp.atsScore}% ATS Score</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Motivation Banner */}
        <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-amber-50 via-purple-50 to-indigo-50 border border-purple-100/80 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-700">
            <p className="font-semibold text-slate-900 mb-0.5">
              You are shortlisted! Now be bulletproof in the technical interview.
            </p>
            <p className="text-slate-600">
              The AI strategically enhanced your resume with high-impact framing and keywords to beat the ATS filter. Below is every stretched claim and the exact authentic narrative to answer confidently without sounding fraudulent.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('claims')}
              className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'claims'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Stretched Claims Radar ({stretched.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'questions'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Targeted Interview Q&A ({questions.length})
            </button>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="mb-2 text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-600' : ''}`} />
            {isRegenerating ? 'Analyzing with AI...' : 'Regenerate Q&A'}
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {/* TAB 1: CLAIMS RADAR */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              {stretched.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800">100% Verified Profile Fit</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    No major claims or experience gaps were stretched for this resume. All metrics and skills directly aligned with the JD requirements!
                  </p>
                </div>
              ) : (
                stretched.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-shadow space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {item.section}
                        </span>
                        <h4 className="text-sm font-bold text-indigo-950">
                          {item.field}
                        </h4>
                      </div>
                      <div>{getRiskBadge(item.riskLevel)}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Original Baseline / Actual
                        </span>
                        <p className="text-slate-700 italic">
                          {item.originalValue || 'Not explicitly mentioned in source profile.'}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                        <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                          Tailored Resume Claim (ATS Optimized)
                        </span>
                        <p className="text-indigo-950 font-medium">
                          {item.enhancedValue}
                        </p>
                      </div>
                    </div>

                    {item.interviewTip && (
                      <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">How to Answer in the Interview:</span>{' '}
                          {item.interviewTip}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: QUESTIONS & ANSWERS */}
          {activeTab === 'questions' && (
            <div className="space-y-3">
              {questions.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <Brain className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800">No Questions Generated Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-3">
                    Click "Regenerate Q&A" above to have Gemini AI analyze your tailored resume and create custom interview questions.
                  </p>
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Generate with AI
                  </button>
                </div>
              ) : (
                questions.map((q, idx) => {
                  const isExpanded = expandedQuestion === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                      <button
                        onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                {q.category}
                              </span>
                              {getDifficultyBadge(q.difficulty)}
                              {q.relatedField && (
                                <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                  Re: {q.relatedField}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {q.question}
                            </h4>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                          <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-sm relative group">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-indigo-600" />
                                Recommended Confident Answer (Authentic & Solid)
                              </span>
                              <button
                                onClick={() => copyToClipboard(q.suggestedAnswer, idx)}
                                className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    Copy Answer
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {q.suggestedAnswer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Keep this tab open while preparing for your interview phone screen or onsite.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
}
