import { ITemplateDefinition, TemplateId, ICandidateProfile, IResumeVersion } from '@ats/shared-types';

export const ATS_TEMPLATES: Record<TemplateId, ITemplateDefinition> = {
  'classic-professional': {
    id: 'classic-professional',
    displayName: 'Classic Professional',
    description: 'Traditional ATS-standard single column layout with clear horizontal dividing rules and strong section hierarchy.',
    category: 'Executive & General',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'declaration'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 10,
      lineSpacing: 1.2,
      marginsMm: 12,
      accentColor: '#1e293b',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm', 'lineSpacing'],
  },
  'modern-minimal': {
    id: 'modern-minimal',
    displayName: 'Modern Minimal',
    description: 'Ultra-clean, distraction-free typographic design with generous whitespace and high-contrast headings.',
    category: 'Modern & Creative',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Inter',
      fontSizePt: 9.5,
      lineSpacing: 1.25,
      marginsMm: 13,
      accentColor: '#0f172a',
    },
    headerStyle: 'split-accent',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'corporate-standard': {
    id: 'corporate-standard',
    displayName: 'Corporate Standard',
    description: 'Centered header format ideal for business analysts, finance specialists, operations, and enterprise roles.',
    category: 'Corporate & Finance',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'businessExperience'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Times New Roman',
      fontSizePt: 10,
      lineSpacing: 1.2,
      marginsMm: 14,
      accentColor: '#1e3a8a',
    },
    headerStyle: 'centered',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'technical-engineer': {
    id: 'technical-engineer',
    displayName: 'Technical Engineer',
    description: 'Prioritizes technical skills, systems architecture, and engineering projects with precise bullet metrics.',
    category: 'Engineering & Tech',
    isAtsCompliant: true,
    defaultSectionOrder: ['skills', 'experience', 'projects', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 9.5,
      lineSpacing: 1.2,
      marginsMm: 12,
      accentColor: '#0369a1',
    },
    headerStyle: 'compact',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'software-developer': {
    id: 'software-developer',
    displayName: 'Software Developer',
    description: 'Tailored for frontend, backend, and full-stack software engineers with dedicated code tech stacks and GitHub portfolio prominence.',
    category: 'Engineering & Tech',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'experience', 'projects', 'education'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 9.5,
      lineSpacing: 1.2,
      marginsMm: 12,
      accentColor: '#0284c7',
    },
    headerStyle: 'split-accent',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'fresher-graduate': {
    id: 'fresher-graduate',
    displayName: 'Fresher and Graduate',
    description: 'Focuses on academic foundation, coursework, academic projects, and certifications for entry-level applicants.',
    category: 'Entry Level',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'education', 'projects', 'skills', 'experience', 'certifications', 'declaration'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Inter',
      fontSizePt: 10,
      lineSpacing: 1.3,
      marginsMm: 16,
      accentColor: '#2563eb',
    },
    headerStyle: 'centered',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'experienced-professional': {
    id: 'experienced-professional',
    displayName: 'Experienced Professional',
    description: 'Chronological work experience leader highlighting career trajectory, team leadership, and quantifiable business milestones.',
    category: 'Leadership & Senior',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'businessExperience'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Calibri',
      fontSizePt: 10,
      lineSpacing: 1.25,
      marginsMm: 15,
      accentColor: '#334155',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'career-change': {
    id: 'career-change',
    displayName: 'Career Change',
    description: 'Hybrid functional/chronological structure highlighting transferable competencies, recent certifications, and bridge projects.',
    category: 'Specialized',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'projects', 'experience', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 10,
      lineSpacing: 1.25,
      marginsMm: 15,
      accentColor: '#475569',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'administrative-support': {
    id: 'administrative-support',
    displayName: 'Administrative and Office Support',
    description: 'Emphasis on computer proficiency, office tools, administrative coordination, and reliable organizational support.',
    category: 'Administration & Office',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'experience', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Arial',
      fontSizePt: 10,
      lineSpacing: 1.25,
      marginsMm: 15,
      accentColor: '#0f766e',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'sales-customer-service': {
    id: 'sales-customer-service',
    displayName: 'Sales and Customer Service',
    description: 'Highlights quota achievements, client relationship management, communication strengths, and key revenue impact.',
    category: 'Sales & Service',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'experience', 'skills', 'education', 'achievements'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Inter',
      fontSizePt: 10,
      lineSpacing: 1.25,
      marginsMm: 15,
      accentColor: '#b45309',
    },
    headerStyle: 'compact',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'electrical-instrumentation': {
    id: 'electrical-instrumentation',
    displayName: 'Electrical and Instrumentation',
    description: 'Tailored for technical trades, industrial technicians, electrical engineering, equipment maintenance, and safety compliance.',
    category: 'Engineering & Industrial',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'experience', 'education', 'certifications', 'declaration'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 9.5,
      lineSpacing: 1.2,
      marginsMm: 14,
      accentColor: '#1e293b',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'project-focused': {
    id: 'project-focused',
    displayName: 'Project-Focused',
    description: 'Prominently features delivered projects, technical deliverables, architectural scope, and direct client results.',
    category: 'Consulting & Freelance',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'projects', 'skills', 'experience', 'education'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 9.5,
      lineSpacing: 1.25,
      marginsMm: 15,
      accentColor: '#3b82f6',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'skills-focused': {
    id: 'skills-focused',
    displayName: 'Skills-Focused',
    description: 'Functional ATS layout organizing expertise into technical, job-specific, computer, and language proficiencies.',
    category: 'Specialized',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'experience', 'projects', 'education'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Inter',
      fontSizePt: 10,
      lineSpacing: 1.25,
      marginsMm: 15,
      accentColor: '#1d4ed8',
    },
    headerStyle: 'split-accent',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'academic-professional': {
    id: 'academic-professional',
    displayName: 'Academic Professional',
    description: 'Designed for educators, researchers, lecturers, and academic fellows with emphasis on education, publications, and research.',
    category: 'Academia & Research',
    isAtsCompliant: true,
    defaultSectionOrder: ['education', 'experience', 'projects', 'skills', 'certifications', 'declaration'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Times New Roman',
      fontSizePt: 10.5,
      lineSpacing: 1.25,
      marginsMm: 18,
      accentColor: '#1e1b4b',
    },
    headerStyle: 'centered',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'general-purpose': {
    id: 'general-purpose',
    displayName: 'General Purpose',
    description: 'A versatile, balanced ATS-ready template suitable for all employment domains, career levels, and global standards.',
    category: 'Executive & General',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications', 'declaration'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 10,
      lineSpacing: 1.25,
      marginsMm: 15,
      accentColor: '#1e293b',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'modern-single-column': {
    id: 'modern-single-column',
    displayName: 'Modern Single Column',
    description: 'Clean single-column layout with sleek left-accented section headers and high ATS text-stream clarity.',
    category: 'Modern & Creative',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Inter',
      fontSizePt: 9.5,
      lineSpacing: 1.25,
      marginsMm: 14,
      accentColor: '#2563eb',
    },
    headerStyle: 'split-accent',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'minimal-professional': {
    id: 'minimal-professional',
    displayName: 'Minimal Professional',
    description: 'High-density, minimalist design that maximizes content per page with crisp typography and subtle rules.',
    category: 'Executive & General',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Calibri',
      fontSizePt: 9.5,
      lineSpacing: 1.15,
      marginsMm: 12,
      accentColor: '#0f172a',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'corporate-professional': {
    id: 'corporate-professional',
    displayName: 'Corporate Professional',
    description: 'Stately and authoritative presentation tailored for enterprise managers, directors, and management consultants.',
    category: 'Corporate & Finance',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'experience', 'businessExperience', 'education', 'skills', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Times New Roman',
      fontSizePt: 10,
      lineSpacing: 1.2,
      marginsMm: 15,
      accentColor: '#1e3a8a',
    },
    headerStyle: 'centered',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'graduate-entry': {
    id: 'graduate-entry',
    displayName: 'Graduate Entry',
    description: 'Strategic structure prioritizing academic coursework, honors, university capstones, and foundational internships.',
    category: 'Entry Level',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'education', 'projects', 'skills', 'experience', 'certifications', 'declaration'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 10,
      lineSpacing: 1.3,
      marginsMm: 16,
      accentColor: '#4f46e5',
    },
    headerStyle: 'centered',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'technical-specialist': {
    id: 'technical-specialist',
    displayName: 'Technical Specialist',
    description: 'Architected for IT specialists, systems analysts, database administrators, and network engineers.',
    category: 'Engineering & Tech',
    isAtsCompliant: true,
    defaultSectionOrder: ['skills', 'experience', 'projects', 'certifications', 'education'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 9.5,
      lineSpacing: 1.2,
      marginsMm: 13,
      accentColor: '#0891b2',
    },
    headerStyle: 'compact',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'senior-engineer': {
    id: 'senior-engineer',
    displayName: 'Senior Engineer',
    description: 'Emphasizes technical leadership, systems scale, architectural decisions, and high-impact engineering accomplishments.',
    category: 'Engineering & Tech',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Inter',
      fontSizePt: 9.5,
      lineSpacing: 1.2,
      marginsMm: 13,
      accentColor: '#0369a1',
    },
    headerStyle: 'split-accent',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'executive-leadership': {
    id: 'executive-leadership',
    displayName: 'Executive Leadership',
    description: 'Distinguished design for VP, C-Suite, and Senior Directors highlighting P&L, board governance, and global strategy.',
    category: 'Leadership & Senior',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'experience', 'businessExperience', 'skills', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Georgia',
      fontSizePt: 10,
      lineSpacing: 1.25,
      marginsMm: 16,
      accentColor: '#1e293b',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'marketing-professional': {
    id: 'marketing-professional',
    displayName: 'Marketing Professional',
    description: 'Highlights digital campaign metrics, CAC/ROAS efficiencies, brand leadership, and growth marketing results.',
    category: 'Modern & Creative',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Inter',
      fontSizePt: 9.5,
      lineSpacing: 1.25,
      marginsMm: 14,
      accentColor: '#c026d3',
    },
    headerStyle: 'split-accent',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'customer-support': {
    id: 'customer-support',
    displayName: 'Customer Support',
    description: 'Showcases CSAT/NPS achievements, ticketing resolution velocity, helpdesk tools, and client retention.',
    category: 'Sales & Service',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'experience', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Arial',
      fontSizePt: 10,
      lineSpacing: 1.25,
      marginsMm: 15,
      accentColor: '#059669',
    },
    headerStyle: 'compact',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'finance-accounting': {
    id: 'finance-accounting',
    displayName: 'Finance and Accounting',
    description: 'Precision tabular format highlighting GAAP/IFRS audits, financial modeling, ERP systems, and fiscal governance.',
    category: 'Corporate & Finance',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Calibri',
      fontSizePt: 9.5,
      lineSpacing: 1.2,
      marginsMm: 14,
      accentColor: '#1e3a8a',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'healthcare-medical': {
    id: 'healthcare-medical',
    displayName: 'Healthcare and Medical',
    description: 'Designed for RNs, physicians, clinicians, and medical administrators with prominent licensure and EHR systems.',
    category: 'Specialized',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'certifications', 'experience', 'skills', 'education', 'declaration'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 9.5,
      lineSpacing: 1.2,
      marginsMm: 14,
      accentColor: '#0284c7',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'researcher-cv': {
    id: 'researcher-cv',
    displayName: 'Researcher CV',
    description: 'Academic CV structure emphasizing peer-reviewed publications, research grants, laboratories, and presentations.',
    category: 'Academia & Research',
    isAtsCompliant: true,
    defaultSectionOrder: ['education', 'experience', 'projects', 'skills', 'certifications', 'declaration'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Times New Roman',
      fontSizePt: 10,
      lineSpacing: 1.25,
      marginsMm: 16,
      accentColor: '#1e1b4b',
    },
    headerStyle: 'centered',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'employment-gap-friendly': {
    id: 'employment-gap-friendly',
    displayName: 'Employment-Gap Friendly',
    description: 'Functional hybrid format emphasizing acquired skills, independent consulting, professional development, and core achievements.',
    category: 'Specialized',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'projects', 'experience', 'education', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Inter',
      fontSizePt: 9.5,
      lineSpacing: 1.25,
      marginsMm: 15,
      accentColor: '#475569',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'international-professional': {
    id: 'international-professional',
    displayName: 'International Professional',
    description: 'Standardized layout complying with international cross-border hiring norms, multilingual proficiencies, and global relocations.',
    category: 'Executive & General',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'experience', 'skills', 'education', 'projects', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Calibri',
      fontSizePt: 10,
      lineSpacing: 1.25,
      marginsMm: 15,
      accentColor: '#0f766e',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
  'ats-focused-hybrid': {
    id: 'ats-focused-hybrid',
    displayName: 'ATS-Focused Hybrid',
    description: 'Engineered specifically for maximum machine parsing accuracy across Workday, Taleo, Greenhouse, and iCIMS ATS engines.',
    category: 'Specialized',
    isAtsCompliant: true,
    defaultSectionOrder: ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'],
    defaultFormatting: {
      pageSize: 'A4',
      fontFamily: 'Roboto',
      fontSizePt: 9.5,
      lineSpacing: 1.2,
      marginsMm: 13,
      accentColor: '#1e293b',
    },
    headerStyle: 'standard',
    supportedCustomizations: ['accentColor', 'fontSizePt', 'marginsMm'],
  },
};

export const TEMPLATE_LIST: ITemplateDefinition[] = Object.values(ATS_TEMPLATES);

export function getTemplateById(id: string): ITemplateDefinition {
  return ATS_TEMPLATES[id as TemplateId] || ATS_TEMPLATES['classic-professional'];
}

/**
 * Maps a master candidate profile to a template-specific section layout.
 * Guarantees zero data loss when changing templates.
 */
export function mapCandidateToTemplate(
  profile: ICandidateProfile,
  resumeVersion: Partial<IResumeVersion>
): {
  template: ITemplateDefinition;
  effectiveSectionOrder: string[];
  effectiveFormatting: typeof ATS_TEMPLATES['classic-professional']['defaultFormatting'];
} {
  const template = getTemplateById(resumeVersion.templateId || 'classic-professional');
  const baseOrder =
    resumeVersion.sectionOrder && resumeVersion.sectionOrder.length > 0
      ? [...resumeVersion.sectionOrder]
      : [...template.defaultSectionOrder];

  // Guarantee ZERO data loss:
  // If the candidate profile has data in a section, ensure that section is present in effectiveSectionOrder
  if (profile.workExperience && profile.workExperience.length > 0 && !baseOrder.includes('experience')) {
    baseOrder.push('experience');
  }
  if (profile.education && profile.education.length > 0 && !baseOrder.includes('education')) {
    baseOrder.push('education');
  }
  if (profile.projects && profile.projects.length > 0 && !baseOrder.includes('projects')) {
    baseOrder.push('projects');
  }
  if (
    profile.skills &&
    (profile.skills.technicalSkills?.length > 0 ||
      profile.skills.jobSkills?.length > 0 ||
      profile.skills.computerSkills?.length > 0 ||
      profile.skills.languages?.length > 0) &&
    !baseOrder.includes('skills')
  ) {
    baseOrder.push('skills');
  }
  if (profile.certifications && profile.certifications.length > 0 && !baseOrder.includes('certifications')) {
    baseOrder.push('certifications');
  }
  if (profile.businessExperience && profile.businessExperience.length > 0 && !baseOrder.includes('businessExperience')) {
    baseOrder.push('businessExperience');
  }

  const effectiveFormatting = {
    ...template.defaultFormatting,
    ...(resumeVersion.formatting || {}),
  };

  return {
    template,
    effectiveSectionOrder: baseOrder,
    effectiveFormatting,
  };
}
