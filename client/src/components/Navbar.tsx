import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lightbulb, ShieldCheck, UserCheck, Menu, X, ArrowRight, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scrollToElement } from '../utils/scroll';
import { BrandEmblem } from './BrandEmblem';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, admin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path && !location.hash;

  const closeMenu = () => setMobileMenuOpen(false);

  const handleNavClick = (sectionId: string) => {
    closeMenu();
    if (location.pathname === '/') {
      scrollToElement(sectionId);
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Main Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link to="/" onClick={closeMenu} className="flex items-center group py-1">
            <BrandEmblem
              size="md"
              subtitle="Ideathon 2026 • Innovation & Incubation"
              theme="light"
            />
          </Link>

          {/* Desktop Navigation Links with Smooth Scrolling */}
          <div className="hidden lg:flex items-center gap-1.5">
            <Link
              to="/"
              onClick={() => {
                closeMenu();
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                isActive('/')
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>

            <button
              type="button"
              onClick={() => handleNavClick('themes')}
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Problem Verticals
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('timeline')}
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Event Roadmap
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('guidelines')}
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Guidelines & FAQ
            </button>

            <div className="h-5 w-px bg-slate-200 mx-2" />

            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-700 text-white shadow-xs hover:bg-blue-800 active:scale-95 transition-all"
            >
              <span>Register Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Admin ({admin?.name?.split(' ')[0]})</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="ml-1 inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Organizer Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Portal</span>
              </Link>
            )}
          </div>

          {/* Mobile & Tablet Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/register"
              onClick={closeMenu}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-700 text-white shadow-xs hover:bg-blue-800"
            >
              <span>Register</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4 px-2 space-y-2 animate-fade-in bg-white">
            <Link
              to="/"
              onClick={() => {
                closeMenu();
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`block px-4 py-2.5 rounded-lg text-sm font-bold ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>

            <button
              type="button"
              onClick={() => handleNavClick('themes')}
              className="w-full text-left block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Problem Verticals
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('timeline')}
              className="w-full text-left block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Event Roadmap
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('guidelines')}
              className="w-full text-left block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Guidelines & FAQ
            </button>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                to="/register"
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-blue-700 text-white shadow-xs"
              >
                <span>Register Team Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/admin/dashboard"
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-800"
                >
                  <UserCheck className="w-4 h-4 text-blue-700" />
                  <span>Admin Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Organizer Login Portal</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
