import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  convertMillimetersToTwip,
} from 'docx';
import { ICandidateProfile, IResumeVersion } from '@ats/shared-types';
import { getTemplateById } from '@ats/template-registry';

export async function generateDocxBuffer(
  profile: ICandidateProfile,
  resumeVersion: Partial<IResumeVersion>
): Promise<Buffer> {
  const template = getTemplateById(resumeVersion.templateId || 'classic-professional');
  const formatting = {
    ...template.defaultFormatting,
    ...(resumeVersion.formatting || {}),
  };

  const marginsTwips = convertMillimetersToTwip(formatting.marginsMm);
  const docChildren: Paragraph[] = [];

  const fontFamily = formatting.fontFamily || 'Roboto';

  // 1. Header Section
  const p = profile.personalDetails;
  docChildren.push(
    new Paragraph({
      alignment: template.headerStyle === 'centered' ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: p.fullName || 'Candidate Name',
          bold: true,
          size: 32, // 16pt
          font: fontFamily,
          color: formatting.accentColor ? formatting.accentColor.replace('#', '') : '1E293B',
        }),
      ],
    })
  );

  if (p.headline) {
    docChildren.push(
      new Paragraph({
        alignment: template.headerStyle === 'centered' ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: p.headline,
            italics: true,
            size: 22, // 11pt
            font: fontFamily,
            color: '475569',
          }),
        ],
      })
    );
  }

  // Contact info row
  const contactParts: string[] = [];
  if (p.email) contactParts.push(p.email);
  if (p.phone) contactParts.push(p.phone);
  if (p.city || p.country) contactParts.push([p.city, p.country].filter(Boolean).join(', '));
  if (p.linkedinUrl) contactParts.push(`LinkedIn: ${p.linkedinUrl}`);
  if (p.githubUrl) contactParts.push(`GitHub: ${p.githubUrl}`);

  if (contactParts.length > 0) {
    docChildren.push(
      new Paragraph({
        alignment: template.headerStyle === 'centered' ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: contactParts.join('  •  '),
            size: 19, // 9.5pt
            font: fontFamily,
            color: '64748B',
          }),
        ],
      })
    );
  }

  // Helper for Section Headings
  const addSectionHeading = (title: string) => {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        border: {
          bottom: {
            color: formatting.accentColor ? formatting.accentColor.replace('#', '') : 'CBD5E1',
            space: 4,
            style: BorderStyle.SINGLE,
            size: 8,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            font: fontFamily,
            color: formatting.accentColor ? formatting.accentColor.replace('#', '') : '1E293B',
          }),
        ],
      })
    );
  };

  const sectionOrder =
    resumeVersion.sectionOrder && resumeVersion.sectionOrder.length > 0
      ? resumeVersion.sectionOrder
      : template.defaultSectionOrder;

  for (const section of sectionOrder) {
    switch (section) {
      case 'summary': {
        if (profile.professionalSummary && profile.professionalSummary.trim().length > 0) {
          addSectionHeading('Professional Summary');
          docChildren.push(
            new Paragraph({
              spacing: { after: 140 },
              children: [
                new TextRun({
                  text: profile.professionalSummary,
                  size: 20, // 10pt
                  font: fontFamily,
                }),
              ],
            })
          );
        }
        break;
      }

      case 'skills': {
        const hasSkills =
          profile.skills.technicalSkills.length > 0 ||
          profile.skills.jobSkills.length > 0 ||
          profile.skills.computerSkills.length > 0;

        if (hasSkills) {
          addSectionHeading('Skills');
          if (profile.skills.technicalSkills.length > 0) {
            docChildren.push(
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: 'Technical Skills: ', bold: true, size: 20, font: fontFamily }),
                  new TextRun({ text: profile.skills.technicalSkills.join(', '), size: 20, font: fontFamily }),
                ],
              })
            );
          }
          if (profile.skills.jobSkills.length > 0) {
            docChildren.push(
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: 'Core Competencies: ', bold: true, size: 20, font: fontFamily }),
                  new TextRun({ text: profile.skills.jobSkills.join(', '), size: 20, font: fontFamily }),
                ],
              })
            );
          }
          if (profile.skills.computerSkills.length > 0) {
            docChildren.push(
              new Paragraph({
                spacing: { after: 120 },
                children: [
                  new TextRun({ text: 'Tools & Technologies: ', bold: true, size: 20, font: fontFamily }),
                  new TextRun({ text: profile.skills.computerSkills.join(', '), size: 20, font: fontFamily }),
                ],
              })
            );
          }
        }
        break;
      }

      case 'experience': {
        const activeExp = profile.workExperience.filter((e) => e.includeInResume);
        if (activeExp.length > 0) {
          addSectionHeading('Work Experience');
          for (const exp of activeExp) {
            docChildren.push(
              new Paragraph({
                spacing: { before: 100, after: 40 },
                children: [
                  new TextRun({ text: exp.jobTitle, bold: true, size: 20, font: fontFamily }),
                  new TextRun({ text: ` | ${exp.employer}`, size: 20, font: fontFamily }),
                  new TextRun({
                    text: ` (${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate})`,
                    italics: true,
                    size: 18,
                    font: fontFamily,
                    color: '64748B',
                  }),
                ],
              })
            );

            for (const resp of exp.responsibilities) {
              if (resp.trim().length > 0) {
                docChildren.push(
                  new Paragraph({
                    bullet: { level: 0 },
                    spacing: { after: 40 },
                    children: [
                      new TextRun({
                        text: resp,
                        size: 20,
                        font: fontFamily,
                      }),
                    ],
                  })
                );
              }
            }
          }
        }
        break;
      }

      case 'education': {
        const activeEdu = profile.education.filter((e) => e.includeInResume);
        if (activeEdu.length > 0) {
          addSectionHeading('Education');
          for (const edu of activeEdu) {
            docChildren.push(
              new Paragraph({
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({ text: edu.qualification, bold: true, size: 20, font: fontFamily }),
                  new TextRun({ text: edu.specialization ? ` in ${edu.specialization}` : '', size: 20, font: fontFamily }),
                  new TextRun({ text: ` — ${edu.institution}`, size: 20, font: fontFamily }),
                  new TextRun({
                    text: edu.endDate ? ` (${edu.endDate})` : '',
                    italics: true,
                    size: 18,
                    font: fontFamily,
                    color: '64748B',
                  }),
                ],
              })
            );
          }
        }
        break;
      }

      case 'projects': {
        const activeProj = profile.projects.filter((p) => p.includeInResume);
        if (activeProj.length > 0) {
          addSectionHeading('Projects');
          for (const proj of activeProj) {
            docChildren.push(
              new Paragraph({
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({ text: proj.name, bold: true, size: 20, font: fontFamily }),
                  new TextRun({
                    text: proj.technologies.length > 0 ? ` [${proj.technologies.join(', ')}]` : '',
                    italics: true,
                    size: 18,
                    font: fontFamily,
                    color: '64748B',
                  }),
                ],
              })
            );
            if (proj.description) {
              docChildren.push(
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { after: 40 },
                  children: [
                    new TextRun({
                      text: proj.description,
                      size: 20,
                      font: fontFamily,
                    }),
                  ],
                })
              );
            }
          }
        }
        break;
      }

      case 'certifications': {
        const activeCert = profile.certifications.filter((c) => c.includeInResume);
        if (activeCert.length > 0) {
          addSectionHeading('Certifications');
          for (const cert of activeCert) {
            docChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 40 },
                children: [
                  new TextRun({ text: cert.title, bold: true, size: 20, font: fontFamily }),
                  new TextRun({ text: ` — ${cert.issuer}`, size: 20, font: fontFamily }),
                  new TextRun({
                    text: cert.issueDate ? ` (${cert.issueDate})` : '',
                    italics: true,
                    size: 18,
                    font: fontFamily,
                    color: '64748B',
                  }),
                ],
              })
            );
          }
        }
        break;
      }

      case 'declaration': {
        if (profile.declaration.enabled && profile.declaration.text) {
          addSectionHeading('Declaration');
          docChildren.push(
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: profile.declaration.text,
                  size: 18,
                  italics: true,
                  font: fontFamily,
                  color: '475569',
                }),
              ],
            })
          );
        }
        break;
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: formatting.pageSize === 'A4' ? convertMillimetersToTwip(210) : convertInchesToTwip(8.5),
              height: formatting.pageSize === 'A4' ? convertMillimetersToTwip(297) : convertInchesToTwip(11),
            },
            margin: {
              top: marginsTwips,
              bottom: marginsTwips,
              left: marginsTwips,
              right: marginsTwips,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
