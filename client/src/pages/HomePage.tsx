import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
  FileCheck,
  Award,
  Calendar,
  ChevronDown,
  Layers,
  Search,
  Sparkles,
  BookOpen,
  TrendingUp,
  Target,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api/client';
import { ProblemArea } from '../types';
import { scrollToElement } from '../utils/scroll';
import { BrandEmblem } from '../components/BrandEmblem';

export const HomePage: React.FC = () => {
  const location = useLocation();
  const [problemAreas, setProblemAreas] = useState<ProblemArea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await api.get('/problem-areas');
        if (res.data?.success && res.data?.data) {
          setProblemAreas(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load problem areas:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAreas();
  }, []);

  // Smooth scroll to section if URL has a hash upon navigation
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        scrollToElement(sectionId);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const filteredAreas = problemAreas.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const faqs = [
    {
      q: 'Who is eligible to participate in Marephraem Ideasource 2026?',
      a: 'The ideathon is open to student engineering teams across all academic departments of Mar Ephraem College of Engineering & Technology. Inter-departmental collaborations are welcome and encouraged.',
    },
    {
      q: 'How is the official Team Leader designated?',
      a: 'After adding your team members, you explicitly designate one member as the official Team Leader via the dedicated selection step.',
    },
    {
      q: 'How is the authoritative Project ID generated and issued?',
      a: 'Upon successful form submission, the system atomically issues an official sequential Project ID (e.g. HCW-001, ASF-001) based on the chosen problem area. The ID is immediately shown on screen and sent via email confirmation.',
    },
    {
      q: 'Is a faculty supervisor required during registration?',
      a: 'Yes. Each team must specify their designated faculty supervisor (Name, Designation, and Academic Branch) who serves as the internal project guide and mentor throughout the evaluation stages.',
    },
    {
      q: 'What if our innovative solution falls outside the predefined 10 categories?',
      a: 'Select the "Other Area" option and enter your custom problem area title. The system deterministically computes a unique 3-character uppercase abbreviation for your team\'s official Project ID.',
    },
  ];

  return (
    <div className="space-y-24 pb-20 text-slate-800">
      {/* Hero Section with Impressive Background Animation Graphic Picture */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white border-b border-slate-800">
        {/* Background Image: Symbolizing Growth, Innovation, Light & Career */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/growth-innovation-hero.jpg"
            alt="Growth, Innovation, and Career Light"
            className="w-full h-full object-cover object-center animate-pulse-beam scale-105 filter brightness-75 contrast-110"
          />
          {/* Luminous Architectural Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/80" />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/90" />
        </div>

        {/* Floating Animation Graphic Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/5 w-3 h-3 rounded-full bg-amber-400/80 blur-xs animate-float-1" />
          <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-blue-400/70 blur-xs animate-float-2" />
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-amber-300/60 blur-xs animate-float-3" />
          <div className="absolute top-1/2 right-1/6 w-2.5 h-2.5 rounded-full bg-cyan-300/80 blur-xs animate-float-1" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
          {/* Official Emblem & Majestic Headings */}
          <div className="space-y-5 max-w-5xl mx-auto flex flex-col items-center">
            {/* Centered Glowing Emblem Container */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-700/70 backdrop-blur-md shadow-2xl shadow-blue-950/60 transition-transform duration-300 hover:scale-105">
              <BrandEmblem size="2xl" layout="vertical" showText={false} theme="dark" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-widest uppercase">
              <span>Official Ideathon 2026 Platform</span>
            </div>

            <h1 className="font-times text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12] drop-shadow-md">
              Marephraem <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-sky-300">
                Ideasource
              </span>
            </h1>

            {/* Clearly Viewable Cursive Subtitle Symbolizing Growth & Career */}
            <div className="font-cursive text-2xl sm:text-3xl lg:text-4xl text-amber-300 font-bold tracking-wide drop-shadow-sm pt-1">
              "Pioneering Engineering Solutions • Illuminating Career Futures"
            </div>

            <p className="font-sans text-sm sm:text-base lg:text-lg text-slate-200 font-medium max-w-3xl mx-auto leading-relaxed pt-2 drop-shadow-xs">
              A prestigious platform uniting student talent to conceive breakthrough technologies. 
              Nurture your engineering intellect through direct faculty mentorship, structured field research, and institutional incubation.
            </p>
          </div>

          {/* Action CTAs with Smooth Scrolling on Click */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-blue-700 text-white shadow-xl shadow-amber-600/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans"
            >
              <span>Register Your Team Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => scrollToElement('themes')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md transition-all shadow-md cursor-pointer font-sans"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>Explore Problem Verticals</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToElement('timeline')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-700/80 transition-all shadow-md cursor-pointer font-sans"
            >
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Event Schedule</span>
            </button>
          </div>

          {/* Key Official Ideathon Event Highlights with Times & Cursive Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto pt-10 text-left">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-xl transition-all hover:border-amber-400/50 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                <span className="font-times text-2xl font-black text-amber-300">10 + 1</span>
              </div>
              <div>
                <div className="font-times text-sm font-bold text-white uppercase tracking-wider">Problem Verticals</div>
                <div className="font-cursive text-sm text-slate-300 font-semibold mt-0.5">Predefined & Custom Technical Tracks</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-xl transition-all hover:border-emerald-400/50 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                <span className="font-times text-lg font-black text-emerald-300">IEDC</span>
              </div>
              <div>
                <div className="font-times text-sm font-bold text-white uppercase tracking-wider">IEDC Incubation</div>
                <div className="font-times text-xs font-semibold text-emerald-300">Grants & Recognition</div>
                <div className="font-cursive text-sm text-slate-300 font-semibold mt-0.5">Project Prototype Backing</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-xl transition-all hover:border-blue-400/50 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                <span className="font-times text-xl font-black text-blue-300">1 : 1</span>
              </div>
              <div>
                <div className="font-times text-sm font-bold text-white uppercase tracking-wider">Faculty Mentorship</div>
                <div className="font-cursive text-sm text-slate-300 font-semibold mt-0.5">Direct Academic & R&D Guidance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Areas Section with Times New Roman & Cursive Subtitle */}
      <section id="themes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-28">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Layers className="w-3.5 h-3.5 text-blue-700" />
            <span>Problem Themes & Tracks</span>
          </div>

          <h2 className="font-times text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Official Innovation Verticals
          </h2>

          <div className="font-cursive text-xl sm:text-2xl text-blue-800 font-bold">
            "Discover Your Calling Across Critical National Challenges"
          </div>

          <p className="font-sans text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Select an official vertical aligned with your problem statement. Each vertical generates an authoritative 3-character prefix for your team's Project ID.
          </p>

          {/* Search filter for categories */}
          <div className="pt-3 max-w-md mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search problem area or code (e.g. Healthcare, HCW, Farming)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs font-sans"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse shadow-2xs" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAreas.map((area, index) => (
              <div
                key={area._id}
                className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between shadow-2xs relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-times font-bold text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Track #{index + 1}
                    </span>
                    <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      Prefix: {area.abbreviation}
                    </span>
                  </div>

                  <h3 className="font-times text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {area.name}
                  </h3>

                  <p className="font-sans text-xs text-slate-600 leading-relaxed font-normal">
                    {area.isOther
                      ? 'Propose an interdisciplinary solution. Requires a descriptive custom problem title and automatically generates a unique 3-character ID.'
                      : `Official theme for ${area.name}. Teams registered under this vertical receive sequential Project IDs prefixed with ${area.abbreviation}.`}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-sans">Open Track</span>
                  </span>

                  <Link
                    to={`/register?track=${encodeURIComponent(area._id)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline font-sans cursor-pointer"
                  >
                    <span>Register for this Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Event Roadmap / Timeline Section with Times & Cursive Script */}
      <section id="timeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-28">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Event Roadmap & Schedule</span>
          </div>

          <h2 className="font-times text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Ideathon Progression Journey
          </h2>

          <div className="font-cursive text-xl sm:text-2xl text-blue-800 font-bold">
            "From Initial Conception to Grand Institutional Exhibition"
          </div>

          <p className="font-sans text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Four progressive milestones leading to final presentation before institutional and industrial evaluators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Milestone 01: Registration Open & In Progress */}
          <div className="p-6 rounded-2xl bg-white border-2 border-blue-600 shadow-md space-y-3 relative ring-4 ring-blue-500/10">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-times font-black text-base shadow-sm">
              01
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Registration Open</span>
            </div>
            <h3 className="font-times text-lg font-bold text-slate-900">Team Registration</h3>
            <p className="font-sans text-xs text-slate-600 leading-relaxed">
              Form your team, complete the member roster, designate your official Team Leader, and secure an authoritative Project ID.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
              >
                <span>Register Team</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Milestone 02: Mentor Review (Upcoming / In Progress) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center font-times font-black text-base">
              02
            </div>
            <div className="font-cursive text-base text-amber-700 font-bold">
              Upcoming Phase
            </div>
            <h3 className="font-times text-lg font-bold text-slate-900">Faculty Mentor Review</h3>
            <p className="font-sans text-xs text-slate-600 leading-relaxed">
              Consult with your designated faculty supervisor to hone your proposal, review technical feasibility, and prepare your project prototype outline.
            </p>
          </div>

          {/* Milestone 03: Upcoming Pitch Deck Stage */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center font-times font-black text-base">
              03
            </div>
            <div className="font-cursive text-base text-amber-700 font-bold">
              Upcoming Phase
            </div>
            <h3 className="font-times text-lg font-bold text-slate-900">Idea Pitch Deck Submission</h3>
            <p className="font-sans text-xs text-slate-600 leading-relaxed">
              Teams formulate technical synopses, system architectural diagrams, and project execution methodologies for evaluation.
            </p>
          </div>

          {/* Milestone 04: Upcoming Grand Finale */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center font-times font-black text-base">
              04
            </div>
            <div className="font-cursive text-base text-slate-600 font-bold">
              Grand Finale
            </div>
            <h3 className="font-times text-lg font-bold text-slate-900">Jury Evaluation & Awards</h3>
            <p className="font-sans text-xs text-slate-600 leading-relaxed">
              Demonstrate working prototypes before senior academic and industrial evaluators for final institutional recognition and honors.
            </p>
          </div>
        </div>
      </section>

      {/* Guidelines & Interactive FAQ Section */}
      <section id="guidelines" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-28">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Rules & Event Policies</span>
          </div>

          <h2 className="font-times text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>

          <div className="font-cursive text-xl sm:text-2xl text-amber-800 font-bold">
            "Everything You Need to Know for Official Registration"
          </div>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm sm:text-base font-times font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ml-3 ${
                    expandedFaq === idx ? 'rotate-180 text-blue-700' : ''
                  }`}
                />
              </button>
              {expandedFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm font-sans text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Motivational Institutional Call to Action Banner */}
        <div className="pt-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 border border-slate-800">
            <div className="space-y-3 max-w-xl">
              <div className="font-cursive text-2xl sm:text-3xl text-amber-300 font-bold">
                "Step Forward, Shape the Future"
              </div>
              <h3 className="font-times text-2xl sm:text-3xl font-black text-white">
                Ready to Submit Your Team Registration?
              </h3>
              <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Registrations are officially open for all academic departments of Mar Ephraem College. 
                Complete your team entry to receive your authoritative Project ID.
              </p>
            </div>

            <Link
              to="/register"
              className="shrink-0 inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-blue-600 hover:from-amber-600 hover:to-blue-700 text-white shadow-lg active:scale-95 transition-all cursor-pointer font-sans"
            >
              <span>Proceed to Registration Form</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
