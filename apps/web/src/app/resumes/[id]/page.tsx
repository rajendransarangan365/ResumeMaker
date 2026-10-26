'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Download,
  Layout,
  Sliders,
  Eye,
  FileEdit,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileDown,
  Maximize2,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Wand2,
  RotateCcw,
  Undo2,
  MessageSquare,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Award,
  Share2,
  X,
  Palette,
  Bot,
} from 'lucide-react';
import { api, getApiBase } from '@/lib/api';
import { useResumeEditorStore } from '@/stores/resume-editor.store';
import { LiveDocumentCanvas } from '@/components/LiveDocumentCanvas';
import { PageBalanceAlert } from '@/components/PageBalanceAlert';
import { TemplateGalleryModal } from '@/components/TemplateGalleryModal';
import { AiResumeCalibratorModal } from '@/components/AiResumeCalibratorModal';
import { saveLocalDraft } from '@/lib/offline-storage';
import { TEMPLATE_LIST, getTemplateById } from '@ats/template-registry';

interface PageProps {
  params: { id: string };
}

export default function ResumeEditorPage({ params }: PageProps) {
  const router = useRouter();
  const resumeId = params.id;

  const [loading, setLoading] = useState(true);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [calibratorModalOpen, setCalibratorModalOpen] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [optimizingBulletId, setOptimizingBulletId] = useState<string | null>(null);
  const [optimizingSummary, setOptimizingSummary] = useState(false);
  const [bulletHistory, setBulletHistory] = useState<Record<string, string[]>>({});
  const [activePromptBulletId, setActivePromptBulletId] = useState<string | null>(null);
  const [customPromptText, setCustomPromptText] = useState<string>('');

  // Mobile Word-style ribbon sheets
  const [mobileSheet, setMobileSheet] = useState<'content' | 'format' | 'ai' | 'export' | null>(null);

  // Accordion open/collapse states for sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    projects: true,
    skills: true,
  });

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const {
    resume,
    profile,
    zoomLevel,
    isSaving,
    isDirty,
    pageMetrics,
    setResumeAndProfile,
    setZoomLevel,
    setIsSaving,
    setIsDirty,
    setTemplateId,
    updateFormatting,
    updateProfileDetails,
    updateProfessionalSummary,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    updateSkills,
    recalculateMetrics,
  } = useResumeEditorStore();

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  const loadResume = async () => {
    setLoading(true);
    const res = await api.getResume(resumeId);
    if (res.success && res.data) {
      setResumeAndProfile(res.data.resume, res.data.profile);
    } else if (
      res.error?.code === 'UNAUTHORIZED' ||
      res.error?.message?.toLowerCase().includes('unauthorized') ||
      res.error?.message?.toLowerCase().includes('authentication')
    ) {
      router.push(`/login?redirect=/resumes/${resumeId}`);
      return;
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!resume || !profile) return;
    setIsSaving(true);

    const actualResumeId = resume.id || (resume as any)._id || resumeId;
    const actualProfileId = profile.id || (profile as any)._id;

    // Save offline draft to IndexedDB
    await saveLocalDraft({ id: actualResumeId, resume, profile });

    // Persist to server
    const [resumeRes, profileRes] = await Promise.all([
      api.updateResume(actualResumeId, resume),
      api.updateProfile(actualProfileId, profile),
    ]);

    setIsSaving(false);

    if (resumeRes.success && profileRes.success) {
      setIsDirty(false);
      setSaveFeedback('All changes saved successfully.');
      setTimeout(() => setSaveFeedback(null), 3000);
    } else {
      setSaveFeedback('Saved locally (Offline Mode).');
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  const handleExportDocx = async () => {
    if (!resume) return;
    const actualResumeId = resume.id || (resume as any)._id || resumeId;
    await api.downloadDocx(actualResumeId, resume.title);
  };

  const handleExportPdf = () => {
    if (!resume) return;
    const actualResumeId = resume.id || (resume as any)._id || resumeId;
    const base = getApiBase();
    window.open(`${base}/exports/preview/${actualResumeId}?print=true`, '_blank');
  };

  // Quick or Custom AI Bullet Optimization
  const handleOptimizeBullet = async (
    expId: string,
    bulletIdx: number,
    originalText: string,
    promptInstruction?: string
  ) => {
    if (!originalText || originalText.trim().length < 5) return;
    const key = `${expId}-${bulletIdx}`;
    setOptimizingBulletId(key);

    // Save previous state to bulletHistory stack for instant Undo
    setBulletHistory((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), originalText],
    }));

    try {
      const res = await api.optimizeBullet({
        originalText,
        targetRole: profile?.personalDetails?.headline || 'Software Engineer',
        customPrompt: promptInstruction || customPromptText || undefined,
      });
      if (res.success && res.data?.improvedBullets && res.data.improvedBullets.length > 0) {
        const exp = profile?.workExperience.find((e: any) => e.id === expId);
        if (exp) {
          const updated = [...exp.responsibilities];
          updated[bulletIdx] = res.data.improvedBullets[0];
          updateWorkExperience(expId, { responsibilities: updated });
        }
        if (activePromptBulletId === key) {
          setActivePromptBulletId(null);
          setCustomPromptText('');
        }
      }
    } catch (err) {
      console.error('Failed to optimize bullet:', err);
    } finally {
      setOptimizingBulletId(null);
    }
  };

  // Undo AI Bullet Polish
  const handleUndoBullet = (expId: string, bulletIdx: number) => {
    const key = `${expId}-${bulletIdx}`;
    const history = bulletHistory[key] || [];
    if (history.length === 0) return;

    const previousText = history[history.length - 1];
    setBulletHistory((prev) => ({
      ...prev,
      [key]: prev[key].slice(0, -1),
    }));

    const exp = profile?.workExperience.find((e: any) => e.id === expId);
    if (exp) {
      const updated = [...exp.responsibilities];
      updated[bulletIdx] = previousText;
      updateWorkExperience(expId, { responsibilities: updated });
    }
  };

  // Quick AI Summary Polish
  const handlePolishSummary = async () => {
    if (!profile) return;
    setOptimizingSummary(true);
    try {
      const res = await api.calibrateResume({
        profile,
        targetRole: profile.personalDetails?.headline || 'Software Engineer',
      });
      if (res.success && res.data?.calibratedSummary) {
        updateProfessionalSummary(res.data.calibratedSummary);
      }
    } catch (err) {
      console.error('Failed to polish summary:', err);
    } finally {
      setOptimizingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-sm text-studio-500">
        Loading resume editor...
      </div>
    );
  }

  if (!resume || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-base font-bold text-studio-900 mb-2">Resume Not Found</h2>
        <button
          onClick={() => router.push('/resumes')}
          className="text-xs text-brand-600 underline"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const currentTemplate = getTemplateById(resume.templateId);

  // ---------------------------------------------------------------------------
  // Reusable Content Sections Renderer (used in Desktop Sidebar & Mobile Sheet)
  // ---------------------------------------------------------------------------
  const renderContentSections = (isMobileSheet = false) => {
    return (
      <div className="space-y-4">
        {/* Quick jump badges in mobile sheet */}
        {isMobileSheet && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['personal', 'summary', 'experience', 'education', 'projects', 'skills'].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  setExpandedSections((prev) => ({ ...prev, [sec]: true }));
                  const el = document.getElementById(`section-${sec}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap bg-studio-100 hover:bg-brand-50 hover:text-brand-700 text-studio-700 capitalize border border-studio-200"
              >
                {sec}
              </button>
            ))}
          </div>
        )}

        {/* 1. Personal Details Section */}
        <div id="section-personal" className="rounded-xl border border-studio-200 bg-white shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full flex items-center justify-between p-3.5 bg-studio-50/60 hover:bg-studio-50 text-left border-b border-studio-100"
          >
            <span className="font-bold text-xs text-studio-800">Personal Details</span>
            {expandedSections.personal ? (
              <ChevronDown className="w-4 h-4 text-studio-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-studio-400" />
            )}
          </button>

          {expandedSections.personal && (
            <div className="p-3.5 space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarangan Rajendran"
                  value={profile.personalDetails.fullName || ''}
                  onChange={(e) => updateProfileDetails({ fullName: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">Professional Headline</label>
                <input
                  type="text"
                  placeholder="e.g. React Developer | MERN Stack Developer"
                  value={profile.personalDetails.headline || ''}
                  onChange={(e) => updateProfileDetails({ headline: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">Email</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={profile.personalDetails.email || ''}
                    onChange={(e) => updateProfileDetails({ email: e.target.value })}
                    className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9629991655"
                    value={profile.personalDetails.phone || ''}
                    onChange={(e) => updateProfileDetails({ phone: e.target.value })}
                    className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">City / Location</label>
                  <input
                    type="text"
                    placeholder="Chennai / Pudukkottai"
                    value={profile.personalDetails.city || ''}
                    onChange={(e) => updateProfileDetails({ city: e.target.value })}
                    className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">Country</label>
                  <input
                    type="text"
                    placeholder="India"
                    value={profile.personalDetails.country || ''}
                    onChange={(e) => updateProfileDetails({ country: e.target.value })}
                    className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="linkedin.com/in/username"
                    value={profile.personalDetails.linkedinUrl || ''}
                    onChange={(e) => updateProfileDetails({ linkedinUrl: e.target.value })}
                    className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="github.com/username"
                    value={profile.personalDetails.githubUrl || ''}
                    onChange={(e) => updateProfileDetails({ githubUrl: e.target.value })}
                    className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Professional Summary Section */}
        <div id="section-summary" className="rounded-xl border border-studio-200 bg-white shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full flex items-center justify-between p-3.5 bg-studio-50/60 hover:bg-studio-50 text-left border-b border-studio-100"
          >
            <span className="font-bold text-xs text-studio-800">Professional Summary</span>
            {expandedSections.summary ? (
              <ChevronDown className="w-4 h-4 text-studio-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-studio-400" />
            )}
          </button>

          {expandedSections.summary && (
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-studio-500">
                  {(profile.professionalSummary || '').length} characters
                </span>
                <button
                  onClick={handlePolishSummary}
                  disabled={optimizingSummary}
                  className="text-[11px] font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 disabled:opacity-50"
                  title="AI Polish Summary"
                >
                  <Wand2 className="w-3 h-3 text-amber-500" />
                  <span>{optimizingSummary ? 'Polishing...' : 'AI Polish'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={profile.professionalSummary || ''}
                onChange={(e) => updateProfessionalSummary(e.target.value)}
                placeholder="Concise overview of your technical stack and accomplishments..."
                className="w-full border rounded-lg p-2.5 text-xs leading-relaxed text-studio-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}
        </div>

        {/* 3. Work Experience Section */}
        <div id="section-experience" className="rounded-xl border border-studio-200 bg-white shadow-xs overflow-hidden">
          <div className="w-full flex items-center justify-between p-3.5 bg-studio-50/60 border-b border-studio-100">
            <button
              onClick={() => toggleSection('experience')}
              className="flex items-center gap-2 text-left"
            >
              <Briefcase className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-xs text-studio-800">
                Work Experience ({profile.workExperience?.length || 0})
              </span>
              {expandedSections.experience ? (
                <ChevronDown className="w-3.5 h-3.5 text-studio-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-studio-400" />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                addWorkExperience({
                  id: `exp-${Date.now()}`,
                  jobTitle: 'Software Engineer',
                  employer: 'Company / Client Name',
                  employmentType: 'Full-time',
                  startDate: '2023',
                  endDate: 'Present',
                  isCurrent: true,
                  responsibilities: ['Developed and maintained high-performance scalable systems.'],
                  technologies: [],
                  includeInResume: true,
                })
              }
              className="px-2.5 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          </div>

          {expandedSections.experience && (
            <div className="p-3.5 space-y-4">
              {profile.workExperience.length === 0 && (
                <p className="text-xs text-studio-400 text-center py-2">
                  No experience entries yet. Click &ldquo;Add Role&rdquo; above.
                </p>
              )}

              {profile.workExperience.map((exp: any, index: number) => (
                <div
                  key={exp.id || index}
                  className="p-3 rounded-xl border border-studio-200 bg-studio-50/40 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="font-bold text-xs text-studio-800">
                      #{index + 1} {exp.jobTitle || 'Role'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeWorkExperience(exp.id)}
                      className="text-studio-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Remove experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">
                        Employment & Experience Type
                      </label>
                      <select
                        value={exp.employmentType || 'Full-time'}
                        onChange={(e) => updateWorkExperience(exp.id, { employmentType: e.target.value as any })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs text-studio-900 font-medium"
                      >
                        <option value="Full-time">Full-time (Standard Role)</option>
                        <option value="Freelance">Freelance / Client Projects</option>
                        <option value="Business / Founder">Business / Founder / Operations</option>
                        <option value="Contract">Contract / Consulting</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship / Trainee</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Full Stack Developer"
                        value={exp.jobTitle || ''}
                        onChange={(e) => updateWorkExperience(exp.id, { jobTitle: e.target.value })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">Employer / Client / Business</label>
                      <input
                        type="text"
                        placeholder="e.g. Freelance / Self-Employed or Company"
                        value={exp.employer || ''}
                        onChange={(e) => updateWorkExperience(exp.id, { employer: e.target.value })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">Start Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Jun 2022"
                        value={exp.startDate || ''}
                        onChange={(e) => updateWorkExperience(exp.id, { startDate: e.target.value })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">End Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Present"
                        value={exp.isCurrent ? 'Present' : exp.endDate || ''}
                        disabled={exp.isCurrent}
                        onChange={(e) => updateWorkExperience(exp.id, { endDate: e.target.value })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs disabled:bg-studio-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${exp.id}`}
                      checked={exp.isCurrent || false}
                      onChange={(e) =>
                        updateWorkExperience(exp.id, {
                          isCurrent: e.target.checked,
                          endDate: e.target.checked ? 'Present' : exp.endDate,
                        })
                      }
                      className="rounded text-brand-600"
                    />
                    <label htmlFor={`current-${exp.id}`} className="text-[11px] text-studio-700 font-medium">
                      I currently work here
                    </label>
                  </div>

                  {/* Bullet points editing */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-studio-700">
                        Bullet Points ({exp.responsibilities?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(exp.responsibilities || []), ''];
                          updateWorkExperience(exp.id, { responsibilities: updated });
                        }}
                        className="text-[10px] text-brand-600 hover:text-brand-700 font-bold flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet</span>
                      </button>
                    </div>

                    {(exp.responsibilities || []).map((b: string, bIdx: number) => {
                      const bulletKey = `${exp.id}-${bIdx}`;
                      const isOptimizingThis = optimizingBulletId === bulletKey;
                      const hasUndoHistory = (bulletHistory[bulletKey] || []).length > 0;
                      const isPromptOpen = activePromptBulletId === bulletKey;

                      return (
                        <div key={bIdx} className="space-y-1.5 p-2 rounded-lg bg-white border border-studio-200 shadow-2xs">
                          {/* Bullet Input Row */}
                          <div className="flex items-start gap-1.5">
                            <span className="text-brand-600 font-bold text-sm mt-0.5">•</span>
                            <textarea
                              rows={2}
                              value={b}
                              onChange={(e) => {
                                const updated = [...exp.responsibilities];
                                updated[bIdx] = e.target.value;
                                updateWorkExperience(exp.id, { responsibilities: updated });
                              }}
                              placeholder="Action verb + accomplishment + measurable metric..."
                              className="flex-1 border border-studio-200 rounded p-1.5 text-xs bg-white text-studio-900 leading-snug focus:ring-1 focus:ring-brand-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = exp.responsibilities.filter((_: any, i: number) => i !== bIdx);
                                updateWorkExperience(exp.id, { responsibilities: updated });
                              }}
                              className="p-1 text-studio-400 hover:text-red-500 rounded transition-colors"
                              title="Delete bullet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Action Toolbar directly beneath bullet */}
                          <div className="flex items-center justify-between pt-1 border-t border-studio-100 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              {/* Quick AI Polish */}
                              <button
                                type="button"
                                onClick={() => handleOptimizeBullet(exp.id, bIdx, b)}
                                disabled={isOptimizingThis}
                                className="px-2 py-0.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                                title="Quick AI Polish with strong action verbs"
                              >
                                <Sparkles className={`w-3 h-3 ${isOptimizingThis ? 'animate-spin text-amber-500' : 'text-violet-600'}`} />
                                <span>{isOptimizingThis ? 'Polishing...' : 'AI Polish'}</span>
                              </button>

                              {/* Re-Polish with Prompt Drawer Toggle */}
                              <button
                                type="button"
                                onClick={() => setActivePromptBulletId(isPromptOpen ? null : bulletKey)}
                                className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition-colors ${
                                  isPromptOpen
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-studio-100 hover:bg-studio-200 text-studio-700'
                                }`}
                                title="Prompt AI with custom instructions"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>Prompt / Suggestions</span>
                              </button>
                            </div>

                            {/* Undo Polish Button (Always Visible & Clearly Labeled) */}
                            <button
                              type="button"
                              onClick={() => handleUndoBullet(exp.id, bIdx)}
                              disabled={!hasUndoHistory}
                              className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition-all ${
                                hasUndoHistory
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold cursor-pointer shadow-2xs'
                                  : 'bg-studio-50 text-studio-300 cursor-not-allowed'
                              }`}
                              title={
                                hasUndoHistory
                                  ? `Undo last polish (${bulletHistory[bulletKey].length} version available)`
                                  : 'No AI polish edits to undo yet'
                              }
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Undo{hasUndoHistory ? ` (${bulletHistory[bulletKey].length})` : ''}</span>
                            </button>
                          </div>

                          {/* Expandable Suggestion & Re-prompting Drawer */}
                          {isPromptOpen && (
                            <div className="mt-2 p-2.5 rounded-lg border border-violet-200 bg-violet-50/90 space-y-2 animate-in fade-in duration-150">
                              <div className="flex items-center justify-between text-[11px] font-bold text-violet-900">
                                <span className="flex items-center gap-1.5">
                                  <Wand2 className="w-3 h-3 text-violet-600" />
                                  <span>Click suggestion or type prompt:</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActivePromptBulletId(null)}
                                  className="text-studio-400 hover:text-studio-700 text-xs px-1"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Quick Suggestion Chips */}
                              <div className="flex flex-wrap gap-1">
                                {[
                                  'Add quantifiable metrics & results',
                                  'Make punchy & concise',
                                  'Highlight technical stack & architecture',
                                  'Focus on freelance client turnaround',
                                  'Show business ownership & operations',
                                ].map((chip) => (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={() => {
                                      setCustomPromptText(chip);
                                      handleOptimizeBullet(exp.id, bIdx, b, chip);
                                    }}
                                    className="px-2 py-0.5 bg-white border border-violet-200 hover:border-violet-400 rounded-full text-[10px] text-violet-700 hover:bg-violet-100 transition-colors shadow-2xs"
                                  >
                                    + {chip}
                                  </button>
                                ))}
                              </div>

                              {/* Custom Prompt Box */}
                              <div className="flex gap-1.5 pt-0.5">
                                <input
                                  type="text"
                                  placeholder="e.g. Focus on ASP.NET & React, add 25% performance improvement..."
                                  value={customPromptText}
                                  onChange={(e) => setCustomPromptText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleOptimizeBullet(exp.id, bIdx, b, customPromptText);
                                    }
                                  }}
                                  className="flex-1 border border-violet-300 rounded px-2.5 py-1 text-xs bg-white text-studio-900 focus:ring-1 focus:ring-violet-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleOptimizeBullet(exp.id, bIdx, b, customPromptText)}
                                  disabled={isOptimizingThis}
                                  className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-xs"
                                >
                                  {isOptimizingThis ? 'Polishing...' : 'Polish'}
                                </button>
                                {hasUndoHistory && (
                                  <button
                                    type="button"
                                    onClick={() => handleUndoBullet(exp.id, bIdx)}
                                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                                    title="Undo last polish"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Undo</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Education Section */}
        <div id="section-education" className="rounded-xl border border-studio-200 bg-white shadow-xs overflow-hidden">
          <div className="w-full flex items-center justify-between p-3.5 bg-studio-50/60 border-b border-studio-100">
            <button
              onClick={() => toggleSection('education')}
              className="flex items-center gap-2 text-left"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs text-studio-800">
                Education ({profile.education?.length || 0})
              </span>
              {expandedSections.education ? (
                <ChevronDown className="w-3.5 h-3.5 text-studio-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-studio-400" />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                addEducation({
                  id: `edu-${Date.now()}`,
                  qualification: 'Bachelor of Engineering',
                  specialization: 'Computer Science',
                  institution: 'College / University',
                  startDate: '2016',
                  endDate: '2020',
                  gradePercentageCgpa: '7.5 CGPA',
                  includeInResume: true,
                })
              }
              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          {expandedSections.education && (
            <div className="p-3.5 space-y-4">
              {profile.education.length === 0 && (
                <p className="text-xs text-studio-400 text-center py-2">
                  No education entries yet. Click &ldquo;Add Education&rdquo; above.
                </p>
              )}

              {profile.education.map((edu: any, index: number) => (
                <div
                  key={edu.id || index}
                  className="p-3 rounded-xl border border-studio-200 bg-studio-50/40 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="font-bold text-xs text-studio-800">
                      #{index + 1} {edu.qualification || 'Qualification'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="text-studio-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Remove education"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">
                        Degree / Qualification
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bachelor of Engineering in Computer Science"
                        value={edu.qualification || ''}
                        onChange={(e) => updateEducation(edu.id, { qualification: e.target.value })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">Specialization</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={edu.specialization || ''}
                        onChange={(e) => updateEducation(edu.id, { specialization: e.target.value })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">Institution / College</label>
                      <input
                        type="text"
                        placeholder="e.g. College Name"
                        value={edu.institution || ''}
                        onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">Graduation Year / Dates</label>
                      <input
                        type="text"
                        placeholder="e.g. 2016 – 2020"
                        value={edu.endDate || ''}
                        onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">Grade / Percentage / CGPA</label>
                      <input
                        type="text"
                        placeholder="e.g. GPA: 7.23 or 75%"
                        value={edu.gradePercentageCgpa || ''}
                        onChange={(e) => updateEducation(edu.id, { gradePercentageCgpa: e.target.value })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Projects Section */}
        <div id="section-projects" className="rounded-xl border border-studio-200 bg-white shadow-xs overflow-hidden">
          <div className="w-full flex items-center justify-between p-3.5 bg-studio-50/60 border-b border-studio-100">
            <button
              onClick={() => toggleSection('projects')}
              className="flex items-center gap-2 text-left"
            >
              <FolderGit2 className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-xs text-studio-800">
                Projects ({profile.projects?.length || 0})
              </span>
              {expandedSections.projects ? (
                <ChevronDown className="w-3.5 h-3.5 text-studio-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-studio-400" />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                addProject({
                  id: `proj-${Date.now()}`,
                  name: 'New Project',
                  category: 'Professional',
                  technologies: ['React', 'Node.js'],
                  description: 'Engineered full-stack responsive web application.',
                  url: '',
                  githubUrl: '',
                  includeInResume: true,
                })
              }
              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          {expandedSections.projects && (
            <div className="p-3.5 space-y-4">
              {profile.projects.length === 0 && (
                <p className="text-xs text-studio-400 text-center py-2">
                  No project entries yet. Click &ldquo;Add Project&rdquo; above.
                </p>
              )}

              {profile.projects.map((proj: any, index: number) => (
                <div
                  key={proj.id || index}
                  className="p-3 rounded-xl border border-studio-200 bg-studio-50/40 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="font-bold text-xs text-studio-800">
                      #{index + 1} {proj.name || 'Project'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      className="text-studio-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Remove project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">Project Name</label>
                      <input
                        type="text"
                        placeholder="e.g. ATS Resume Intelligence Studio"
                        value={proj.name || ''}
                        onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                        className="w-full border rounded px-2 py-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">
                        Technologies (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. React.js, Node.js, MongoDB"
                        value={(proj.technologies || []).join(', ')}
                        onChange={(e) =>
                          updateProject(proj.id, {
                            technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        className="w-full border rounded px-2 py-1 bg-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">Live Demo URL</label>
                        <input
                          type="url"
                          placeholder="https://my-app.vercel.app"
                          value={proj.url || ''}
                          onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                          className="w-full border rounded px-2 py-1 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">GitHub Repository URL</label>
                        <input
                          type="url"
                          placeholder="https://github.com/username/project"
                          value={proj.githubUrl || ''}
                          onChange={(e) => updateProject(proj.id, { githubUrl: e.target.value })}
                          className="w-full border rounded px-2 py-1 bg-white text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-studio-500 block mb-0.5">Description & Highlights</label>
                      <textarea
                        rows={3}
                        placeholder="Architected responsive UI, integrated REST APIs, improved performance by 20%..."
                        value={proj.description || ''}
                        onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                        className="w-full border rounded p-1.5 bg-white text-xs leading-snug"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Skills Section */}
        <div id="section-skills" className="rounded-xl border border-studio-200 bg-white shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('skills')}
            className="w-full flex items-center justify-between p-3.5 bg-studio-50/60 hover:bg-studio-50 text-left border-b border-studio-100"
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-violet-600" />
              <span className="font-bold text-xs text-studio-800">Skills (3 Categories)</span>
            </div>
            {expandedSections.skills ? (
              <ChevronDown className="w-4 h-4 text-studio-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-studio-400" />
            )}
          </button>

          {expandedSections.skills && (
            <div className="p-3.5 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">
                  Technical Skills (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="React.js, Node.js, C#, ASP.NET, MongoDB, SQL"
                  value={profile.skills.technicalSkills.join(', ')}
                  onChange={(e) =>
                    updateSkills({
                      technicalSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">
                  Core Competencies & Job Skills
                </label>
                <input
                  type="text"
                  placeholder="REST APIs, Full Stack Architecture, Agile/Scrum"
                  value={profile.skills.jobSkills.join(', ')}
                  onChange={(e) =>
                    updateSkills({
                      jobSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-studio-600 block mb-0.5">
                  Tools & Platforms / Computer Skills
                </label>
                <input
                  type="text"
                  placeholder="Git, GitHub, VS Code, Figma, Postman, Linux"
                  value={profile.skills.computerSkills.join(', ')}
                  onChange={(e) =>
                    updateSkills({
                      computerSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-studio-900 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Reusable Formatting Controls (used in Desktop Right Panel & Mobile Sheet)
  // ---------------------------------------------------------------------------
  const renderFormattingControls = (isMobileSheet = false) => {
    return (
      <div className="space-y-5 text-xs">
        <div>
          <label className="block font-semibold text-studio-700 mb-1.5">Active ATS Template</label>
          <button
            onClick={() => setTemplateModalOpen(true)}
            className="w-full flex items-center justify-between p-2.5 border rounded-xl bg-studio-50 hover:bg-studio-100 text-left font-semibold text-studio-800 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: resume.formatting.accentColor }}
              />
              <span>{currentTemplate.displayName}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-studio-400" />
          </button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold text-studio-700">Font Size</label>
            <span className="font-mono text-studio-500 font-bold">{resume.formatting.fontSizePt}pt</span>
          </div>
          <input
            type="range"
            min="8.5"
            max="12"
            step="0.5"
            value={resume.formatting.fontSizePt}
            onChange={(e) => updateFormatting({ fontSizePt: parseFloat(e.target.value) })}
            className="w-full accent-brand-600 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold text-studio-700">Margins</label>
            <span className="font-mono text-studio-500 font-bold">{resume.formatting.marginsMm}mm</span>
          </div>
          <input
            type="range"
            min="10"
            max="25"
            step="1"
            value={resume.formatting.marginsMm}
            onChange={(e) => updateFormatting({ marginsMm: parseInt(e.target.value) })}
            className="w-full accent-brand-600 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold text-studio-700">Line Spacing</label>
            <span className="font-mono text-studio-500 font-bold">{resume.formatting.lineSpacing}</span>
          </div>
          <input
            type="range"
            min="1.1"
            max="1.6"
            step="0.05"
            value={resume.formatting.lineSpacing}
            onChange={(e) => updateFormatting({ lineSpacing: parseFloat(e.target.value) })}
            className="w-full accent-brand-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="block font-semibold text-studio-700 mb-1.5">Accent Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={resume.formatting.accentColor}
              onChange={(e) => updateFormatting({ accentColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-studio-200 cursor-pointer"
            />
            <span className="font-mono text-studio-600 text-xs font-semibold">{resume.formatting.accentColor}</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-studio-700 mb-1.5">Page Standard</label>
          <div className="grid grid-cols-2 gap-2">
            {(['A4', 'Letter'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateFormatting({ pageSize: size })}
                className={`py-1.5 rounded-lg font-semibold text-xs border transition-all ${
                  resume.formatting.pageSize === size
                    ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                    : 'bg-white text-studio-700 border-studio-200 hover:bg-studio-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons inside sheet/panel */}
        <div className="pt-3 border-t border-studio-200 space-y-2">
          <button
            onClick={() => setCalibratorModalOpen(true)}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-violet-600 to-brand-600 hover:from-violet-700 hover:to-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Calibrate Resume</span>
          </button>

          <button
            onClick={handleExportDocx}
            className="w-full py-2.5 px-3 bg-white border border-studio-300 hover:bg-studio-50 text-studio-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            <span>Export Word (.docx)</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="w-full py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF (Print/A4)</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="resume-editor relative">
      {/* Top Editor Toolbar (Responsive Desktop & Word Mobile Header) */}
      <div className="resume-editor__toolbar">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={() => router.push('/resumes')}
            className="p-1.5 hover:bg-studio-100 rounded-lg text-studio-600 hover:text-studio-900 transition-colors shrink-0"
            title="Back to Resumes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col min-w-0">
            <input
              type="text"
              value={resume.title}
              onChange={(e) => {
                useResumeEditorStore.setState((state) => ({
                  resume: state.resume ? { ...state.resume, title: e.target.value } : null,
                  isDirty: true,
                }));
              }}
              className="font-bold text-xs sm:text-sm text-studio-900 bg-transparent hover:bg-studio-100/60 focus:bg-white border-b border-transparent focus:border-brand-500 rounded px-1 py-0.5 truncate max-w-[200px] sm:max-w-md"
            />
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-studio-500 px-1">
              <span className="truncate hidden sm:inline">{currentTemplate.displayName}</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDirty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                <span className={isDirty ? 'text-amber-600 font-medium' : 'text-emerald-600'}>
                  {isDirty ? 'Unsaved' : 'Saved'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {saveFeedback && (
            <span className="text-xs text-emerald-600 font-medium mr-2 flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{saveFeedback}</span>
            </span>
          )}

          <button
            onClick={() => setCalibratorModalOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-brand-600 hover:from-violet-700 hover:to-brand-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            title="Calibrate action verbs, ATS scores, and bullet impact"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Calibrate Resume</span>
          </button>

          <button
            onClick={() => setTemplateModalOpen(true)}
            className="px-3 py-1.5 bg-white border border-studio-200 hover:bg-studio-50 text-studio-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Layout className="w-3.5 h-3.5 text-brand-600" />
            <span>Templates (15)</span>
          </button>

          <button
            onClick={handleExportDocx}
            className="px-3 py-1.5 bg-white border border-studio-200 hover:bg-studio-50 text-studio-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            title="Export as native editable Microsoft Word document"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Word (.docx)</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3 py-1.5 bg-white border border-studio-200 hover:bg-studio-50 text-studio-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            title="Export as high-fidelity selectable-text PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>PDF (A4)</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>

        {/* Mobile Word App Top Actions */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button
            onClick={() => setCalibratorModalOpen(true)}
            className="p-1.5 bg-violet-50 text-violet-700 rounded-lg border border-violet-200"
            title="AI Calibrate"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? '...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Desktop 3-Pane + Word Mobile Continuous Canvas) */}
      <div className="resume-editor__workspace relative">
        {/* Left Pane: Interactive Content Sections (Desktop) */}
        <div className="resume-editor__sidebar hidden sm:block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-studio-400">
              Resume Content Sections
            </h2>
            <button
              onClick={() => setCalibratorModalOpen(true)}
              className="text-[11px] font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>AI Calibrate</span>
            </button>
          </div>

          {renderContentSections(false)}
        </div>

        {/* Center Pane: Live Document Preview (Always visible on all screens!) */}
        <div className="resume-editor__canvas flex flex-1 flex-col items-center justify-start overflow-y-auto p-2 sm:p-6 pb-24 sm:pb-6">
          <div className="w-full max-w-3xl mb-3 sm:mb-4">
            <PageBalanceAlert metrics={pageMetrics} />
          </div>

          <LiveDocumentCanvas
            profile={profile}
            resume={resume}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
          />
        </div>

        {/* Right Pane: Design & Formatting Controls (Desktop) */}
        <div className="resume-editor__panel hidden xl:block">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-studio-400">
              Layout & Formatting
            </h2>
            {renderFormattingControls(false)}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Word Mobile Bottom Ribbon (Fixed at bottom on phones, like Word app) */}
      {/* ------------------------------------------------------------------- */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-studio-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setMobileSheet('content')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
            mobileSheet === 'content' ? 'text-brand-600 font-bold' : 'text-studio-600'
          }`}
        >
          <FileEdit className="w-5 h-5" />
          <span>Content</span>
        </button>

        <button
          onClick={() => setMobileSheet('format')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
            mobileSheet === 'format' ? 'text-brand-600 font-bold' : 'text-studio-600'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span>Design</span>
        </button>

        <button
          onClick={() => setCalibratorModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-violet-600"
        >
          <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center -mt-3 shadow-md border-2 border-white">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <span>AI Copilot</span>
        </button>

        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const widthPx = Math.round((resume.formatting.pageSize === 'A4' ? 210 : 215.9) * 3.7795);
              const fitZoom = Math.min(1.0, Math.max(0.35, Number(((window.innerWidth - 24) / widthPx).toFixed(2))));
              setZoomLevel(zoomLevel === 1.0 ? fitZoom : 1.0);
            }
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-studio-600"
        >
          <Eye className="w-5 h-5" />
          <span>{Math.round(zoomLevel * 100)}%</span>
        </button>

        <button
          onClick={() => setMobileSheet('export')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
            mobileSheet === 'export' ? 'text-brand-600 font-bold' : 'text-studio-600'
          }`}
        >
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Word Mobile Slide-Up Bottom Sheet (Content Drawer) */}
      {/* ------------------------------------------------------------------- */}
      {mobileSheet === 'content' && (
        <div className="fixed inset-0 bg-studio-950/50 backdrop-blur-xs z-50 flex flex-col justify-end sm:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-t-2xl shadow-2xl border-t border-studio-200 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Grab handle & Header */}
            <div className="pt-2 pb-2.5 px-4 border-b border-studio-100 flex items-center justify-between bg-studio-50/70">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-sm text-studio-900">Edit Resume Content</span>
              </div>
              <button
                onClick={() => setMobileSheet(null)}
                className="px-3.5 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-brand-700 transition-colors"
              >
                Done
              </button>
            </div>
            {/* Content Form Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {renderContentSections(true)}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Word Mobile Slide-Up Bottom Sheet (Format / Design Drawer) */}
      {/* ------------------------------------------------------------------- */}
      {mobileSheet === 'format' && (
        <div className="fixed inset-0 bg-studio-950/50 backdrop-blur-xs z-50 flex flex-col justify-end sm:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-t-2xl shadow-2xl border-t border-studio-200 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="pt-2 pb-2.5 px-4 border-b border-studio-100 flex items-center justify-between bg-studio-50/70">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-sm text-studio-900">Design & Typography</span>
              </div>
              <button
                onClick={() => setMobileSheet(null)}
                className="px-3.5 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-brand-700 transition-colors"
              >
                Done
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {renderFormattingControls(true)}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Word Mobile Slide-Up Bottom Sheet (Export Drawer) */}
      {/* ------------------------------------------------------------------- */}
      {mobileSheet === 'export' && (
        <div className="fixed inset-0 bg-studio-950/50 backdrop-blur-xs z-50 flex flex-col justify-end sm:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-t-2xl shadow-2xl border-t border-studio-200 max-h-[50vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="pt-2 pb-2.5 px-4 border-b border-studio-100 flex items-center justify-between bg-studio-50/70">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-sm text-studio-900">Export Resume</span>
              </div>
              <button
                onClick={() => setMobileSheet(null)}
                className="px-3 py-1 bg-studio-200 text-studio-800 rounded-lg text-xs font-bold hover:bg-studio-300 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => {
                  handleExportDocx();
                  setMobileSheet(null);
                }}
                className="w-full py-3 px-4 bg-white border border-studio-300 hover:bg-studio-50 text-studio-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <FileDown className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <p className="font-bold text-xs text-studio-900">Microsoft Word Document (.docx)</p>
                    <p className="text-[10px] text-studio-500">Fully editable text with ATS single-column formatting</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-studio-400" />
              </button>

              <button
                onClick={() => {
                  handleExportPdf();
                  setMobileSheet(null);
                }}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <p className="font-bold text-xs text-white">Download PDF (Print / A4)</p>
                    <p className="text-[10px] text-brand-100">Clean vector fonts, selectable text & clickable links</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      <TemplateGalleryModal
        currentTemplateId={resume.templateId}
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={(newId) => setTemplateId(newId)}
      />

      {/* AI Resume Calibrator Modal */}
      <AiResumeCalibratorModal
        isOpen={calibratorModalOpen}
        onClose={() => setCalibratorModalOpen(false)}
      />
    </div>
  );
}
