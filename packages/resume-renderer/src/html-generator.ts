import { ICandidateProfile, IResumeVersion } from '@ats/shared-types';
import { getTemplateById } from '@ats/template-registry';

export function generateResumeHtml(
  profile: ICandidateProfile,
  resumeVersion: Partial<IResumeVersion>,
  options?: { embedded?: boolean; mobileReflow?: boolean }
): string {
  const template = getTemplateById(resumeVersion.templateId || 'classic-professional');
  const formatting = {
    ...template.defaultFormatting,
    ...(resumeVersion.formatting || {}),
  };

  const isA4 = formatting.pageSize === 'A4';
  const widthMm = isA4 ? 210 : 215.9;
  const heightMm = isA4 ? 297 : 279.4;
  const p = profile.personalDetails;

  const sectionOrder = [
    ...(resumeVersion.sectionOrder && resumeVersion.sectionOrder.length > 0
      ? resumeVersion.sectionOrder
      : template.defaultSectionOrder),
  ];

  // Guarantee ZERO data loss: ensure any populated candidate sections are rendered
  if (profile.workExperience && profile.workExperience.length > 0 && !sectionOrder.includes('experience')) {
    sectionOrder.push('experience');
  }
  if (profile.education && profile.education.length > 0 && !sectionOrder.includes('education')) {
    sectionOrder.push('education');
  }
  if (profile.projects && profile.projects.length > 0 && !sectionOrder.includes('projects')) {
    sectionOrder.push('projects');
  }
  if (
    profile.skills &&
    (profile.skills.technicalSkills?.length > 0 ||
      profile.skills.jobSkills?.length > 0 ||
      profile.skills.computerSkills?.length > 0 ||
      profile.skills.languages?.length > 0) &&
    !sectionOrder.includes('skills')
  ) {
    sectionOrder.push('skills');
  }
  if (profile.certifications && profile.certifications.length > 0 && !sectionOrder.includes('certifications')) {
    sectionOrder.push('certifications');
  }
  if (profile.businessExperience && profile.businessExperience.length > 0 && !sectionOrder.includes('businessExperience')) {
    sectionOrder.push('businessExperience');
  }

  let bodyContent = '';

  // Render header based on template headerStyle
  const isCentered = template.headerStyle === 'centered';
  const isSplit = template.headerStyle === 'split-accent';

  bodyContent += `
    <header class="resume-template__header ${isCentered ? 'text-center' : ''} ${isSplit ? 'resume-template__header--split' : ''}" style="margin-bottom: 1.25rem;">
      <h1 class="resume-template__name" style="font-size: 1.75rem; font-weight: 700; color: ${formatting.accentColor}; margin: 0; line-height: 1.2;">
        ${p.fullName || 'Candidate Name'}
      </h1>
      ${
        p.headline
          ? `<p class="resume-template__headline" style="font-size: 1rem; color: #475569; margin: 0.25rem 0 0.5rem 0; font-weight: 500;">${p.headline}</p>`
          : ''
      }
      <div class="resume-template__contact" style="font-size: 0.85rem; color: #64748b; margin-top: 0.35rem; display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; ${
        isCentered ? 'justify-content: center;' : ''
      }">
        ${p.email ? `<span><a href="mailto:${p.email}" style="color: inherit; text-decoration: none;">${p.email}</a></span>` : ''}
        ${p.phone ? `<span>•</span><span><a href="tel:${p.phone.replace(/[^+\d]/g, '')}" style="color: inherit; text-decoration: none;">${p.phone}</a></span>` : ''}
        ${p.city || p.country ? `<span>•</span><span>${[p.city, p.country].filter(Boolean).join(', ')}</span>` : ''}
        ${p.linkedinUrl ? `<span>•</span><span><a href="${p.linkedinUrl.startsWith('http') ? p.linkedinUrl : `https://${p.linkedinUrl}`}" target="_blank" rel="noopener noreferrer" style="color: ${formatting.accentColor}; font-weight: 500; text-decoration: underline;">LinkedIn</a></span>` : ''}
        ${p.githubUrl ? `<span>•</span><span><a href="${p.githubUrl.startsWith('http') ? p.githubUrl : `https://${p.githubUrl}`}" target="_blank" rel="noopener noreferrer" style="color: ${formatting.accentColor}; font-weight: 500; text-decoration: underline;">GitHub</a></span>` : ''}
      </div>
    </header>
  `;

  // Render sections
  for (const section of sectionOrder) {
    switch (section) {
      case 'summary': {
        if (profile.professionalSummary && profile.professionalSummary.trim().length > 0) {
          bodyContent += `
            <section class="resume-template__section" style="margin-bottom: 1.1rem;">
              <h2 class="resume-template__section-title" style="font-size: 1rem; text-transform: uppercase; font-weight: 700; color: ${formatting.accentColor}; border-bottom: 1.5px solid ${formatting.accentColor}33; padding-bottom: 0.2rem; margin: 0 0 0.45rem 0; letter-spacing: 0.05em;">
                Professional Summary
              </h2>
              <p class="resume-template__summary-text" style="margin: 0; line-height: ${formatting.lineSpacing}; color: #1e293b;">
                ${profile.professionalSummary}
              </p>
            </section>
          `;
        }
        break;
      }

      case 'skills': {
        const hasSkills =
          profile.skills.technicalSkills.length > 0 ||
          profile.skills.jobSkills.length > 0 ||
          profile.skills.computerSkills.length > 0;

        if (hasSkills) {
          bodyContent += `
            <section class="resume-template__section" style="margin-bottom: 1.1rem;">
              <h2 class="resume-template__section-title" style="font-size: 1rem; text-transform: uppercase; font-weight: 700; color: ${formatting.accentColor}; border-bottom: 1.5px solid ${formatting.accentColor}33; padding-bottom: 0.2rem; margin: 0 0 0.45rem 0; letter-spacing: 0.05em;">
                Skills
              </h2>
              <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                ${
                  profile.skills.technicalSkills.length > 0
                    ? `<p style="margin: 0; line-height: 1.4;"><strong style="color: #0f172a;">Technical Skills:</strong> <span style="color: #334155;">${profile.skills.technicalSkills.join(', ')}</span></p>`
                    : ''
                }
                ${
                  profile.skills.jobSkills.length > 0
                    ? `<p style="margin: 0; line-height: 1.4;"><strong style="color: #0f172a;">Core Competencies:</strong> <span style="color: #334155;">${profile.skills.jobSkills.join(', ')}</span></p>`
                    : ''
                }
                ${
                  profile.skills.computerSkills.length > 0
                    ? `<p style="margin: 0; line-height: 1.4;"><strong style="color: #0f172a;">Tools & Platforms:</strong> <span style="color: #334155;">${profile.skills.computerSkills.join(', ')}</span></p>`
                    : ''
                }
              </div>
            </section>
          `;
        }
        break;
      }

      case 'experience': {
        const activeExp = profile.workExperience.filter((e) => e.includeInResume !== false);
        if (activeExp.length > 0) {
          bodyContent += `
            <section class="resume-template__section" style="margin-bottom: 1.1rem;">
              <h2 class="resume-template__section-title" style="font-size: 1rem; text-transform: uppercase; font-weight: 700; color: ${formatting.accentColor}; border-bottom: 1.5px solid ${formatting.accentColor}33; padding-bottom: 0.2rem; margin: 0 0 0.5rem 0; letter-spacing: 0.05em;">
                Work Experience
              </h2>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${activeExp
                  .map(
                    (exp) => `
                  <div class="resume-template__item">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
                      <h3 style="font-size: 0.95rem; font-weight: 600; margin: 0; color: #0f172a;">
                        ${exp.jobTitle} <span style="font-weight: 400; color: #475569;">| ${exp.employer}</span>
                        ${exp.employmentType && exp.employmentType !== 'Full-time' ? `<span style="font-size: 0.78rem; font-weight: 600; padding: 0.1rem 0.45rem; border-radius: 4px; background: #f1f5f9; color: #475569; margin-left: 0.4rem; border: 1px solid #e2e8f0;">${exp.employmentType}</span>` : ''}
                      </h3>
                      <span style="font-size: 0.85rem; color: #64748b; font-style: italic;">
                        ${exp.startDate} – ${exp.isCurrent ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    ${
                      exp.responsibilities && exp.responsibilities.length > 0
                        ? `
                      <ul style="margin: 0.35rem 0 0 1.25rem; padding: 0; list-style-type: disc; color: #334155; line-height: ${formatting.lineSpacing};">
                        ${exp.responsibilities.map((r) => `<li style="margin-bottom: 0.2rem;">${r}</li>`).join('')}
                      </ul>
                    `
                        : ''
                    }
                  </div>
                `
                  )
                  .join('')}
              </div>
            </section>
          `;
        }
        break;
      }

      case 'education': {
        const activeEdu = profile.education.filter((e) => e.includeInResume !== false);
        if (activeEdu.length > 0) {
          bodyContent += `
            <section class="resume-template__section" style="margin-bottom: 1.1rem;">
              <h2 class="resume-template__section-title" style="font-size: 1rem; text-transform: uppercase; font-weight: 700; color: ${formatting.accentColor}; border-bottom: 1.5px solid ${formatting.accentColor}33; padding-bottom: 0.2rem; margin: 0 0 0.5rem 0; letter-spacing: 0.05em;">
                Education
              </h2>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${activeEdu
                  .map(
                    (edu) => `
                  <div class="resume-template__item">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
                      <h3 style="font-size: 0.95rem; font-weight: 600; margin: 0; color: #0f172a;">
                        ${edu.qualification}${edu.specialization ? ` in ${edu.specialization}` : ''}
                      </h3>
                      <span style="font-size: 0.85rem; color: #64748b; font-style: italic;">
                        ${edu.endDate || ''}
                      </span>
                    </div>
                    <div style="font-size: 0.88rem; color: #475569;">
                      ${edu.institution} ${edu.gradePercentageCgpa ? `• Grade: ${edu.gradePercentageCgpa}` : ''}
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </section>
          `;
        }
        break;
      }

      case 'projects': {
        const activeProj = profile.projects.filter((p) => p.includeInResume !== false);
        if (activeProj.length > 0) {
          bodyContent += `
            <section class="resume-template__section" style="margin-bottom: 1.1rem;">
              <h2 class="resume-template__section-title" style="font-size: 1rem; text-transform: uppercase; font-weight: 700; color: ${formatting.accentColor}; border-bottom: 1.5px solid ${formatting.accentColor}33; padding-bottom: 0.2rem; margin: 0 0 0.5rem 0; letter-spacing: 0.05em;">
                Projects
              </h2>
              <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                ${activeProj
                  .map(
                    (proj) => {
                      const gitUrl = (proj as any).githubUrl || (proj.url && proj.url.includes('github') ? proj.url : '');
                      const liveUrl = proj.url && !proj.url.includes('github') ? proj.url : '';
                      return `
                  <div class="resume-template__item">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.25rem;">
                      <h3 style="font-size: 0.95rem; font-weight: 600; margin: 0; color: #0f172a;">
                        ${proj.name}
                        ${
                          proj.technologies && proj.technologies.length > 0
                            ? `<span style="font-size: 0.82rem; font-weight: 400; color: #64748b; font-style: italic;"> (${proj.technologies.join(', ')})</span>`
                            : ''
                        }
                      </h3>
                      <div style="display: flex; gap: 0.6rem; align-items: baseline;">
                        ${liveUrl ? `<a href="${liveUrl.startsWith('http') ? liveUrl : `https://${liveUrl}`}" target="_blank" rel="noopener noreferrer" style="font-size: 0.82rem; color: ${formatting.accentColor}; font-weight: 600; text-decoration: underline;">Live Demo ↗</a>` : ''}
                        ${gitUrl ? `<a href="${gitUrl.startsWith('http') ? gitUrl : `https://${gitUrl}`}" target="_blank" rel="noopener noreferrer" style="font-size: 0.82rem; color: #475569; font-weight: 600; text-decoration: underline;">GitHub ↗</a>` : ''}
                      </div>
                    </div>
                    <p style="margin: 0.25rem 0 0 0; color: #334155; line-height: ${formatting.lineSpacing};">
                      ${proj.description}
                    </p>
                  </div>
                `;
                    }
                  )
                  .join('')}
              </div>
            </section>
          `;
        }
        break;
      }

      case 'certifications': {
        const activeCert = profile.certifications.filter((c) => c.includeInResume);
        if (activeCert.length > 0) {
          bodyContent += `
            <section class="resume-template__section" style="margin-bottom: 1.1rem;">
              <h2 class="resume-template__section-title" style="font-size: 1rem; text-transform: uppercase; font-weight: 700; color: ${formatting.accentColor}; border-bottom: 1.5px solid ${formatting.accentColor}33; padding-bottom: 0.2rem; margin: 0 0 0.5rem 0; letter-spacing: 0.05em;">
                Certifications
              </h2>
              <ul style="margin: 0.35rem 0 0 1.25rem; padding: 0; list-style-type: disc; color: #334155; line-height: 1.4;">
                ${activeCert
                  .map(
                    (cert) => `
                  <li style="margin-bottom: 0.2rem;">
                    <strong>${cert.title}</strong> — ${cert.issuer} ${cert.issueDate ? `(${cert.issueDate})` : ''}
                  </li>
                `
                  )
                  .join('')}
              </ul>
            </section>
          `;
        }
        break;
      }

      case 'declaration': {
        if (profile.declaration.enabled && profile.declaration.text) {
          bodyContent += `
            <section class="resume-template__section" style="margin-top: 1.5rem;">
              <h2 class="resume-template__section-title" style="font-size: 0.95rem; text-transform: uppercase; font-weight: 700; color: ${formatting.accentColor}; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.2rem; margin: 0 0 0.4rem 0;">
                Declaration
              </h2>
              <p style="font-size: 0.85rem; font-style: italic; color: #475569; margin: 0; line-height: 1.4;">
                ${profile.declaration.text}
              </p>
            </section>
          `;
        }
        break;
      }
    }
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.fullName || 'Resume'} - ATS Resume</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: ${formatting.pageSize === 'A4' ? 'A4' : 'letter'};
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    body {
      margin: 0;
      padding: 0;
      background: ${options?.mobileReflow ? '#ffffff' : '#f8fafc'};
      font-family: '${formatting.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: ${formatting.fontSizePt}pt;
      color: #0f172a;
    }
    ${options?.mobileReflow ? `
    .resume-page {
      background: #ffffff;
      width: 100% !important;
      max-width: 100% !important;
      min-height: auto !important;
      padding: 16px !important;
      margin: 0 !important;
      box-shadow: none !important;
      box-sizing: border-box !important;
    }
    ` : `
    .resume-page {
      background: #ffffff;
      width: ${widthMm}mm;
      min-height: ${heightMm}mm;
      padding: ${formatting.marginsMm}mm;
      margin: 0 auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    `}
    @media print {
      body {
        background: transparent !important;
      }
      .no-print {
        display: none !important;
      }
      .resume-page {
        margin: 0 !important;
        box-shadow: none !important;
        width: 100% !important;
        min-height: 100% !important;
        padding: ${formatting.marginsMm}mm !important;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  ${!options?.embedded ? `
  <!-- Print & PDF Download Action Bar (Hidden when printing or saving as PDF) -->
  <div class="no-print" style="position: sticky; top: 0; z-index: 100; background: #0f172a; color: #ffffff; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-weight: 700; font-size: 14px; letter-spacing: -0.01em;">ATS Resume Studio — PDF Ready</span>
      <span style="background: #1e293b; color: #94a3b8; font-size: 11px; padding: 2px 8px; rounded: 4px; border: 1px solid #334155;">100% Selectable ATS Vector</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <button onclick="window.print()" style="background: #2563eb; hover: #1d4ed8; color: #ffffff; border: none; border-radius: 8px; padding: 8px 18px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(37,99,235,0.4);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Save / Print as PDF
      </button>
      <button onclick="window.close()" style="background: transparent; color: #cbd5e1; border: 1px solid #475569; border-radius: 8px; padding: 8px 14px; font-size: 12px; cursor: pointer;">
        Close
      </button>
    </div>
  </div>
  ` : ''}

  <main class="resume-page resume-template resume-template--${template.id}">
    ${bodyContent}
  </main>

  <script>
    // If opened with ?print=true or print in hash, trigger native print dialog automatically
    window.addEventListener('DOMContentLoaded', function() {
      if (window.location.search.includes('print=true') || window.location.hash.includes('print')) {
        setTimeout(function() {
          window.print();
        }, 500);
      }
    });
  </script>
</body>
</html>
  `;
}
