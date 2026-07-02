'use client';
import { useMemo } from 'react';
import { MagnifyingGlass, Folder, CalendarStar, FileDoc, ChartBar, ChartPieSlice, ListDashes } from '@phosphor-icons/react';
import { Song } from '@/types';

interface MenuViewProps {
  onNavigate: (view: 'directory' | 'planner' | 'history', category?: string) => void;
  onSearch: (query: string) => void;
  sundayCount: number;
  songs: Song[];
}

export default function MenuView({ onNavigate, onSearch, sundayCount, songs }: MenuViewProps) {
  const alphaCategories = ['A-C', 'D-H', 'I-M', 'N-R', 'S-Z'];
  const themeCategories = [
    'Bhajan', 'Praise-Adoration', 'Chorus', 'Gospel', 'Testimony', 
    'Commitment & Calling', 'Prayer', 'Christian Faith & Hope', 
    'Good Friday', 'Easter', 'Christmas', 'Preaching'
  ];
  const categories = [...alphaCategories, ...themeCategories];

  // Assign a distinct color to each category for the pie chart
  const catColors: Record<string, string> = {
    'A-C': '#ef4444',
    'D-H': '#f97316',
    'I-M': '#eab308',
    'N-R': '#22c55e',
    'S-Z': '#3b82f6',
    'Bhajan': '#ef4444',
    'Praise-Adoration': '#f97316',
    'Chorus': '#eab308',
    'Gospel': '#22c55e',
    'Testimony': '#3b82f6',
    'Commitment & Calling': '#8b5cf6',
    'Prayer': '#ec4899',
    'Christian Faith & Hope': '#14b8a6',
    'Good Friday': '#64748b',
    'Easter': '#f43f5e',
    'Christmas': '#a855f7',
    'Preaching': '#84cc16',
  };

  const stats = useMemo(() => {
    const totalSongs = songs.length;
    
    const getCount = (s: Song) => s.history ? s.history.length : (s.sungCount || 0);
    
    const sorted = [...songs].sort((a, b) => getCount(b) - getCount(a));
    const sungSongs = sorted.filter(s => getCount(s) > 0);
    const topSung = sungSongs.slice(0, 5);
    
    const neverSungSongs = songs.filter(s => getCount(s) === 0);
    const neverSungCount = neverSungSongs.length;
    
    // Find highest sung count for proportional scaling
    const maxSungCount = topSung.length > 0 ? getCount(topSung[0]) : 1;

    const neverSungByCategory = categories.map(cat => ({
      name: cat,
      count: neverSungSongs.filter(s => s.category === cat).length,
      color: catColors[cat] || '#888'
    })).filter(c => c.count > 0);

    // Generate conic-gradient string
    let currentAngle = 0;
    const gradientParts = neverSungByCategory.map(cat => {
      const percentage = (cat.count / neverSungCount) * 100;
      const start = currentAngle;
      const end = currentAngle + percentage;
      currentAngle = end;
      return `${cat.color} ${start}% ${end}%`;
    });
    const pieGradient = neverSungCount > 0 ? `conic-gradient(${gradientParts.join(', ')})` : '';

    return { totalSongs, topSung, sungSongs, neverSungCount, neverSungSongs, neverSungByCategory, pieGradient, maxSungCount, getCount };
  }, [songs]);

  return (
    <main className="view-section active-view overflow-y-auto pb-20 bg-white dark:bg-[#191919]">
      <div className="w-full h-56 md:h-72 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1519491050282-cf00c82424b4?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=4800" 
          alt="Church Interior" 
          className="w-full h-full object-cover object-center opacity-90 dark:opacity-80" 
        />
      </div>

      <div className="max-w-[800px] mx-auto px-8 relative -mt-10 md:-mt-12">
        <div className="text-[72px] md:text-[84px] leading-none mb-4 filter drop-shadow-sm select-none">🎶</div>
        <h1 className="text-[32px] md:text-[40px] font-bold mb-8 text-[#37352f] dark:text-[rgba(255,255,255,0.9)] tracking-tight border-none pb-0 m-0">
          SVC Music Library
        </h1>

        <div className="mb-8 relative w-full flex items-center">
          <MagnifyingGlass className="absolute left-4 text-gray-400 text-lg z-10 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search across all songs... (Press Enter)" 
            className="w-full pr-4 py-3.5 rounded-xl bg-gray-100 dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#373737] focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px] text-black dark:text-white transition-all shadow-sm pl-12" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(e.currentTarget.value);
              }
            }}
          />
        </div>

        <div className="px-4 py-3.5 rounded text-[15px] bg-[#f1f1ef] dark:bg-[#2b2b2b] flex gap-3 mb-8 items-start border border-transparent dark:border-[#373737]">
          <span className="text-lg mt-0.5 select-none">💡</span>
          <p className="text-[#37352f] dark:text-[rgba(255,255,255,0.8)] leading-relaxed m-0">
            Welcome to online portal of the Music team of Satya Vachan Church, Lucknow. Here you will find all the resources needed to fruitfully contribute to Sunday worship through the ministry of Music.
          </p>
        </div>

        <h2 className="text-xs font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-3 px-2 border-none">
          Alphabetical Index
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8 px-1">
          {alphaCategories.map(cat => (
            <button 
              key={cat}
              onClick={() => onNavigate('directory', cat)}
              className="svc-btn w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded text-[15px] text-[#37352f] dark:text-[rgba(255,255,255,0.8)] hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors border-none bg-transparent"
            >
              <Folder className="text-[18px] text-gray-400 dark:text-gray-500" /> 
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <h2 className="text-xs font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-3 px-2 border-none">
          Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-12 px-1">
          {themeCategories.map(cat => (
            <button 
              key={cat}
              onClick={() => onNavigate('directory', cat)}
              className="svc-btn w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded text-[15px] text-[#37352f] dark:text-[rgba(255,255,255,0.8)] hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors border-none bg-transparent"
            >
              <Folder className="text-[18px] text-gray-400 dark:text-gray-500" /> 
              <span>{cat === 'Christmas' ? 'Christmas Carols Song' : cat}</span>
            </button>
          ))}
        </div>

        <h2 className="text-xs font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-3 px-2 border-none">
          Services &amp; Tools
        </h2>
        
        <div className="space-y-1 mb-12 flex flex-col">
          <button 
            onClick={() => onNavigate('planner')}
            className="svc-btn w-full flex items-center justify-between px-3 py-2 rounded text-[15px] text-[#37352f] dark:text-[rgba(255,255,255,0.8)] hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors border-none bg-transparent"
          >
            <div className="flex items-center gap-2.5">
              <CalendarStar weight="fill" className="text-[18px] text-blue-500" /> This Sunday&apos;s Songs
            </div>
            {sundayCount > 0 && (
              <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {sundayCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => onNavigate('history')}
            className="svc-btn w-full flex items-center justify-between px-3 py-2 rounded text-[15px] text-[#37352f] dark:text-[rgba(255,255,255,0.8)] hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors border-none bg-transparent"
          >
            <div className="flex items-center gap-2.5">
              <ChartBar weight="fill" className="text-[18px] text-emerald-500" /> Frequency of the Songs
            </div>
          </button>
        </div>

        <div className="pt-6 pb-12 border-t border-gray-200 dark:border-[#373737]">
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-3 px-2 m-0">Master File - GoogleDoc</p>
          <a 
            href="https://docs.google.com/document/d/17tdD0uOvBJWOUuEpFhQ2lf694AoCjdfYTzNhcNkTqKY/edit?tab=t.0#heading=h.yctkmt9idzma" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors group text-[#37352f] dark:text-[rgba(255,255,255,0.8)] no-underline"
          >
            <FileDoc className="text-[20px] text-[#2684FF] dark:text-[#5e9eff]" />
            <span className="text-[15px] border-b border-gray-300 dark:border-gray-600 group-hover:border-current transition-colors">
              Master File.docx
            </span>
            <span className="text-[12px] text-gray-400 ml-1">408.8KB</span>
          </a>
        </div>
      </div>
    </main>
  );
}
