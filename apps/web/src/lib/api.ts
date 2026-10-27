const TOKEN_KEY = 'ats_auth_token';

export const setAuthToken = (token?: string | null) => {
  if (typeof window !== 'undefined') {
    if (token && token.trim() !== '') {
      localStorage.setItem(TOKEN_KEY, token.trim());
      document.cookie = `ats_token=${token.trim()}; path=/; max-age=604800; SameSite=Lax`;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = `ats_token=; path=/; max-age=0; SameSite=Lax`;
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const getApiBase = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }
  // When running in browser on Vercel or any production host, route directly to live Render backend
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://resumemaker-api-uswp.onrender.com/api/v1';
    }
  }
  return '/api/v1';
};

async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string; details?: any[] } }> {
  try {
    const apiBase = getApiBase();
    const token = getAuthToken();
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${apiBase}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {}),
      },
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Unable to connect to server. Check network connection.',
      },
    };
  }
}

export const api = {
  // Auth
  register: (body: any) => fetcher('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  
  verifyEmail: async (body: any) => {
    const res = await fetcher<{ user: any; token: string }>('/auth/verify-email', { method: 'POST', body: JSON.stringify(body) });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },

  resendVerification: (body: any) => fetcher('/auth/resend-verification', { method: 'POST', body: JSON.stringify(body) }),

  login: async (body: any) => {
    const res = await fetcher<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },

  logout: async () => {
    setAuthToken(null);
    return fetcher('/auth/logout', { method: 'POST' });
  },

  getMe: () => fetcher<{ user: any }>('/auth/me'),
  forgotPassword: (body: any) => fetcher('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  verifyResetOtp: (body: any) => fetcher<{ resetToken: string }>('/auth/verify-reset-otp', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body: any) => fetcher('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // Profile
  getProfile: () => fetcher<{ profile: any }>('/profiles'),
  updateProfile: (profileId: string, body: any) => fetcher<{ profile: any }>(`/profiles/${profileId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  checkCareerGaps: () => fetcher<{ detectedGaps: any[]; recommendations: string[] }>('/profiles/career-gap-check', { method: 'POST' }),

  // Resumes
  getResumes: () => fetcher<{ resumes: any[] }>('/resumes'),
  getResume: (resumeId: string) => fetcher<{ resume: any; profile: any }>(`/resumes/${resumeId}`),
  createResume: (body: any) => fetcher<{ resume: any }>('/resumes', { method: 'POST', body: JSON.stringify(body) }),
  updateResume: (resumeId: string, body: any) => fetcher<{ resume: any }>(`/resumes/${resumeId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  duplicateResume: (resumeId: string) => fetcher<{ resume: any }>(`/resumes/${resumeId}/duplicate`, { method: 'POST' }),
  deleteResume: (resumeId: string) => fetcher(`/resumes/${resumeId}`, { method: 'DELETE' }),

  // Documents
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = getAuthToken();
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${getApiBase()}/documents/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: formData,
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: { code: 'UPLOAD_FAILED', message: err.message } };
    }
  },
  parseDocument: (documentId: string) => fetcher<{ documentId: string; parsedData: any }>(`/documents/parse/${documentId}`, { method: 'POST' }),
  applyDocumentToProfile: (documentId: string, reviewedData?: any) =>
    fetcher(`/documents/apply-to-profile/${documentId}`, { method: 'POST', body: JSON.stringify({ reviewedData }) }),

  // Optimization & AI
  analyzeJd: (body: any) => fetcher<{ analysis: any }>('/optimization/analyze-jd', { method: 'POST', body: JSON.stringify(body) }),
  matchJd: (body: any) => fetcher<{ matches: any[]; keywordCoveragePercentage: number; tailoredSummarySuggestion: string }>('/optimization/match-jd', { method: 'POST', body: JSON.stringify(body) }),
  optimizeBullet: (body: any) => fetcher<{ improvedBullets: string[]; feedback: string }>('/optimization/optimize-bullet', { method: 'POST', body: JSON.stringify(body) }),
  calibrateResume: (body: { profile: any; targetRole?: string }) =>
    fetcher<{
      overallScore: number;
      scores: { impact: number; verbs: number; skills: number; readability: number };
      recommendations: string[];
      calibratedSummary: string;
      calibratedBullets: { expId: string; original: string; improved: string }[];
      suggestedSkills: { technicalSkills: string[]; jobSkills: string[]; computerSkills: string[] };
    }>('/optimization/calibrate-resume', { method: 'POST', body: JSON.stringify(body) }),
  reconstructResume: (body: {
    jobTitle: string;
    companyName?: string;
    jobDescriptionText: string;
    existingResumeId?: string;
    templateId?: string;
  }) =>
    fetcher<{
      resumeId: string;
      resume: any;
      profile: any;
      tailoredSummary: string;
      prioritizedSkills: string[];
    }>('/optimization/reconstruct-resume', { method: 'POST', body: JSON.stringify(body) }),

  // Exports & Layout
  getPageMetrics: (resumeId: string) => fetcher<{ metrics: any }>(`/exports/metrics/${resumeId}`),
  downloadDocx: async (resumeId: string, filename: string) => {
    try {
      const token = getAuthToken();
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${getApiBase()}/exports/docx`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ resumeId }),
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.error?.message || `Export failed with status ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(filename || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      console.error('Word export error:', err);
      alert(err.message || 'Could not export Word document. Please ensure you are logged in.');
    }
  },

  // AI Usage
  getAiUsageSummary: () => fetcher<{ summary: any; recentLogs: any[] }>('/ai-usage/summary'),

  // Multi-Agent Engine & Knowledge Base
  getAgentHealth: () => fetcher<{ pythonService: string; pythonDetails: any; localEngine: string; totalJobFamiliesLoaded: number }>('/agents/health'),
  getJobFamilies: () => fetcher<{ total: number; jobFamilies: any[] }>('/agents/knowledge/job-families'),
  getJobFamilyById: (id: string) => fetcher<{ jobFamily: any }>(`/agents/knowledge/job-families/${id}`),
  orchestrateAgentResume: (body: {
    resumeId?: string;
    jobTitle: string;
    companyName?: string;
    rawText: string;
    preferredTemplateId?: string;
    saveMode?: 'update' | 'create_new';
  }) => fetcher<any>('/agents/orchestrate', { method: 'POST', body: JSON.stringify(body) }),
  matchCandidateJob: (body: {
    jobTitle: string;
    companyName?: string;
    rawText: string;
  }) => fetcher<any>('/agents/match', { method: 'POST', body: JSON.stringify(body) }),
};
