'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Award,
  Calendar,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { api, getAuthToken } from '@/lib/api';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [gapModalOpen, setGapModalOpen] = useState(false);
  const [gapResults, setGapResults] = useState<{ detectedGaps: any[]; recommendations: string[] } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const res = await api.getProfile();
    if (res.success && res.data?.profile) {
      setProfile(res.data.profile);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    const res = await api.updateProfile(profile._id, profile);
    setSaving(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Candidate profile saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to save profile changes.' });
    }
  };

  const handleCareerGapCheck = async () => {
    const res = await api.checkCareerGaps();
    if (res.success && res.data) {
      setGapResults(res.data);
      setGapModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-studio-500 text-sm">
        Loading master candidate profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 max-w-md mx-auto my-16 p-8 bg-white border border-studio-200 rounded-2xl shadow-sm text-center">
        <User className="w-12 h-12 text-brand-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-studio-900 mb-2">Master Candidate Profile</h2>
        <p className="text-xs text-studio-500 mb-6">
          Please sign in to access and edit your verified personal details, education, work experience, and 5-part skills.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={loadProfile}
            className="px-4 py-2 border border-studio-300 rounded-lg text-xs font-semibold text-studio-700 hover:bg-studio-50"
          >
            Retry Loading
          </button>
          <a
            href="/login"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex items-center gap-2 mb-4 text-xs font-medium text-studio-500">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-studio-200 text-studio-700 hover:text-brand-600 hover:border-brand-300 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-studio-300 hidden sm:inline">/</span>
        <span className="text-studio-700 font-semibold hidden sm:inline">Master Candidate Profile</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-studio-900 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-brand-600" />
            <span>Master Candidate Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-studio-500 mt-1">
            Ground-truth professional record. Any changes made here are preserved across all 15 ATS resume versions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCareerGapCheck}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-amber-200 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Career Gap Assistant</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Sections Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-studio-200 p-2 shadow-sm space-y-1">
            {[
              { id: 'personal', label: 'Personal Details', icon: User },
              { id: 'summary', label: 'Professional Summary', icon: Briefcase },
              { id: 'experience', label: 'Work Experience', count: profile.workExperience?.length, icon: Briefcase },
              { id: 'education', label: 'Education', count: profile.education?.length, icon: GraduationCap },
              { id: 'projects', label: 'Projects', count: profile.projects?.length, icon: FolderGit2 },
              { id: 'skills', label: 'Skills (5-Part)', icon: Wrench },
              { id: 'certifications', label: 'Certifications', count: profile.certifications?.length, icon: Award },
              { id: 'declaration', label: 'Declaration', icon: CheckCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-studio-600 hover:bg-studio-50 hover:text-studio-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span className="text-[10px] bg-studio-100 text-studio-600 px-1.5 py-0.5 rounded-full font-mono">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Detail Form */}
        <div className="flex-1 bg-white rounded-xl border border-studio-200 p-6 shadow-sm">
          {/* Personal Details */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-studio-900 border-b pb-2">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-studio-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={profile.personalDetails.fullName || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalDetails: { ...profile.personalDetails, fullName: e.target.value },
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-studio-700 mb-1">Professional Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Software Engineer"
                    value={profile.personalDetails.headline || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalDetails: { ...profile.personalDetails, headline: e.target.value },
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-studio-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={profile.personalDetails.email || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalDetails: { ...profile.personalDetails, email: e.target.value },
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-studio-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profile.personalDetails.phone || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalDetails: { ...profile.personalDetails, phone: e.target.value },
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-studio-700 mb-1">City</label>
                  <input
                    type="text"
                    value={profile.personalDetails.city || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalDetails: { ...profile.personalDetails, city: e.target.value },
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-studio-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={profile.personalDetails.country || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalDetails: { ...profile.personalDetails, country: e.target.value },
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-studio-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profile.personalDetails.linkedinUrl || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalDetails: { ...profile.personalDetails, linkedinUrl: e.target.value },
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-studio-700 mb-1">GitHub / Portfolio URL</label>
                  <input
                    type="url"
                    value={profile.personalDetails.githubUrl || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalDetails: { ...profile.personalDetails, githubUrl: e.target.value },
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Professional Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-base font-bold text-studio-900">Professional Summary</h2>
                <span className="text-xs text-studio-500 font-mono">
                  {profile.professionalSummary?.length || 0} characters
                </span>
              </div>
              <p className="text-xs text-studio-500 leading-relaxed">
                Provide a concise overview of your background, technical depth, and quantifiable value.
              </p>
              <textarea
                rows={6}
                value={profile.professionalSummary || ''}
                onChange={(e) => setProfile({ ...profile, professionalSummary: e.target.value })}
                placeholder="Write your professional executive summary..."
                className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-brand-500 leading-relaxed font-sans"
              />
            </div>
          )}

          {/* Work Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-base font-bold text-studio-900">Work Experience</h2>
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      workExperience: [
                        {
                          id: Math.random().toString(36).substring(2, 9),
                          employer: 'New Employer',
                          jobTitle: 'Software Engineer',
                          employmentType: 'Full-time',
                          startDate: '2022',
                          endDate: 'Present',
                          isCurrent: true,
                          responsibilities: ['Architected key features and led sprint planning.'],
                          technologies: [],
                          includeInResume: true,
                        },
                        ...profile.workExperience,
                      ],
                    })
                  }
                  className="px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              {profile.workExperience.map((exp: any, index: number) => (
                <div key={exp.id || index} className="p-4 rounded-lg border border-studio-200 bg-studio-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-studio-900">Role #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          workExperience: profile.workExperience.filter((_: any, i: number) => i !== index),
                        })
                      }
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Job Title</label>
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) => {
                          const updated = [...profile.workExperience];
                          updated[index].jobTitle = e.target.value;
                          setProfile({ ...profile, workExperience: updated });
                        }}
                        className="w-full border rounded px-3 py-1.5 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Employer</label>
                      <input
                        type="text"
                        value={exp.employer}
                        onChange={(e) => {
                          const updated = [...profile.workExperience];
                          updated[index].employer = e.target.value;
                          setProfile({ ...profile, workExperience: updated });
                        }}
                        className="w-full border rounded px-3 py-1.5 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Start Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Jan 2021"
                        value={exp.startDate}
                        onChange={(e) => {
                          const updated = [...profile.workExperience];
                          updated[index].startDate = e.target.value;
                          setProfile({ ...profile, workExperience: updated });
                        }}
                        className="w-full border rounded px-3 py-1.5 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">End Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Present"
                        value={exp.endDate}
                        onChange={(e) => {
                          const updated = [...profile.workExperience];
                          updated[index].endDate = e.target.value;
                          setProfile({ ...profile, workExperience: updated });
                        }}
                        className="w-full border rounded px-3 py-1.5 bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-xs mb-1">
                      Responsibilities (one bullet per line)
                    </label>
                    <textarea
                      rows={3}
                      value={exp.responsibilities?.join('\n') || ''}
                      onChange={(e) => {
                        const updated = [...profile.workExperience];
                        updated[index].responsibilities = e.target.value.split('\n');
                        setProfile({ ...profile, workExperience: updated });
                      }}
                      className="w-full border rounded p-2 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-base font-bold text-studio-900">Education History</h2>
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      education: [
                        {
                          id: Math.random().toString(36).substring(2, 9),
                          qualification: 'Bachelor of Technology',
                          specialization: 'Computer Science',
                          institution: 'University of Technology',
                          startDate: '2018',
                          endDate: '2022',
                          gradePercentageCgpa: '8.5 CGPA',
                          includeInResume: true,
                        },
                        ...profile.education,
                      ],
                    })
                  }
                  className="px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Degree</span>
                </button>
              </div>

              {profile.education.map((edu: any, index: number) => (
                <div key={edu.id || index} className="p-4 rounded-lg border border-studio-200 bg-studio-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-studio-900">Degree #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          education: profile.education.filter((_: any, i: number) => i !== index),
                        })
                      }
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Qualification / Degree</label>
                      <input
                        type="text"
                        value={edu.qualification}
                        onChange={(e) => {
                          const updated = [...profile.education];
                          updated[index].qualification = e.target.value;
                          setProfile({ ...profile, education: updated });
                        }}
                        className="w-full border rounded px-3 py-1.5 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Specialization / Major</label>
                      <input
                        type="text"
                        value={edu.specialization || ''}
                        onChange={(e) => {
                          const updated = [...profile.education];
                          updated[index].specialization = e.target.value;
                          setProfile({ ...profile, education: updated });
                        }}
                        className="w-full border rounded px-3 py-1.5 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...profile.education];
                          updated[index].institution = e.target.value;
                          setProfile({ ...profile, education: updated });
                        }}
                        className="w-full border rounded px-3 py-1.5 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Graduation Year / Dates</label>
                      <input
                        type="text"
                        value={edu.endDate || ''}
                        onChange={(e) => {
                          const updated = [...profile.education];
                          updated[index].endDate = e.target.value;
                          setProfile({ ...profile, education: updated });
                        }}
                        className="w-full border rounded px-3 py-1.5 bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills (5-Part) */}
          {activeTab === 'skills' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-studio-900 border-b pb-2">Categorized Skills (5 Categories)</h2>

              <div>
                <label className="block font-semibold text-xs mb-1 text-studio-800">
                  1. Technical Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={profile.skills?.technicalSkills?.join(', ') || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      skills: {
                        ...profile.skills,
                        technicalSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g. TypeScript, React, Node.js, Next.js, GraphQL, PostgreSQL"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-xs mb-1 text-studio-800">
                  2. Core Competencies & Job Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={profile.skills?.jobSkills?.join(', ') || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      skills: {
                        ...profile.skills,
                        jobSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g. Agile Project Management, Systems Architecture, Code Review, Mentorship"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-xs mb-1 text-studio-800">
                  3. Computer Skills & Tools (comma separated)
                </label>
                <input
                  type="text"
                  value={profile.skills?.computerSkills?.join(', ') || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      skills: {
                        ...profile.skills,
                        computerSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g. Git, Docker, Kubernetes, AWS, VS Code, Figma, JIRA"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* Declaration */}
          {activeTab === 'declaration' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-studio-900 border-b pb-2">Formal Declaration</h2>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dec-enabled"
                  checked={profile.declaration?.enabled || false}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      declaration: { ...profile.declaration, enabled: e.target.checked },
                    })
                  }
                  className="rounded text-brand-600"
                />
                <label htmlFor="dec-enabled" className="text-sm font-semibold text-studio-800">
                  Include formal declaration at the end of the resume
                </label>
              </div>
              <textarea
                rows={3}
                value={profile.declaration?.text || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    declaration: { ...profile.declaration, text: e.target.value },
                  })
                }
                className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-brand-500 font-sans"
              />
            </div>
          )}
        </div>
      </div>

      {/* Truthful Career Gap Modal */}
      {gapModalOpen && gapResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-studio-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-studio-200">
            <h3 className="text-lg font-bold text-studio-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Career Gap Assistant</span>
            </h3>
            <p className="text-xs text-studio-600 mb-4">
              Ethical employment gap evaluator. We identify intervals and provide truthful presentation strategies without fabricating employers or dates.
            </p>

            {gapResults.detectedGaps.length === 0 ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>No significant gaps (&gt; 6 months) detected between your employment records.</span>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-studio-800">Detected Intervals:</span>
                {gapResults.detectedGaps.map((gap, i) => (
                  <div key={i} className="text-xs p-2 rounded bg-amber-50 border border-amber-200 flex justify-between">
                    <span>{gap.startDate} – {gap.endDate}</span>
                    <span className="font-semibold text-amber-900">~{gap.durationMonths} months</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1 text-xs text-studio-600 mb-6">
              <span className="font-bold text-studio-800">Guidance:</span>
              <ul className="list-disc list-inside space-y-1">
                {gapResults.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setGapModalOpen(false)}
                className="px-4 py-2 bg-studio-200 hover:bg-studio-300 rounded-lg text-xs font-semibold text-studio-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
