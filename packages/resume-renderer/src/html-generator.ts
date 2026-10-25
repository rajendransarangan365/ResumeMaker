import { ICandidateProfile, IResumeVersion } from '@ats/shared-types';
import { getTemplateById } from '@ats/template-registry';

export function generateResumeHtml(
  profile: ICandidateProfile,
  resumeVersion: Partial<IResumeVersion>
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

  const sectionOrder =
    resumeVersion.sectionOrder && resumeVersion.sectionOrder.length > 0
      ? resumeVersion.sectionOrder
      : template.defaultSectionOrder;

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
        ${p.email ? `<span>${p.email}</span>` : ''}
        ${p.phone ? `<span>•</span><span>${p.phone}</span>` : ''}
        ${p.city || p.country ? `<span>•</span><span>${[p.city, p.country].filter(Boolean).join(', ')}</span>` : ''}
        ${p.linkedinUrl ? `<span>•</span><span>LinkedIn: ${p.linkedinUrl}</span>` : ''}
        ${p.githubUrl ? `<span>•</span><span>GitHub: ${p.githubUrl}</span>` : ''}
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
        const activeExp = profile.workExperience.filter((e) => e.includeInResume);
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
        const activeEdu = profile.education.filter((e) => e.includeInResume);
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
        const activeProj = profile.projects.filter((p) => p.includeInResume);
        if (activeProj.length > 0) {
          bodyContent += `
            <section class="resume-template__section" style="margin-bottom: 1.1rem;">
              <h2 class="resume-template__section-title" style="font-size: 1rem; text-transform: uppercase; font-weight: 700; color: ${formatting.accentColor}; border-bottom: 1.5px solid ${formatting.accentColor}33; padding-bottom: 0.2rem; margin: 0 0 0.5rem 0; letter-spacing: 0.05em;">
                Projects
              </h2>
              <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                ${activeProj
                  .map(
                    (proj) => `
                  <div class="resume-template__item">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                      <h3 style="font-size: 0.95rem; font-weight: 600; margin: 0; color: #0f172a;">
                        ${proj.name}
                        ${
                          proj.technologies.length > 0
                            ? `<span style="font-size: 0.82rem; font-weight: 400; color: #64748b; font-style: italic;"> (${proj.technologies.join(', ')})</span>`
                            : ''
                        }
                      </h3>
                      ${proj.url ? `<a href="${proj.url}" style="font-size: 0.82rem; color: ${formatting.accentColor}; text-decoration: none;">View Project</a>` : ''}
                    </div>
                    <p style="margin: 0.25rem 0 0 0; color: #334155; line-height: ${formatting.lineSpacing};">
                      ${proj.description}
                    </p>
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
      background: #f8fafc;
      font-family: '${formatting.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: ${formatting.fontSizePt}pt;
      color: #0f172a;
    }
    .resume-page {
      background: #ffffff;
      width: ${widthMm}mm;
      min-height: ${heightMm}mm;
      padding: ${formatting.marginsMm}mm;
      margin: 0 auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    @media print {
      body {
        background: transparent;
      }
      .resume-page {
        margin: 0;
        box-shadow: none;
        width: 100%;
        min-height: 100%;
        padding: ${formatting.marginsMm}mm;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <main class="resume-page resume-template resume-template--${template.id}">
    ${bodyContent}
  </main>
</body>
</html>
  `;
}
