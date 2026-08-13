'use client';

import React, { useState } from 'react';
import { 
  House, Folder, FolderSimple, MagnifyingGlass, Wrench, List, X,
  ListDashes, CalendarStar, ChartBar, FileDoc
} from '@phosphor-icons/react';

const ALPHA_CATEGORIES = [
  { label: 'A - C', value: 'A-C', color: '#ef4444' },
  { label: 'D - H', value: 'D-H', color: '#f97316' },
  { label: 'I - M', value: 'I-M', color: '#eab308' },
  { label: 'N - R', value: 'N-R', color: '#22c55e' },
  { label: 'S - Z', value: 'S-Z', color: '#3b82f6' },
];

const THEME_CATEGORIES = [
  { label: 'Bhajan', value: 'Bhajan', color: '#ec4899' },
  { label: 'Praise & Adoration', value: 'Praise-Adoration', color: '#8b5cf6' },
  { label: 'Chorus', value: 'Chorus', color: '#a855f7' },
  { label: 'Gospel', value: 'Gospel', color: '#14b8a6' },
  { label: 'Testimony', value: 'Testimony', color: '#06b6d4' },
  { label: 'Commitment & Calling', value: 'Commitment & Calling', color: '#6366f1' },
  { label: 'Prayer', value: 'Prayer', color: '#84cc16' },
  { label: 'Christian Faith & Hope', value: 'Christian Faith & Hope', color: '#10b981' },
  { label: 'Good Friday', value: 'Good Friday', color: '#64748b' },
  { label: 'Easter', value: 'Easter', color: '#f43f5e' },
  { label: 'Christmas Carols', value: 'Christmas', color: '#d946ef' },
  { label: 'Preaching', value: 'Preaching', color: '#475569' },
];

interface BottomNavProps {
  onNavigate: (view: 'menu' | 'directory' | 'planner' | 'history' | 'service-order', category?: string) => void;
  onOpenSearch: () => void;
  onOpenSidebar: () => void;
  activeView: string;
  sundayCount: number;
}

export default function BottomNav({ 
  onNavigate, 
  onOpenSearch, 
  onOpenSidebar,
  activeView,
  sundayCount 
}: BottomNavProps) {
  const [showToolsSheet, setShowToolsSheet] = useState(false);
  const [showCategoriesSheet, setShowCategoriesSheet] = useState(false);

  return (
    <>
      {/* Tools Modal / Bottom Sheet */}
      {showToolsSheet && (
        <div 
          className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={() => setShowToolsSheet(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#222222] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border-t sm:border border-gray-200 dark:border-[#333] animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Wrench className="text-xl text-blue-500" weight="fill" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Services & Tools</h3>
              </div>
              <button 
                onClick={() => setShowToolsSheet(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#333]"
              >
                <X className="text-lg" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Order of service */}
              <button
                onClick={() => {
                  setShowToolsSheet(false);
                  onNavigate('service-order');
                }}
                className="w-full text-left p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] flex items-center justify-between transition-colors border border-gray-200/60 dark:border-[#333]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <ListDashes className="text-xl" weight="fill" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Order of Service</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Plan and organize Sunday worship service order</p>
                  </div>
                </div>
              </button>

              {/* Sunday Songs */}
              <button
                onClick={() => {
                  setShowToolsSheet(false);
                  onNavigate('planner');
                }}
                className="w-full text-left p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] flex items-center justify-between transition-colors border border-gray-200/60 dark:border-[#333]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <CalendarStar className="text-xl" weight="fill" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">This Sunday&apos;s Songs</h4>
                      {sundayCount > 0 && (
                        <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                          {sundayCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View setlist and present slides</p>
                  </div>
                </div>
              </button>

              {/* Song Frequency */}
              <button
                onClick={() => {
                  setShowToolsSheet(false);
                  onNavigate('history');
                }}
                className="w-full text-left p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] flex items-center justify-between transition-colors border border-gray-200/60 dark:border-[#333]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <ChartBar className="text-xl" weight="fill" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Frequency of the Songs</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Analytics and history counts</p>
                  </div>
                </div>
              </button>

              {/* Master File */}
              <a
                href="https://docs.google.com/document/d/17tdD0uOvBJWOUuEpFhQ2lf694AoCjdfYTzNhcNkTqKY/edit?tab=t.0#heading=h.yctkmt9idzma"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowToolsSheet(false)}
                className="w-full text-left p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] flex items-center justify-between transition-colors border border-gray-200/60 dark:border-[#333] no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <FileDoc className="text-xl" weight="fill" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Master File (.docx)</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Google Docs master file link</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Categories Bottom Sheet */}
      {showCategoriesSheet && (
        <div 
          className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={() => setShowCategoriesSheet(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#222222] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border-t sm:border border-gray-200 dark:border-[#333] animate-slideUp max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Folder className="text-xl text-blue-500" weight="fill" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h3>
              </div>
              <button 
                onClick={() => setShowCategoriesSheet(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#333]"
              >
                <X className="text-lg" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4">
              {/* Alphabetical Section */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">Alphabetical Index</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALPHA_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setShowCategoriesSheet(false);
                        onNavigate('directory', cat.value);
                      }}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-gray-100 dark:border-[#2a2a2a] transition-colors text-left"
                    >
                      <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{cat.label}</span>
                    </button>
                  ))}
                  {/* All Songs */}
                  <button
                    onClick={() => {
                      setShowCategoriesSheet(false);
                      onNavigate('directory', 'All');
                    }}
                    className="col-span-2 flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 transition-colors text-left"
                  >
                    <FolderSimple className="text-blue-500" weight="fill" />
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">All Songs</span>
                  </button>
                </div>
              </div>

              {/* Theme Categories Section */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">By Theme</p>
                <div className="grid grid-cols-2 gap-2">
                  {THEME_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setShowCategoriesSheet(false);
                        onNavigate('directory', cat.value);
                      }}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] border border-gray-100 dark:border-[#2a2a2a] transition-colors text-left"
                    >
                      <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[130] bg-white/90 dark:bg-[#181818]/90 backdrop-blur-md border-t border-gray-200 dark:border-[#2e2e2e] px-2 py-1.5 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          
          {/* 1. HOME */}
          <button
            onClick={() => onNavigate('menu')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
              activeView === 'menu' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <House className="text-xl" weight={activeView === 'menu' ? 'fill' : 'regular'} />
            <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
          </button>

          {/* 2. CATEGORIES */}
          <button
            onClick={() => setShowCategoriesSheet(true)}
            className="flex flex-col items-center justify-center w-14 py-1 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Folder className="text-xl" />
            <span className="text-[10px] mt-0.5 tracking-tight">Categories</span>
          </button>

          {/* 3. SEARCH (Highlighted colorful circle in middle) */}
          <div className="relative -top-4 flex justify-center items-center">
            <button
              onClick={onOpenSearch}
              aria-label="Search Songs"
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-[#181818]"
            >
              <MagnifyingGlass className="text-2xl font-bold" weight="bold" />
            </button>
          </div>

          {/* 4. TOOLS */}
          <button
            onClick={() => setShowToolsSheet(true)}
            className="flex flex-col items-center justify-center w-14 py-1 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
          >
            <Wrench className="text-xl" />
            <span className="text-[10px] mt-0.5 tracking-tight">Tools</span>
          </button>

          {/* 5. MENU (Sidebar Drawer) */}
          <button
            onClick={onOpenSidebar}
            className="flex flex-col items-center justify-center w-14 py-1 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <List className="text-xl" />
            <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
          </button>

        </div>
      </nav>
    </>
  );
}
