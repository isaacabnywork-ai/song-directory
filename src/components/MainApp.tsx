'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Song } from '@/types';
import LandingView from './LandingView';
import MenuView from './MenuView';
import DirectoryView from './DirectoryView';
import SongView from './SongView';
import PlannerView from './PlannerView';
import SlidesView from './SlidesView';
import { Moon, Sun } from '@phosphor-icons/react';

type ViewState = 'landing' | 'menu' | 'directory' | 'song' | 'planner' | 'slides';

export default function MainApp({ initialSongs }: { initialSongs: Song[] }) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [activeView, setActiveView] = useState<ViewState>('landing');
  const [darkMode, setDarkMode] = useState(true);
  
  // Directory state
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Song view state
  const [currentSongId, setCurrentSongId] = useState<number | null>(null);
  const currentSong = useMemo(() => songs.find(s => s.id === currentSongId) || null, [songs, currentSongId]);
  
  // Sunday planner state
  const [sundaySongs, setSundaySongs] = useState<Song[]>([]);
  
  // Load sunday songs from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('svc_setlist');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setSundaySongs(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Save sunday songs to local storage when changed
  useEffect(() => {
    localStorage.setItem('svc_setlist', JSON.stringify(sundaySongs));
  }, [sundaySongs]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
          onSelectSong={(id) => {
            setCurrentSongId(id);
            setActiveView('song');
          }}
        />
      )}

      {activeView === 'song' && currentSong && (
        <SongView 
          song={currentSong}
          onBack={() => setActiveView('directory')}
          onAddToSunday={() => {
            if (!sundaySongs.find(s => s.id === currentSong.id)) {
              setSundaySongs([...sundaySongs, currentSong]);
            }
          }}
          onUpdate={(updatedSong) => {
            setSongs(songs.map(s => s.id === updatedSong.id ? updatedSong : s));
          }}
        />
      )}

      {activeView === 'planner' && (
        <PlannerView 
          songs={sundaySongs}
          onBack={() => setActiveView('menu')}
          onRemove={(id) => {
            setSundaySongs(sundaySongs.filter(s => s.id !== id));
          }}
          onPresent={() => setActiveView('slides')}
        />
      )}

      {activeView === 'slides' && (
        <SlidesView 
          songs={sundaySongs}
          onClose={() => setActiveView('planner')}
        />
      )}
    </div>
  );
}
