'use client';
import { useState, useMemo } from 'react';
import { Song } from '@/types';
import { ArrowLeft, FolderOpen, MagnifyingGlass, Plus, Lightning, MagnifyingGlassMinus, Books } from '@phosphor-icons/react';

interface DirectoryViewProps {
  songs: Song[];
  category: string;
  initialSearch: string;
  onBack: () => void;
  onSelectSong: (id: number, currentList: Song[]) => void;
  onSongAdded?: (song: Song) => void;
  onUpdateSong?: (song: Song) => void;
}

export default function DirectoryView({ songs, category, initialSearch, onBack, onSelectSong, onSongAdded, onUpdateSong }: DirectoryViewProps) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<'title' | 'artist' | 'year' | 'frequency'>('title');
  const [localCategory, setLocalCategory] = useState<string>(category);
  const [showPickModal, setShowPickModal] = useState(false);
  const [pickSearch, setPickSearch] = useState('');

  // Compute available categories from all songs
  const allCategories = useMemo(() => Array.from(new Set(songs.map(s => s.category))), [songs]);

  const filteredSongs = useMemo(() => {
    let list = songs;
    
    if (localCategory && localCategory !== 'Search Results' && localCategory !== 'All') {
      list = list.filter(s => s.category === localCategory);
    }
    
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(q));
    }
    
    return list.sort((a, b) => {
      if (sort === 'frequency') {
        const freqA = a.history?.length || a.sungCount || 0;
        const freqB = b.history?.length || b.sungCount || 0;
        return freqB - freqA;
      }
      let v1: any = a[sort as keyof Song] ?? '';
      let v2: any = b[sort as keyof Song] ?? '';
      if (typeof v1 === 'string') v1 = v1.toLowerCase();
      if (typeof v2 === 'string') v2 = v2.toLowerCase();
      if (v1 < v2) return -1;
      if (v1 > v2) return 1;
      return 0;
    });
  }, [songs, localCategory, search, sort]);

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
                {localCategory === 'Search Results' ? (
                  <><MagnifyingGlass weight="fill" className="text-blue-500" /> Search Results</>
                ) : localCategory === 'All' ? (
                  <><FolderOpen weight="fill" className="text-blue-500" /> All Songs</>
                ) : (
                  <><FolderOpen weight="fill" className="text-blue-500" /> {localCategory}</>
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
                    const res = await fetch('/api/songs', {
                      method: 'POST',
                      body: JSON.stringify({ title, artist, category, year: new Date().getFullYear() }),
                      headers: { 'Content-Type': 'application/json' }
                    });
                    if (res.ok) {
                      const newSong = await res.json();
                      if (onSongAdded) {
                        onSongAdded(newSong);
                      } else {
                        window.location.reload();
                      }
                    } else {
                      alert('Failed to add song. Please try again.');
                    }
                  }
                }}
                className="svc-btn h-10 px-4 flex-shrink-0 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium border-none flex items-center justify-center gap-2 shadow-sm outline-none"
              >
                <Plus weight="bold" /> <span className="whitespace-nowrap">Add Song</span>
              </button>
              {localCategory !== 'Search Results' && localCategory !== 'All' && (
                <button 
                  onClick={() => setShowPickModal(true)}
                  className="svc-btn h-10 px-4 flex-shrink-0 bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#37352f] dark:text-white rounded-lg text-sm font-medium border-none flex items-center justify-center gap-2 shadow-sm outline-none hover:bg-gray-200 dark:hover:bg-[#373737]"
                >
                  <Books weight="bold" /> <span className="whitespace-nowrap">Pick from Library</span>
                </button>
              )}
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
                value={localCategory}
                onChange={(e) => setLocalCategory(e.target.value)}
                className="h-10 px-3 flex-shrink-0 rounded-lg bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] focus:outline-none focus:border-blue-500 text-sm text-black dark:text-white cursor-pointer shadow-sm outline-none"
              >
                <option value="All">All Categories</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="h-10 px-3 flex-shrink-0 rounded-lg bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] focus:outline-none focus:border-blue-500 text-sm text-black dark:text-white cursor-pointer shadow-sm outline-none"
              >
                <option value="title">Sort by Title</option>
                <option value="artist">Sort by Artist</option>
                <option value="year">Sort by Year</option>
                <option value="frequency">Sort by Frequency</option>
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
                onClick={() => onSelectSong(song.id, filteredSongs)}
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
            <MagnifyingGlassMinus className="text-6xl text-gray-300 dark:text-[#333] mb-4" />
            <h3 className="text-xl font-medium text-[#37352f] dark:text-white mb-2 border-none">No songs found</h3>
            <p className="text-gray-500 max-w-md m-0">
              {search 
                ? `We couldn't find any songs matching "${search}".` 
                : "This category is currently empty. Add a song to get started!"}
            </p>
          </div>
        )}
      </div>

      {showPickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white dark:bg-[#191919] rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-[#333]">
            <div className="p-4 border-b border-gray-200 dark:border-[#333] flex justify-between items-center">
              <h3 className="text-lg font-bold m-0 text-[#37352f] dark:text-white flex items-center gap-2 border-none pb-0"><Books /> Pick Songs for {localCategory}</h3>
              <button onClick={() => setShowPickModal(false)} className="text-gray-500 hover:text-black dark:hover:text-white text-xl bg-transparent border-none p-0 cursor-pointer">✕</button>
            </div>
            <div className="p-4 border-b border-gray-200 dark:border-[#333]">
              <input 
                type="text" 
                placeholder="Search all songs to add..." 
                value={pickSearch}
                onChange={(e) => setPickSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#333] focus:outline-none focus:border-blue-500 text-sm text-black dark:text-white"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {songs
                .filter(s => ['A-C', 'D-H', 'I-M', 'N-R', 'S-Z'].includes(s.category))
                .filter(s => s.category !== localCategory)
                .filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(pickSearch.toLowerCase()))
                .slice(0, 50)
                .map(song => (
                  <div key={song.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2b2b2b] rounded-lg group transition-colors">
                    <div>
                      <div className="font-medium text-[#37352f] dark:text-white">{song.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{song.artist} • Currently in <span className="font-semibold">{song.category}</span></div>
                    </div>
                    <button 
                      onClick={async () => {
                        const res = await fetch(`/api/songs/${song.id}`, {
                          method: 'PUT',
                          body: JSON.stringify({ category: localCategory }),
                          headers: { 'Content-Type': 'application/json' }
                        });
                        if (res.ok) {
                          const updated = await res.json();
                          if (onUpdateSong) {
                            onUpdateSong(updated);
                          } else {
                            window.location.reload();
                          }
                        }
                      }}
                      className="svc-btn px-3 py-1.5 bg-blue-50 dark:bg-[rgba(38,132,255,0.15)] text-blue-600 dark:text-[#5e9eff] text-xs font-bold rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity border-none"
                    >
                      Move Here
                    </button>
                  </div>
              ))}
              {songs.filter(s => ['A-C', 'D-H', 'I-M', 'N-R', 'S-Z'].includes(s.category) && s.category !== localCategory && `${s.title} ${s.artist}`.toLowerCase().includes(pickSearch.toLowerCase())).length === 0 && (
                <div className="text-center p-8 text-gray-500 text-sm italic">
                  No matching songs found in A-Z categories.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
