import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Crown,
  Users,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react';
import { api } from '../api/client';
import { Registration, ProblemArea } from '../types';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const AdminRegistrationsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [problemAreas, setProblemAreas] = useState<ProblemArea[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedFieldVisit, setSelectedFieldVisit] = useState<string>('all');

  // Expanded inline roster state
  const [expandedRosterId, setExpandedRosterId] = useState<string | null>(null);

  // Modals state
  const [viewingReg, setViewingReg] = useState<Registration | null>(null);
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch problem areas once
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await api.get('/problem-areas');
        if (res.data?.success && res.data?.data) {
          setProblemAreas(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load problem areas:', err);
      }
    };
    fetchAreas();
  }, []);

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
        search: search.trim() || undefined,
        problemArea: selectedArea !== 'all' ? selectedArea : undefined,
        department: selectedDept !== 'all' ? selectedDept : undefined,
        section: selectedSection !== 'all' ? selectedSection : undefined,
        fieldVisitStatus: selectedFieldVisit !== 'all' ? selectedFieldVisit : undefined,
      };

      const res = await api.get('/admin/registrations', { params });
      if (res.data?.success && res.data?.data) {
        setRegistrations(res.data.data.registrations);
        setTotalCount(res.data.data.pagination.total);
        setTotalPages(res.data.data.pagination.totalPages || 1);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch registrations.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, selectedArea, selectedDept, selectedSection, selectedFieldVisit, toastError]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRegistrations();
  };

  const handleDownloadPdf = async (reg: Registration) => {
    try {
      const res = await api.get(`/admin/registrations/${reg._id}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reg.projectId}-registration-slip.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toastError('Failed to generate registration PDF.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;

    setIsSavingEdit(true);
    try {
      const payload = {
        teamName: editingReg.teamName,
        projectTitle: editingReg.projectTitle,
        department: editingReg.department,
        section: editingReg.section,
        otherProblemArea: editingReg.otherProblemArea,
        fieldVisitStatus: editingReg.fieldVisitStatus,
        supervisorName: editingReg.supervisorName,
        supervisorDesignation: editingReg.supervisorDesignation,
        supervisorBranch: editingReg.supervisorBranch,
      };

      const res = await api.patch(`/admin/registrations/${editingReg._id}`, payload);
      if (res.data?.success) {
        success(`Registration ${editingReg.projectId} updated successfully.`);
        setEditingReg(null);
        fetchRegistrations();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update registration record.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/registrations/${deletingId}`);
      if (res.data?.success) {
        success('Registration record has been archived.');
        setDeletingId(null);
        fetchRegistrations();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to archive registration.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-times text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-times text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Registration Management
          </h2>
          <p className="font-times text-xs text-slate-600 font-medium">
            Official record repository, complete team rosters, verified Project IDs, and administrative controls.
          </p>
        </div>
        <div className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 shadow-2xs">
          Total Enrolled Teams: <strong>{totalCount}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Project ID, Team Name, Member Name, Reg No, or Email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-times"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-700 text-white shadow-xs hover:bg-blue-800 transition-colors cursor-pointer"
          >
            Search Records
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Problem Area Track</label>
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Categories</option>
              {problemAreas.map((area) => (
                <option key={area._id} value={area.name}>
                  {area.name} ({area.abbreviation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Field Visit Status</label>
            <select
              value={selectedFieldVisit}
              onChange={(e) => {
                setSelectedFieldVisit(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Yes">Yes (Conducted)</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Reset Filters</label>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedArea('all');
                setSelectedDept('all');
                setSelectedSection('all');
                setSelectedFieldVisit('all');
                setCurrentPage(1);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Registrations Table with Entire Team Members Details Display */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
            Loading registrations database...
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic">
            No registration records found matching the current search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-3.5">S.No</th>
                  <th className="py-3.5 px-3.5">Project ID</th>
                  <th className="py-3.5 px-3.5">Team Name</th>
                  <th className="py-3.5 px-3.5">Team Members Roster</th>
                  <th className="py-3.5 px-3.5">Project Title</th>
                  <th className="py-3.5 px-3.5">Problem Area</th>
                  <th className="py-3.5 px-3.5">Field Visit</th>
                  <th className="py-3.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {registrations.map((reg, index) => {
                  const isExpanded = expandedRosterId === reg._id;
                  return (
                    <React.Fragment key={reg._id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3.5 text-slate-500 font-medium">
                          {(currentPage - 1) * 10 + index + 1}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono font-bold text-blue-700 text-sm">
                          {reg.projectId}
                        </td>
                        <td className="py-3.5 px-3.5 font-bold text-slate-900">
                          <div>{reg.teamName}</div>
                          <div className="text-[11px] text-slate-500 font-normal">
                            {reg.department}{reg.section ? ` (Sec ${reg.section})` : ''}
                          </div>
                        </td>

                        {/* Complete Team Members Summary Cell with Expand/Collapse */}
                        <td className="py-3.5 px-3.5 text-slate-700 min-w-[240px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-blue-700" />
                                <span>{reg.members?.length || 1} Members</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setExpandedRosterId(isExpanded ? null : reg._id)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Hide Roster</span>
                                    <ChevronUp className="w-3 h-3" />
                                  </>
                                ) : (
                                  <>
                                    <span>View Entire Details</span>
                                    <ChevronDown className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="text-[11px] text-slate-700 flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-600 fill-current" />
                              <span className="font-bold">Leader:</span> {reg.teamLeaderName} ({reg.teamLeaderRegisterNumber})
                            </div>

                            {reg.contactEmail && (
                              <div className="text-[10px] text-blue-700 font-mono flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span>{reg.contactEmail}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3.5 text-slate-800 max-w-xs truncate" title={reg.projectTitle}>
                          <div className="font-semibold">{reg.projectTitle}</div>
                          <div className="text-[10px] text-slate-500">
                            Guide: {reg.supervisorName} ({reg.supervisorBranch})
                          </div>
                        </td>

                        <td className="py-3.5 px-3.5 text-slate-700">
                          <div className="font-medium">{reg.categoryNameSnapshot}</div>
                          {reg.otherProblemArea && (
                            <div className="text-[10px] text-amber-700 italic">
                              "{reg.otherProblemArea}"
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              reg.fieldVisitStatus === 'Yes'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {reg.fieldVisitStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setViewingReg(reg)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="View Full Registration Record"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(reg)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Download Official Slip"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingReg(reg)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(reg._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Archive Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Row Displaying Entire Details of All Team Members */}
                      {isExpanded && (
                        <tr className="bg-blue-50/40 border-b border-blue-200 animate-fade-in">
                          <td colSpan={8} className="p-4 sm:p-5">
                            <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-700" />
                                  <h4 className="font-times font-bold text-sm text-slate-900">
                                    Full Team Roster for {reg.teamName} (Project ID: {reg.projectId})
                                  </h4>
                                </div>
                                <span className="text-xs text-slate-500 font-mono">
                                  Leader Email: <strong>{reg.contactEmail || 'N/A'}</strong>
                                </span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                    <tr>
                                      <th className="py-2 px-3">#</th>
                                      <th className="py-2 px-3">Member Full Name</th>
                                      <th className="py-2 px-3">University Register No</th>
                                      <th className="py-2 px-3">Year</th>
                                      <th className="py-2 px-3">Department</th>
                                      <th className="py-2 px-3">Section</th>
                                      <th className="py-2 px-3">Email Address</th>
                                      <th className="py-2 px-3">Mobile Phone</th>
                                      <th className="py-2 px-3">Role</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium">
                                    {reg.members?.map((m, idx) => (
                                      <tr key={idx} className={m.isLeader ? 'bg-amber-50/40' : ''}>
                                        <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                                        <td className="py-2.5 px-3 font-bold text-slate-900">
                                          {m.memberName}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-slate-800">
                                          {m.registerNumber}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                                          {m.year || '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-700">{m.department}</td>
                                        <td className="py-2.5 px-3 text-slate-700">Section {m.section}</td>
                                        <td className="py-2.5 px-3 text-blue-700 font-mono text-[11px]">
                                          {m.email || (m.isLeader ? reg.contactEmail : '—')}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                                          {m.phone || '—'}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          {m.isLeader ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                              <Crown className="w-3 h-3 text-amber-700 fill-current" />
                                              <span>Official Team Leader</span>
                                            </span>
                                          ) : (
                                            <span className="text-slate-500 text-[11px]">Team Member</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 font-medium">
          <div>
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (Total {totalCount} records)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Details Modal Displaying Entire Details */}
      {viewingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-times">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
                  Official Project ID: {viewingReg.projectId}
                </span>
                <h3 className="font-times text-xl font-bold">{viewingReg.projectTitle}</h3>
              </div>
              <button
                onClick={() => setViewingReg(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Project & Team Summary Box */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 block font-bold">Team Name</span>
                  <span className="text-sm font-bold text-slate-900">{viewingReg.teamName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">Department & Section</span>
                  <span className="text-slate-900 font-semibold">
                    {viewingReg.department} - Section {viewingReg.section}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">Official Problem Area</span>
                  <span className="text-slate-900 font-semibold">{viewingReg.categoryNameSnapshot}</span>
                  {viewingReg.otherProblemArea && (
                    <span className="text-blue-700 block italic">
                      Specified: "{viewingReg.otherProblemArea}"
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">Field Visit Conducted</span>
                  <span className="text-slate-900 font-bold">{viewingReg.fieldVisitStatus}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">Leader Contact Email</span>
                  <span className="text-blue-700 font-mono font-bold">{viewingReg.contactEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">Faculty Supervisor</span>
                  <span className="text-slate-900 font-semibold">
                    {viewingReg.supervisorName} ({viewingReg.supervisorDesignation}, {viewingReg.supervisorBranch})
                  </span>
                </div>
              </div>

              {/* Entire Details of All Team Members */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-times font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-700" />
                    <span>Entire Details of All Registered Team Members ({viewingReg.members?.length || 1})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Leader Email: <span className="font-mono text-blue-700 font-bold">{viewingReg.contactEmail}</span>
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3.5">#</th>
                        <th className="py-2.5 px-3.5">Member Full Name</th>
                        <th className="py-2.5 px-3.5">Register Number</th>
                        <th className="py-2.5 px-3.5">Year</th>
                        <th className="py-2.5 px-3.5">Department</th>
                        <th className="py-2.5 px-3.5">Section</th>
                        <th className="py-2.5 px-3.5">Email Address</th>
                        <th className="py-2.5 px-3.5">Mobile Phone</th>
                        <th className="py-2.5 px-3.5">Designated Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {viewingReg.members?.map((m, idx) => (
                        <tr key={idx} className={m.isLeader ? 'bg-amber-50/50' : 'hover:bg-slate-50/60'}>
                          <td className="py-3 px-3.5 font-bold text-slate-400">#{idx + 1}</td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 text-sm">{m.memberName}</td>
                          <td className="py-3 px-3.5 font-mono text-slate-800">{m.registerNumber}</td>
                          <td className="py-3 px-3.5 text-slate-700 font-medium">{m.year || '—'}</td>
                          <td className="py-3 px-3.5 text-slate-700">{m.department}</td>
                          <td className="py-3 px-3.5 text-slate-700">Section {m.section}</td>
                          <td className="py-3 px-3.5 text-blue-700 font-mono text-[11px]">
                            {m.email || (m.isLeader ? viewingReg.contactEmail : '—')}
                          </td>
                          <td className="py-3 px-3.5 text-slate-700 font-mono text-[11px]">
                            {m.phone || '—'}
                          </td>
                          <td className="py-3 px-3.5">
                            {m.isLeader ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <Crown className="w-3 h-3 text-amber-700 fill-current" />
                                <span>Official Team Leader</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Team Member</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => handleDownloadPdf(viewingReg)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Slip</span>
              </button>
              <button
                onClick={() => setViewingReg(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authorized Editing Modal */}
      {editingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-times">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
                  Issued ID: {editingReg.projectId} (Preserved)
                </span>
                <h3 className="font-times text-base font-bold">Edit Registration Information</h3>
              </div>
              <button
                onClick={() => setEditingReg(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={editingReg.projectTitle}
                    onChange={(e) => setEditingReg({ ...editingReg, projectTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-times"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    value={editingReg.teamName}
                    onChange={(e) => setEditingReg({ ...editingReg, teamName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-times"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Field Visit Status</label>
                  <select
                    value={editingReg.fieldVisitStatus}
                    onChange={(e) =>
                      setEditingReg({ ...editingReg, fieldVisitStatus: e.target.value as 'Yes' | 'No' })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-times"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editingReg.department}
                    onChange={(e) => setEditingReg({ ...editingReg, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-times"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={editingReg.section}
                    onChange={(e) => setEditingReg({ ...editingReg, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-times"
                    required
                  />
                </div>

                {editingReg.otherProblemArea !== undefined && (
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Custom Problem Area Title
                    </label>
                    <input
                      type="text"
                      value={editingReg.otherProblemArea || ''}
                      onChange={(e) =>
                        setEditingReg({ ...editingReg, otherProblemArea: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-times"
                    />
                  </div>
                )}

                <div className="col-span-2 pt-2 border-t border-slate-100 font-bold text-slate-700">
                  Faculty Supervisor Mentorship
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Supervisor Name</label>
                  <input
                    type="text"
                    value={editingReg.supervisorName}
                    onChange={(e) => setEditingReg({ ...editingReg, supervisorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-times"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingReg.supervisorDesignation}
                    onChange={(e) =>
                      setEditingReg({ ...editingReg, supervisorDesignation: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-times"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Branch</label>
                  <input
                    type="text"
                    value={editingReg.supervisorBranch}
                    onChange={(e) => setEditingReg({ ...editingReg, supervisorBranch: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-times"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingEdit ? 'Saving Changes...' : 'Save & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Archiving */}
      <ConfirmationModal
        isOpen={!!deletingId}
        title="Archive Registration Record"
        message="Are you sure you want to archive this registration? The issued Project ID will remain preserved in historical records and will not be reused."
        confirmLabel="Archive Record"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
