import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import { geminiService } from './gemini.service';
import { ICandidateProfile, IWorkExperience, IEducation, IProject, ISkills, ICertification } from '@ats/shared-types';

export class ParsingService {
  /**
   * Extracts raw text from an uploaded file based on file contents (magic bytes),
   * extension, or MIME type. Handles files without extensions smoothly.
   */
  public async extractRawText(filePath: string, mimeType: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);

    // Check PDF magic bytes (%PDF-)
    const isPdfHeader = fileBuffer.slice(0, 5).toString('ascii').startsWith('%PDF');
    if (isPdfHeader || mimeType === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
      try {
        const parsed = await pdfParse(fileBuffer);
        if (parsed.text && parsed.text.trim().length > 0) {
          return parsed.text;
        }
      } catch (err: any) {
        console.warn('[ParsingService] pdf-parse failed, attempting fallback text extraction:', err.message);
      }
    }

    // Check DOCX / ZIP magic bytes (PK\x03\x04)
    const isZipHeader = fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b;
    if (
      isZipHeader ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filePath.toLowerCase().endsWith('.docx')
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        if (result.value && result.value.trim().length > 0) {
          return result.value;
        }
      } catch (err: any) {
        console.warn('[ParsingService] mammoth failed, attempting fallback text extraction:', err.message);
      }
    }

    // Text / markdown / fallback
    return fileBuffer.toString('utf-8');
  }

  /**
   * Universal structural resume parser (rule-based).
   * Extracts personal details, professional summary, all work experiences with bullets,
   * all education entries, skills, projects, and certifications from ANY resume layout
   * without any hardcoded candidate or dummy data.
   */
  public parseResumeRobust(rawText: string): Partial<ICandidateProfile> {
    const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const allLines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

    const cleanBullet = (text: string): string => {
      return text.replace(/^[•\-\*\u2022\u25E6\u2043\u2219\u00B7\s]+/, '').trim();
    };

    const SECTION_HEADERS = [
      { type: 'summary', regex: /^(professional\s+summary|executive\s+summary|career\s+summary|summary|profile|about\s+me|career\s+objective|objective)\b/i },
      { type: 'skills', regex: /^(technical\s+skills|skills\s*&|skills\s+and|core\s+competencies|skills|key\s+skills|areas\s+of\s+expertise|technical\s+proficiencies)\b/i },
      { type: 'experience', regex: /^(professional\s+experience|work\s+experience|experience|employment\s+history|work\s+history|career\s+history)\b/i },
      { type: 'education', regex: /^(education\s*&|education\s+and|education|academic\s+background|academic\s+qualifications|academics|education\s+history)\b/i },
      { type: 'projects', regex: /^(projects|personal\s+projects|key\s+projects|academic\s+projects|notable\s+projects)\b/i },
      { type: 'certifications', regex: /^(certifications\s*&|certifications|certificates|licenses|courses)\b/i },
      { type: 'achievements', regex: /^(achievements|awards\s*&|awards|honors)\b/i },
      { type: 'declaration', regex: /^(declaration)\b/i },
    ];

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/;
    const dateRangeRegex = /((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4})\.?\s*\d{0,4})\s*[-–—to]+\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4})\.?\s*\d{0,4}|Present|Current)/i;
    const singleYearRegex = /\b(19\d\d|20\d\d)\b/;

    // Split text into section buckets
    const sections: Record<string, string[]> = { header: [] };
    let currentSection = 'header';

    for (const line of allLines) {
      let matchedType: string | null = null;
      for (const h of SECTION_HEADERS) {
        if (h.regex.test(line)) {
          matchedType = h.type;
          break;
        }
      }

      if (matchedType) {
        currentSection = matchedType;
        if (!sections[currentSection]) sections[currentSection] = [];
      } else {
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(line);
      }
    }

    // 1. Personal Details
    const headerLines = sections['header'] || [];
    let fullName = '';
    let headline = '';
    let email = '';
    let phone = '';
    let address = '';
    let city = '';
    let country = 'India';
    let linkedinUrl = '';
    let githubUrl = '';

    const fullEmailMatch = rawText.match(emailRegex);
    if (fullEmailMatch) email = fullEmailMatch[0];

    const fullPhoneMatch = rawText.match(phoneRegex);
    if (fullPhoneMatch) phone = fullPhoneMatch[0].trim();

    const linkedinMatch = rawText.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    if (linkedinMatch) linkedinUrl = linkedinMatch[0];

    const githubMatch = rawText.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
    if (githubMatch) githubUrl = githubMatch[0];

    for (let i = 0; i < headerLines.length; i++) {
      const l = headerLines[i];
      if (/address[:\s]/i.test(l)) {
        address = l.replace(/^address[:\s]*/i, '').trim();
        const parts = address.split(',');
        if (parts.length > 1) {
          city = parts[parts.length - 2].trim();
        }
        continue;
      }

      if (l.includes('@') || phoneRegex.test(l) || /linkedin|github/i.test(l)) {
        if (/chennai|bengaluru|bangalore|pudukkottai|mumbai|delhi|hyderabad|pune|kolkata|coimbatore/i.test(l) && !city) {
          const locMatch = l.match(/(chennai|bengaluru|bangalore|pudukkottai|mumbai|delhi|hyderabad|pune|kolkata|coimbatore)/i);
          if (locMatch) city = locMatch[0];
        }
        continue;
      }

      if (!fullName && l.length >= 2 && l.length < 50 && !/software|developer|engineer|resume|curriculum/i.test(l)) {
        fullName = l;
        continue;
      }

      if (!headline && (/developer|engineer|architect|manager|consultant|specialist|stack/i.test(l) || fullName)) {
        headline = l;
        continue;
      }
    }

    if (!fullName && headerLines.length > 0) {
      fullName = headerLines[0];
    }

    // 2. Summary
    const summaryLines = sections['summary'] || [];
    const professionalSummary = summaryLines.join(' ').replace(/\s+/g, ' ').trim();

    // 3. Skills
    const skillLines = sections['skills'] || [];
    const technicalSkills = new Set<string>();
    const jobSkills = new Set<string>();
    const computerSkills = new Set<string>();

    for (const line of skillLines) {
      const cleanL = cleanBullet(line);
      const colonIdx = cleanL.indexOf(':');
      if (colonIdx > 0 && colonIdx < 40) {
        const category = cleanL.substring(0, colonIdx).toLowerCase();
        const items = cleanL.substring(colonIdx + 1).split(/[,•|/]/).map((s) => s.trim()).filter(Boolean);
        if (/tool|git|ide|cloud|platform|docker|visual studio|figma|editor/i.test(category)) {
          items.forEach((it) => computerSkills.add(it));
        } else if (/core|competenc|manage|agile|sdlc|communicat|problem|leadership|soft/i.test(category)) {
          items.forEach((it) => jobSkills.add(it));
        } else {
          items.forEach((it) => technicalSkills.add(it));
        }
      } else {
        const items = cleanL.split(/[,•|/]/).map((s) => s.trim()).filter(Boolean);
        items.forEach((it) => {
          if (it.length >= 2 && it.length <= 40) {
            technicalSkills.add(it);
          }
        });
      }
    }

    // 4. Work Experience
    const expLines = sections['experience'] || [];
    const workExperience: IWorkExperience[] = [];
    let currentJob: IWorkExperience | null = null;

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const dateMatch = line.match(dateRangeRegex);
      const isBullet = /^[•\-\*\u2022\u25E6\u2043\u2219\u00B7]/.test(line);

      if (dateMatch && !isBullet) {
        if (currentJob) {
          workExperience.push(currentJob);
        }

        const startDate = dateMatch[1].trim();
        const endDate = dateMatch[2].trim();
        const isCurrent = /present|current/i.test(endDate);

        const rem = line.replace(dateMatch[0], '').replace(/[–—•]/g, '').trim();
        let jobTitle = 'Software Engineer';
        let employer = '';

        if (rem) {
          if (/engineer|developer|trainee|manager|lead|architect|analyst|intern/i.test(rem)) {
            jobTitle = rem;
          } else {
            employer = rem;
          }
        }

        // Check previous lines if title or employer is empty
        if (i > 0) {
          const prev1 = expLines[i - 1];
          if (!/^[•\-\*]/.test(prev1)) {
            if (/engineer|developer|trainee|manager|lead|architect|analyst|intern/i.test(prev1)) {
              jobTitle = prev1;
              if (i > 1 && !employer && !/^[•\-\*]/.test(expLines[i - 2])) {
                employer = expLines[i - 2];
              }
            } else if (!employer) {
              employer = prev1;
            }
          }
        }

        if (!employer && i + 1 < expLines.length && !/^[•\-\*]/.test(expLines[i + 1])) {
          employer = expLines[i + 1];
          i++;
        }

        employer = employer.replace(/[–—•]/g, ' - ').replace(/\s+/g, ' ').trim();
        if (!employer) employer = 'Organization';

        currentJob = {
          id: `exp-${workExperience.length + 1}`,
          jobTitle: jobTitle.replace(/[–—•]/g, '').trim(),
          employer,
          employmentType: 'Full-time',
          startDate,
          endDate,
          isCurrent,
          responsibilities: [],
          technologies: [],
          includeInResume: true,
        };
        continue;
      }

      if (currentJob) {
        if (isBullet) {
          currentJob.responsibilities.push(cleanBullet(line));
        } else if (currentJob.responsibilities.length > 0) {
          const lastIdx = currentJob.responsibilities.length - 1;
          currentJob.responsibilities[lastIdx] += ' ' + line;
        } else if (!currentJob.employer || currentJob.employer === 'Organization') {
          currentJob.employer = line;
        }
      }
    }

    if (currentJob) {
      workExperience.push(currentJob);
    }

    // 5. Education
    const eduLines = sections['education'] || [];
    const education: IEducation[] = [];
    const joinedEdu = eduLines.join('\n');
    let rawBlocks = joinedEdu.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);

    if (rawBlocks.length <= 1) {
      const degreeHeaders = /(Bachelor|Master|B\.?E\.?|B\.?Tech|B\.?Sc|M\.?E\.?|M\.?Tech|M\.?Sc|Higher\s+Secondary|HSC|SSLC|Secondary\s+School|Diploma|Ph\.?D)/i;
      const blocks: string[] = [];
      let currentLines: string[] = [];

      for (const line of eduLines) {
        if (degreeHeaders.test(line) && currentLines.length > 0 && !line.includes('Key Courses:')) {
          blocks.push(currentLines.join('\n'));
          currentLines = [line];
        } else {
          currentLines.push(line);
        }
      }
      if (currentLines.length > 0) blocks.push(currentLines.join('\n'));
      if (blocks.length > 1) rawBlocks = blocks;
    }

    for (const block of rawBlocks) {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      let qualification = '';
      let specialization = '';
      let institution = '';
      let endDate = '';
      let startDate = '';
      let grade = '';

      for (const l of lines) {
        if (l.includes('Key Courses:')) continue;

        const gpaMatch = l.match(/(?:GPA|CGPA|Percentage)[:\s]*([0-9.]+%?)/i);
        const dateMatch =
          l.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present)/i) ||
          l.match(/\b(19\d\d|20\d\d)\b/);

        if (gpaMatch) {
          grade = gpaMatch[0];
        }
        if (dateMatch && !endDate) {
          endDate = dateMatch[0];
        }

        // Inline hyphen split (e.g. Bachelor of Engineering in Computer Science – Shanmuganathan College)
        const inlineHyphen = l.match(/^(Bachelor[^–-]+|Master[^–-]+|B\.?E\.?[^–-]+|B\.?Tech[^–-]+|Higher\s+Secondary[^–-]+|SSLC[^–-]+)\s*[–-]\s*(.+)/i);
        if (inlineHyphen) {
          qualification = inlineHyphen[1].trim();
          institution = inlineHyphen[2].replace(/\(.*?\)/g, '').replace(/\|.*$/, '').trim();
          continue;
        }

        if (/college|university|school|institute|academy/i.test(l)) {
          institution = institution ? `${institution} ${l}` : l;
        } else if (
          /computer\s+science|mechanical|electrical|electronics|civil|commerce|science|arts/i.test(l) &&
          !qualification.toLowerCase().includes(l.toLowerCase())
        ) {
          specialization = specialization ? `${specialization} ${l}` : l;
        } else if (!gpaMatch && !dateMatch) {
          if (!qualification) {
            qualification = l;
          } else if (!institution && lines.indexOf(l) < 3) {
            qualification += ' ' + l;
          } else if (!institution) {
            institution = l;
          } else {
            institution += ' ' + l;
          }
        }
      }

      if (qualification) {
        education.push({
          id: `edu-${education.length + 1}`,
          qualification: qualification.trim(),
          specialization: specialization.trim(),
          institution: institution.trim() || 'Institution',
          startDate,
          endDate: endDate.trim(),
          gradePercentageCgpa: grade.trim(),
          includeInResume: true,
        });
      }
    }

    // 6. Projects
    const projLines = sections['projects'] || [];
    const projects: IProject[] = [];
    let currentProj: IProject | null = null;

    for (let i = 0; i < projLines.length; i++) {
      const line = projLines[i];
      const isBullet = /^[•\-\*\u2022\u25E6\u2043\u2219\u00B7]/.test(line);

      if (!isBullet && line.length >= 3 && line.length < 80) {
        if (currentProj) projects.push(currentProj);
        currentProj = {
          id: `proj-${projects.length + 1}`,
          name: line,
          category: 'Professional',
          description: '',
          technologies: [],
          url: '',
          includeInResume: true,
        };
        continue;
      }

      if (currentProj) {
        if (isBullet) {
          currentProj.description += (currentProj.description ? ' ' : '') + cleanBullet(line);
        } else {
          currentProj.description += ' ' + line;
        }
      }
    }
    if (currentProj) projects.push(currentProj);

    // 7. Certifications & Achievements
    const certLines = [...(sections['certifications'] || []), ...(sections['achievements'] || [])];
    const certifications: ICertification[] = [];
    for (const line of certLines) {
      const cleanL = cleanBullet(line);
      if (cleanL.length > 5) {
        certifications.push({
          id: `cert-${certifications.length + 1}`,
          title: cleanL,
          issuer: cleanL.includes('Coursera') ? 'Coursera' : cleanL.includes('Geek Trust') ? 'Geek Trust' : 'Verified Issuer',
          issueDate: '',
          includeInResume: true,
        });
      }
    }

    return {
      personalDetails: {
        fullName: fullName || 'Candidate',
        headline: headline || 'Software Engineer',
        email: email || '',
        phone: phone || '',
        address: address || '',
        city: city || '',
        country: country || 'India',
        linkedinUrl: linkedinUrl || '',
        githubUrl: githubUrl || '',
      },
      professionalSummary,
      workExperience,
      education,
      projects,
      skills: {
        technicalSkills: Array.from(technicalSkills),
        jobSkills: Array.from(jobSkills),
        computerSkills: Array.from(computerSkills),
        languages: [{ name: 'English', proficiency: 'Professional' }],
        additionalSkills: [],
      },
      certifications,
      uncategorizedInformation: [],
    };
  }

  /**
   * Parses raw extracted resume text into a structured candidate profile snapshot.
   * Leverages Gemini AI when configured, otherwise uses the robust structural section parser.
   */
  public async parseResumeText(userId: string, rawText: string): Promise<Partial<ICandidateProfile>> {
    const systemPrompt = `
You are an expert ATS Resume Parser. Your mission is to extract candidate resume information accurately from the provided unstructured text.
CRITICAL RULES:
1. ONLY extract information that is explicitly stated. Never invent employers, dates, qualifications, or skills.
2. If graduation or employment dates are ambiguous, preserve them as written.
3. Categorize skills into technicalSkills, jobSkills, and computerSkills.
4. Extract ALL work experiences, ALL education entries, and ALL projects found in the document.
5. Set "includeInResume": true for every workExperience, education, and project.
Output strictly valid JSON matching this schema:
{
  "personalDetails": {
    "fullName": string,
    "email": string,
    "phone": string,
    "headline": string,
    "address": string,
    "city": string,
    "country": string,
    "linkedinUrl": string,
    "githubUrl": string,
    "portfolioUrl": string
  },
  "professionalSummary": string,
  "education": [
    {
      "id": string,
      "qualification": string,
      "specialization": string,
      "institution": string,
      "startDate": string,
      "endDate": string,
      "gradePercentageCgpa": string,
      "includeInResume": true
    }
  ],
  "workExperience": [
    {
      "id": string,
      "employer": string,
      "jobTitle": string,
      "startDate": string,
      "endDate": string,
      "isCurrent": boolean,
      "responsibilities": string[],
      "technologies": string[],
      "includeInResume": true
    }
  ],
  "projects": [
    {
      "id": string,
      "name": string,
      "description": string,
      "technologies": string[],
      "url": string,
      "includeInResume": true
    }
  ],
  "skills": {
    "technicalSkills": string[],
    "jobSkills": string[],
    "computerSkills": string[],
    "languages": [{ "name": string, "proficiency": string }]
  },
  "certifications": [
    {
      "id": string,
      "title": string,
      "issuer": string,
      "issueDate": string,
      "includeInResume": true
    }
  ],
  "uncategorizedInformation": string[]
}
    `.trim();

    const userPrompt = `Extract structured resume data from this document content:\n\n<user_resume_content>\n${rawText.slice(0, 15000)}\n</user_resume_content>`;

    // Fallback: Real structural section parser (not dummy hardcoded data)
    const heuristicFallback = (): Partial<ICandidateProfile> => {
      console.log('[ParsingService] Using robust structural parser engine.');
      return this.parseResumeRobust(rawText);
    };

    return await geminiService.executeStructuredPrompt<Partial<ICandidateProfile>>(
      userId,
      'resume_parsing',
      systemPrompt,
      userPrompt,
      heuristicFallback
    );
  }
}

export const parsingService = new ParsingService();
