import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/pages/utils';
import { BarChart3, BookOpen, Briefcase, Clock, Plus } from 'lucide-react';

const TABS = [
  { name: 'Home', label: 'Dashboard', icon: BarChart3 },
  { name: 'Journal', label: 'Journal', icon: BookOpen },
  { name: 'Portfolio', label: 'Portfolio', icon: Briefcase },
  { name: 'History', label: 'History', icon: Clock },
];

export default function Layout({ children, currentPageName }) {
  const handleNewTrade = () => {
    window.dispatchEvent(new CustomEvent('deriverse:openTradeForm'));
  };

return (
    <div className="min-h-screen" style={{ background: '#080B0F' }}>
      {/* Desktop Top Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'rgba(8,11,15,0.95)', borderBottom: '1px solid #1F2D40' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold tracking-tight">
              <span className="text-[#00C2FF]">Deri</span><span className="text-[#E8ECF1]">verse</span>
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = currentPageName === tab.name;
              return (
                <Link
                  key={tab.name}
                  to={createPageUrl(tab.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    active ? 'bg-[#1F2D40] text-[#00C2FF]' : 'text-[#7A8B9E] hover:text-[#E8ECF1] hover:bg-[#111820]'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

        {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleNewTrade}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #00C2FF, #00E5A0)', color: '#080B0F' }}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Trade</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24 md:pb-8">
        {children}
      </main>

{/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl px-2 pb-1 pt-1"
        style={{ background: 'rgba(8,11,15,0.98)', borderTop: '1px solid #1F2D40' }}>
        <div className="flex items-center justify-around">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = currentPageName === tab.name;
            return (
              <Link
                key={tab.name}
                to={createPageUrl(tab.name)}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-all ${
                  active ? 'text-[#00C2FF]' : 'text-[#4A5568]'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
              }
