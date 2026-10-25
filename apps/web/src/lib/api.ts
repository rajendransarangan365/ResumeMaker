const getApiBase = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }
  return '/api/v1';
};

const API_BASE = getApiBase();

async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string; details?: any[] } }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
  verifyEmail: (body: any) => fetcher('/auth/verify-email', { method: 'POST', body: JSON.stringify(body) }),
  resendVerification: (body: any) => fetcher('/auth/resend-verification', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => fetcher('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => fetcher('/auth/logout', { method: 'POST' }),
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
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        credentials: 'include',
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

  // Exports & Layout
  getPageMetrics: (resumeId: string) => fetcher<{ metrics: any }>(`/exports/metrics/${resumeId}`),
  downloadDocx: async (resumeId: string, filename: string) => {
    const res = await fetch(`${API_BASE}/exports/docx`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeId }),
    });
    if (!res.ok) throw new Error('Failed to generate DOCX');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // AI Usage
  getAiUsageSummary: () => fetcher<{ summary: any; recentLogs: any[] }>('/ai-usage/summary'),
};
