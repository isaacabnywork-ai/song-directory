'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Song, ServiceItem } from '@/types';
import { AdminProvider } from '@/context/AdminContext';
import AdminLoginModal from './AdminLoginModal';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MenuView from './MenuView';
import DirectoryView from './DirectoryView';
import SongView from './SongView';
import PlannerView from './PlannerView';
import SlidesView from './SlidesView';
import HistoryView from './HistoryView';
import ServiceOrderView from './ServiceOrderView';
import { Moon, Sun, MagnifyingGlass, X } from '@phosphor-icons/react';

type ViewState = 'menu' | 'directory' | 'song' | 'planner' | 'slides' | 'history' | 'service-order';

export default function MainApp({ initialSongs }: { initialSongs: Song[] }) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [activeView, setActiveView] = useState<ViewState>('menu');
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  
  // Directory state
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Song view state
  const [currentSongId, setCurrentSongId] = useState<number | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const currentSong = useMemo(() => songs.find(s => s.id === currentSongId) || null, [songs, currentSongId]);
  
  // Sunday planner state
  const [sundaySongs, setSundaySongs] = useState<Song[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);

  // Filtered quick search results
  const quickSearchResults = useMemo(() => {
    if (!quickSearchQuery.trim()) return [];
    const q = quickSearchQuery.toLowerCase();
    return songs.filter(s => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)).slice(0, 10);
  }, [songs, quickSearchQuery]);
  
  // Load sunday songs and service items from DB on mount
  useEffect(() => {
    fetch('/api/setlist')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSundaySongs(data);
      })
      .catch(console.error);

    fetch('/api/service-items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServiceItems(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ─── Browser back-button / History API support ───────────────────────────
  // Push a history entry whenever the active view changes so that the phone's
  // native back button steps through views instead of leaving the site.
  const navigateTo = React.useCallback(
    (view: ViewState, category?: string, songId?: number, playlist?: Song[]) => {
      if (category !== undefined) setActiveCategory(category);
      if (songId !== undefined) setCurrentSongId(songId);
      if (playlist !== undefined) setCurrentPlaylist(playlist);

      const state = { view, category, songId };
      window.history.pushState(state, '');
      setActiveView(view);
    },
    []
  );

  // On mount: replace the initial history entry with the current state so the
  // very first back-press from 'menu' still has an entry to pop to.
  useEffect(() => {
    window.history.replaceState({ view: 'menu' }, '');

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as { view?: ViewState; category?: string; songId?: number } | null;
      if (state?.view) {
        setActiveView(state.view);
        if (state.category !== undefined) setActiveCategory(state.category);
        if (state.songId !== undefined) setCurrentSongId(state.songId);
      } else {
        // No more history entries in-app — go back to menu
        setActiveView('menu');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleResetHistory = async () => {
    if (!confirm("Are you sure you want to reset all song history and counts? This will permanently clear all dates and counts.")) {
      return;
    }
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        const resetSongs = songs.map(s => ({
          ...s,
          sungCount: 0,
          history: []
        }));
        const resetSundaySongs = sundaySongs.map(s => ({
          ...s,
          sungCount: 0,
          history: []
        }));
        setSongs(resetSongs);
        setSundaySongs(resetSundaySongs);
        alert("All song history and counts have been reset.");
      } else {
        alert("Failed to reset history. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to reset history.");
    }
  };

  const handleOpenSongFromId = (id: number) => {
    setCurrentSongId(id);
    setCurrentPlaylist(songs);
    setActiveView('song');
  };

  return (
    <AdminProvider>
      {/* Outer flex row on desktop so sidebar sits side-by-side with content */}
      <div className="min-h-screen bg-transparent transition-colors duration-300 w-full">
        {/* Desktop layout: sidebar + content side-by-side */}
        <div className="flex min-h-screen">
          {/* Sidebar pushes content on desktop via margin */}
          <div className={`hidden md:block shrink-0 transition-all duration-300 ${
            isDesktopSidebarCollapsed ? 'w-14' : 'w-64'
          }`} />

          {/* Main scrollable content area */}
          <div className={`flex-1 min-w-0 pb-16 md:pb-4`}>
        {/* Dark Mode Floating Switcher */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="svc-btn fixed top-4 right-4 z-[100] p-2.5 rounded-full shadow-lg bg-black/10 dark:bg-white/10 flex items-center justify-center border-none outline-none backdrop-blur-md hover:scale-105 transition-transform"
        >
          {darkMode ? <Sun className="text-xl text-white" /> : <Moon className="text-xl text-black" />}
        </button>

        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          songs={songs}
          onSelectSong={handleOpenSongFromId}
          onNavigateHome={() => navigateTo('menu')}
          onNavigate={(view, category) => navigateTo(view, category)}
          sundayCount={sundaySongs.length}
          isDesktopCollapsed={isDesktopSidebarCollapsed}
          onToggleDesktopCollapse={() => setIsDesktopSidebarCollapsed(prev => !prev)}
        />

        {/* Admin Login Modal */}
        <AdminLoginModal />

        {/* Quick Search Modal */}
        {showSearchModal && (
          <div 
            className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-sm p-4 flex items-start justify-center pt-16 animate-fadeIn"
            onClick={() => setShowSearchModal(false)}
          >
            <div 
              className="w-full max-w-lg bg-white dark:bg-[#222] rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-[#333]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex items-center mb-3">
                <MagnifyingGlass className="absolute left-3.5 text-blue-500 text-xl pointer-events-none" />
                <input
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  placeholder="Search songs by title or category..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                {quickSearchQuery && (
                  <button
                    onClick={() => setQuickSearchQuery('')}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    <X className="text-lg" />
                  </button>
                )}
              </div>

              {/* Results list */}
              <div className="max-h-80 overflow-y-auto space-y-1">
                {quickSearchQuery.trim() === '' ? (
                  <p className="text-xs text-gray-400 text-center py-6">Start typing to search across all songs...</p>
                ) : quickSearchResults.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No songs found matching &quot;{quickSearchQuery}&quot;</p>
                ) : (
                  quickSearchResults.map(song => (
                    <button
                      key={song.id}
                      onClick={() => {
                        handleOpenSongFromId(song.id);
                        setShowSearchModal(false);
                        setQuickSearchQuery('');
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800/40"
                    >
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{song.title}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#2e2e2e] text-gray-500 dark:text-gray-400 shrink-0 ml-2">
                        {song.category}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Views */}
        {activeView === 'menu' && (
          <MenuView 
            onNavigate={(view, category) => navigateTo(view, category)}
            onSearch={(query) => {
              setSearchQuery(query);
              navigateTo('directory', 'Search Results');
            }}
            sundayCount={sundaySongs.length}
            songs={songs}
          />
        )}

        {activeView === 'directory' && (
          <DirectoryView 
            songs={songs}
            category={activeCategory}
            initialSearch={searchQuery}
            onBack={() => {
              setSearchQuery('');
              navigateTo('menu');
            }}
            onSelectSong={(id, list) => {
              if (list) setCurrentPlaylist(list);
              navigateTo('song', undefined, id);
            }}
            onSongAdded={(song) => {
              setSongs([...songs, song]);
              setCurrentPlaylist([song]);
              navigateTo('song', undefined, song.id);
            }}
            onUpdateSong={(updatedSong) => {
              setSongs(songs.map(s => s.id === updatedSong.id ? updatedSong : s));
            }}
          />
        )}

        {activeView === 'song' && currentSong && (
          <SongView 
            song={currentSong}
            onBack={() => navigateTo('directory')}
            onAddToSunday={async () => {
              if (!sundaySongs.find(s => s.id === currentSong.id)) {
                const res = await fetch('/api/setlist', {
                  method: 'POST',
                  body: JSON.stringify({ songId: currentSong.id }),
                  headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                  const updatedList = await res.json();
                  setSundaySongs(updatedList);
                }
              }
            }}
            onUpdate={(updatedSong) => {
              setSongs(songs.map(s => s.id === updatedSong.id ? updatedSong : s));
            }}
            onDelete={(id) => {
              setSongs(songs.filter(s => s.id !== id));
              setSundaySongs(sundaySongs.filter(s => s.id !== id));
              navigateTo('directory');
            }}
            isSunday={!!sundaySongs.find(s => s.id === currentSong?.id)}
            onPresentSetlist={() => navigateTo('slides')}
            onNext={
              currentPlaylist.length > 1 ? () => {
                const idx = currentPlaylist.findIndex(s => s.id === currentSong.id);
                if (idx !== -1 && idx < currentPlaylist.length - 1) setCurrentSongId(currentPlaylist[idx + 1].id);
              } : undefined
            }
            onPrev={
              currentPlaylist.length > 1 ? () => {
                const idx = currentPlaylist.findIndex(s => s.id === currentSong.id);
                if (idx > 0) setCurrentSongId(currentPlaylist[idx - 1].id);
              } : undefined
            }
            hasNext={currentPlaylist.findIndex(s => s.id === currentSong.id) < currentPlaylist.length - 1}
            hasPrev={currentPlaylist.findIndex(s => s.id === currentSong.id) > 0}
          />
        )}

        {activeView === 'planner' && (
          <PlannerView 
            songs={sundaySongs}
            serviceItems={serviceItems}
            onBack={() => navigateTo('menu')}
            onRemove={async (id) => {
              const res = await fetch(`/api/setlist?songId=${id}`, { method: 'DELETE' });
              if (res.ok) {
                const updatedList = await res.json();
                setSundaySongs(updatedList);
              } else {
                setSundaySongs(sundaySongs.filter(s => s.id !== id));
              }
            }}
            onPresent={() => navigateTo('slides')}
            onOpenSong={(id) => {
              setCurrentPlaylist(sundaySongs);
              navigateTo('song', undefined, id);
            }}
          />
        )}

        {activeView === 'slides' && (
          <SlidesView 
            songs={sundaySongs}
            onClose={() => navigateTo('planner')}
          />
        )}

        {activeView === 'history' && (
          <HistoryView 
            songs={songs}
            onBack={() => navigateTo('menu')}
            onResetHistory={handleResetHistory}
          />
        )}
        
        {activeView === 'service-order' && (
          <ServiceOrderView
            songs={songs}
            serviceItems={serviceItems}
            onServiceItemsChange={async (items) => {
              setServiceItems(items);
              await fetch('/api/service-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(items)
              });
            }}
            onBack={() => navigateTo('menu')}
            onNavigateToPlanner={() => navigateTo('planner')}
            onAddToSetlist={async (songId) => {
              if (!sundaySongs.find(s => s.id === songId)) {
                const res = await fetch('/api/setlist', {
                  method: 'POST',
                  body: JSON.stringify({ songId }),
                  headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                  const updatedList = await res.json();
                  setSundaySongs(updatedList);
                }
              }
            }}
          />
        )}

        {/* Fixed Mobile Bottom Navigation (Hidden on slides presentation mode) */}
        {activeView !== 'slides' && (
          <BottomNav 
            onNavigate={(view, category) => navigateTo(view, category)}
            onOpenSearch={() => setShowSearchModal(true)}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            activeView={activeView}
            sundayCount={sundaySongs.length}
          />
        )}
          </div>{/* end main content */}
        </div>{/* end flex row */}
      </div>{/* end outer wrapper */}
    </AdminProvider>
  );
}
