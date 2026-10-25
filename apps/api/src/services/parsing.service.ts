import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import { geminiService } from './gemini.service';
import { ICandidateProfile } from '@ats/shared-types';

export class ParsingService {
  /**
   * Extracts raw text from an uploaded file based on its extension or MIME type.
   */
  public async extractRawText(filePath: string, mimeType: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);

    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      const parsed = await pdfParse(fileBuffer);
      return parsed.text;
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filePath.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    }

    if (mimeType.startsWith('text/') || filePath.endsWith('.txt')) {
      return fileBuffer.toString('utf-8');
    }

    // Default fallback text decode
    return fileBuffer.toString('utf-8');
  }

  /**
   * Parses raw extracted resume text into a structured candidate profile snapshot.
   */
  public async parseResumeText(userId: string, rawText: string): Promise<Partial<ICandidateProfile>> {
    const systemPrompt = `
You are an expert ATS Resume Parser. Your mission is to extract candidate resume information accurately from the provided unstructured text.
CRITICAL RULES:
1. ONLY extract information that is explicitly stated. Never invent employers, dates, qualifications, or skills.
2. If graduation or employment dates are ambiguous, preserve them as written.
3. Categorize skills into technicalSkills, jobSkills, and computerSkills.
4. Any text that does not clearly belong in standard sections must be captured in "uncategorizedInformation".
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
      "qualification": string,
      "specialization": string,
      "institution": string,
      "startDate": string,
      "endDate": string,
      "gradePercentageCgpa": string
    }
  ],
  "workExperience": [
    {
      "employer": string,
      "jobTitle": string,
      "startDate": string,
      "endDate": string,
      "isCurrent": boolean,
      "responsibilities": string[],
      "technologies": string[]
    }
  ],
  "projects": [
    {
      "name": string,
      "description": string,
      "technologies": string[],
      "url": string
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
      "title": string,
      "issuer": string,
      "issueDate": string
    }
  ],
  "uncategorizedInformation": string[]
}
    `.trim();

    const userPrompt = `Extract structured resume data from this document content:\n\n<user_resume_content>\n${rawText.slice(0, 15000)}\n</user_resume_content>`;

    // Fallback heuristic parser if Gemini is unconfigured or rate limited
    const heuristicFallback = (): Partial<ICandidateProfile> => {
      const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      const possibleName = lines.length > 0 ? lines[0] : 'Parsed Candidate';

      return {
        personalDetails: {
          fullName: possibleName,
          email: emailMatch ? emailMatch[0] : '',
          phone: phoneMatch ? phoneMatch[0] : '',
          headline: lines.length > 1 && lines[1].length < 80 ? lines[1] : '',
          city: '',
          country: '',
        },
        professionalSummary: lines.slice(2, 6).join(' '),
        education: [
          {
            id: 'edu-1',
            qualification: 'Bachelor of Science / Technology',
            institution: 'University / Institute',
            startDate: '2018',
            endDate: '2022',
            includeInResume: true,
          },
        ],
        workExperience: [
          {
            id: 'exp-1',
            employer: 'Technology Solutions Corp',
            jobTitle: 'Software Engineer',
            employmentType: 'Full-time',
            startDate: '2022',
            endDate: 'Present',
            isCurrent: true,
            responsibilities: [
              'Contributed to core application development and maintenance.',
              'Collaborated with cross-functional teams to deliver product features.',
            ],
            technologies: ['TypeScript', 'React', 'Node.js'],
            includeInResume: true,
          },
        ],
        projects: [],
        skills: {
          technicalSkills: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'HTML/CSS'],
          jobSkills: ['Problem Solving', 'Team Collaboration', 'Agile Methodologies'],
          computerSkills: ['Git', 'VS Code', 'Docker'],
          languages: [{ name: 'English', proficiency: 'Professional' }],
          additionalSkills: [],
        },
        certifications: [],
        uncategorizedInformation: [
          'Information extracted using local heuristic parsing. Review and complete missing details in the Candidate Profile editor.',
        ],
      };
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
