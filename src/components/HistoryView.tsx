'use client';
import { useState, useMemo } from 'react';
import { Song } from '@/types';
import { 
  ArrowLeft, MagnifyingGlass, Funnel, Clock, CalendarStar, ChartBar, ChartPieSlice, ListDashes, Trash
} from '@phosphor-icons/react';

interface HistoryViewProps {
  songs: Song[];
  onBack: () => void;
  onResetHistory?: () => void;
}

export default function HistoryView({ songs, onBack, onResetHistory }: HistoryViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [frequencyFilter, setFrequencyFilter] = useState<'All' | 'Never' | 'Rare' | 'Occasional' | 'Frequent'>('All');
  const [sort, setSort] = useState<'natural' | 'most_sung' | 'least_sung' | 'most_overdue' | 'most_recent' | 'name'>('natural');

  // Compute categories dynamically
  const categories = useMemo(() => {
    return Array.from(new Set(songs.map(s => s.category))).sort();
  }, [songs]);

  // Helper to get total sung count for a song
  const getSungCount = (song: Song) => {
    return song.history ? song.history.length : (song.sungCount || 0);
  };

  // Helper to get frequency class
  const getFrequencyClass = (count: number) => {
    if (count === 0) return 'Never';
    if (count <= 2) return 'Rare';
    if (count <= 5) return 'Occasional';
    return 'Frequent';
  };

  // Compute metric numbers for the cards
  const metrics = useMemo(() => {
    let total = songs.length;
    let never = 0;
    let rare = 0;
    let occasional = 0;
    let frequent = 0;

    songs.forEach(song => {
      const cnt = getSungCount(song);
      if (cnt === 0) never++;
      else if (cnt <= 2) rare++;
      else if (cnt <= 5) occasional++;
      else frequent++;
    });

    return { total, never, rare, occasional, frequent };
  }, [songs]);

  // Process filtering and sorting
  const processedSongs = useMemo(() => {
    let list = [...songs];

    // 1. Search filter
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(q));
    }

    // 2. Category filter
    if (categoryFilter !== 'All') {
      list = list.filter(s => s.category === categoryFilter);
    }

    // 3. Frequency filter
    if (frequencyFilter !== 'All') {
      list = list.filter(s => {
        const cnt = getSungCount(s);
        const freqClass = getFrequencyClass(cnt);
        return freqClass === frequencyFilter;
      });
    }

    // 4. Sorting logic
    return list.sort((a, b) => {
      const countA = getSungCount(a);
      const countB = getSungCount(b);

      if (sort === 'most_sung') {
        return countB - countA;
      }
      if (sort === 'least_sung') {
        return countA - countB;
      }
      if (sort === 'most_overdue') {
        // Oldest last sung date first. Never sung songs (time = 0) are considered most overdue and float to top.
        const timeA = a.history && a.history.length > 0 ? new Date(a.history[0].sungAt).getTime() : 0;
        const timeB = b.history && b.history.length > 0 ? new Date(b.history[0].sungAt).getTime() : 0;
        return timeA - timeB;
      }
      if (sort === 'most_recent') {
        // Newest last sung date first. Never sung songs float to the bottom.
        const timeA = a.history && a.history.length > 0 ? new Date(a.history[0].sungAt).getTime() : 0;
        const timeB = b.history && b.history.length > 0 ? new Date(b.history[0].sungAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sort === 'name') {
        return a.title.localeCompare(b.title);
      }
      // default / natural order: sort by ID
      return a.id - b.id;
    });
  }, [songs, search, categoryFilter, frequencyFilter, sort]);

  // Compute conic gradient values for pie chart
  const pieChartStyles = useMemo(() => {
    const { never, rare, occasional, frequent, total } = metrics;
    if (total === 0) return '';
    const neverPct = (never / total) * 100;
    const rarePct = (rare / total) * 100;
    const occasionalPct = (occasional / total) * 100;
    const frequentPct = (frequent / total) * 100;

    return `conic-gradient(
      #ef4444 0% ${neverPct}%, 
      #f59e0b ${neverPct}% ${neverPct + rarePct}%, 
      #10b981 ${neverPct + rarePct}% ${neverPct + rarePct + occasionalPct}%, 
      #3b82f6 ${neverPct + rarePct + occasionalPct}% 100%
    )`;
  }, [metrics]);

  // Compute top 5 most sung songs
  const topSongs = useMemo(() => {
    return [...songs]
      .filter(s => getSungCount(s) > 0)
      .sort((a, b) => getSungCount(b) - getSungCount(a))
      .slice(0, 5);
  }, [songs]);

  const maxTopSungCount = useMemo(() => {
    if (topSongs.length === 0) return 1;
    return getSungCount(topSongs[0]);
  }, [topSongs]);

  // Format date helper
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDotColor = (count: number) => {
    if (count === 0) return 'bg-[#ef4444]';
    if (count <= 2) return 'bg-[#f59e0b]';
    if (count <= 5) return 'bg-[#10b981]';
    return 'bg-[#3b82f6]';
  };

  const getCountBadgeColor = (count: number) => {
    if (count === 0) return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-900/30';
    if (count <= 2) return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    if (count <= 5) return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
    return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
  };

  return (
    <main className="view-section active-view overflow-y-auto bg-gray-50 dark:bg-[#0f0f0f] pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="svc-btn mb-6 flex items-center justify-start gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white border-none bg-transparent p-0"
        >
          <ArrowLeft weight="bold" /> <span>Back to Library Menu</span>
        </button>

        {/* Header Grid Banner */}
        <div 
          className="bg-black dark:bg-[#121212] text-white p-8 md:p-12 relative overflow-hidden rounded-2xl mb-8 border border-gray-900 shadow-xl"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        >
          <div className="absolute top-0 right-0 p-6 text-xs font-mono text-gray-500 tracking-wider text-right hidden sm:block">
            MUSIC MINISTRY<br />
            INTERNAL REFERENCE<br />
            <span className="text-gray-400">SVC · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
          </div>

          <div className="max-w-xl">
            <span className="text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase block mb-2">SVC WORSHIP DIRECTORY</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 border-none pb-0 m-0 text-white font-serif">
              Song History <span className="italic text-[#e9c46a] font-normal">&amp; Frequency</span>
            </h1>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed m-0 font-light">
              Every song. Every service date. Real frequency counts from 2020–2026. Use alongside the rotation plan for the full picture.
            </p>
          </div>

          {onResetHistory && (
            <div className="mt-6 md:absolute md:bottom-6 md:right-8 md:mt-0">
              <button
                onClick={onResetHistory}
                className="svc-btn px-4 py-2 rounded-xl text-xs font-semibold bg-red-950/20 text-red-400 hover:bg-red-900/40 border border-red-900/30 shadow-md flex items-center justify-center gap-2 hover:text-red-200 transition-all cursor-pointer w-full md:w-auto"
              >
                <Trash weight="bold" /> Reset Frequency &amp; History
              </button>
            </div>
          )}
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-[#191919] rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold tracking-wider uppercase m-0">Total Songs</p>
            <p className="text-3xl font-extrabold text-black dark:text-white mt-2 mb-0">{metrics.total}</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#191919] rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-red-500 font-semibold tracking-wider uppercase m-0">Never Sung</p>
            <p className="text-3xl font-extrabold text-red-500 mt-2 mb-0">{metrics.never}</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#191919] rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-amber-500 font-semibold tracking-wider uppercase m-0">Rarely (1-2x)</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-2 mb-0">{metrics.rare}</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#191919] rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-emerald-500 font-semibold tracking-wider uppercase m-0">Occasionally (3-5x)</p>
            <p className="text-3xl font-extrabold text-emerald-500 mt-2 mb-0">{metrics.occasional}</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#191919] rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-blue-500 font-semibold tracking-wider uppercase m-0">Frequently (6+x)</p>
            <p className="text-3xl font-extrabold text-blue-500 mt-2 mb-0">{metrics.frequent}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Donut Chart */}
          <div className="bg-white dark:bg-[#191919] p-6 rounded-2xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm flex flex-col sm:flex-row items-center gap-8">
            <div 
              className="relative w-36 h-36 rounded-full shrink-0 flex items-center justify-center shadow-md" 
              style={{ background: pieChartStyles }}
            >
              <div className="w-24 h-24 rounded-full bg-white dark:bg-[#191919] flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-extrabold text-black dark:text-white leading-none">{metrics.total}</span>
                <span className="text-[10px] tracking-wider uppercase font-bold text-gray-400 mt-1">Songs</span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-2">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-none pb-0 m-0">
                <ChartPieSlice weight="bold" /> Frequency Distribution
              </h3>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Never Sung</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 font-bold">{metrics.never} ({Math.round((metrics.never / metrics.total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Rarely (1-2x)</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 font-bold">{metrics.rare} ({Math.round((metrics.rare / metrics.total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Occasionally (3-5x)</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 font-bold">{metrics.occasional} ({Math.round((metrics.occasional / metrics.total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Frequently (6+x)</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 font-bold">{metrics.frequent} ({Math.round((metrics.frequent / metrics.total) * 100)}%)</span>
              </div>
            </div>
          </div>

          {/* Bar Chart of Top Sung */}
          <div className="bg-white dark:bg-[#191919] p-6 rounded-2xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm flex flex-col justify-between">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-none pb-0 m-0">
              <ChartBar weight="bold" /> Top 5 Most Sung Songs
            </h3>
            {topSongs.length > 0 ? (
              <div className="space-y-3.5">
                {topSongs.map(song => {
                  const count = getSungCount(song);
                  return (
                    <div key={song.id}>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-gray-700 dark:text-gray-300 truncate pr-4 font-semibold">{song.title}</span>
                        <span className="text-gray-500 dark:text-gray-400 shrink-0 font-bold">{count}x</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-[#2c2c2c] rounded-full h-2">
                        <div 
                          className="bg-blue-500 dark:bg-blue-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(count / maxTopSungCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic m-0">No song statistics available.</p>
            )}
          </div>
        </div>

        {/* Search, Filters, and Options Bar */}
        <div className="bg-white dark:bg-[#191919] p-5 rounded-2xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm mb-6 space-y-4">
          
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            
            {/* Search Box */}
            <div className="relative flex-1 flex items-center">
              <MagnifyingGlass className="absolute left-3.5 text-gray-400 text-base pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search song name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-[#202020] border border-gray-200 dark:border-[#333] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-black dark:text-white transition-all"
              />
            </div>

            {/* Category Select */}
            <div className="relative w-full lg:w-56">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-[#202020] border border-gray-200 dark:border-[#333] focus:outline-none focus:border-blue-500 text-sm text-black dark:text-white cursor-pointer shadow-sm appearance-none pr-8 outline-none"
              >
                <option value="All">All categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <Funnel size={14} />
              </div>
            </div>

            {/* Frequency Quick Pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {(['All', 'Never', 'Rare', 'Occasional', 'Frequent'] as const).map(pill => {
                const labelMap = {
                  All: 'All',
                  Never: 'Never sung',
                  Rare: 'Rarely 1-2x',
                  Occasional: 'Occasionally 3-5x',
                  Frequent: 'Frequently 6+x'
                };
                const isActive = frequencyFilter === pill;
                return (
                  <button
                    key={pill}
                    onClick={() => setFrequencyFilter(pill)}
                    className={`svc-btn px-4 py-2 rounded-xl text-xs font-bold transition-all border-none ${
                      isActive 
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' 
                        : 'bg-gray-100 text-gray-600 dark:bg-[#252525] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#303030]'
                    }`}
                  >
                    {labelMap[pill]}
                  </button>
                );
              })}
            </div>

            {/* Matched Counter */}
            <div className="text-xs text-gray-400 dark:text-gray-500 font-bold shrink-0 text-right lg:ml-auto select-none">
              {processedSongs.length} / {songs.length} songs
            </div>
          </div>

          {/* Sort panel */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-gray-100 dark:border-[#2d2d2d]">
            <span className="text-[10px] tracking-widest font-extrabold text-gray-400 dark:text-gray-500 uppercase select-none">SORT BY</span>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'natural', label: '#' },
                { type: 'most_sung', label: 'Most sung' },
                { type: 'least_sung', label: 'Least sung' },
                { type: 'most_overdue', label: 'Most overdue' },
                { type: 'most_recent', label: 'Most recent' },
                { type: 'name', label: 'Name' }
              ].map(item => {
                const isActive = sort === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => setSort(item.type as any)}
                    className={`svc-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-none ${
                      isActive 
                        ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white shadow-sm' 
                        : 'bg-white text-gray-600 dark:bg-[#202020] dark:text-gray-300 border border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#2b2b2b]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend panel */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] font-medium text-gray-500 dark:text-gray-400 pt-2 select-none">
            <button 
              onClick={() => setFrequencyFilter(frequencyFilter === 'Never' ? 'All' : 'Never')}
              className={`svc-btn flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0 text-[11px] font-medium transition-all ${
                frequencyFilter === 'Never' 
                  ? 'text-black dark:text-white font-bold scale-105' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              } ${frequencyFilter !== 'All' && frequencyFilter !== 'Never' ? 'opacity-40' : 'opacity-100'}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full bg-[#ef4444] transition-transform ${frequencyFilter === 'Never' ? 'ring-2 ring-red-500/50 scale-110' : ''}`} />
              <span>Never sung (0x)</span>
            </button>
            <button 
              onClick={() => setFrequencyFilter(frequencyFilter === 'Rare' ? 'All' : 'Rare')}
              className={`svc-btn flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0 text-[11px] font-medium transition-all ${
                frequencyFilter === 'Rare' 
                  ? 'text-black dark:text-white font-bold scale-105' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              } ${frequencyFilter !== 'All' && frequencyFilter !== 'Rare' ? 'opacity-40' : 'opacity-100'}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full bg-[#f59e0b] transition-transform ${frequencyFilter === 'Rare' ? 'ring-2 ring-amber-500/50 scale-110' : ''}`} />
              <span>Rarely (1-2x)</span>
            </button>
            <button 
              onClick={() => setFrequencyFilter(frequencyFilter === 'Occasional' ? 'All' : 'Occasional')}
              className={`svc-btn flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0 text-[11px] font-medium transition-all ${
                frequencyFilter === 'Occasional' 
                  ? 'text-black dark:text-white font-bold scale-105' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              } ${frequencyFilter !== 'All' && frequencyFilter !== 'Occasional' ? 'opacity-40' : 'opacity-100'}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full bg-[#10b981] transition-transform ${frequencyFilter === 'Occasional' ? 'ring-2 ring-emerald-500/50 scale-110' : ''}`} />
              <span>Occasionally (3-5x)</span>
            </button>
            <button 
              onClick={() => setFrequencyFilter(frequencyFilter === 'Frequent' ? 'All' : 'Frequent')}
              className={`svc-btn flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0 text-[11px] font-medium transition-all ${
                frequencyFilter === 'Frequent' 
                  ? 'text-black dark:text-white font-bold scale-105' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              } ${frequencyFilter !== 'All' && frequencyFilter !== 'Frequent' ? 'opacity-40' : 'opacity-100'}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full bg-[#3b82f6] transition-transform ${frequencyFilter === 'Frequent' ? 'ring-2 ring-blue-500/50 scale-110' : ''}`} />
              <span>Frequently (6+x)</span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
              <span>Latest date (dark chip)</span>
            </div>
            <div className="text-gray-400 dark:text-gray-500 border-l border-gray-200 dark:border-gray-800 pl-4 font-bold">
              Bold name = sung 6+ times
            </div>
          </div>
        </div>

        {/* Songs List */}
        {processedSongs.length > 0 ? (
          <div className="space-y-3">
            {processedSongs.map((song, index) => {
              const count = getSungCount(song);
              const isBold = count >= 6;
              const hasHistory = song.history && song.history.length > 0;
              
              return (
                <div 
                  key={song.id}
                  className="bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#2d2d2d] rounded-xl p-4 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Index or status indicator dot */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 w-5 text-right select-none">
                        {index + 1}
                      </span>
                      <span className={`w-3.5 h-3.5 rounded-full ${getDotColor(count)} shadow-inner shrink-0`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className={`text-[15px] text-black dark:text-white m-0 leading-tight ${isBold ? 'font-black' : 'font-normal'}`}>
                        {song.title}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-0 font-medium">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  {/* Metadata and history dates */}
                  <div className="flex flex-col md:items-end gap-2.5 shrink-0 ml-7 md:ml-0">
                    <div className="flex items-center gap-2">
                      {/* Category Badge */}
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#282828] text-gray-500 dark:text-gray-400">
                        {song.category}
                      </span>

                      {/* Frequency Badge */}
                      <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md border ${getCountBadgeColor(count)}`}>
                        {count} times
                      </span>
                    </div>

                    {/* Date history list */}
                    {hasHistory ? (
                      <div className="flex flex-wrap md:justify-end gap-1.5 max-w-sm md:max-w-md">
                        {song.history!.map((h, i) => {
                          const isLatest = i === 0;
                          return (
                            <span 
                              key={h.id}
                              className={`px-2 py-0.5 text-[10px] rounded-md font-medium tracking-wide flex items-center gap-1 transition-colors ${
                                isLatest 
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-bold' 
                                  : 'bg-gray-100 text-gray-600 dark:bg-[#282828] dark:text-gray-400 border border-gray-200 dark:border-gray-800'
                              }`}
                            >
                              {isLatest && <Clock size={10} weight="bold" />}
                              {formatDate(h.sungAt)}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 italic select-none">
                        No sung history recorded
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#2d2d2d] rounded-2xl shadow-sm">
            <ListDashes className="text-6xl text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1 border-none m-0">No matching songs found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md m-0">
              Try adjusting your query, category filter, or frequency level.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
