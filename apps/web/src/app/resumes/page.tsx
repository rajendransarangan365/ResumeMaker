'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Clock,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ResumesListPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setLoading(true);
    const res = await api.getResumes();
    if (res.success && res.data) {
      setResumes(resumes.concat(res.data.resumes || []));
    }
    setLoading(false);
  };

  const handleDuplicate = async (resumeId: string) => {
    const res = await api.duplicateResume(resumeId);
    if (res.success) {
      loadResumes();
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

  const filtered = resumes.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.targetRole && r.targetRole.toLowerCase().includes(search.toLowerCase())) ||
      r.templateId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-studio-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            <span>Resume Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-studio-500 mt-1">
            All your tailored resume versions, branched from your master candidate profile
          </p>
        </div>

        <Link
          href="/resumes/new"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Resume Version</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <Search className="w-4 h-4 text-studio-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by title, target role, or template..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-studio-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-studio-500 bg-white rounded-xl border border-studio-200">
          Loading resume library...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-studio-300">
          <FileText className="w-12 h-12 text-studio-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-studio-800">No resumes found</h3>
          <p className="text-xs text-studio-500 mt-1 mb-4">
            {search ? 'No resumes match your filter criteria.' : 'Create your first resume version to start editing.'}
          </p>
          <Link
            href="/resumes/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Resume</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div
              key={r._id}
              className="rounded-xl border border-studio-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3
                    onClick={() => router.push(`/resumes/${r._id}`)}
                    className="font-bold text-sm text-studio-900 hover:text-brand-600 cursor-pointer"
                  >
                    {r.title}
                  </h3>
                  <span className="text-[10px] bg-studio-100 text-studio-700 px-2 py-0.5 rounded font-mono">
                    {r.templateId}
                  </span>
                </div>
                <p className="text-xs text-studio-600 mb-3">{r.targetRole || 'General Purpose'}</p>
                <div className="flex items-center gap-1 text-[11px] text-studio-400 mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {new Date(r.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-studio-100 flex items-center justify-between">
                <button
                  onClick={() => router.push(`/resumes/${r._id}`)}
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded text-xs transition-colors flex items-center gap-1"
                >
                  <span>Open Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => api.downloadDocx(r._id, r.title)}
                    className="p-1.5 hover:bg-studio-100 text-studio-600 rounded"
                    title="Export DOCX"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(r._id)}
                    className="p-1.5 hover:bg-studio-100 text-studio-600 rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id, r.title)}
                    className="p-1.5 hover:bg-red-50 text-studio-400 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
