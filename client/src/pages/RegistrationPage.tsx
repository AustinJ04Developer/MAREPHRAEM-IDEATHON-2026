import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Lightbulb,
  UserCheck,
  Plus,
  Trash2,
  ArrowRight,
  Mail,
  Phone,
  Crown,
  GraduationCap,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api/client';
import { ProblemArea, TeamMember } from '../types';
import { useToast } from '../context/ToastContext';
import { BrandEmblem } from '../components/BrandEmblem';

export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { error: toastError, success: toastSuccess } = useToast();

  const trackParam = searchParams.get('track') || searchParams.get('area') || searchParams.get('category');

  const [problemAreas, setProblemAreas] = useState<ProblemArea[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState<boolean>(true);

  // Form State
  const [teamName, setTeamName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');

  // Members list - starts with Member 1 with complete details including email, phone, and year
  const [members, setMembers] = useState<TeamMember[]>([
    {
      memberName: '',
      department: '',
      year: '3rd Year',
      registerNumber: '',
      section: '',
      email: '',
      phone: '',
      isLeader: true,
    },
  ]);

  // Explicit Team Leader selection index (0-based)
  const [leaderIndex, setLeaderIndex] = useState<number>(0);

  // Project Info
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [otherProblemArea, setOtherProblemArea] = useState<string>('');
  const [previewAbbr, setPreviewAbbr] = useState<string>('');
  const [fieldVisitStatus, setFieldVisitStatus] = useState<'Yes' | 'No'>('No');

  // Supervisor Info
  const [supervisorName, setSupervisorName] = useState<string>('');
  const [supervisorDesignation, setSupervisorDesignation] = useState<string>('');
  const [supervisorBranch, setSupervisorBranch] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch official problem areas and match track parameter if supplied
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/problem-areas');
        if (res.data?.success && res.data?.data) {
          const areas: ProblemArea[] = res.data.data;
          setProblemAreas(areas);

          if (areas.length > 0) {
            if (trackParam) {
              const matched = areas.find(
                (p) =>
                  p._id === trackParam ||
                  p.code?.toLowerCase() === trackParam.toLowerCase() ||
                  p.abbreviation?.toLowerCase() === trackParam.toLowerCase() ||
                  p.name?.toLowerCase().includes(trackParam.toLowerCase())
              );
              if (matched) {
                setSelectedCategoryId(matched._id);
                return;
              }
            }
            setSelectedCategoryId(areas[0]._id);
          }
        }
      } catch (err: any) {
        toastError('Failed to load official problem areas from server.');
      } finally {
        setIsLoadingAreas(false);
      }
    };
    fetchCategories();
  }, [toastError, trackParam]);

  // Synchronize category if track param changes after initial load
  useEffect(() => {
    if (trackParam && problemAreas.length > 0) {
      const matched = problemAreas.find(
        (p) =>
          p._id === trackParam ||
          p.code?.toLowerCase() === trackParam.toLowerCase() ||
          p.abbreviation?.toLowerCase() === trackParam.toLowerCase() ||
          p.name?.toLowerCase().includes(trackParam.toLowerCase())
      );
      if (matched && matched._id !== selectedCategoryId) {
        setSelectedCategoryId(matched._id);
      }
    }
  }, [trackParam, problemAreas]);

  const selectedCategory = problemAreas.find((p) => p._id === selectedCategoryId);
  const isOtherSelected = !!selectedCategory?.isOther;

  // Real-time abbreviation preview when custom problem area is entered
  useEffect(() => {
    if (!isOtherSelected || !otherProblemArea.trim()) {
      setPreviewAbbr('');
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(
          `/abbreviation-preview?title=${encodeURIComponent(otherProblemArea.trim())}`
        );
        if (res.data?.success && res.data?.data?.abbreviation) {
          setPreviewAbbr(res.data.data.abbreviation);
        }
      } catch {
        setPreviewAbbr('');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [otherProblemArea, isOtherSelected]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedCategoryId(newId);
    const cat = problemAreas.find((p) => p._id === newId);
    if (!cat?.isOther) {
      setOtherProblemArea('');
      setPreviewAbbr('');
    }
  };

  const handleAddMember = () => {
    if (members.length >= 10) {
      toastError('A team can have a maximum of 10 members.');
      return;
    }
    setMembers((prev) => [
      ...prev,
      {
        memberName: '',
        department: department || '',
        year: '3rd Year',
        registerNumber: '',
        section: '',
        email: '',
        phone: '',
        isLeader: false,
      },
    ]);
  };

  const handleRemoveMember = (idx: number) => {
    if (members.length <= 1) {
      toastError('A team must have at least 1 member.');
      return;
    }
    const newMembers = members.filter((_, i) => i !== idx);
    setMembers(newMembers);

    if (leaderIndex === idx) {
      setLeaderIndex(0);
    } else if (leaderIndex > idx) {
      setLeaderIndex(leaderIndex - 1);
    }
  };

  const handleMemberChange = (idx: number, field: keyof TeamMember, val: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!teamName.trim() || teamName.trim().length < 2) {
      errors.teamName = 'Team name must be at least 2 characters.';
    }

    if (!department.trim()) {
      errors.department = 'Team department is required.';
    }

    if (!projectTitle.trim() || projectTitle.trim().length < 3) {
      errors.projectTitle = 'Project title must be at least 3 characters.';
    }

    if (!selectedCategoryId) {
      errors.categoryId = 'Please select an official problem area.';
    }

    if (isOtherSelected) {
      if (!otherProblemArea.trim() || otherProblemArea.trim().length < 3) {
        errors.otherProblemArea =
          'Please specify a descriptive title for your custom problem area (min 3 characters).';
      }
    }

    if (!supervisorName.trim()) {
      errors.supervisorName = 'Supervisor name is required.';
    }

    if (!supervisorDesignation.trim()) {
      errors.supervisorDesignation = 'Supervisor designation is required.';
    }

    if (!supervisorBranch.trim()) {
      errors.supervisorBranch = 'Supervisor branch is required.';
    }

    const regNumbers: string[] = [];
    members.forEach((mem, i) => {
      if (!mem.memberName.trim()) {
        errors[`member_${i}_name`] = `Member #${i + 1} name is required.`;
      }
      if (!mem.registerNumber.trim()) {
        errors[`member_${i}_reg`] = `Member #${i + 1} register number is required.`;
      } else {
        const regClean = mem.registerNumber.trim().toUpperCase();
        if (regNumbers.includes(regClean)) {
          errors[`member_${i}_reg`] = `Duplicate register number: ${regClean}`;
        } else {
          regNumbers.push(regClean);
        }
      }
      if (!mem.department.trim()) {
        errors[`member_${i}_dept`] = `Member #${i + 1} department is required.`;
      }
      if (!mem.year?.trim()) {
        errors[`member_${i}_year`] = `Member #${i + 1} year is required.`;
      }
      if (!mem.section?.trim()) {
        errors[`member_${i}_sec`] = `Member #${i + 1} section is required.`;
      }
      if (!mem.email?.trim() || !mem.email.includes('@') || !mem.email.includes('.')) {
        errors[`member_${i}_email`] = `Member #${i + 1} valid email is required.`;
      }
      if (!mem.phone?.trim() || mem.phone.trim().length < 7) {
        errors[`member_${i}_phone`] = `Member #${i + 1} valid phone number is required.`;
      }
    });

    if (leaderIndex < 0 || leaderIndex >= members.length) {
      errors.leader = 'Please select a valid Team Leader from the added members.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toastError('Please complete all highlighted mandatory fields.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedLeader = members[leaderIndex];
      const leaderEmailAddress = (selectedLeader?.email || '').trim().toLowerCase();

      const payload = {
        teamName: teamName.trim(),
        contactEmail: leaderEmailAddress,
        department: department.trim(),
        teamLeaderIndex: leaderIndex,
        members: members.map((m, idx) => ({
          memberName: m.memberName.trim(),
          department: m.department.trim(),
          year: (m.year || '3rd Year').trim(),
          registerNumber: m.registerNumber.trim().toUpperCase(),
          section: (m.section || '').trim(),
          email: m.email?.trim().toLowerCase() || '',
          phone: m.phone?.trim() || '',
          isLeader: idx === leaderIndex,
        })),
        projectTitle: projectTitle.trim(),
        categoryId: selectedCategoryId,
        otherProblemArea: isOtherSelected ? otherProblemArea.trim() : null,
        fieldVisitStatus,
        supervisorName: supervisorName.trim(),
        supervisorDesignation: supervisorDesignation.trim(),
        supervisorBranch: supervisorBranch.trim(),
      };

      const res = await api.post('/registrations', payload);

      if (res.data?.success && res.data?.data) {
        toastSuccess('Registration confirmed! Official Project ID generated.');
        const projectId = res.data.data.projectId;
        navigate(`/confirmation/${projectId}`, { state: { registration: res.data.data } });
      }
    } catch (err: any) {
      toastError(
        err.message || 'Failed to submit registration. Please verify details and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-800">
      {/* Page Title & Institutional Breadcrumb */}
      <div className="text-center space-y-4 mb-10">
        <div className="flex justify-center">
          <BrandEmblem
            size="lg"
            layout="vertical"
            subtitle="Ideathon 2026 • Innovation & Incubation"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-700" />
          <span>OFFICIAL EVENT REGISTRATION • PHASE 1</span>
        </div>
        <h1 className="font-times text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Team & Project Registration
        </h1>
        <div className="font-cursive text-xl sm:text-2xl text-blue-800 font-bold">
          "Empowering Engineering Minds • Fostering Academic Innovation"
        </div>
        <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Complete the official entry form. After adding all members, explicitly select your Team Leader. Your team will receive an authoritative Project ID and an official registration confirmation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Team Details & Contact */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-times text-lg sm:text-xl font-bold text-slate-900">
                1. Team Identity & Communication
              </h2>
              <p className="text-xs text-slate-500">
                Official team details and primary notification email.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-times">
                Team Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Nexus Innovators"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
                  formErrors.teamName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {formErrors.teamName && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.teamName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-times">
                Department <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science and Engineering"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
                  formErrors.department ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {formErrors.department && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.department}</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Team Members Roster */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-times text-lg font-bold text-slate-900">
                  2. Team Members Roster
                </h2>
                <p className="text-xs text-slate-500">
                  Add all participating members (1 to 10). You will select the Team Leader in Section 3.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMember}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="space-y-4">
            {members.map((mem, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative group"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700">
                      Member #{index + 1}
                    </span>
                    {mem.memberName.trim() && (
                      <span className="text-xs font-semibold text-slate-900">
                        {mem.memberName}
                      </span>
                    )}
                  </div>

                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-white transition-colors cursor-pointer"
                      title="Remove Member"
                      aria-label={`Remove Member ${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={mem.memberName}
                      onChange={(e) => handleMemberChange(index, 'memberName', e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
                    />
                    {formErrors[`member_${index}_name`] && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {formErrors[`member_${index}_name`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      University Register No <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={mem.registerNumber}
                      onChange={(e) => handleMemberChange(index, 'registerNumber', e.target.value)}
                      placeholder="e.g. 961421104001"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs font-mono"
                    />
                    {formErrors[`member_${index}_reg`] && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {formErrors[`member_${index}_reg`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={mem.department}
                      onChange={(e) => handleMemberChange(index, 'department', e.target.value)}
                      placeholder="e.g. CSE"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
                    />
                    {formErrors[`member_${index}_dept`] && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {formErrors[`member_${index}_dept`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Year <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={mem.year || '3rd Year'}
                      onChange={(e) => handleMemberChange(index, 'year', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                    {formErrors[`member_${index}_year`] && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {formErrors[`member_${index}_year`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Section <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={mem.section}
                      onChange={(e) => handleMemberChange(index, 'section', e.target.value)}
                      placeholder="e.g. A"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
                    />
                    {formErrors[`member_${index}_sec`] && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {formErrors[`member_${index}_sec`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-blue-700" />
                      <span>Email Address <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="email"
                      value={mem.email || ''}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      placeholder="e.g. member@marephraem.edu.in"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
                    />
                    {formErrors[`member_${index}_email`] && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {formErrors[`member_${index}_email`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-blue-700" />
                      <span>Mobile Phone <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="tel"
                      value={mem.phone || ''}
                      onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
                    />
                    {formErrors[`member_${index}_phone`] && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {formErrors[`member_${index}_phone`]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: EXPLICIT TEAM LEADER DESIGNATION */}
        <div className="p-6 sm:p-8 rounded-2xl bg-blue-50/70 border-2 border-blue-400 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-blue-200">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-times text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>3. Designate Team Leader</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                  Explicit Selection
                </span>
              </h2>
              <p className="text-xs text-slate-600">
                Select which registered member serves as Team Leader. Their email and phone entered above will be automatically utilized for all official communications:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {members.map((mem, index) => {
              const isSelected = leaderIndex === index;
              return (
                <div
                  key={index}
                  onClick={() => setLeaderIndex(index)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="explicitTeamLeader"
                      checked={isSelected}
                      onChange={() => setLeaderIndex(index)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {mem.memberName.trim() || `Member #${index + 1}`}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                            <Crown className="w-3 h-3 text-amber-600 fill-current" />
                            <span>Team Leader</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {mem.registerNumber.trim() ? `Reg: ${mem.registerNumber}` : 'Reg pending'} • {mem.department || 'Dept'}
                      </div>
                      {mem.email && (
                        <div className="text-[11px] text-blue-700 font-mono mt-0.5 truncate max-w-[200px]">
                          {mem.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : 'Select'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Automatic Leader Communication & Details Confirmation Box */}
          <div className="pt-3 border-t border-blue-200">
            <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold font-times text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Leader Communication & Verification Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block">Designated Leader:</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {members[leaderIndex]?.memberName.trim() || `Member #${leaderIndex + 1}`}
                    {members[leaderIndex]?.registerNumber.trim() ? ` (${members[leaderIndex].registerNumber.trim()})` : ''}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block">Communication Email & Phone:</span>
                  <span className="font-mono font-bold text-blue-700 text-xs">
                    {members[leaderIndex]?.email?.trim() || 'Email pending above'}
                    {members[leaderIndex]?.phone?.trim() ? ` • ${members[leaderIndex].phone.trim()}` : ''}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium pt-1">
                ✓ The official Project ID confirmation, digital certificate slip, and all stage notices will be dispatched to the Team Leader at the email provided above. No separate email entry is required.
              </p>
            </div>
          </div>

          {formErrors.leader && (
            <p className="text-xs text-rose-600">{formErrors.leader}</p>
          )}
        </div>

        {/* Step 4: Project Information & Vertical */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-times text-lg font-bold text-slate-900">
                4. Project & Problem Statement Vertical
              </h2>
              <p className="text-xs text-slate-500">
                Project title, problem area theme, and ground field visit status.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. AI-Powered Autonomous Agricultural Drone"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
                  formErrors.projectTitle ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {formErrors.projectTitle && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.projectTitle}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Problem Area <span className="text-rose-500">*</span>
                </label>
                {isLoadingAreas ? (
                  <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  <select
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {problemAreas.map((area, idx) => (
                      <option key={area._id} value={area._id}>
                        {idx + 1}. {area.name} ({area.abbreviation})
                      </option>
                    ))}
                  </select>
                )}
                {selectedCategory && (
                  <div className="mt-2 space-y-1">
                    {trackParam && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Pre-selected from Innovation Verticals Catalog</span>
                      </div>
                    )}
                    {!selectedCategory.isOther && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                          Prefix: {selectedCategory.abbreviation}
                        </span>
                        <span>• Generated ID format: {selectedCategory.abbreviation}-001</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Field Visit Status <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer font-bold text-xs transition-all ${
                      fieldVisitStatus === 'Yes'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fieldVisitStatus"
                      value="Yes"
                      checked={fieldVisitStatus === 'Yes'}
                      onChange={() => setFieldVisitStatus('Yes')}
                      className="sr-only"
                    />
                    <span>Yes (Conducted)</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer font-bold text-xs transition-all ${
                      fieldVisitStatus === 'No'
                        ? 'border-slate-700 bg-slate-100 text-slate-900 font-extrabold'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fieldVisitStatus"
                      value="No"
                      checked={fieldVisitStatus === 'No'}
                      onChange={() => setFieldVisitStatus('No')}
                      className="sr-only"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* If Other Area is selected, custom input */}
            {isOtherSelected && (
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Specify Your Custom Problem Area <span className="text-rose-500">*</span>
                  </label>
                  {previewAbbr && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <span>Generated Prefix:</span>
                      <strong className="text-slate-900 text-sm">{previewAbbr}</strong>
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={otherProblemArea}
                  onChange={(e) => setOtherProblemArea(e.target.value)}
                  placeholder="e.g. Smart Healthcare Robotics or Waste Management Systems"
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 ${
                    formErrors.otherProblemArea
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-amber-300'
                  }`}
                />
                {formErrors.otherProblemArea ? (
                  <p className="text-xs text-rose-600">{formErrors.otherProblemArea}</p>
                ) : (
                  <p className="text-[11px] text-amber-800">
                    A deterministic 3-character uppercase abbreviation (e.g. <code>SHR</code>, <code>WMS</code>) is created automatically for your Project ID.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 5: Faculty Supervisor Mentorship */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-times text-lg font-bold text-slate-900">
                5. Faculty Supervisor Mentorship
              </h2>
              <p className="text-xs text-slate-500">
                Designated faculty member overseeing and guiding the project.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Supervisor Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                placeholder="e.g. Dr. A. Johnson"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 ${
                  formErrors.supervisorName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {formErrors.supervisorName && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.supervisorName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={supervisorDesignation}
                onChange={(e) => setSupervisorDesignation(e.target.value)}
                placeholder="e.g. Associate Professor"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 ${
                  formErrors.supervisorDesignation
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-slate-300'
                }`}
              />
              {formErrors.supervisorDesignation && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.supervisorDesignation}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Branch / Discipline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={supervisorBranch}
                onChange={(e) => setSupervisorBranch(e.target.value)}
                placeholder="e.g. Mechanical Engineering"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 ${
                  formErrors.supervisorBranch ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {formErrors.supervisorBranch && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.supervisorBranch}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Action Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-extrabold text-base text-white">
              Ready to submit official registration?
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Your team will immediately be assigned an official Project ID and receive email confirmation.
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Issuing Project ID...</span>
              </>
            ) : (
              <>
                <span>Submit Official Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
