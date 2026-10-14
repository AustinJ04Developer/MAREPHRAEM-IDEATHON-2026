import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  Printer,
  Home,
  Mail,
  Calendar,
  Crown,
  Award,
} from 'lucide-react';
import { api } from '../api/client';
import { Registration } from '../types';
import { BrandEmblem } from '../components/BrandEmblem';

export const ConfirmationPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const stateReg = location.state?.registration;
  const isCompleteStateReg = Boolean(
    stateReg &&
      stateReg.department &&
      stateReg.supervisorName &&
      stateReg.members &&
      stateReg.members.length > 0 &&
      stateReg.categoryNameSnapshot
  );

  const [registration, setRegistration] = useState<Registration | null>(
    isCompleteStateReg ? stateReg : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!isCompleteStateReg);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // headless fallback
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      const fetchReg = async () => {
        try {
          const res = await api.get(`/registrations/${projectId}`);
          if (res.data?.success && res.data?.data) {
            setRegistration(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load registration details:', err);
        } finally {
          setIsLoading(false);
        }
      };

      // Always fetch authoritative record from MongoDB if state is incomplete or on mount
      fetchReg();
    }
  }, [projectId]);

  const handleDownloadPdf = async () => {
    if (!registration) return;
    setIsDownloadingPdf(true);
    try {
      const targetId = registration.projectId || registration._id;
      const res = await api.get(`/registrations/${targetId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${registration.projectId}-registration-slip.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Retrieving confirmed registration...</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 text-slate-800">
        <h2 className="text-lg font-bold text-slate-900">Registration Not Found</h2>
        <p className="text-xs text-slate-600">
          No registration record was found for Project ID: <strong>{projectId}</strong>.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 text-white font-bold text-xs"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7 text-slate-800">
      {/* Official Success Indicator */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <BrandEmblem
            size="xl"
            layout="vertical"
            subtitle="Official Ideathon Registration Certificate"
          />
        </div>

        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div>
          <h1 className="font-times text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Registration Confirmed
          </h1>
          <div className="font-cursive text-xl sm:text-2xl text-emerald-800 font-bold">
            "Official Verification Slip & Enrollment Certificate"
          </div>
          <p className="font-sans text-xs sm:text-sm text-slate-600 mt-1">
            Your team has been successfully enrolled in <strong>Marephraem Ideasource 2026</strong>.
          </p>
        </div>
      </div>

      {/* Authoritative Project ID Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white text-center shadow-md space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-widest text-blue-300">
          Official Project Identification Code
        </div>
        <div className="font-mono text-4xl sm:text-5xl font-black tracking-wider text-white">
          {registration.projectId}
        </div>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Preserve this official Project ID for all stage submissions, mentor interactions, and final jury evaluations.
        </p>
      </div>

      {/* Email Alert Banner */}
      {registration.contactEmail && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-xs text-blue-900 no-print">
          <Mail className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <strong>Confirmation Email Dispatched:</strong> An official registration receipt and Project ID slip have been sent to{' '}
            <span className="font-bold underline text-blue-950">{registration.contactEmail}</span>.
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 no-print">
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-blue-700 text-white shadow-xs hover:bg-blue-800 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isDownloadingPdf ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>Download Official PDF Slip</span>
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Summary</span>
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* Official Registration Slip Summary Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 print-container">
        {/* Institutional Masthead in Print/View */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              Mar Ephraem College of Engineering & Technology • IEDC
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{registration.projectTitle}</h2>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-auto">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Registered:{' '}
              {new Date(registration.createdAt).toLocaleDateString('en-IN', {
                dateStyle: 'medium',
              })}
            </span>
          </div>
        </div>

        {/* Structured Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Project & Problem Theme
            </div>
            <div>
              <span className="text-slate-500 block">Problem Area:</span>
              <span className="font-bold text-slate-900 text-sm">
                {registration.categoryNameSnapshot || (registration as any).problemArea || 'Official Area'}
              </span>
            </div>
            {registration.otherProblemArea && (
              <div>
                <span className="text-slate-500 block">Custom Problem Title:</span>
                <span className="font-semibold text-blue-700">
                  {registration.otherProblemArea}
                </span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block">Field Visit Conducted:</span>
              <span className="font-bold text-emerald-700">
                {registration.fieldVisitStatus || 'No'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Team & Mentorship
            </div>
            <div>
              <span className="text-slate-500 block">Team Name:</span>
              <span className="font-bold text-slate-900 text-sm">{registration.teamName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Department:</span>
              <span className="font-semibold text-slate-800">
                {registration.department
                  ? `${registration.department}${registration.section ? ` - Section ${registration.section}` : ''}`
                  : 'Engineering Department'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Faculty Supervisor:</span>
              <span className="font-semibold text-slate-800">
                {registration.supervisorName ? (
                  <>
                    <span>{registration.supervisorName}</span>
                    {(registration.supervisorDesignation || registration.supervisorBranch) && (
                      <span className="text-slate-500 font-normal">
                        {' '}({[registration.supervisorDesignation, registration.supervisorBranch].filter(Boolean).join(', ')})
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400 italic">Faculty Supervisor Assigned</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Registered Members Table */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Registered Team Members ({registration.members?.length || 1})
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="divide-y divide-slate-100">
              {registration.members && registration.members.length > 0 ? (
                registration.members.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-400">#{idx + 1}</span>
                      <span className="font-bold text-slate-900 text-sm">{m.memberName}</span>
                      {m.isLeader && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <Crown className="w-3 h-3 text-amber-600 fill-current" />
                          <span>Team Leader</span>
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] pl-6 sm:pl-0 flex flex-wrap items-center gap-1.5">
                      <span>{m.registerNumber} • {m.year ? `${m.year} • ` : ''}{m.department}{m.section ? ` (Sec ${m.section})` : ''}</span>
                      {m.email && <span className="text-blue-700">• {m.email}</span>}
                      {m.phone && <span>• {m.phone}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 sm:p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{registration.teamLeaderName || 'Team Leader'}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      <Crown className="w-3 h-3 text-amber-600 fill-current" />
                      <span>Team Leader</span>
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    {registration.teamLeaderRegisterNumber || ''}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
