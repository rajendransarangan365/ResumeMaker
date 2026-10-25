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
} from 'lucide-react';
import { api } from '@/lib/api';
import { useResumeEditorStore } from '@/stores/resume-editor.store';
import { LiveDocumentCanvas } from '@/components/LiveDocumentCanvas';
import { PageBalanceAlert } from '@/components/PageBalanceAlert';
import { TemplateGalleryModal } from '@/components/TemplateGalleryModal';
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
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const {
    resume,
    profile,
    zoomLevel,
    mobileMode,
    isSaving,
    isDirty,
    pageMetrics,
    setResumeAndProfile,
    setZoomLevel,
    setMobileMode,
    setIsSaving,
    setIsDirty,
    setTemplateId,
    updateFormatting,
    updateProfileDetails,
    updateProfessionalSummary,
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
    // Open printable HTML stream in new window for direct native PDF print
    window.open(`/api/v1/exports/preview/${actualResumeId}`, '_blank');
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

  return (
    <div className="resume-editor">
      {/* Top Editor Toolbar */}
      <div className="resume-editor__toolbar">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/resumes')}
            className="p-1.5 hover:bg-studio-100 rounded text-studio-600 transition-colors"
            title="Back to Resumes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <input
              type="text"
              value={resume.title}
              onChange={(e) => {
                useResumeEditorStore.setState((state) => ({
                  resume: state.resume ? { ...state.resume, title: e.target.value } : null,
                  isDirty: true,
                }));
              }}
              className="font-bold text-sm text-studio-900 bg-transparent hover:bg-studio-100/60 focus:bg-white border-b border-transparent focus:border-brand-500 rounded px-1.5 py-0.5"
            />
            <div className="flex items-center gap-2 text-[11px] text-studio-500 px-1.5">
              <span>{currentTemplate.displayName}</span>
              <span>•</span>
              <span className={isDirty ? 'text-amber-600 font-medium' : 'text-emerald-600'}>
                {isDirty ? 'Unsaved changes' : 'Saved'}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          {saveFeedback && (
            <span className="text-xs text-emerald-600 font-medium mr-2 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{saveFeedback}</span>
            </span>
          )}

          <button
            onClick={() => setTemplateModalOpen(true)}
            className="px-3 py-1.5 bg-white border border-studio-200 hover:bg-studio-50 text-studio-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Layout className="w-3.5 h-3.5 text-brand-600" />
            <span>Templates (15)</span>
          </button>

          <button
            onClick={handleExportDocx}
            className="px-3 py-1.5 bg-white border border-studio-200 hover:bg-studio-50 text-studio-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            title="Export as native editable Microsoft Word document"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Word (.docx)</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3 py-1.5 bg-white border border-studio-200 hover:bg-studio-50 text-studio-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            title="Export as high-fidelity selectable-text PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>PDF (A4)</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex sm:hidden items-center bg-studio-100 p-1 rounded-lg">
          <button
            onClick={() => setMobileMode('edit')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              mobileMode === 'edit' ? 'bg-white shadow-sm text-studio-900' : 'text-studio-500'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setMobileMode('preview')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              mobileMode === 'preview' ? 'bg-white shadow-sm text-studio-900' : 'text-studio-500'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setMobileMode('design')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              mobileMode === 'design' ? 'bg-white shadow-sm text-studio-900' : 'text-studio-500'
            }`}
          >
            Design
          </button>
        </div>
      </div>

      {/* 3-Pane Workspace */}
      <div className="resume-editor__workspace">
        {/* Left Pane: Content Sections (Hidden on mobile if not 'edit' mode) */}
        <div
          className={`resume-editor__sidebar ${
            mobileMode !== 'edit' ? 'hidden sm:block' : 'w-full sm:w-96'
          }`}
        >
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-studio-400 mb-2">
              Resume Content Sections
            </h2>

            {/* Personal Details Section */}
            <div className="rounded-lg border border-studio-200 bg-white p-3.5 shadow-sm space-y-2">
              <span className="font-bold text-xs text-studio-800 block">Personal Details</span>
              <input
                type="text"
                placeholder="Full Name"
                value={profile.personalDetails.fullName || ''}
                onChange={(e) => updateProfileDetails({ fullName: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
              <input
                type="text"
                placeholder="Professional Headline"
                value={profile.personalDetails.headline || ''}
                onChange={(e) => updateProfileDetails({ headline: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={profile.personalDetails.email || ''}
                  onChange={(e) => updateProfileDetails({ email: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={profile.personalDetails.phone || ''}
                  onChange={(e) => updateProfileDetails({ phone: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
            </div>

            {/* Summary Section */}
            <div className="rounded-lg border border-studio-200 bg-white p-3.5 shadow-sm space-y-2">
              <span className="font-bold text-xs text-studio-800 block">Professional Summary</span>
              <textarea
                rows={4}
                value={profile.professionalSummary || ''}
                onChange={(e) => updateProfessionalSummary(e.target.value)}
                placeholder="Executive summary..."
                className="w-full border rounded p-2 text-xs leading-relaxed"
              />
            </div>

            {/* Work Experience Section */}
            <div className="rounded-lg border border-studio-200 bg-white p-3.5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-studio-800">
                  Work Experience ({profile.workExperience.length})
                </span>
              </div>
              <p className="text-[11px] text-studio-500">
                To add or modify detailed roles, update your Master Profile or edit entries directly.
              </p>
              {profile.workExperience.map((exp: any, i: number) => (
                <div key={exp.id || i} className="p-2 border rounded bg-studio-50/50 text-xs">
                  <div className="font-semibold text-studio-900">{exp.jobTitle}</div>
                  <div className="text-studio-500 text-[11px]">{exp.employer} ({exp.startDate} - {exp.endDate})</div>
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="rounded-lg border border-studio-200 bg-white p-3.5 shadow-sm space-y-2">
              <span className="font-bold text-xs text-studio-800">
                Education ({profile.education.length})
              </span>
              {profile.education.map((edu: any, i: number) => (
                <div key={edu.id || i} className="p-2 border rounded bg-studio-50/50 text-xs">
                  <div className="font-semibold text-studio-900">{edu.qualification}</div>
                  <div className="text-studio-500 text-[11px]">{edu.institution} ({edu.endDate})</div>
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div className="rounded-lg border border-studio-200 bg-white p-3.5 shadow-sm space-y-2">
              <span className="font-bold text-xs text-studio-800">Technical Skills</span>
              <input
                type="text"
                value={profile.skills.technicalSkills.join(', ')}
                onChange={(e) =>
                  useResumeEditorStore.getState().updateSkills({
                    technicalSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Center Pane: Live Document Preview & Page Balancing */}
        <div
          className={`resume-editor__canvas ${
            mobileMode !== 'preview' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="w-full max-w-3xl mb-4">
            <PageBalanceAlert metrics={pageMetrics} />
          </div>

          <LiveDocumentCanvas
            profile={profile}
            resume={resume}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
          />
        </div>

        {/* Right Pane: Design & Formatting Controls (Hidden on mobile if not 'design' mode) */}
        <div
          className={`resume-editor__panel ${
            mobileMode !== 'design' ? 'hidden xl:block' : 'block w-full xl:w-80'
          }`}
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-studio-400 mb-3">
                Layout & Formatting
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-studio-700 mb-1">Active ATS Template</label>
                  <button
                    onClick={() => setTemplateModalOpen(true)}
                    className="w-full flex items-center justify-between p-2.5 border rounded-lg bg-studio-50 hover:bg-studio-100 text-left font-semibold text-studio-800"
                  >
                    <span>{currentTemplate.displayName}</span>
                    <ChevronRight className="w-4 h-4 text-studio-400" />
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-studio-700 mb-1">
                    Font Size: {resume.formatting.fontSizePt}pt
                  </label>
                  <input
                    type="range"
                    min="8.5"
                    max="12"
                    step="0.5"
                    value={resume.formatting.fontSizePt}
                    onChange={(e) => updateFormatting({ fontSizePt: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-studio-700 mb-1">
                    Margins: {resume.formatting.marginsMm}mm
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="25"
                    step="1"
                    value={resume.formatting.marginsMm}
                    onChange={(e) => updateFormatting({ marginsMm: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-studio-700 mb-1">
                    Line Spacing: {resume.formatting.lineSpacing}
                  </label>
                  <input
                    type="range"
                    min="1.1"
                    max="1.6"
                    step="0.05"
                    value={resume.formatting.lineSpacing}
                    onChange={(e) => updateFormatting({ lineSpacing: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-studio-700 mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={resume.formatting.accentColor}
                      onChange={(e) => updateFormatting({ accentColor: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="font-mono text-studio-600">{resume.formatting.accentColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-studio-700 mb-1">Page Standard</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['A4', 'Letter'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updateFormatting({ pageSize: size })}
                        className={`py-1.5 rounded font-semibold text-xs border ${
                          resume.formatting.pageSize === size
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-studio-700 border-studio-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-studio-200 space-y-2">
              <button
                onClick={handleExportDocx}
                className="w-full py-2.5 px-3 bg-white border border-studio-300 hover:bg-studio-50 text-studio-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <FileDown className="w-4 h-4 text-blue-600" />
                <span>Export Word (.docx)</span>
              </button>
              <button
                onClick={handleExportPdf}
                className="w-full py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF (Print/A4)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selector Modal */}
      <TemplateGalleryModal
        currentTemplateId={resume.templateId}
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={(newId) => setTemplateId(newId)}
      />
    </div>
  );
}
