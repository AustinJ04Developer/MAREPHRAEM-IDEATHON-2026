import React, { useEffect, useState, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  RefreshCw,
  Compass,
  Users,
  Calendar,
  FileText,
} from 'lucide-react';
import { api } from '../api/client';
import { Registration, ProblemArea, ReportSettings } from '../types';
import { useToast } from '../context/ToastContext';
import {
  INSTITUTIONAL_DEPARTMENTS,
  INSTITUTIONAL_SECTIONS,
  DepartmentOption,
  findCanonicalDepartment,
} from '../constants/academic';

export const AdminReportsPage: React.FC = () => {
  const { error: toastError } = useToast();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [problemAreas, setProblemAreas] = useState<ProblemArea[]>([]);
  const [reportSettings, setReportSettings] = useState<ReportSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Filters
  const [problemArea, setProblemArea] = useState<string>('all');
  const [department, setDepartment] = useState<string>('all');
  const [section, setSection] = useState<string>('all');
  const [fieldVisitStatus, setFieldVisitStatus] = useState<string>('all');

  // Load problem areas and report settings
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [areasRes, settingsRes] = await Promise.all([
          api.get('/problem-areas'),
          api.get('/admin/settings/report'),
        ]);

        if (areasRes.data?.success && areasRes.data?.data) {
          setProblemAreas(areasRes.data.data);
        }
        if (settingsRes.data?.success && settingsRes.data?.data) {
          setReportSettings(settingsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load report metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        problemArea: problemArea !== 'all' ? problemArea : undefined,
        department: department !== 'all' ? department : undefined,
        section: section !== 'all' ? section : undefined,
        fieldVisitStatus: fieldVisitStatus !== 'all' ? fieldVisitStatus : undefined,
      };

      const res = await api.get('/admin/reports/consolidated', { params });
      if (res.data?.success && res.data?.data) {
        setRegistrations(res.data.data.registrations);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch consolidated report.');
    } finally {
      setIsLoading(false);
    }
  }, [problemArea, department, section, fieldVisitStatus, toastError]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Export CSV
  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      const params = new URLSearchParams();
      if (problemArea !== 'all') params.append('problemArea', problemArea);
      if (department !== 'all') params.append('department', department);
      if (section !== 'all') params.append('section', section);
      if (fieldVisitStatus !== 'all') params.append('fieldVisitStatus', fieldVisitStatus);

      const res = await api.get(`/admin/reports/registrations.csv?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marephraem-ideathon-2026-report-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toastError('Failed to generate CSV export.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const params = new URLSearchParams();
      if (problemArea !== 'all') params.append('problemArea', problemArea);
      if (department !== 'all') params.append('department', department);
      if (section !== 'all') params.append('section', section);
      if (fieldVisitStatus !== 'all') params.append('fieldVisitStatus', fieldVisitStatus);

      const res = await api.get(`/admin/reports/registrations.pdf?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marephraem-ideathon-2026-consolidated-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toastError('Failed to generate PDF report.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const totalMembers = registrations.reduce(
    (acc, reg) => acc + (reg.members ? reg.members.length : 0),
    0
  );
  const uniqueTeams = new Set(registrations.map((r) => r.teamName)).size;

  return (
    <div className="space-y-6 font-times text-slate-800">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h2 className="font-times text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Consolidated Registration Reports
          </h2>
          <p className="font-times text-xs text-slate-600 font-medium">
            Generate and export institutional registration registers, PDF summaries, and spreadsheet archives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={isExportingCsv || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-xs disabled:opacity-50 transition-colors"
          >
            {isExportingCsv ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            )}
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {isExportingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Generate Official PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 no-print">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-brand-600" />
            <span>Report Filters</span>
          </div>
          <button
            onClick={() => {
              setProblemArea('all');
              setDepartment('all');
              setSection('all');
              setFieldVisitStatus('all');
            }}
            className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Problem Area</label>
            <select
              value={problemArea}
              onChange={(e) => setProblemArea(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Official Categories</option>
              {problemAreas.map((area) => (
                <option key={area._id} value={area.name}>
                  {area.name} ({area.abbreviation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Field Visit Status</label>
            <select
              value={fieldVisitStatus}
              onChange={(e) => setFieldVisitStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Yes">Yes (Field Visit Done)</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Departments</option>
              {INSTITUTIONAL_DEPARTMENTS.map((dept) => (
                <option key={dept.code} value={dept.name}>
                  {dept.name} ({dept.abbreviation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Sections</option>
              {INSTITUTIONAL_SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-4 no-print">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Filtered Records</div>
          <div className="text-2xl font-black text-slate-900">{registrations.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Teams</div>
          <div className="text-2xl font-black text-brand-600">{uniqueTeams}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Students</div>
          <div className="text-2xl font-black text-emerald-600">{totalMembers}</div>
        </div>
      </div>

      {/* Institutional Report Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6 print-container">
        {/* Institutional Header Block (Reflecting Configured Settings!) */}
        <div className="text-center space-y-2 pb-6 border-b border-slate-200">
          {reportSettings?.headerImageKey && (
            <div className="mb-4 flex justify-center">
              <img
                src={`/api/v1/uploads/header-image/${reportSettings.headerImageKey}`}
                alt="Report Header"
                style={{
                  maxHeight: `${reportSettings.maximumImageHeight || 100}px`,
                  maxWidth: `${reportSettings.maximumImageWidth || 600}px`,
                  objectFit: reportSettings.imageFit || 'contain',
                }}
                className="mx-auto"
              />
            </div>
          )}

          <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">
            {reportSettings?.collegeName || 'MAR EPHRAEM COLLEGE OF ENGINEERING AND TECHNOLOGY'}
          </h1>
          {reportSettings?.departmentName && (
            <p className="text-xs font-semibold text-brand-700">
              {reportSettings.departmentName}
            </p>
          )}
          <p className="text-sm font-bold text-slate-800">
            {reportSettings?.eventName || 'MAREPHRAEM IDEATHON 2026'}
          </p>

          {reportSettings?.showReportTitle && (
            <div className="pt-2">
              <h2 className="text-sm font-extrabold text-slate-900">
                {reportSettings.reportTitle || 'Consolidated Project Registration Register'}
              </h2>
              {reportSettings.reportSubtitle && (
                <p className="text-xs text-slate-500 italic">
                  {reportSettings.reportSubtitle}
                </p>
              )}
            </div>
          )}

          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
            <span>
              Generated on:{' '}
              {new Date().toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
            <span>Total Enrolled Teams: {registrations.length}</span>
          </div>

          {(department !== 'all' ||
            section !== 'all' ||
            problemArea !== 'all' ||
            fieldVisitStatus !== 'all') && (
            <div className="pt-2 text-[10px] text-slate-700 font-medium flex flex-wrap gap-x-3 gap-y-1 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
              <span className="font-bold text-slate-900">Active Filters:</span>
              {department !== 'all' && (
                <span>
                  Department: <strong>{department}</strong>
                </span>
              )}
              {section !== 'all' && (
                <span>
                  Section: <strong>{section}</strong>
                </span>
              )}
              {problemArea !== 'all' && (
                <span>
                  Problem Area: <strong>{problemArea}</strong>
                </span>
              )}
              {fieldVisitStatus !== 'all' && (
                <span>
                  Field Visit: <strong>{fieldVisitStatus}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Compiling report dataset...
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No registration records match the selected report filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-2.5 border-r border-slate-800">S.No</th>
                  <th className="p-2.5 border-r border-slate-800">Project ID</th>
                  <th className="p-2.5 border-r border-slate-800">Team Name</th>
                  <th className="p-2.5 border-r border-slate-800">Team Leader</th>
                  <th className="p-2.5 border-r border-slate-800">Team Members</th>
                  <th className="p-2.5 border-r border-slate-800">Dept/Sec</th>
                  <th className="p-2.5 border-r border-slate-800">Project Title</th>
                  <th className="p-2.5 border-r border-slate-800">Problem Area</th>
                  <th className="p-2.5 border-r border-slate-800">Supervisor</th>
                  <th className="p-2.5">Field Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {registrations.map((reg, index) => (
                  <tr key={reg._id} className="hover:bg-slate-50">
                    <td className="p-2.5 border-r border-slate-200 font-mono text-center">
                      {index + 1}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-brand-700">
                      {reg.projectId}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">
                      {reg.teamName}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div>{reg.teamLeaderName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {reg.teamLeaderRegisterNumber}
                      </div>
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-[11px] text-slate-700">
                      {(reg.members || []).map((m, i) => (
                        <div key={i}>
                          • {m.memberName} ({m.registerNumber})
                        </div>
                      ))}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="font-semibold text-slate-800">{reg.department}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {reg.section ? `Section ${reg.section.toUpperCase()}` : 'General'}
                      </div>
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-medium text-slate-900">
                      {reg.projectTitle}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <span className="font-semibold text-slate-800">
                        {reg.categoryNameSnapshot}
                      </span>
                      {reg.otherProblemArea && (
                        <div className="text-[10px] text-brand-700 italic">
                          Custom: "{reg.otherProblemArea}"
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-[11px]">
                      <div>{reg.supervisorName}</div>
                      <div className="text-[10px] text-slate-500">
                        {reg.supervisorDesignation}, {reg.supervisorBranch}
                      </div>
                    </td>
                    <td className="p-2.5 font-bold text-center">
                      <span
                        className={
                          reg.fieldVisitStatus === 'Yes' ? 'text-emerald-700' : 'text-slate-500'
                        }
                      >
                        {reg.fieldVisitStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Text */}
        {reportSettings?.showFooter && (
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
            {reportSettings.footerText ||
              'MAREPHRAEM IDEATHON 2026 • Official Registration Management System'}
          </div>
        )}
      </div>
    </div>
  );
};
