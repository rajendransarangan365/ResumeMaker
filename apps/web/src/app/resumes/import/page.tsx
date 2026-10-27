'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ResumeImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<'upload' | 'extracting' | 'review' | 'applied'>('upload');
  const [parsedData, setParsedData] = useState<any>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartParsing = async () => {
    if (!file) return;
    setErrorMessage('');
    setStage('extracting');

    // 1. Upload Document
    const uploadRes = await api.uploadDocument(file);
    if (!uploadRes.success || !uploadRes.data?.documentId) {
      setErrorMessage(uploadRes.error?.message || 'Failed to upload document.');
      setStage('upload');
      return;
    }

    const docId = uploadRes.data.documentId;
    setDocumentId(docId);

    // 2. Parse Document with AI
    const parseRes = await api.parseDocument(docId);
    if (parseRes.success && parseRes.data?.parsedData) {
      setParsedData(parseRes.data.parsedData);
      setStage('review');
    } else {
      setErrorMessage(parseRes.error?.message || 'Failed to parse resume content.');
      setStage('upload');
    }
  };

  const handleApplyToProfile = async () => {
    if (!documentId) return;
    const res = await api.applyDocumentToProfile(documentId, parsedData);
    if (res.success) {
      setStage('applied');
      setTimeout(() => router.push('/profile'), 1500);
    } else {
      setErrorMessage(res.error?.message || 'Failed to apply parsed data to profile.');
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex items-center gap-2 mb-4 text-xs font-medium text-studio-500">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-studio-200 text-studio-700 hover:text-brand-600 hover:border-brand-300 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-studio-300">/</span>
        <span className="text-studio-700 font-semibold">Import Resume</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-studio-900 tracking-tight flex items-center gap-2">
          <Upload className="w-6 h-6 text-brand-600" />
          <span>Resume Ingestion & Parsing Studio</span>
        </h1>
        <p className="text-xs sm:text-sm text-studio-500 mt-1">
          Upload an existing resume to extract work history, education, and skills into your master candidate profile.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stage 1: Upload Dropzone */}
      {stage === 'upload' && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`resume-upload__dropzone ${isDragging ? 'resume-upload--dragging' : ''}`}
            onClick={() => document.getElementById('resume-file-input')?.click()}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-studio-800">
              {file ? file.name : 'Click to select or drag and drop your resume'}
            </h3>
            <p className="text-xs text-studio-500 mt-1">
              Supports PDF, DOCX, TXT, RTF, ODT, and Image files (max 10MB)
            </p>
            {file && (
              <span className="mt-3 px-3 py-1 bg-brand-100 text-brand-800 text-xs font-semibold rounded-full">
                Ready for Extraction ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleStartParsing}
              disabled={!file}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Begin Multi-Stage Extraction</span>
            </button>
          </div>
        </div>
      )}

      {/* Stage 2: In-Progress Pipeline */}
      {stage === 'extracting' && (
        <div className="p-12 text-center bg-white rounded-2xl border border-studio-200 shadow-sm space-y-4">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
          <h3 className="font-bold text-base text-studio-900">Running Built-in AI Resume Intelligence Agent...</h3>
          <p className="text-xs text-studio-500 max-w-md mx-auto">
            Parsing text buffers locally with the built-in Resume Intelligence Agent, accurately classifying candidate credentials, spoken languages, and work experience.
          </p>
        </div>
      )}

      {/* Stage 3: Review Interface */}
      {stage === 'review' && parsedData && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Extraction complete! Review the extracted data before applying it to your master profile.</span>
            </div>
            <button
              onClick={handleApplyToProfile}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <span>Confirm & Save to Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Extracted Personal Details */}
          <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-studio-900 border-b pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-studio-600 block mb-0.5">Name</label>
                <input
                  type="text"
                  value={parsedData.personalDetails?.fullName || ''}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      personalDetails: { ...parsedData.personalDetails, fullName: e.target.value },
                    })
                  }
                  className="w-full border rounded px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="font-semibold text-studio-600 block mb-0.5">Headline</label>
                <input
                  type="text"
                  value={parsedData.personalDetails?.headline || ''}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      personalDetails: { ...parsedData.personalDetails, headline: e.target.value },
                    })
                  }
                  className="w-full border rounded px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="font-semibold text-studio-600 block mb-0.5">Email</label>
                <input
                  type="email"
                  value={parsedData.personalDetails?.email || ''}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      personalDetails: { ...parsedData.personalDetails, email: e.target.value },
                    })
                  }
                  className="w-full border rounded px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="font-semibold text-studio-600 block mb-0.5">Phone</label>
                <input
                  type="text"
                  value={parsedData.personalDetails?.phone || ''}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      personalDetails: { ...parsedData.personalDetails, phone: e.target.value },
                    })
                  }
                  className="w-full border rounded px-2.5 py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Extracted Summary */}
          {parsedData.professionalSummary && (
            <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm space-y-2">
              <h3 className="font-bold text-sm text-studio-900 border-b pb-2">Professional Summary</h3>
              <textarea
                rows={3}
                value={parsedData.professionalSummary}
                onChange={(e) => setParsedData({ ...parsedData, professionalSummary: e.target.value })}
                className="w-full border rounded p-2 text-xs leading-relaxed"
              />
            </div>
          )}

          {/* Extracted Work Experience */}
          {parsedData.workExperience && parsedData.workExperience.length > 0 && (
            <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-sm text-studio-900 flex items-center gap-2">
                  <span>Extracted Work Experience ({parsedData.workExperience.length})</span>
                </h3>
              </div>
              <div className="space-y-3">
                {parsedData.workExperience.map((exp: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-studio-100 bg-studio-50/50 space-y-2">
                    <div className="flex justify-between items-baseline flex-wrap">
                      <span className="font-bold text-xs text-studio-900">
                        {exp.jobTitle} <span className="font-normal text-studio-600">at {exp.employer}</span>
                      </span>
                      <span className="text-[11px] text-studio-500 font-mono">
                        {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-studio-700 space-y-1">
                        {exp.responsibilities.map((r: string, rIdx: number) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Education */}
          {parsedData.education && parsedData.education.length > 0 && (
            <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-studio-900 border-b pb-2">
                Extracted Education ({parsedData.education.length})
              </h3>
              <div className="space-y-2">
                {parsedData.education.map((edu: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-studio-100 bg-studio-50/50 flex justify-between items-start text-xs">
                    <div>
                      <div className="font-bold text-studio-900">
                        {edu.qualification} {edu.specialization ? `in ${edu.specialization}` : ''}
                      </div>
                      <div className="text-studio-600">{edu.institution}</div>
                      {edu.gradePercentageCgpa && (
                        <div className="text-studio-500 text-[11px]">{edu.gradePercentageCgpa}</div>
                      )}
                    </div>
                    <div className="text-studio-500 font-mono text-[11px]">{edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Skills & Spoken Languages */}
          {parsedData.skills && (
            <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-studio-900 border-b pb-2">Extracted Skills & Languages</h3>
              <div className="space-y-2 text-xs">
                {parsedData.skills.technicalSkills?.length > 0 && (
                  <div>
                    <strong className="text-studio-800">Technical Skills:</strong>{' '}
                    <span className="text-studio-600">{parsedData.skills.technicalSkills.join(', ')}</span>
                  </div>
                )}
                {parsedData.skills.jobSkills?.length > 0 && (
                  <div>
                    <strong className="text-studio-800">Core Competencies:</strong>{' '}
                    <span className="text-studio-600">{parsedData.skills.jobSkills.join(', ')}</span>
                  </div>
                )}
                {parsedData.skills.computerSkills?.length > 0 && (
                  <div>
                    <strong className="text-studio-800">Tools & Platforms:</strong>{' '}
                    <span className="text-studio-600">{parsedData.skills.computerSkills.join(', ')}</span>
                  </div>
                )}
                {parsedData.skills.languages?.length > 0 && (
                  <div className="pt-2 border-t border-studio-100 flex items-center gap-2 flex-wrap">
                    <strong className="text-studio-800">Spoken Languages:</strong>
                    {parsedData.skills.languages.map((lang: any, lIdx: number) => (
                      <span
                        key={lIdx}
                        className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md font-semibold text-[11px]"
                      >
                        {typeof lang === 'string' ? lang : `${lang.name}${lang.proficiency ? ` (${lang.proficiency})` : ''}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Extracted Certifications */}
          {parsedData.certifications && parsedData.certifications.length > 0 && (
            <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-studio-900 border-b pb-2">
                Extracted Certifications ({parsedData.certifications.length})
              </h3>
              <div className="space-y-2">
                {parsedData.certifications.map((cert: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-studio-100 bg-studio-50/50 flex justify-between items-start text-xs">
                    <div>
                      <div className="font-bold text-studio-900">{cert.title || cert.name}</div>
                      <div className="text-studio-600">{cert.issuer || 'Verified Credential'}</div>
                    </div>
                    {cert.issueDate && <div className="text-studio-500 font-mono text-[11px]">{cert.issueDate}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Projects */}
          {parsedData.projects && parsedData.projects.length > 0 && (
            <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-studio-900 border-b pb-2">
                Extracted Projects ({parsedData.projects.length})
              </h3>
              <div className="space-y-2">
                {parsedData.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-studio-100 bg-studio-50/50 text-xs space-y-1">
                    <div className="font-bold text-studio-900">{proj.name}</div>
                    {proj.technologies?.length > 0 && (
                      <div className="text-studio-500 text-[11px]">[{proj.technologies.join(', ')}]</div>
                    )}
                    <div className="text-studio-700">{proj.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uncategorized Information Buffer */}
          {parsedData.uncategorizedInformation && parsedData.uncategorizedInformation.length > 0 && (
            <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5 space-y-2">
              <h3 className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Uncategorized Information (Preserved)</span>
              </h3>
              <p className="text-xs text-amber-800">
                Text from your document that did not map directly into standard fields is safely preserved below:
              </p>
              <ul className="list-disc list-inside text-xs text-studio-700 space-y-1 font-mono">
                {parsedData.uncategorizedInformation.map((snippet: string, idx: number) => (
                  <li key={idx}>{snippet}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Stage 4: Successfully Applied */}
      {stage === 'applied' && (
        <div className="p-12 text-center bg-white rounded-2xl border border-studio-200 shadow-sm space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-studio-900">Profile Updated Successfully!</h2>
          <p className="text-xs text-studio-500">Redirecting to candidate profile manager...</p>
        </div>
      )}
    </div>
  );
}
