import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Compass,
  FileSpreadsheet,
  Settings,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../api/client';
import { DashboardSummary, CategoryStat } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard/summary');
        if (res.data?.success && res.data?.data) {
          setSummary(res.data.data.summary);
          setCategoryStats(res.data.data.categoryStats);
          setRecentRegistrations(res.data.data.recentRegistrations);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-2xl" />
          <div className="h-72 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Color palette for charts
  const PIE_COLORS = ['#10b981', '#64748b'];

  const fieldVisitPieData = [
    { name: 'Field Visit Conducted (Yes)', value: summary?.fieldVisitYesCount || 0 },
    { name: 'No Field Visit (No)', value: summary?.fieldVisitNoCount || 0 },
  ];

  const barChartData = categoryStats.map((c) => ({
    name: c.abbreviation,
    fullName: c.name,
    count: c.count,
  }));

  return (
    <div className="space-y-8 font-times text-slate-800">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-times text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p className="font-times text-xs text-slate-600 font-medium">
            Real-time analytics across teams, official verticals, and verification metrics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-600" />
            <span>Generate Reports</span>
          </Link>
          <Link
            to="/admin/registrations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Manage Registrations</span>
          </Link>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Registrations */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Registrations</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary?.totalRegistrations || 0}</div>
          <p className="text-[11px] text-slate-500 font-medium">Assigned unique Project IDs</p>
        </div>

        {/* Unique Teams */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Teams</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary?.totalTeams || 0}</div>
          <p className="text-[11px] text-slate-500 font-medium">Distinct team submissions</p>
        </div>

        {/* Total Members */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary?.totalMembers || 0}</div>
          <p className="text-[11px] text-slate-500 font-medium">Enrolled member participants</p>
        </div>

        {/* Field Visit Status Ratio */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Field Visit Done</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {summary?.fieldVisitYesCount || 0}
            <span className="text-sm font-semibold text-slate-400 ml-2">
              / {summary?.totalRegistrations || 0}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {summary?.totalRegistrations
              ? `${Math.round(((summary.fieldVisitYesCount || 0) / summary.totalRegistrations) * 100)}% conducted`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registrations by Problem Area</h3>
              <p className="text-xs text-slate-500">Distribution across 10 official verticals and Other Area</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              11 Categories
            </span>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any, name: any, props: any) => [
                    `${val} teams`,
                    props.payload.fullName,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Field Visit Status Donut */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Field Visit Verification</h3>
            <p className="text-xs text-slate-500">On-site industrial/rural visits conducted</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {summary?.totalRegistrations === 0 ? (
              <p className="text-xs text-slate-400 italic">No registrations recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fieldVisitPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {fieldVisitPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Yes: {summary?.fieldVisitYesCount || 0}</span>
            <span>No: {summary?.fieldVisitNoCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Registrations</h3>
            <p className="text-xs text-slate-500">Latest submissions recorded by the engine</p>
          </div>
          <Link
            to="/admin/registrations"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 italic">
            No registration records found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Project ID</th>
                  <th className="py-2.5 px-3">Team Name</th>
                  <th className="py-2.5 px-3">Team Members Roster</th>
                  <th className="py-2.5 px-3">Project Title</th>
                  <th className="py-2.5 px-3">Problem Area</th>
                  <th className="py-2.5 px-3">Field Visit</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">{reg.projectId}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{reg.teamName}</td>
                    <td className="py-3 px-3 text-slate-700">
                      <div>
                        <span className="font-bold text-slate-900">{reg.members?.length || 1} Members</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Leader: {reg.teamLeaderName} ({reg.teamLeaderRegisterNumber})
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs truncate">{reg.projectTitle}</td>
                    <td className="py-3 px-3 text-slate-600">{reg.categoryNameSnapshot}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          reg.fieldVisitStatus === 'Yes'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {reg.fieldVisitStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(reg.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
