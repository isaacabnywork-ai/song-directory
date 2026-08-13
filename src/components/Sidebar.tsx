'use client';

import React, { useState, useMemo } from 'react';
import { Song } from '@/types';
import { useAdmin } from '@/context/AdminContext';
import { 
  X, CaretDown, CaretRight, CaretLeft, MusicNote, LockKey, LockKeyOpen, 
  Folder, House, ListDashes, CalendarStar, ChartBar, FileDoc, Wrench, MusicNotes
} from '@phosphor-icons/react';

interface SidebarProps {
  isOpen: boolean;           // mobile drawer open
  onClose: () => void;       // close mobile drawer
  songs: Song[];
  onSelectSong: (id: number) => void;
  onNavigateHome: () => void;
  onNavigate?: (view: 'menu' | 'directory' | 'planner' | 'history' | 'service-order', category?: string) => void;
  sundayCount?: number;
  // desktop collapsed state is managed by MainApp
  isDesktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}

// Alphabetical ranges for grouping
const ALPHA_RANGES = [
  { label: 'A - C', letters: ['A', 'B', 'C'], category: 'A-C' },
  { label: 'D - F', letters: ['D', 'E', 'F'], category: 'D-F' },
  { label: 'G - I', letters: ['G', 'H', 'I'], category: 'G-I' },
  { label: 'J - L', letters: ['J', 'K', 'L'], category: 'J-L' },
  { label: 'M - O', letters: ['M', 'N', 'O'], category: 'M-O' },
  { label: 'P - R', letters: ['P', 'Q', 'R'], category: 'P-R' },
  { label: 'S - U', letters: ['S', 'T', 'U'], category: 'S-U' },
  { label: 'V - Z', letters: ['V', 'W', 'X', 'Y', 'Z'], category: 'V-Z' },
];

const getSongLetter = (title: string): string => {
  const bracketMatch = title.match(/[\[\(]([^\]\)]+)/);
  let textToParse = "";
  if (bracketMatch && bracketMatch[1]) {
    textToParse = bracketMatch[1].trim();
  } else {
    textToParse = title.trim();
  }
  const cleanText = textToParse.replace(/^(o|oh|oho)\s+/i, '');
  const englishMatch = cleanText.match(/[A-Za-z]/);
  if (englishMatch) {
    return englishMatch[0].toUpperCase();
  }
  return cleanText.charAt(0).toUpperCase() || '?';
};

