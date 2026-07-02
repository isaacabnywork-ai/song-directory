'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Song } from '@/types';
import LandingView from './LandingView';
import MenuView from './MenuView';
import DirectoryView from './DirectoryView';
import SongView from './SongView';
import PlannerView from './PlannerView';
import SlidesView from './SlidesView';
import HistoryView from './HistoryView';
import { Moon, Sun } from '@phosphor-icons/react';

type ViewState = 'landing' | 'menu' | 'directory' | 'song' | 'planner' | 'slides' | 'history';

export default function MainApp({ initialSongs }: { initialSongs: Song[] }) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [activeView, setActiveView] = useState<ViewState>('landing');
  const [darkMode, setDarkMode] = useState(true);
  
  // Directory state
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Song view state
  const [currentSongId, setCurrentSongId] = useState<number | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const currentSong = useMemo(() => songs.find(s => s.id === currentSongId) || null, [songs, currentSongId]);
  
  // Sunday planner state
  const [sundaySongs, setSundaySongs] = useState<Song[]>([]);
  
  // Load sunday songs from DB on mount
  useEffect(() => {
    fetch('/api/setlist')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSundaySongs(data);
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

  const handleResetHistory = async () => {
    if (!confirm("Are you sure you want to reset all song history and counts? This will permanently clear all dates and counts.")) {
      return;
    }
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        // Clear history and counts locally in songs and sundaySongs state
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

  return (
    <div className={`min-h-screen bg-transparent transition-colors duration-300 w-full`}>
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="svc-btn fixed bottom-6 right-6 z-[100] p-3 rounded-full shadow-lg bg-black/10 dark:bg-white/10 flex items-center justify-center border-none outline-none backdrop-blur-md"
      >
        {darkMode ? <Sun className="text-xl text-white" /> : <Moon className="text-xl text-black" />}
      </button>

      {activeView === 'landing' && (
        <LandingView onEnter={() => setActiveView('menu')} />
      )}
      
      {activeView === 'menu' && (
        <MenuView 
          onNavigate={(view, category) => {
            if (category) setActiveCategory(category);
            setActiveView(view);
          }}
          onSearch={(query) => {
            setSearchQuery(query);
            setActiveCategory('Search Results');
            setActiveView('directory');
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
            setActiveView('menu');
          }}
          onSelectSong={(id, list) => {
            setCurrentSongId(id);
            if (list) setCurrentPlaylist(list);
            setActiveView('song');
          }}
          onSongAdded={(song) => {
            setSongs([...songs, song]);
            setCurrentSongId(song.id);
            setCurrentPlaylist([song]);
            setActiveView('song');
          }}
          onUpdateSong={(updatedSong) => {
            setSongs(songs.map(s => s.id === updatedSong.id ? updatedSong : s));
          }}
        />
      )}

      {activeView === 'song' && currentSong && (
        <SongView 
          song={currentSong}
          onBack={() => setActiveView('directory')}
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
            setActiveView('directory');
          }}
          isSunday={!!sundaySongs.find(s => s.id === currentSong?.id)}
          onPresentSetlist={() => setActiveView('slides')}
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
          onBack={() => setActiveView('menu')}
          onRemove={async (id) => {
            const res = await fetch(`/api/setlist?songId=${id}`, { method: 'DELETE' });
            if (res.ok) {
              const updatedList = await res.json();
              setSundaySongs(updatedList);
            } else {
              setSundaySongs(sundaySongs.filter(s => s.id !== id));
            }
          }}
          onPresent={() => setActiveView('slides')}
          onOpenSong={(id) => {
            setCurrentSongId(id);
            setCurrentPlaylist(sundaySongs);
            setActiveView('song');
          }}
        />
      )}

      {activeView === 'slides' && (
        <SlidesView 
          songs={sundaySongs}
          onClose={() => setActiveView('planner')}
        />
      )}

      {activeView === 'history' && (
        <HistoryView 
          songs={songs}
          onBack={() => setActiveView('menu')}
          onResetHistory={handleResetHistory}
        />
      )}
    </div>
  );
}
