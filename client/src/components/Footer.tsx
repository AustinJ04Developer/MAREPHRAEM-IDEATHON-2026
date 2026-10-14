import React from 'react';
import { MapPin, Globe, Lightbulb, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandEmblem } from './BrandEmblem';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Institutional Initiative */}
          <div className="space-y-4">
            <BrandEmblem
              size="md"
              theme="dark"
              subtitle="Edition 2026 • Ideathon"
            />
            <p className="text-xs text-slate-400 leading-relaxed">
              Marephraem Ideasource is organized under the auspices of the Innovation & Entrepreneurship Development Cell (IEDC) and Research & Development Cell, fostering student technological innovation and entrepreneurial solutions.
            </p>
          </div>

          {/* Col 2: Institutional Campus */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-1 border-b border-slate-800">
              Host Institution
            </h4>
            <div className="text-xs text-slate-300 space-y-2">
              <p className="font-bold text-white">
                Mar Ephraem College of Engineering and Technology
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                A Christian Minority Institution run by the Catholic Diocese of Marthandam.
              </p>
              <p className="flex items-start gap-2 text-slate-400 text-[11px] leading-relaxed pt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Malankara Hills, Elavuvilai, Marthandam, Kanyakumari District, Tamil Nadu – 629171</span>
              </p>
            </div>
          </div>

          {/* Col 3: Official Secretariat & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-1 border-b border-slate-800">
              Secretariat & Helpdesk
            </h4>
            <div className="text-xs text-slate-300 space-y-2.5">
              <p className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a
                  href="https://www.marephraem.edu.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 underline transition-colors"
                >
                  www.marephraem.edu.in
                </a>
              </p>
              <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                <p>• AICTE Approved</p>
                <p>• Affiliated to Anna University, Chennai</p>
                <p>• NAAC Accredited Institution</p>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Portals & Administration */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-1 border-b border-slate-800">
              Platform Links
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Overview & Guidelines
                </Link>
              </li>
              <li>
                <a href="/#themes" className="hover:text-white transition-colors">
                  10 Official Problem Verticals
                </a>
              </li>
              <li>
                <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                  Register Your Team
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Administrative Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright Footer */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 text-center sm:text-left">
          <p>© 2026 Mar Ephraem College of Engineering and Technology. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Official Event Management System</span>
            <span>•</span>
            <span>Anna University Affiliated</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
