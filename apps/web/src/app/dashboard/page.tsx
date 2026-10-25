'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Upload,
  Target,
  User,
  Sparkles,
  Layout,
  Clock,
  Copy,
  Trash2,
  Download,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api, getAuthToken } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      api.getMe().then((res) => {
        if (!res.success) {
          router.push('/login?redirect=/dashboard');
        } else {
          loadDashboardData();
        }
      });
    } else {
      loadDashboardData();
    }
  }, [router]);

  const loadDashboardData = async () => {
    setLoading(true);
    const [resumesRes, profileRes, aiRes] = await Promise.all([
      api.getResumes(),
      api.getProfile(),
      api.getAiUsageSummary(),
    ]);

    if (!resumesRes.success && resumesRes.error?.code === 'UNAUTHORIZED') {
      router.push('/login?redirect=/dashboard');
      return;
    }

    if (resumesRes.success && resumesRes.data) {
      setResumes(resumesRes.data.resumes || []);
    }
    if (profileRes.success && profileRes.data) {
      setProfile(profileRes.data.profile);
    }
    if (aiRes.success && aiRes.data) {
      setAiSummary(aiRes.data.summary);
    }
    setLoading(false);
  };

  const handleDuplicate = async (resumeId: string) => {
    const res = await api.duplicateResume(resumeId);
    if (res.success) {
      loadDashboardData();
    }
  };

  const handleDelete = async (resumeId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const res = await api.deleteResume(resumeId);
      if (res.success) {
        setResumes(resumes.filter((r) => r._id !== resumeId));
      }
    }
  };

  const handleDownloadDocx = async (resumeId: string, title: string) => {
    try {
      await api.downloadDocx(resumeId, title);
    } catch (e) {
      alert('Failed to download Word document.');
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-studio-900 tracking-tight">
            Resume Intelligence Studio
          </h1>
          <p className="text-xs sm:text-sm text-studio-500 mt-1">
            Manage your verified master candidate profile and tailored ATS-friendly resumes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/resumes/new"
            className="px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Resume</span>
          </Link>
        </div>
      </div>

      {/* Primary Action Journey Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Link
          href="/resumes/new"
          className="group rounded-xl border border-studio-200 bg-white p-5 shadow-sm hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-studio-900 mb-1">Create Resume</h3>
            <p className="text-xs text-studio-500">
              Build an ATS-optimized resume from your verified profile with standard formatting.
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 mt-4">
            <span>Start Building</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/resumes/import"
          className="group rounded-xl border border-studio-200 bg-white p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-studio-900 mb-1">Import Existing Resume</h3>
            <p className="text-xs text-studio-500">
              Extract PDF, DOCX, TXT, or images. Review extracted fields and map to your profile.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-4">
            <span>Upload Document</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/resumes/tailor"
          className="group rounded-xl border border-studio-200 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-studio-900 mb-1">Tailor to Job (JD)</h3>
            <p className="text-xs text-studio-500">
              Analyze requirements, inspect your Requirement Matrix, and optimize bullet points.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-4">
            <span>Match Job Description</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/profile"
          className="group rounded-xl border border-studio-200 bg-white p-5 shadow-sm hover:border-purple-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-studio-900 mb-1">Candidate Profile</h3>
            <p className="text-xs text-studio-500">
              Manage your master record of education, experience, 5-part skills, and career gaps.
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 mt-4">
            <span>Edit Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Recent Resumes & Studio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Resume List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-studio-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-studio-700" />
              <span>Resume Library</span>
            </h2>
            <Link href="/resumes" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View All ({resumes.length})
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-studio-500 bg-white rounded-xl border border-studio-200">
              Loading resumes...
            </div>
          ) : resumes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-studio-300">
              <FileText className="w-10 h-10 text-studio-400 mx-auto mb-3" />
              <h3 className="font-bold text-studio-800 text-sm">No resumes created yet</h3>
              <p className="text-xs text-studio-500 mt-1 mb-4">
                Create a new resume from your profile or import an existing document.
              </p>
              <Link
                href="/resumes/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Resume</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.slice(0, 5).map((r) => (
                <div
                  key={r._id}
                  className="rounded-xl border border-studio-200 bg-white p-4 shadow-sm hover:border-studio-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-studio-900 hover:text-brand-600 cursor-pointer"
                        onClick={() => router.push(`/resumes/${r._id}`)}>
                        {r.title}
                      </h3>
                      <span className="text-[11px] bg-studio-100 text-studio-700 font-mono px-2 py-0.5 rounded">
                        {r.templateId}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-studio-500 mt-1">
                      <span>{r.targetRole || 'General Resume'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(r.updatedAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => router.push(`/resumes/${r._id}`)}
                      className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded text-xs transition-colors"
                    >
                      Open Editor
                    </button>
                    <button
                      onClick={() => handleDownloadDocx(r._id, r.title)}
                      className="p-2 hover:bg-studio-100 text-studio-600 rounded transition-colors"
                      title="Download DOCX"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(r._id)}
                      className="p-2 hover:bg-studio-100 text-studio-600 rounded transition-colors"
                      title="Duplicate Resume"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r._id, r.title)}
                      className="p-2 hover:bg-red-50 text-studio-400 hover:text-red-600 rounded transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: AI & Profile Status */}
        <div className="space-y-6">
          {/* Profile Overview */}
          <div className="rounded-xl border border-studio-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-sm text-studio-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Master Profile Status</span>
            </h3>
            {profile ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-studio-100">
                  <span className="text-studio-500">Name</span>
                  <span className="font-semibold text-studio-800">{profile.personalDetails?.fullName || 'Not entered'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-studio-100">
                  <span className="text-studio-500">Work History</span>
                  <span className="font-semibold text-studio-800">{profile.workExperience?.length || 0} entries</span>
                </div>
                <div className="flex justify-between py-1 border-b border-studio-100">
                  <span className="text-studio-500">Education</span>
                  <span className="font-semibold text-studio-800">{profile.education?.length || 0} degrees</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-studio-500">Technical Skills</span>
                  <span className="font-semibold text-studio-800">{profile.skills?.technicalSkills?.length || 0} listed</span>
                </div>
                <div className="pt-3">
                  <Link
                    href="/profile"
                    className="block w-full py-2 bg-studio-100 hover:bg-studio-200 text-studio-800 text-center font-semibold rounded text-xs transition-colors"
                  >
                    Edit Master Profile
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-studio-500">Loading master profile...</p>
            )}
          </div>

          {/* AI Usage Card */}
          <div className="rounded-xl border border-studio-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-studio-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Gemini AI Accounting</span>
              </h3>
              <Link href="/ai-usage" className="text-xs font-semibold text-purple-600 hover:underline">
                Details
              </Link>
            </div>
            {aiSummary ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-studio-100">
                  <span className="text-studio-500">Active Model</span>
                  <span className="font-mono text-studio-800">{aiSummary.modelInUse}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-studio-100">
                  <span className="text-studio-500">Requests Today</span>
                  <span className="font-semibold text-studio-800">{aiSummary.requestsToday}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-studio-100">
                  <span className="text-studio-500">Tokens This Month</span>
                  <span className="font-semibold text-studio-800">{aiSummary.totalTokensConsumed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-studio-500">Estimated Cost</span>
                  <span className="font-semibold text-studio-800">${aiSummary.totalEstimatedCostUsd.toFixed(4)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-studio-500">Loading AI analytics...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
