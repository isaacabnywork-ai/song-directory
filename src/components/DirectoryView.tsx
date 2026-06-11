'use client';
import { useState, useMemo } from 'react';
import { Song } from '@/types';
import { ArrowLeft, FolderOpen, MagnifyingGlass, Plus, Lightning, MagnifyingGlassMinus } from '@phosphor-icons/react';

interface DirectoryViewProps {
  songs: Song[];
  category: string;
  initialSearch: string;
  onBack: () => void;
  onSelectSong: (id: number) => void;
}

export default function DirectoryView({ songs, category, initialSearch, onBack, onSelectSong }: DirectoryViewProps) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<'title' | 'artist' | 'year'>('title');

  const filteredSongs = useMemo(() => {
    let list = category === 'Search Results' ? songs : songs.filter(s => s.category === category);
    
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(q));
    }
    
    return list.sort((a, b) => {
      let v1 = a[sort];
      let v2 = b[sort];
      if (typeof v1 === 'string') v1 = v1.toLowerCase();
      if (typeof v2 === 'string') v2 = v2.toLowerCase();
      if (v1 < v2) return -1;
      if (v1 > v2) return 1;
      return 0;
    });
  }, [songs, category, search, sort]);

  return (
    <main className="view-section active-view overflow-y-auto bg-gray-50 dark:bg-[#0f0f0f] pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <div className="mb-8">
          <button 
            onClick={onBack}
            className="svc-btn mb-6 flex items-center justify-start gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white border-none bg-transparent p-0"
          >
            <ArrowLeft weight="bold" /> <span>Back to Library Menu</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3 border-none pb-0 m-0">
                {category === 'Search Results' ? (
                  <><MagnifyingGlass weight="fill" className="text-blue-500" /> Search Results</>
                ) : (
                  <><FolderOpen weight="fill" className="text-blue-500" /> {category}</>
                )}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 m-0">Select a song to view chords and lyrics.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <button 
                onClick={async () => {
                  const title = prompt('Song Title:');
                  if (!title) return;
                  const artist = prompt('Artist:', 'SVC Worship');
                  const category = prompt('Category (e.g. Bhajan, Praise-Adoration, Chorus, Gospel, etc):', 'Bhajan');
                  if (title && artist && category) {
                    await fetch('/api/songs', {
                      method: 'POST',
                      body: JSON.stringify({ title, artist, category, year: new Date().getFullYear() }),
                      headers: { 'Content-Type': 'application/json' }
                    });
                    window.location.reload();
                  }
                }}
                className="svc-btn h-10 px-4 flex-shrink-0 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium border-none flex items-center justify-center gap-2 shadow-sm outline-none"
              >
                <Plus weight="bold" /> <span className="whitespace-nowrap">Add Song</span>
              </button>
              <div className="relative w-full sm:w-56 h-10 flex-shrink-0 flex items-center">
                <MagnifyingGlass className="absolute left-3 text-gray-400 z-10 pointer-events-none" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..." 
                  className="w-full h-full pr-4 rounded-lg bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 text-sm text-black dark:text-white shadow-sm pl-10" 
                />
              </div>
              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value as 'title' | 'artist' | 'year')}
                className="h-10 px-3 flex-shrink-0 rounded-lg bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] focus:outline-none focus:border-blue-500 text-sm text-black dark:text-white cursor-pointer shadow-sm outline-none"
              >
                <option value="title">Sort by Title</option>
                <option value="artist">Sort by Artist</option>
                <option value="year">Sort by Year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-500 mb-4 flex justify-between items-center border-b border-gray-200 dark:border-[#333] pb-2">
          <span>{filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1"><Lightning /> Search Directory</span>
        </div>

        {filteredSongs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredSongs.map(song => (
              <div 
                key={song.id}
                onClick={() => onSelectSong(song.id)}
                className="svc-btn song-card bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#333] rounded-lg p-4 hover:shadow-md group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-black dark:text-white text-base leading-tight group-hover:text-blue-500">{song.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{song.artist}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-[#2b2b2b] text-gray-600 dark:text-gray-300 rounded">{song.year}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MagnifyingGlassMinus weight="duotone" className="text-5xl text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 m-0">No matching songs</h3>
            <p className="text-sm text-gray-500 mt-1 m-0">Try a different search term.</p>
          </div>
        )}
      </div>
    </main>
  );
}
