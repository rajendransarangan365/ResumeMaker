'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useResumeEditorStore } from '@/stores/resume-editor.store';

interface AiResumeCalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiResumeCalibratorModal({ isOpen, onClose }: AiResumeCalibratorModalProps) {
  const { profile, updateProfessionalSummary, updateWorkExperience, updateSkills } = useResumeEditorStore();

  const [targetRole, setTargetRole] = useState(profile?.personalDetails?.headline || 'Software Engineer');
  const [loading, setLoading] = useState(false);
  const [calibratedData, setCalibratedData] = useState<{
    overallScore: number;
    scores: { impact: number; verbs: number; skills: number; readability: number };
    recommendations: string[];
    calibratedSummary: string;
    calibratedBullets: { expId: string; original: string; improved: string }[];
    suggestedSkills: { technicalSkills: string[]; jobSkills: string[]; computerSkills: string[] };
  } | null>(null);

  const [appliedSections, setAppliedSections] = useState<{
    summary?: boolean;
    bullets?: boolean;
    skills?: boolean;
    all?: boolean;
  }>({});

  if (!isOpen || !profile) return null;

  const handleRunCalibration = async () => {
    setLoading(true);
    setAppliedSections({});
    try {
      const res = await api.calibrateResume({ profile, targetRole });
      if (res.success && res.data) {
        setCalibratedData(res.data);
      }
    } catch (err) {
      console.error('Calibration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const applySummary = () => {
    if (!calibratedData?.calibratedSummary) return;
    updateProfessionalSummary(calibratedData.calibratedSummary);
    setAppliedSections((prev) => ({ ...prev, summary: true }));
  };

  const applyBullets = () => {
    if (!calibratedData?.calibratedBullets || !profile.workExperience) return;
    for (const item of calibratedData.calibratedBullets) {
      const exp = profile.workExperience.find((e: any) => e.id === item.expId);
      if (exp && exp.responsibilities) {
        const updatedResps = exp.responsibilities.map((r: string) => (r === item.original ? item.improved : r));
        updateWorkExperience(item.expId, { responsibilities: updatedResps });
      }
    }
    setAppliedSections((prev) => ({ ...prev, bullets: true }));
  };

  const applySkills = () => {
    if (!calibratedData?.suggestedSkills) return;
    updateSkills(calibratedData.suggestedSkills);
    setAppliedSections((prev) => ({ ...prev, skills: true }));
  };

  const applyAll = () => {
    applySummary();
    applyBullets();
    applySkills();
    setAppliedSections({ summary: true, bullets: true, skills: true, all: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-studio-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-studio-200 my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-brand-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-studio-900 flex items-center gap-2">
                <span>AI Resume Calibrator & ATS Optimizer</span>
              </h2>
              <p className="text-xs text-studio-500">
                Calibrates action verbs, quantifiable achievements, and keywords to maximize recruiter screening pass-rate.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-studio-100 rounded-lg text-studio-400 hover:text-studio-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Role & Trigger */}
        <div className="bg-studio-50 border border-studio-200 rounded-xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-studio-700 mb-1">Target Calibration Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer, React Developer"
              className="w-full border rounded-lg px-3 py-1.5 text-xs bg-white text-studio-900 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={handleRunCalibration}
            disabled={loading}
            className="sm:self-end px-5 py-2 bg-gradient-to-r from-violet-600 to-brand-600 hover:from-violet-700 hover:to-brand-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Calibrating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{calibratedData ? 'Re-Calibrate Resume' : 'Start AI Calibration'}</span>
              </>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {!calibratedData && !loading && (
            <div className="py-12 text-center space-y-3">
              <TrendingUp className="w-12 h-12 text-studio-300 mx-auto" />
              <h3 className="font-bold text-sm text-studio-700">Ready to Calibrate Your Resume</h3>
              <p className="text-xs text-studio-500 max-w-md mx-auto">
                Click &ldquo;Start AI Calibration&rdquo; above. Our AI engine will inspect your work experience bullet points, professional summary, and technical skills to suggest high-impact improvements.
              </p>
            </div>
          )}

          {loading && (
            <div className="py-14 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
              <h3 className="font-bold text-sm text-studio-800">Analyzing & Calibrating Resume...</h3>
              <p className="text-xs text-studio-500">
                Auditing action verbs, quantifying results, and benchmarking keywords against ATS standards.
              </p>
            </div>
          )}

          {calibratedData && !loading && (
            <>
              {/* Scorecard */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="col-span-2 sm:col-span-1 bg-brand-50 border border-brand-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-brand-700 block mb-1">ATS Score</span>
                  <span className="text-2xl font-black text-brand-700">{calibratedData.overallScore}</span>
                  <span className="text-[10px] text-brand-600 block">/ 100</span>
                </div>
                <div className="bg-white border border-studio-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-studio-500 block mb-1">Impact</span>
                  <span className="text-lg font-bold text-studio-800">{calibratedData.scores.impact}%</span>
                </div>
                <div className="bg-white border border-studio-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-studio-500 block mb-1">Action Verbs</span>
                  <span className="text-lg font-bold text-studio-800">{calibratedData.scores.verbs}%</span>
                </div>
                <div className="bg-white border border-studio-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-studio-500 block mb-1">Skills</span>
                  <span className="text-lg font-bold text-studio-800">{calibratedData.scores.skills}%</span>
                </div>
                <div className="bg-white border border-studio-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-studio-500 block mb-1">Brevity</span>
                  <span className="text-lg font-bold text-studio-800">{calibratedData.scores.readability}%</span>
                </div>
              </div>

              {/* Action Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-900">
                    Calibration recommendations ready to apply to your resume.
                  </span>
                </div>
                <button
                  onClick={applyAll}
                  disabled={appliedSections.all}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
                >
                  {appliedSections.all ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>All Applied</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply All Improvements</span>
                    </>
                  )}
                </button>
              </div>

              {/* Section 1: Professional Summary */}
              {calibratedData.calibratedSummary && (
                <div className="border border-studio-200 rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-studio-800 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-brand-600" />
                      <span>Calibrated Professional Summary</span>
                    </span>
                    <button
                      onClick={applySummary}
                      disabled={appliedSections.summary}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded border border-brand-200 text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                    >
                      {appliedSections.summary ? 'Applied' : 'Apply Summary'}
                    </button>
                  </div>
                  <p className="text-xs text-studio-700 bg-studio-50 p-2.5 rounded-lg leading-relaxed">
                    {calibratedData.calibratedSummary}
                  </p>
                </div>
              )}

              {/* Section 2: Bullet Points */}
              {calibratedData.calibratedBullets && calibratedData.calibratedBullets.length > 0 && (
                <div className="border border-studio-200 rounded-xl p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-studio-800 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Calibrated Experience Bullet Points ({calibratedData.calibratedBullets.length})</span>
                    </span>
                    <button
                      onClick={applyBullets}
                      disabled={appliedSections.bullets}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded border border-brand-200 text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                    >
                      {appliedSections.bullets ? 'Applied' : 'Apply Bullets'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {calibratedData.calibratedBullets.map((b, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-studio-100 bg-studio-50/60 text-xs space-y-1">
                        <div className="text-[11px] text-studio-400 line-through">&ldquo;{b.original}&rdquo;</div>
                        <div className="text-studio-900 font-medium flex items-start gap-1">
                          <ArrowRight className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{b.improved}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Skills */}
              {calibratedData.suggestedSkills && (
                <div className="border border-studio-200 rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-studio-800 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>Calibrated Skills Profile</span>
                    </span>
                    <button
                      onClick={applySkills}
                      disabled={appliedSections.skills}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded border border-brand-200 text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                    >
                      {appliedSections.skills ? 'Applied' : 'Apply Skills'}
                    </button>
                  </div>
                  <div className="text-xs text-studio-600 space-y-1 bg-studio-50 p-2.5 rounded-lg">
                    <div>
                      <strong className="text-studio-800">Technical Skills:</strong>{' '}
                      {calibratedData.suggestedSkills.technicalSkills.join(', ')}
                    </div>
                    <div>
                      <strong className="text-studio-800">Core Competencies:</strong>{' '}
                      {calibratedData.suggestedSkills.jobSkills.join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t pt-4 mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-studio-200 rounded-lg text-xs font-semibold text-studio-600 hover:bg-studio-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
