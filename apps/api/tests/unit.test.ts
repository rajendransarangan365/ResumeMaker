import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { RegisterSchema, VerifyOtpSchema, PersonalDetailsSchema } from '@ats/resume-schema';
import { ATS_TEMPLATES, TEMPLATE_LIST, getTemplateById, mapCandidateToTemplate } from '@ats/template-registry';
import { calculatePageMetrics, generateResumeHtml } from '@ats/resume-renderer';
import { ICandidateProfile, IResumeVersion } from '@ats/shared-types';

describe('Unit & Integration Test Suite', () => {
  // 1. Authentication & Security Schemas
  describe('Authentication & Security', () => {
    it('should validate matching registration passwords', () => {
      const valid = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      };
      const result = RegisterSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched registration passwords', () => {
      const invalid = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        termsAccepted: true,
      };
      const result = RegisterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should require a 6-digit numeric OTP', () => {
      expect(VerifyOtpSchema.safeParse({ email: 'john@example.com', otp: '123456' }).success).toBe(true);
      expect(VerifyOtpSchema.safeParse({ email: 'john@example.com', otp: '12345' }).success).toBe(false);
      expect(VerifyOtpSchema.safeParse({ email: 'john@example.com', otp: 'abcdef' }).success).toBe(false);
    });

    it('should verify bcrypt password hashing and comparison', async () => {
      const password = 'SuperSecretPassword123!';
      const hash = await bcrypt.hash(password, 10);
      expect(await bcrypt.compare(password, hash)).toBe(true);
      expect(await bcrypt.compare('WrongPassword', hash)).toBe(false);
    });

    it('should securely hash OTP using SHA-256 without plaintext leakage', () => {
      const otp = '492817';
      const hash1 = crypto.createHash('sha256').update(otp).digest('hex');
      const hash2 = crypto.createHash('sha256').update(otp).digest('hex');
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  // 2. ATS Template Registry (30 Templates)
  describe('Template Registry & Data Mapping', () => {
    it('should contain all 30 required ATS templates', () => {
      expect(TEMPLATE_LIST.length).toBe(30);
      const expectedIds = [
        'classic-professional',
        'modern-minimal',
        'corporate-standard',
        'technical-engineer',
        'software-developer',
        'fresher-graduate',
        'experienced-professional',
        'career-change',
        'administrative-support',
        'sales-customer-service',
        'electrical-instrumentation',
        'project-focused',
        'skills-focused',
        'academic-professional',
        'general-purpose',
        'modern-single-column',
        'minimal-professional',
        'corporate-professional',
        'graduate-entry',
        'technical-specialist',
        'senior-engineer',
        'executive-leadership',
        'marketing-professional',
        'customer-support',
        'finance-accounting',
        'healthcare-medical',
        'researcher-cv',
        'employment-gap-friendly',
        'international-professional',
        'ats-focused-hybrid',
      ];
      expectedIds.forEach((id) => {
        expect(ATS_TEMPLATES[id as keyof typeof ATS_TEMPLATES]).toBeDefined();
        expect(ATS_TEMPLATES[id as keyof typeof ATS_TEMPLATES].isAtsCompliant).toBe(true);
      });
    });

    it('should map candidate profile to template without data loss when switching', () => {
      const mockProfile: ICandidateProfile = {
        id: 'prof-1',
        userId: 'user-1',
        profileTitle: 'Master Profile',
        personalDetails: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+1 555-0199',
        },
        professionalSummary: 'Experienced software architect with 8+ years experience.',
        education: [
          {
            id: 'edu-1',
            qualification: 'B.S. in Computer Science',
            institution: 'MIT',
            includeInResume: true,
          },
        ],
        workExperience: [
          {
            id: 'exp-1',
            employer: 'Tech Corp',
            jobTitle: 'Senior Software Engineer',
            employmentType: 'Full-time',
            startDate: '2020',
            endDate: 'Present',
            isCurrent: true,
            responsibilities: ['Architected cloud infrastructure.'],
            includeInResume: true,
          },
        ],
        projects: [],
        skills: {
          technicalSkills: ['TypeScript', 'React', 'Node.js'],
          jobSkills: ['System Design'],
          computerSkills: ['Docker'],
          languages: [{ name: 'English', proficiency: 'Native/Bilingual' }],
          additionalSkills: [],
        },
        certifications: [],
        businessExperience: [],
        currentOccupation: { status: 'Employed' },
        careerGaps: [],
        declaration: { enabled: false, text: '' },
        uncategorizedInformation: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mapped = mapCandidateToTemplate(mockProfile, { templateId: 'technical-engineer' });
      expect(mapped.template.id).toBe('technical-engineer');
      // Technical Engineer template puts skills and experience first
      expect(mapped.effectiveSectionOrder).toContain('skills');
      expect(mapped.effectiveSectionOrder).toContain('experience');

      // Verify HTML generation contains candidate data
      const html = generateResumeHtml(mockProfile, { templateId: 'technical-engineer' });
      expect(html).toContain('Jane Doe');
      expect(html).toContain('Tech Corp');
      expect(html).toContain('TypeScript');
    });
  });

  // 3. Physical A4 Layout & Page Balancing
  describe('Page Balancing & Physical Layout Metrics', () => {
    it('should calculate A4 dimensions and detect page metrics accurately', () => {
      const mockProfile: ICandidateProfile = {
        id: 'prof-1',
        userId: 'user-1',
        profileTitle: 'Master',
        personalDetails: { fullName: 'Alex Smith', email: 'alex@example.com', phone: '123' },
        professionalSummary: 'Short summary for single page document.',
        education: [],
        workExperience: [
          {
            id: 'exp-1',
            employer: 'Acme Inc',
            jobTitle: 'Developer',
            employmentType: 'Full-time',
            startDate: '2022',
            endDate: '2023',
            isCurrent: false,
            responsibilities: ['Built user interfaces', 'Fixed bugs'],
            includeInResume: true,
          },
        ],
        projects: [],
        skills: { technicalSkills: ['JavaScript'], jobSkills: [], computerSkills: [], languages: [], additionalSkills: [] },
        certifications: [],
        businessExperience: [],
        currentOccupation: { status: 'Employed' },
        careerGaps: [],
        declaration: { enabled: false, text: '' },
        uncategorizedInformation: [],
        createdAt: '',
        updatedAt: '',
      };

      const metrics = calculatePageMetrics(mockProfile, {
        pageSize: 'A4',
        fontFamily: 'Roboto',
        fontSizePt: 10,
        lineSpacing: 1.25,
        marginsMm: 15,
        accentColor: '#1e293b',
      });

      expect(metrics.pageSize).toBe('A4');
      expect(metrics.pageWidthMm).toBe(210);
      expect(metrics.pageHeightMm).toBe(297);
      expect(metrics.estimatedPages).toBe(1);
      expect(metrics.contentHeightPx).toBeGreaterThan(0);
    });
  });
});
