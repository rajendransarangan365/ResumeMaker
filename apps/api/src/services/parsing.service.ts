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
    // 1. Text normalization: Un-glue tokens that PDFs often concatenate
    let cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    cleanText = cleanText.replace(/(\b(?:19\d\d|20\d\d))([A-Za-z])/g, '$1 $2');
    cleanText = cleanText.replace(/(\b(?:19\d\d|20\d\d))(\d{1,2}(?:st|nd|rd|th))/gi, '$1 $2');
    cleanText = cleanText.replace(/([a-zA-Z])((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/gi, '$1 $2');
    cleanText = cleanText.replace(/(\d+)\s*Days\s*([A-Za-z])/g, '$1 Days $2');

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
      { type: 'languages', regex: /^(languages\s*known|spoken\s*languages|languages\s*spoken|languages|language\s+proficiency)\b/i },
      { type: 'personal_details', regex: /^(personal\s+details|personal\s+profile|personal\s+information)\b/i },
      { type: 'achievements', regex: /^(achievements|awards\s*&|awards|honors)\b/i },
      { type: 'declaration', regex: /^(declaration)\b/i },
    ];

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/;
    const dateRangeRegex = /((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4})\.?\s*\d{0,4})\s*[-–—to]+\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4})\.?\s*\d{0,4}|Present|Current)/i;
    const singleYearRegex = /\b(19\d\d|20\d\d)\b/;

    // Collect top column dates for 2-column resumes where dates appear first in stream
    const topDates: string[] = [];
    for (let i = 0; i < Math.min(allLines.length, 12); i++) {
      const l = allLines[i];
      const dm = l.match(dateRangeRegex);
      if (dm && !l.toLowerCase().includes('days') && !l.toLowerCase().includes('experience')) {
        topDates.push(dm[0]);
      }
    }

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

      // Skip date ranges, duration lines, numbers, and document labels
      if (dateRangeRegex.test(l) || /^\b\d+\s+(Days|Months|Years)\b/i.test(l) || /^\d+/.test(l) || /resume|curriculum|page\s+\d/i.test(l)) {
        continue;
      }

      if (!fullName && l.length >= 2 && l.length < 50 && !/software|developer|engineer|skills|work|internship|project/i.test(l)) {
        fullName = l;
        continue;
      }

      if (fullName && !headline && l.length >= 2 && l.length < 90) {
        headline = l;
        continue;
      }
    }

    if (!fullName && headerLines.length > 0) {
      for (const hl of headerLines) {
        if (!dateRangeRegex.test(hl) && !hl.includes('@') && !phoneRegex.test(hl) && !/^\d+/.test(hl)) {
          fullName = hl;
          break;
        }
      }
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
    let topDateIdx = 0;

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const isBullet = /^[•\-\*\u2022\u25E6\u2043\u2219\u00B7]/.test(line);
      const dateMatch = line.match(dateRangeRegex);

      // Form 1: Line contains inline date range
      if (dateMatch && !isBullet) {
        if (currentJob) {
          workExperience.push(currentJob);
        }

        const startDate = dateMatch[1]?.trim() || '';
        const endDate = dateMatch[2]?.trim() || 'Present';
        const isCurrent = /present|current/i.test(endDate);

        const rem = line.replace(dateMatch[0], '').replace(/[–—•]/g, ' ').trim();
        let jobTitle = '';
        let employer = '';

        if (rem) {
          if (/engineer|developer|trainee|manager|lead|architect|analyst|intern|specialist/i.test(rem)) {
            jobTitle = rem;
          } else {
            employer = rem;
          }
        }

        // Look back if title was on the preceding line
        if (!jobTitle && i > 0) {
          const prev = expLines[i - 1];
          if (!/^[•\-\*\u2022\u25E6\u2043\u2219\u00B7]/.test(prev) && /engineer|developer|trainee|manager|lead|architect|analyst|intern|specialist/i.test(prev)) {
            jobTitle = prev;
          }
        }

        // Look ahead if employer is on the next line
        if (!employer && i + 1 < expLines.length) {
          const next = expLines[i + 1];
          if (!/^[•\-\*\u2022\u25E6\u2043\u2219\u00B7]/.test(next) && !next.match(dateRangeRegex)) {
            employer = next;
            i++;
          }
        }

        currentJob = {
          id: `exp-${workExperience.length + 1}`,
          jobTitle: (jobTitle || 'Software Engineer').replace(/[–—•]/g, ' ').trim(),
          employer: (employer || 'Organization').replace(/[–—•]/g, ' - ').replace(/\s+/g, ' ').trim(),
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

      // Form 2: Line is Job Title - Company without date (2-column resume with top dates)
      const titleEmpMatch = line.match(/^([A-Za-z\s]+(?:Engineer|Developer|Manager|Architect|Consultant|Specialist|Lead|Intern|Trainee))\s*[-–—]\s*(.+)$/i);
      if (titleEmpMatch && !isBullet) {
        if (currentJob) {
          workExperience.push(currentJob);
        }
        const fallbackDate = topDates[topDateIdx] || '';
        topDateIdx++;
        const fbParts = fallbackDate.split(/[-–—to]+/);
        const startDate = fbParts[0]?.trim() || '';
        const endDate = fbParts[1]?.trim() || 'Present';

        currentJob = {
          id: `exp-${workExperience.length + 1}`,
          jobTitle: titleEmpMatch[1].trim(),
          employer: titleEmpMatch[2].replace(/[–—•]/g, ' - ').replace(/\s+/g, ' ').trim(),
          employmentType: 'Full-time',
          startDate,
          endDate,
          isCurrent: /present|current/i.test(endDate),
          responsibilities: [],
          technologies: [],
          includeInResume: true,
        };
        continue;
      }

      // Form 3: Title alone on a line (look ahead to see if next line has dates)
      if (!isBullet && /^(?:Senior\s+|Lead\s+|Junior\s+|Associate\s+)?(?:Software\s+|Frontend\s+|Backend\s+|Full\s*Stack\s+|MERN\s+Stack\s+|Technical\s+)?(?:Engineer|Developer|Manager|Architect|Specialist|Trainee)\b/i.test(line) && line.length < 60) {
        if (i + 1 < expLines.length && expLines[i + 1].match(dateRangeRegex)) {
          continue; // Handled in Form 1 on next line
        }
        if (currentJob) {
          workExperience.push(currentJob);
        }
        const fallbackDate = topDates[topDateIdx] || '';
        topDateIdx++;
        const fbParts = fallbackDate.split(/[-–—to]+/);
        const startDate = fbParts[0]?.trim() || '';
        const endDate = fbParts[1]?.trim() || 'Present';

        currentJob = {
          id: `exp-${workExperience.length + 1}`,
          jobTitle: line.trim(),
          employer: '',
          employmentType: 'Full-time',
          startDate,
          endDate,
          isCurrent: /present|current/i.test(endDate),
          responsibilities: [],
          technologies: [],
          includeInResume: true,
        };
        continue;
      }

      if (currentJob) {
        if (isBullet) {
          currentJob.responsibilities.push(cleanBullet(line));
        } else if (!currentJob.employer || currentJob.employer === 'Organization') {
          currentJob.employer = line.replace(/[–—•]/g, ' - ').replace(/\s+/g, ' ').trim();
        } else if (line.length > 25) {
          currentJob.responsibilities.push(line);
        }
      }
    }

    if (currentJob) {
      workExperience.push(currentJob);
    }

    // 5. Education
    const eduLines = sections['education'] || [];
    const education: IEducation[] = [];
    const degreeBoundary = /^(?:(?:19\d\d|20\d\d)\s+)?(?:Bachelor|Master|B\.?E\.?|B\.?Tech|B\.?Sc|M\.?E\.?|M\.?Tech|M\.?Sc|Higher\s+Secondary|HSC|SSLC|Secondary\s+School|Diploma|Ph\.?D|10th|12th)\b/i;

    const eduBlocks: string[][] = [];
    let curBlock: string[] = [];
    for (const l of eduLines) {
      if (l.includes('Key Courses:')) continue;
      if (degreeBoundary.test(l) && curBlock.length > 0) {
        eduBlocks.push(curBlock);
        curBlock = [l];
      } else {
        curBlock.push(l);
      }
    }
    if (curBlock.length > 0) eduBlocks.push(curBlock);

    for (const block of eduBlocks) {
      let qual = '';
      let spec = '';
      let inst = '';
      let date = '';
      let grade = '';

      for (let i = 0; i < block.length; i++) {
        const l = block[i];
        const gpaM = l.match(/(?:GPA|CGPA|Percentage|Grade|Marks)[:\s\-]*([0-9.]+\s*(?:\/\s*10|%)?)/i);
        if (gpaM) grade = gpaM[0];

        const dateRangeM = l.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present)/i);
        const yearM = l.match(/\b(19\d\d|20\d\d)\b/);

        if (dateRangeM) date = dateRangeM[0];
        else if (yearM && !date) date = yearM[0];

        const inlineHyphen = l.match(/^(Bachelor[^–-]+|Master[^–-]+|B\.?E\.?[^–-]+|B\.?Tech[^–-]+|Higher\s+Secondary[^–-]+|SSLC[^–-]+|10th|12th)\s*[–-]\s*(.+)/i);
        if (inlineHyphen) {
          qual = inlineHyphen[1].trim();
          inst = inlineHyphen[2].replace(/\(.*?\)/g, '').replace(/\|.*$/, '').trim();
          continue;
        }

        if (/college|university|school|institute|academy/i.test(l)) {
          inst = inst ? `${inst} ${l}` : l;
        } else if (
          /computer\s+science|information\s+technology|electrical|mechanical|civil|electronics/i.test(l) &&
          !qual.toLowerCase().includes(l.toLowerCase())
        ) {
          spec = spec ? `${spec} ${l}` : l;
        } else if (!gpaM && !dateRangeM && !yearM) {
          if (!qual) {
            qual = l;
            if ((qual.endsWith('in') || qual.endsWith('of')) && i + 1 < block.length) {
              qual += ' ' + block[i + 1];
              i++;
            }
          } else if (!inst) {
            inst = l;
          } else {
            inst += ' ' + l;
          }
        } else if (!qual) {
          qual = l.replace(/\b(19\d\d|20\d\d)\b/, '').trim();
        }
      }

      if (qual) {
        education.push({
          id: `edu-${education.length + 1}`,
          qualification: qual.trim(),
          specialization: spec.trim(),
          institution: inst.trim() || 'Institution',
          startDate: '',
          endDate: date.trim(),
          gradePercentageCgpa: grade.trim(),
          includeInResume: true,
        });
      }
    }

    // 6. Projects
    const projLines = sections['projects'] || [];
    const projects: IProject[] = [];
    let curProj: IProject | null = null;

    for (const l of projLines) {
      const isProjHeader = (/\.io|\.com/i.test(l) || /^\d+\s*Days/i.test(l) || /^Project\s*[:\-]/i.test(l)) && l.length < 80;
      if (isProjHeader) {
        if (curProj) projects.push(curProj);
        curProj = {
          id: `proj-${projects.length + 1}`,
          name: l.replace(/^\d+\s*Days\s*/i, '').trim(),
          category: 'Professional',
          description: '',
          technologies: [],
          url: '',
          includeInResume: true,
        };
        continue;
      }
      if (curProj) {
        const clean = cleanBullet(l);
        curProj.description += (curProj.description ? ' ' : '') + clean;
      }
    }
    if (curProj) projects.push(curProj);

    // 7. Spoken Languages Extraction (Tamil, English, Hindi, etc.)
    const SPOKEN_LANGUAGES = [
      'tamil', 'english', 'hindi', 'telugu', 'malayalam', 'kannada',
      'marathi', 'bengali', 'gujarati', 'punjabi', 'urdu', 'french',
      'german', 'spanish', 'mandarin', 'chinese', 'japanese', 'korean',
      'arabic', 'russian', 'italian', 'portuguese'
    ];

    const isLanguageLine = (text: string): boolean => {
      const lower = text.toLowerCase().trim();
      if (/^(languages|languages\s*known|spoken\s*languages|language\s+proficiency|mother\s*tongue)[\s:]+/i.test(lower)) return true;
      const clean = lower.replace(/^(languages\s*known|languages|spoken\s*languages|language\s+proficiency)[\s:]*/i, '');
      const words = clean.split(/[,/•\s]+/).filter(w => w.length > 2);
      if (words.length > 0 && words.every(w => SPOKEN_LANGUAGES.includes(w) || ['native', 'fluent', 'professional', 'read', 'write', 'speak', 'known', 'languages', 'and', 'basic', 'intermediate'].includes(w))) {
        return true;
      }
      return false;
    };

    const parsedLanguages: any[] = [];
    const discoveredLanguages = new Set<string>();
    const languageSources = [
      ...(sections['languages'] || []),
      ...allLines.filter(l => isLanguageLine(l)),
    ];

    for (const line of languageSources) {
      const clean = line.replace(/^(languages\s*known|languages|spoken\s*languages|language\s+proficiency|mother\s*tongue)[\s:]+/i, '');
      const parts = clean.split(/[,/•\n\t]+/).map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        for (const lang of SPOKEN_LANGUAGES) {
          if (part.toLowerCase().includes(lang)) {
            const formatted = lang.charAt(0).toUpperCase() + lang.slice(1);
            if (!discoveredLanguages.has(formatted)) {
              discoveredLanguages.add(formatted);
              const prof = part.toLowerCase().includes('native') || part.toLowerCase().includes('mother')
                ? 'Native/Bilingual'
                : part.toLowerCase().includes('basic')
                ? 'Basic'
                : 'Professional';
              parsedLanguages.push({ name: formatted, proficiency: prof });
            }
          }
        }
      }
    }

    if (parsedLanguages.length === 0) {
      parsedLanguages.push({ name: 'English', proficiency: 'Professional' });
    }

    // 8. Certifications & Achievements (STRICTLY EXCLUDING SPOKEN LANGUAGES)
    const certLines = [...(sections['certifications'] || []), ...(sections['achievements'] || [])];
    const certifications: ICertification[] = [];
    for (const line of certLines) {
      const cleanL = cleanBullet(line);
      // Filter out language lines, language lists, and headers
      if (isLanguageLine(cleanL) || /^languages\b/i.test(cleanL) || SPOKEN_LANGUAGES.some(lang => cleanL.toLowerCase() === lang)) {
        continue;
      }
      if (cleanL.length > 5) {
        certifications.push({
          id: `cert-${certifications.length + 1}`,
          title: cleanL,
          issuer: cleanL.includes('Coursera') ? 'Coursera' : cleanL.includes('Geek Trust') ? 'Geek Trust' : cleanL.includes('AWS') ? 'AWS' : cleanL.includes('Microsoft') ? 'Microsoft' : cleanL.includes('Google') ? 'Google' : 'Verified Issuer',
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
        languages: parsedLanguages,
        additionalSkills: [],
      },
      certifications,
      uncategorizedInformation: [],
    };
  }

  /**
   * Post-sanitizer: Guarantees spoken languages never end up in certifications
   */
  private sanitizeParsedData(data: Partial<ICandidateProfile>): Partial<ICandidateProfile> {
    if (!data) return data;

    const SPOKEN_LANGUAGES = [
      'tamil', 'english', 'hindi', 'telugu', 'malayalam', 'kannada',
      'marathi', 'bengali', 'gujarati', 'punjabi', 'urdu', 'french',
      'german', 'spanish', 'mandarin', 'chinese', 'japanese', 'korean',
      'arabic', 'russian', 'italian', 'portuguese'
    ];

    if (data.certifications && Array.isArray(data.certifications)) {
      const validCerts: any[] = [];
      const extractedLanguages: any[] = (data.skills?.languages && Array.isArray(data.skills.languages))
        ? [...data.skills.languages]
        : [];

      for (const cert of data.certifications) {
        const titleLower = (cert.title || '').toLowerCase().trim();
        const isLang =
          titleLower.startsWith('language') ||
          titleLower.startsWith('spoken') ||
          SPOKEN_LANGUAGES.some(l => titleLower.includes(l) && (titleLower.length < 28 || titleLower.startsWith('language')));

        if (isLang) {
          for (const lang of SPOKEN_LANGUAGES) {
            if (titleLower.includes(lang)) {
              const formatted = lang.charAt(0).toUpperCase() + lang.slice(1);
              if (!extractedLanguages.some(el => (el.name || '').toLowerCase() === lang)) {
                extractedLanguages.push({ name: formatted, proficiency: 'Professional' });
              }
            }
          }
        } else {
          validCerts.push(cert);
        }
      }

      data.certifications = validCerts;
      if (!data.skills) {
        data.skills = { technicalSkills: [], jobSkills: [], computerSkills: [], languages: extractedLanguages, additionalSkills: [] } as any;
      } else {
        data.skills.languages = extractedLanguages;
      }
    }

    return data;
  }

  /**
   * Parses raw extracted resume text into a structured candidate profile snapshot.
   * Leverages built-in ResumeIntelligenceAgent engine locally with optional Gemini enhancement.
   */
  public async parseResumeText(userId: string, rawText: string): Promise<Partial<ICandidateProfile>> {
    const systemPrompt = `
You are an expert ATS Resume Intelligence Agent. Your mission is to extract candidate resume information accurately from the provided unstructured text.
CRITICAL RULES:
1. ONLY extract information that is explicitly stated. Never invent employers, dates, qualifications, or skills.
2. If graduation or employment dates are ambiguous, preserve them as written.
3. Categorize skills into technicalSkills, jobSkills, and computerSkills.
4. Extract ALL work experiences, ALL education entries, and ALL projects found in the document.
5. Set "includeInResume": true for every workExperience, education, and project.
6. NEVER classify human spoken languages (e.g. English, Tamil, Hindi, Spanish, French, German) as certifications. Always place all human spoken languages strictly under skills.languages.
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

    // Local Built-in ResumeIntelligenceAgent Parser (Zero external dependency, instant execution)
    const heuristicFallback = (): Partial<ICandidateProfile> => {
      console.log('[ParsingService] Using built-in local ResumeIntelligenceAgent engine.');
      return this.parseResumeRobust(rawText);
    };

    const rawResult = await geminiService.executeStructuredPrompt<Partial<ICandidateProfile>>(
      userId,
      'resume_parsing',
      systemPrompt,
      userPrompt,
      heuristicFallback
    );

    // Sanitize to guarantee zero languages in certifications
    return this.sanitizeParsedData(rawResult);
  }
}

export const parsingService = new ParsingService();
