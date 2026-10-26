import { ICandidateProfile, IResumeFormatting, PageSize } from '@ats/shared-types';

export interface IPageLayoutMetrics {
  pageSize: PageSize;
  pageWidthMm: number;
  pageHeightMm: number;
  pageWidthPx: number;
  pageHeightPx: number;
  contentHeightPx: number;
  estimatedPages: number;
  hasOrphanedHeadings: boolean;
  warnings: string[];
  suggestions: string[];
}

export function calculatePageMetrics(
  profile: ICandidateProfile,
  formatting: IResumeFormatting
): IPageLayoutMetrics {
  const isA4 = formatting.pageSize === 'A4';
  const pageWidthMm = isA4 ? 210 : 215.9;
  const pageHeightMm = isA4 ? 297 : 279.4;
  
  // 96 DPI conversion (1mm ≈ 3.7795px)
  const mmToPx = 3.7795;
  const pageWidthPx = Math.round(pageWidthMm * mmToPx);
  const pageHeightPx = Math.round(pageHeightMm * mmToPx);
  const marginPx = Math.round(formatting.marginsMm * mmToPx);
  const usableHeightPx = pageHeightPx - marginPx * 2;

  // Approximate content height estimation
  let estimatedHeight = 0;
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Header height (Name, title, contact row)
  const p = profile.personalDetails || {};
  estimatedHeight += p.headline ? 90 : 70;

  // Summary height
  if (profile.professionalSummary && profile.professionalSummary.trim().length > 0) {
    const lines = Math.ceil(profile.professionalSummary.length / 90);
    estimatedHeight += 24 + lines * (formatting.fontSizePt * formatting.lineSpacing * 1.3);
  }

  // Work Experience
  const activeExp = profile.workExperience.filter((e) => e.includeInResume !== false);
  if (activeExp.length > 0) {
    estimatedHeight += 24; // Section Header
    for (const exp of activeExp) {
      estimatedHeight += 28; // Employer, role, dates
      const bulletLines = exp.responsibilities.reduce((acc, r) => acc + Math.ceil(r.length / 85), 0);
      estimatedHeight += bulletLines * (formatting.fontSizePt * formatting.lineSpacing * 1.3) + 6;
    }
  }

  // Education
  const activeEdu = profile.education.filter((e) => e.includeInResume !== false);
  if (activeEdu.length > 0) {
    estimatedHeight += 24;
    for (const edu of activeEdu) {
      estimatedHeight += 28;
    }
  }

  // Projects
  const activeProj = profile.projects.filter((p) => p.includeInResume !== false);
  if (activeProj.length > 0) {
    estimatedHeight += 24;
    for (const proj of activeProj) {
      estimatedHeight += 24;
      const descLines = Math.ceil((proj.description || '').length / 90);
      estimatedHeight += descLines * (formatting.fontSizePt * formatting.lineSpacing * 1.3) + 6;
    }
  }

  // Skills
  const hasSkills =
    profile.skills.technicalSkills.length > 0 ||
    profile.skills.jobSkills.length > 0 ||
    profile.skills.computerSkills.length > 0;
  if (hasSkills) {
    estimatedHeight += 24;
    if (profile.skills.technicalSkills.length > 0) estimatedHeight += 20;
    if (profile.skills.jobSkills.length > 0) estimatedHeight += 20;
    if (profile.skills.computerSkills.length > 0) estimatedHeight += 20;
  }

  // Certifications
  const activeCert = profile.certifications.filter((c) => c.includeInResume !== false);
  if (activeCert.length > 0) {
    estimatedHeight += 24 + activeCert.length * 18;
  }

  // Declaration
  if (profile.declaration.enabled) {
    estimatedHeight += 45;
  }

  const estimatedPages = Math.max(1, Math.ceil(estimatedHeight / usableHeightPx));
  const pageRemainder = estimatedHeight % usableHeightPx;
  const overflowPercentage = pageRemainder / usableHeightPx;

  // Detect orphan headings or awkward trailing content
  let hasOrphanedHeadings = false;
  if (estimatedPages > 1 && pageRemainder < 120 && pageRemainder > 0) {
    hasOrphanedHeadings = true;
    warnings.push('Content barely spills onto an additional page. Consider slightly reducing margins or font size.');
    suggestions.push(`Adjust margins from ${formatting.marginsMm}mm to ${Math.max(10, formatting.marginsMm - 2)}mm to fit onto ${estimatedPages - 1} page(s).`);
  }

  if (estimatedPages === 1 && overflowPercentage > 0.85 && overflowPercentage <= 1.0) {
    suggestions.push('Document comfortably fills single page. Optimal A4 balance.');
  }

  return {
    pageSize: formatting.pageSize,
    pageWidthMm,
    pageHeightMm,
    pageWidthPx,
    pageHeightPx,
    contentHeightPx: Math.round(estimatedHeight),
    estimatedPages,
    hasOrphanedHeadings,
    warnings,
    suggestions,
  };
}
