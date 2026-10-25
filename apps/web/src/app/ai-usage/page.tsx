'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart2,
  DollarSign,
  Activity,
  Zap,
  Clock,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { api, getAuthToken } from '@/lib/api';

export default function AiUsagePage() {
  const [summary, setSummary] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    setLoading(true);
    const res = await api.getAiUsageSummary();
    if (res.success && res.data) {
      setSummary(res.data.summary);
      setRecentLogs(res.data.recentLogs || []);
    }
    setLoading(false);
  };

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
        <span className="text-studio-700 font-semibold hidden sm:inline">Gemini AI Usage</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-studio-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-purple-600" />
            <span>Gemini AI Governance & Usage Monitoring</span>
          </h1>
          <p className="text-xs sm:text-sm text-studio-500 mt-1">
            Real-time token consumption, estimated operational expenditure, and request performance metrics.
          </p>
        </div>

        <button
          onClick={loadUsageData}
          disabled={loading}
          className="px-3.5 py-2 bg-white border border-studio-200 hover:bg-studio-50 text-studio-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-studio-500 bg-white rounded-xl border border-studio-200">
          Gathering real-time AI telemetry...
        </div>
      ) : summary ? (
        <div className="space-y-8">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-studio-500 mb-2">
                <span>Requests This Month</span>
                <Activity className="w-4 h-4 text-brand-600" />
              </div>
              <div className="text-2xl font-bold text-studio-900 font-mono">
                {summary.requestsThisMonth}
              </div>
              <p className="text-[11px] text-studio-400 mt-1">
                {summary.requestsToday} requests logged today
              </p>
            </div>

            <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-studio-500 mb-2">
                <span>Total Tokens</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-studio-900 font-mono">
                {summary.totalTokensConsumed.toLocaleString()}
              </div>
              <p className="text-[11px] text-studio-400 mt-1">Prompt & Candidate tokens</p>
            </div>

            <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-studio-500 mb-2">
                <span>Estimated Expenditure</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 font-mono">
                ${summary.totalEstimatedCostUsd.toFixed(4)}
              </div>
              <p className="text-[11px] text-studio-400 mt-1">
                Budget limit: ${summary.monthlyBudgetLimit} ({summary.budgetUtilizationPercentage}% utilized)
              </p>
            </div>

            <div className="bg-white rounded-xl border border-studio-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-studio-500 mb-2">
                <span>Average Latency</span>
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-studio-900 font-mono">
                {summary.averageLatencyMs} ms
              </div>
              <p className="text-[11px] text-studio-400 mt-1">
                Active model: <span className="font-mono">{summary.modelInUse}</span>
              </p>
            </div>
          </div>

          {/* Real AI Audit Log Table */}
          <div className="bg-white rounded-xl border border-studio-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-studio-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-studio-900">Recent AI Operation Logs</h2>
              <span className="text-xs text-studio-500">{recentLogs.length} events logged</span>
            </div>

            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-studio-400">
                No AI requests have been executed yet in this session.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-studio-50 border-b border-studio-200 text-studio-600 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Feature</th>
                      <th className="px-6 py-3">Model</th>
                      <th className="px-6 py-3">Tokens</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Cost (USD)</th>
                      <th className="px-6 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-studio-100">
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-studio-50/60">
                        <td className="px-6 py-3 font-semibold text-studio-900 capitalize">
                          {log.feature.replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-3 font-mono text-studio-600">{log.model}</td>
                        <td className="px-6 py-3 font-mono text-studio-800">{log.tokens.toLocaleString()}</td>
                        <td className="px-6 py-3 font-mono text-studio-600">{log.durationMs} ms</td>
                        <td className="px-6 py-3">
                          {log.success ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Success</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                              <ShieldAlert className="w-3 h-3 text-red-600" />
                              <span>Failed</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 font-mono text-studio-700">
                          ${(log.costUsd || 0).toFixed(6)}
                        </td>
                        <td className="px-6 py-3 text-studio-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
