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
  Clock,
  Copy,
  Trash2,
  Download,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Building2,
  Calendar,
  AlertTriangle,
  Award,
  Filter,
} from 'lucide-react';
import { api, getAuthToken } from '@/lib/api';
import InterviewPrepModal from '@/components/InterviewPrepModal';

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter state for applications
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal state
  const [activePrepApp, setActivePrepApp] = useState<any | null>(null);

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
    try {
      const [resumesRes, profileRes, aiRes, appsRes] = await Promise.all([
        api.getResumes(),
        api.getProfile(),
        api.getAiUsageSummary(),
        api.getApplications(),
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
      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data.applications || []);
        setStatusCounts(appsRes.data.statusCounts || {});
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (resumeId: string) => {
    const res = await api.duplicateResume(resumeId);
    if (res.success) {
      loadDashboardData();
    }
  };

  const handleDeleteResume = async (resumeId: string, title: string) => {
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
    } catch {
      alert('Failed to download Word document.');
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await api.updateApplicationStatus(appId, { status: newStatus });
      if (res.success && res.data?.application) {
        const updatedApp = res.data.application;
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? updatedApp : app))
        );
        // Refresh counts
        const appsRes = await api.getApplications();
        if (appsRes.success && appsRes.data) {
          setStatusCounts(appsRes.data.statusCounts || {});
        }

        // If changed to shortlisted or interview, open the Interview Prep Modal
        if (newStatus === 'shortlisted' || newStatus === 'interview') {
          setActivePrepApp(updatedApp);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update application status.');
    }
  };

  const handleDeleteApplication = async (appId: string, jobTitle: string) => {
    if (confirm(`Remove application tracking for "${jobTitle}"?`)) {
      try {
        const res = await api.deleteApplication(appId);
        if (res.success) {
          setApplications((prev) => prev.filter((app) => app._id !== appId));
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete application.');
      }
    }
  };

  const filteredApplications =
    selectedStatusFilter === 'all'
      ? applications
      : applications.filter((a) => a.status === selectedStatusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'interview':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'offered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Multi-Agent AI Career Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Targeted Applications & Interview Radar
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Optimize resumes against real job descriptions, track application statuses, and defend every enhanced experience claim in your interviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/resumes/tailor"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-950/40 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Target className="w-4 h-4" />
              <span>Optimize for JD</span>
            </Link>
            <Link
              href="/resumes/new"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Resume</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              Applications Tracked
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {applications.length}
              </span>
              <span className="text-xs text-indigo-300 font-medium">pipeline</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-xs font-medium text-purple-300 uppercase tracking-wider block">
              Shortlisted
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-200">
                {statusCounts.shortlisted || 0}
              </span>
              <span className="text-xs text-purple-300 font-medium">ready for prep</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-xs font-medium text-emerald-300 uppercase tracking-wider block">
              Interviews Scheduled
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-200">
                {statusCounts.interview || 0}
              </span>
              <span className="text-xs text-emerald-300 font-medium">active</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              Resume Versions
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {resumes.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">in library</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/resumes/tailor"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Tailor to Job Description</h3>
            <p className="text-xs text-slate-500">
              Paste JD text to optimize bullets, close experience year gaps, and hit 100% ATS score.
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 mt-4">
            <span>Tailor Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/resumes/new"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Create New Resume</h3>
            <p className="text-xs text-slate-500">
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
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Import Existing Resume</h3>
            <p className="text-xs text-slate-500">
              Extract PDF, DOCX, TXT, or images with our multi-agent parser and map to profile.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-4">
            <span>Upload File</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/profile"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Candidate Profile</h3>
            <p className="text-xs text-slate-500">
              Manage your master record of work experience, 5-part skills matrix, and career timeline.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-4">
            <span>Edit Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Main Grid: Applications Tracker + Library */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Applications Tracker */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Targeted Job Applications & Interview Prep
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mark an application as <strong>Shortlisted</strong> to reveal enhanced claims and get instant AI interview defense.
              </p>
            </div>

            {/* Status Filter Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['all', 'applied', 'shortlisted', 'interview', 'offered', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    selectedStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st} {st !== 'all' && statusCounts[st] ? `(${statusCounts[st]})` : ''}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
              Loading applications...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No applications tracked yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
                Optimize a resume against a target Job Description to automatically track claims and get custom interview coaching.
              </p>
              <Link
                href="/resumes/tailor"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Target className="w-4 h-4" />
                <span>Optimize Resume for a JD</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const stretchedCount = app.stretchedFields?.length || 0;
                const isShortlistedOrBeyond = ['shortlisted', 'interview', 'offered'].includes(app.status);

                return (
                  <div
                    key={app._id}
                    className={`rounded-2xl border p-5 shadow-sm transition-all bg-white hover:shadow-md ${
                      isShortlistedOrBeyond
                        ? 'border-purple-200 bg-gradient-to-br from-white to-purple-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900">
                            {app.jobTitle}
                          </h3>
                          {app.companyName && (
                            <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {app.companyName}
                            </span>
                          )}
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-indigo-600">
                            <Sparkles className="w-3.5 h-3.5" />
                            {app.atsScore || 95}% ATS Match
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(app.appliedDate || app.createdAt).toLocaleDateString()}
                          </span>
                          {stretchedCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                                {stretchedCount} Claim{stretchedCount > 1 ? 's' : ''} Enhanced
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status Selector & Prep Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className="text-xs font-semibold border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="applied">Applied</option>
                          <option value="shortlisted">⭐ Shortlisted</option>
                          <option value="interview">🎯 Interview</option>
                          <option value="offered">🎉 Offered</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        <button
                          onClick={() => setActivePrepApp(app)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isShortlistedOrBeyond
                              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/30 animate-pulse'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          <BrainCircuit className="w-3.5 h-3.5" />
                          <span>Claims & Prep</span>
                        </button>

                        <button
                          onClick={() => handleDeleteApplication(app._id, app.jobTitle)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Claims Highlight Bar if shortlisted */}
                    {isShortlistedOrBeyond && stretchedCount > 0 && (
                      <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-xs">
                        <div className="text-slate-600 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            <strong>Shortlisted action required:</strong> Review interview answers for your {stretchedCount} enhanced claims before your recruiter call.
                          </span>
                        </div>
                        <button
                          onClick={() => setActivePrepApp(app)}
                          className="text-purple-700 font-bold hover:underline shrink-0 ml-2"
                        >
                          View Answers →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Resume Library Section */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <span>Resume Versions Library</span>
              </h2>
              <Link href="/resumes" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                View All ({resumes.length})
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
                Loading resumes...
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-sm">No resumes in library</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Create a new resume from your profile or import an existing document.
                </p>
                <Link
                  href="/resumes/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold"
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
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-bold text-sm text-slate-900 hover:text-brand-600 cursor-pointer"
                          onClick={() => router.push(`/resumes/${r._id}`)}
                        >
                          {r.title}
                        </h3>
                        <span className="text-[11px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded">
                          {r.templateId}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span>{r.targetRole || 'General Resume'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(r.updatedAt).toLocaleDateString()}</span>
                        </span>
                        {r.atsScore && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">
                              {r.atsScore}% Score
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => router.push(`/resumes/${r._id}`)}
                        className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Open Editor
                      </button>
                      <button
                        onClick={() => handleDownloadDocx(r._id, r.title)}
                        className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        title="Download Word Document (DOCX)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(r._id)}
                        className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        title="Duplicate Resume"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteResume(r._id, r.title)}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
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
        </div>

        {/* Right 1 Col: Master Profile & AI Accounting */}
        <div className="space-y-6">
          {/* Master Profile Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Verified Master Profile</span>
            </h3>
            {profile ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-semibold text-slate-800">
                    {profile.personalDetails?.fullName || 'Not entered'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Work Experience</span>
                  <span className="font-semibold text-slate-800">
                    {profile.workExperience?.length || 0} positions
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Education</span>
                  <span className="font-semibold text-slate-800">
                    {profile.education?.length || 0} degrees
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Technical Skills</span>
                  <span className="font-semibold text-slate-800">
                    {profile.skills?.technicalSkills?.length || 0} skills
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Job Competencies</span>
                  <span className="font-semibold text-slate-800">
                    {profile.skills?.jobSkills?.length || 0} competencies
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    href="/profile"
                    className="block w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-semibold rounded-xl text-xs transition-colors"
                  >
                    Edit Master Profile
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Loading master profile...</p>
            )}
          </div>

          {/* AI Usage & Cost Accounting */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Gemini AI Accounting</span>
              </h3>
              <Link href="/ai-usage" className="text-xs font-semibold text-purple-600 hover:underline">
                Audit Logs
              </Link>
            </div>

            {aiSummary ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Active Model</span>
                  <span className="font-mono text-slate-800 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                    {aiSummary.modelInUse || 'gemini-2.5-flash'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Requests Today</span>
                  <span className="font-semibold text-slate-800">{aiSummary.requestsToday}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Tokens Consumed</span>
                  <span className="font-semibold text-slate-800">
                    {aiSummary.totalTokensConsumed.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Estimated Cost</span>
                  <span className="font-semibold text-emerald-700">
                    ${aiSummary.totalEstimatedCostUsd.toFixed(4)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Loading AI analytics...</p>
            )}
          </div>

          {/* Interview Confidence Tip Box */}
          <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white p-5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Interview Defense Tip</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              When an interviewer asks about an enhanced skill or timeline, anchor your response on <strong>first-principles architecture</strong> and <strong>high-impact outcomes</strong> rather than tenure alone.
            </p>
          </div>
        </div>
      </div>

      {/* Interview Prep Modal */}
      {activePrepApp && (
        <InterviewPrepModal
          application={activePrepApp}
          onClose={() => setActivePrepApp(null)}
          onUpdate={(updated) => {
            setApplications((prev) =>
              prev.map((a) => (a._id === updated._id ? updated : a))
            );
          }}
        />
      )}
    </div>
  );
}