export default function Sidebar({ 
  isOpen, 
  onClose, 
  songs, 
  onSelectSong, 
  onNavigateHome,
  onNavigate,
  sundayCount = 0,
  isDesktopCollapsed = false,
  onToggleDesktopCollapse,
}: SidebarProps) {
  const { isAdmin, logout, setShowLoginModal } = useAdmin();
  const [expandedRanges, setExpandedRanges] = useState<Record<string, boolean>>({
    'A - C': true
  });

  const toggleRange = (label: string) => {
    setExpandedRanges(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const songsByRange = useMemo(() => {
    const map: Record<string, Song[]> = {};
    ALPHA_RANGES.forEach(r => { map[r.label] = []; });

    songs.forEach(song => {
      const letter = getSongLetter(song.title);
      const matchedRange = ALPHA_RANGES.find(r => r.letters.includes(letter));
      if (matchedRange) {
        map[matchedRange.label].push(song);
      } else {
        map['A - C'].push(song);
      }
    });

    Object.keys(map).forEach(rangeLabel => {
      map[rangeLabel].sort((a, b) => a.title.localeCompare(b.title));
    });

    return map;
  }, [songs]);

  const navItems = onNavigate ? [
    { icon: <House weight="fill" className="text-blue-500" />, label: 'Library Home', onClick: () => { onNavigateHome(); onClose(); } },
    { icon: <ListDashes weight="fill" className="text-purple-500" />, label: 'Order of Service', onClick: () => { onNavigate('service-order'); onClose(); } },
    { icon: <CalendarStar weight="fill" className="text-blue-500" />, label: "This Sunday's Songs", badge: sundayCount, onClick: () => { onNavigate('planner'); onClose(); } },
    { icon: <ChartBar weight="fill" className="text-emerald-500" />, label: 'Frequency of Songs', onClick: () => { onNavigate('history'); onClose(); } },
  ] : [
    { icon: <House weight="fill" className="text-blue-500" />, label: 'Library Home', onClick: () => { onNavigateHome(); onClose(); } },
  ];

  // ─── Desktop Collapsed Sidebar (icon-only strip on desktop) ────────────────
  const collapsedSidebar = (
    <aside className="hidden md:flex fixed top-0 left-0 bottom-0 z-[160] w-14 flex-col bg-white dark:bg-[#1f1f1f] border-r border-gray-200 dark:border-[#333] shadow-sm transition-all duration-300">
      {/* Toggle expand button */}
      <div className="p-2 border-b border-gray-200 dark:border-[#333] flex justify-center">
        <button
          onClick={onToggleDesktopCollapse}
          title="Expand sidebar"
          className="p-2 rounded-lg text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
        >
          <CaretRight className="text-base" />
        </button>
      </div>

      {/* Icon nav */}
      <nav className="flex-1 flex flex-col items-center py-3 gap-1 overflow-y-auto">
        <button
          onClick={() => { onNavigateHome(); onClose(); }}
          title="Library Home"
          className="relative w-10 h-10 flex items-center justify-center rounded-xl text-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
        >
          <House weight="fill" className="text-blue-500" />
        </button>

        <div className="w-6 border-t border-gray-200 dark:border-[#333] my-1" />

        {/* Alpha range icon buttons */}
        {ALPHA_RANGES.map(range => (
          <button
            key={range.label}
            onClick={() => { onNavigate?.('directory', range.category); }}
            title={`Songs ${range.label}`}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            {range.label.split(' - ')[0]}
          </button>
        ))}

        <div className="w-6 border-t border-gray-200 dark:border-[#333] my-1" />

        {/* Tools below index */}
        {navItems.filter(item => item.label !== 'Library Home').map((item, i) => (
          <button
            key={`tool-${i}`}
            onClick={item.onClick}
            title={item.label}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            {item.icon}
            {'badge' in item && (item.badge as number) > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-blue-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        <a
          href="https://docs.google.com/document/d/17tdD0uOvBJWOUuEpFhQ2lf694AoCjdfYTzNhcNkTqKY/edit?tab=t.0#heading=h.yctkmt9idzma"
          target="_blank"
          rel="noopener noreferrer"
          title="Master File (.docx)"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
        >
          <FileDoc weight="fill" className="text-amber-500" />
        </a>
      </nav>

      {/* Footer icon */}
      <div className="p-2 border-t border-gray-200 dark:border-[#333] flex justify-center">
        <button
          onClick={() => { setShowLoginModal(true); onClose(); }}
          title={isAdmin ? 'Admin active' : 'Admin Login'}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg transition-colors ${
            isAdmin 
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
              : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-500 dark:text-gray-400'
          }`}
        >
          {isAdmin ? <LockKeyOpen weight="fill" /> : <LockKey />}
        </button>
      </div>
    </aside>
  );

  // ─── Full Sidebar Panel (used for mobile drawer and desktop expanded) ───────
  const fullSidebar = (
    <aside className={`fixed top-0 left-0 bottom-0 z-[160] w-64 bg-white dark:bg-[#1f1f1f] border-r border-gray-200 dark:border-[#333] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isDesktopCollapsed ? 'md:hidden' : 'md:translate-x-0 md:flex'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-[#333] flex items-center justify-between bg-gray-50/80 dark:bg-[#181818]">
        <div className="flex items-center gap-2">
          <MusicNotes className="text-blue-500 text-lg" weight="fill" />
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">SVC Library</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Song Directory</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Desktop collapse button */}
          <button
            onClick={onToggleDesktopCollapse}
            title="Collapse sidebar"
            className="hidden md:flex p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-[#2c2c2c] transition-colors"
          >
            <CaretLeft className="text-base" />
          </button>
          {/* Mobile close button */}
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-[#2c2c2c] transition-colors"
          >
            <X className="text-xl" />
          </button>
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {/* Quick Actions */}
        <div className="space-y-1">
          <button
            onClick={() => { onNavigateHome(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <House className="text-lg text-blue-500 shrink-0" weight="fill" />
            <span>Library Home</span>
          </button>
        </div>

        {/* Alphabetical Ranges Accordion */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Alphabetical Index ({songs.length} Songs)
            </span>
          </div>

          <div className="space-y-1.5">
            {ALPHA_RANGES.map(range => {
              const rangeSongs = songsByRange[range.label] || [];
              const isExpanded = !!expandedRanges[range.label];

              return (
                <div key={range.label} className="rounded-xl overflow-hidden border border-transparent dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#181818]">
                  <button
                    onClick={() => toggleRange(range.label)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="text-blue-500 text-base shrink-0" weight="fill" />
                      <span>Songs {range.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-[#2d2d2d] text-gray-600 dark:text-gray-400 font-medium">
                        {rangeSongs.length}
                      </span>
                      {isExpanded ? (
                        <CaretDown className="text-xs text-gray-400" />
                      ) : (
                        <CaretRight className="text-xs text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-[#282828] py-1 max-h-60 overflow-y-auto">
                      {rangeSongs.length === 0 ? (
                        <p className="px-4 py-2 text-xs text-gray-400 italic">No songs in this range</p>
                      ) : (
                        rangeSongs.map(song => (
                          <button
                            key={song.id}
                            onClick={() => { onSelectSong(song.id); onClose(); }}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 truncate"
                          >
                            <MusicNote className="text-gray-400 shrink-0" />
                            <span className="truncate">{song.title}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-[#333]" />

        {/* Services & Tools */}
        <div>
          <div className="px-3 mb-2 flex items-center gap-1.5">
            <Wrench className="text-xs text-gray-400" weight="fill" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Services &amp; Tools
            </span>
          </div>
          <div className="space-y-1">
            {onNavigate && (
              <>
                <button
                  onClick={() => { onNavigate('service-order'); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ListDashes className="text-base text-purple-500 shrink-0" weight="fill" />
                    <span>Order of Service</span>
                  </div>
                </button>

                <button
                  onClick={() => { onNavigate('planner'); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarStar className="text-base text-blue-500 shrink-0" weight="fill" />
                    <span>This Sunday&apos;s Songs</span>
                  </div>
                  {sundayCount > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                      {sundayCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { onNavigate('history'); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ChartBar className="text-base text-emerald-500 shrink-0" weight="fill" />
                    <span>Frequency of Songs</span>
                  </div>
                </button>
              </>
            )}

            <a
              href="https://docs.google.com/document/d/17tdD0uOvBJWOUuEpFhQ2lf694AoCjdfYTzNhcNkTqKY/edit?tab=t.0#heading=h.yctkmt9idzma"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors no-underline"
            >
              <div className="flex items-center gap-2.5">
                <FileDoc className="text-base text-amber-500 shrink-0" weight="fill" />
                <span>Master File (.docx)</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Admin Toggle */}
      <div className="p-3 border-t border-gray-200 dark:border-[#333] bg-gray-50/80 dark:bg-[#181818]">
        {isAdmin ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <LockKeyOpen className="text-base text-amber-600 dark:text-amber-400 shrink-0" weight="fill" />
              <span>Admin Mode Active</span>
            </div>
            <button
              onClick={logout}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline px-2 py-1"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setShowLoginModal(true); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3a3a] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <LockKey className="text-sm text-gray-500" />
            <span>Admin Login</span>
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-xs md:hidden transition-opacity duration-300"
        />
      )}

      {/* On desktop: show collapsed sidebar when collapsed, or fullSidebar when expanded.
          On mobile: always use fullSidebar (which slides in when isOpen is true). */}
      {isDesktopCollapsed && collapsedSidebar}
      {fullSidebar}
    </>
  );
}
