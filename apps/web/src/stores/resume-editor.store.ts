import { create } from 'zustand';
import { IResumeVersion, ICandidateProfile, IResumeFormatting } from '@ats/shared-types';
import { getTemplateById } from '@ats/template-registry';
import { calculatePageMetrics, IPageLayoutMetrics } from '@ats/resume-renderer/client';

interface ResumeEditorState {
  resume: IResumeVersion | null;
  profile: ICandidateProfile | null;
  activeSection: string;
  zoomLevel: number; // 0.5 to 1.5
  mobileMode: 'edit' | 'preview' | 'design';
  isSaving: boolean;
  isDirty: boolean;
  pageMetrics: IPageLayoutMetrics | null;

  setResumeAndProfile: (resume: IResumeVersion, profile: ICandidateProfile) => void;
  setActiveSection: (section: string) => void;
  setZoomLevel: (zoom: number) => void;
  setMobileMode: (mode: 'edit' | 'preview' | 'design') => void;
  setIsSaving: (isSaving: boolean) => void;
  setIsDirty: (isDirty: boolean) => void;

  // Updates
  updateFormatting: (formatting: Partial<IResumeFormatting>) => void;
  setTemplateId: (templateId: string) => void;
  reorderSections: (newOrder: string[]) => void;
  toggleSectionVisibility: (section: string, visible: boolean) => void;
  updateProfileDetails: (details: Partial<ICandidateProfile['personalDetails']>) => void;
  updateProfessionalSummary: (summary: string) => void;
  addWorkExperience: (item: any) => void;
  updateWorkExperience: (id: string, updated: any) => void;
  removeWorkExperience: (id: string) => void;
  addEducation: (item: any) => void;
  updateEducation: (id: string, updated: any) => void;
  removeEducation: (id: string) => void;
  addProject: (item: any) => void;
  updateProject: (id: string, updated: any) => void;
  removeProject: (id: string) => void;
  updateSkills: (skills: Partial<ICandidateProfile['skills']>) => void;
  recalculateMetrics: () => void;
}

export const useResumeEditorStore = create<ResumeEditorState>((set, get) => ({
  resume: null,
  profile: null,
  activeSection: 'personal',
  zoomLevel: 1.0,
  mobileMode: 'edit',
  isSaving: false,
  isDirty: false,
  pageMetrics: null,

  setResumeAndProfile: (resume, profile) => {
    const metrics = calculatePageMetrics(profile, resume.formatting);
    set({ resume, profile, pageMetrics: metrics, isDirty: false });
  },

  setActiveSection: (activeSection) => set({ activeSection }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setMobileMode: (mobileMode) => set({ mobileMode }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setIsDirty: (isDirty) => set({ isDirty }),

  updateFormatting: (formattingUpdate) => {
    const { resume, profile } = get();
    if (!resume) return;
    const newFormatting = { ...resume.formatting, ...formattingUpdate };
    const updatedResume = { ...resume, formatting: newFormatting };
    const metrics = profile ? calculatePageMetrics(profile, newFormatting) : null;
    set({ resume: updatedResume, pageMetrics: metrics, isDirty: true });
  },

  setTemplateId: (templateId) => {
    const { resume, profile } = get();
    if (!resume) return;
    const templateDef = getTemplateById(templateId);
    const updatedResume = {
      ...resume,
      templateId,
      sectionOrder: templateDef.defaultSectionOrder,
      formatting: { ...templateDef.defaultFormatting, ...resume.formatting },
    };
    const metrics = profile ? calculatePageMetrics(profile, updatedResume.formatting) : null;
    set({ resume: updatedResume, pageMetrics: metrics, isDirty: true });
  },

  reorderSections: (newOrder) => {
    const { resume } = get();
    if (!resume) return;
    set({ resume: { ...resume, sectionOrder: newOrder }, isDirty: true });
  },

  toggleSectionVisibility: (section, visible) => {
    const { resume } = get();
    if (!resume) return;
    const currentVisibility = { ...(resume.sectionVisibility || {}) };
    currentVisibility[section] = visible;
    set({ resume: { ...resume, sectionVisibility: currentVisibility }, isDirty: true });
  },

  updateProfileDetails: (details) => {
    const { profile, resume } = get();
    if (!profile) return;
    const updatedProfile = {
      ...profile,
      personalDetails: { ...profile.personalDetails, ...details },
    };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  updateProfessionalSummary: (summary) => {
    const { profile, resume } = get();
    if (!profile) return;
    const updatedProfile = { ...profile, professionalSummary: summary };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  addWorkExperience: (item) => {
    const { profile, resume } = get();
    if (!profile) return;
    const updatedProfile = {
      ...profile,
      workExperience: [item, ...profile.workExperience],
    };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  updateWorkExperience: (id, updated) => {
    const { profile, resume } = get();
    if (!profile) return;
    const list = profile.workExperience.map((e) => (e.id === id ? { ...e, ...updated } : e));
    const updatedProfile = { ...profile, workExperience: list };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  removeWorkExperience: (id) => {
    const { profile, resume } = get();
    if (!profile) return;
    const list = profile.workExperience.filter((e) => e.id !== id);
    const updatedProfile = { ...profile, workExperience: list };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  addEducation: (item) => {
    const { profile, resume } = get();
    if (!profile) return;
    const updatedProfile = {
      ...profile,
      education: [item, ...profile.education],
    };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  updateEducation: (id, updated) => {
    const { profile, resume } = get();
    if (!profile) return;
    const list = profile.education.map((e) => (e.id === id ? { ...e, ...updated } : e));
    const updatedProfile = { ...profile, education: list };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  removeEducation: (id) => {
    const { profile, resume } = get();
    if (!profile) return;
    const list = profile.education.filter((e) => e.id !== id);
    const updatedProfile = { ...profile, education: list };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  addProject: (item) => {
    const { profile, resume } = get();
    if (!profile) return;
    const updatedProfile = {
      ...profile,
      projects: [item, ...profile.projects],
    };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  updateProject: (id, updated) => {
    const { profile, resume } = get();
    if (!profile) return;
    const list = profile.projects.map((p) => (p.id === id ? { ...p, ...updated } : p));
    const updatedProfile = { ...profile, projects: list };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  removeProject: (id) => {
    const { profile, resume } = get();
    if (!profile) return;
    const list = profile.projects.filter((p) => p.id !== id);
    const updatedProfile = { ...profile, projects: list };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  updateSkills: (skillsUpdate) => {
    const { profile, resume } = get();
    if (!profile) return;
    const updatedProfile = {
      ...profile,
      skills: { ...profile.skills, ...skillsUpdate },
    };
    const metrics = resume ? calculatePageMetrics(updatedProfile, resume.formatting) : null;
    set({ profile: updatedProfile, pageMetrics: metrics, isDirty: true });
  },

  recalculateMetrics: () => {
    const { profile, resume } = get();
    if (profile && resume) {
      set({ pageMetrics: calculatePageMetrics(profile, resume.formatting) });
    }
  },
}));
