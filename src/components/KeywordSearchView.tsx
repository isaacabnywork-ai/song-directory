'use client';

import React, { useState, useMemo } from 'react';
import { Song } from '@/types';
import { 
  ArrowLeft, MagnifyingGlass, X, Sparkle, 
  CalendarPlus, Check, Funnel, BookOpen, ArrowSquareOut, Fire
} from '@phosphor-icons/react';

interface KeywordSearchViewProps {
  songs: Song[];
  onBack: () => void;
  onSelectSong: (id: number, currentList?: Song[]) => void;
  onAddToSunday: (songId: number) => void;
  sundaySongIds: number[];
}

// Popular worship themes in English & Hindi for fast 1-click discovery
const POPULAR_THEMES = [
  { label: 'Love / प्यार', query: 'love' },
  { label: 'प्रेम (Prem)', query: 'प्रेम' },
  { label: 'Grace / अनुग्रह', query: 'अनुग्रह' },
  { label: 'Praise / स्तुति', query: 'स्तुति' },
  { label: 'Holy / पवित्र', query: 'पवित्र' },
  { label: 'Cross / क्रूस', query: 'क्रूस' },
  { label: 'Peace / शान्ति', query: 'शान्ति' },
  { label: 'Salvation / उद्धार', query: 'उद्धार' },
  { label: 'Joy / आनंद', query: 'आनंद' },
  { label: 'Faith / विश्वास', query: 'विश्वास' },
  { label: 'Light / ज्योति', query: 'ज्योति' },
  { label: 'King / राजा', query: 'राजा' },
  { label: 'Blood / लहू', query: 'लहू' },
  { label: 'Heart / दिल', query: 'दिल' },
  { label: 'Prabhu / प्रभु', query: 'प्रभु' },
];

interface MatchedStanza {
  type: string;
  lines: string[];
  matchCount: number;
}

interface SongMatch {
  song: Song;
  titleMatches: number;
  lyricsMatches: number;
  totalMatches: number;
  stanzas: MatchedStanza[];
}

export default function KeywordSearchView({
  songs,
  onBack,
  onSelectSong,
  onAddToSunday,
  sundaySongIds,
}: KeywordSearchViewProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(songs.map(s => s.category))).sort();
  }, [songs]);

  // Strip chord annotations e.g. [C], [Am7] from text for clean matching
  const stripChords = (text: string) => {
    return text.replace(/\[[^\]]*\]/g, '');
  };

  // Perform search across all songs
  const searchResults = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const lowerQuery = trimmed.toLowerCase();
    const results: SongMatch[] = [];

    // Filter by category first if chosen
    const songsToSearch = selectedCategory === 'All' 
      ? songs 
      : songs.filter(s => s.category === selectedCategory);

    for (const song of songsToSearch) {
      let titleMatches = 0;
      let lyricsMatches = 0;
      const matchedStanzas: MatchedStanza[] = [];

      // 1. Check title
      const cleanTitle = stripChords(song.title);
      const titleLower = cleanTitle.toLowerCase();
      if (titleLower.includes(lowerQuery)) {
        // Count occurrences in title
        let pos = 0;
        while ((pos = titleLower.indexOf(lowerQuery, pos)) !== -1) {
          titleMatches++;
          pos += lowerQuery.length;
        }
      }

      // 2. Check lyrics
      if (song.lyrics) {
        const rawStanzas = song.lyrics.replace(/\r\n/g, '\n').split(/\n{2,}/);

        for (const rawStanza of rawStanzas) {
          if (!rawStanza.trim()) continue;

          const rawLines = rawStanza.split('\n');
          let stanzaType = 'Verse';
          let startIndex = 0;

          const firstLine = rawLines[0].trim();
          if (firstLine.indexOf('[') === -1 && 
             (firstLine.endsWith(':') || /^(Chorus|Verse|Bridge|Pre-Chorus|Intro|Outro|Tag|Ending|Interlude)/i.test(firstLine))) {
            const match = firstLine.match(/^(Chorus|Verse|Bridge|Pre-Chorus|Intro|Outro|Tag|Ending|Interlude)/i);
            stanzaType = match ? match[0] : firstLine.replace(':', '');
            startIndex = 1;
          }

          const stanzaContentLines = rawLines.slice(startIndex);
          const cleanLines = stanzaContentLines.map(l => stripChords(l));
          const matchingLines: string[] = [];
          let stanzaMatchCount = 0;

          cleanLines.forEach(line => {
            const lineLower = line.toLowerCase();
            if (lineLower.includes(lowerQuery)) {
              let pos = 0;
              while ((pos = lineLower.indexOf(lowerQuery, pos)) !== -1) {
                stanzaMatchCount++;
                lyricsMatches++;
                pos += lowerQuery.length;
              }
              matchingLines.push(line);
            }
          });

          if (matchingLines.length > 0) {
            matchedStanzas.push({
              type: stanzaType,
              lines: matchingLines,
              matchCount: stanzaMatchCount
            });
          }
        }
      }

      const totalMatches = titleMatches + lyricsMatches;
      if (totalMatches > 0) {
        results.push({
          song,
          titleMatches,
          lyricsMatches,
          totalMatches,
          stanzas: matchedStanzas
        });
      }
    }

    // Sort by most matches descending, then title ascending
    return results.sort((a, b) => b.totalMatches - a.totalMatches || a.song.title.localeCompare(b.song.title));
  }, [songs, query, selectedCategory]);

  // Total occurrences across all matching songs
  const grandTotalOccurrences = useMemo(() => {
    return searchResults.reduce((acc, curr) => acc + curr.totalMatches, 0);
  }, [searchResults]);

  // Helper to highlight matching text in lines
  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const lowerKeyword = keyword.toLowerCase();
    const lowerText = text.toLowerCase();

    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let matchIdx = lowerText.indexOf(lowerKeyword, lastIdx);

    while (matchIdx !== -1) {
      if (matchIdx > lastIdx) {
        parts.push(text.slice(lastIdx, matchIdx));
      }
      parts.push(
        <mark 
          key={matchIdx} 
          className="bg-amber-300 dark:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-bold px-1 py-0.5 rounded shadow-xs"
        >
          {text.slice(matchIdx, matchIdx + keyword.length)}
        </mark>
      );
      lastIdx = matchIdx + keyword.length;
      matchIdx = lowerText.indexOf(lowerKeyword, lastIdx);
    }

    if (lastIdx < text.length) {
      parts.push(text.slice(lastIdx));
    }

    return parts;
  };

  const handleAddSetlist = (songId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToSunday(songId);
    setAddedIds(prev => ({ ...prev, [songId]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [songId]: false }));
    }, 2500);
  };

  return (
    <main className="view-section active-view overflow-y-auto bg-gray-50 dark:bg-[#0f0f0f] pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="svc-btn mb-6 flex items-center justify-start gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white border-none bg-transparent p-0"
        >
          <ArrowLeft weight="bold" /> <span>Back to Services &amp; Tools</span>
        </button>

        {/* Hero Header */}
        <div 
          className="bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white p-6 sm:p-10 rounded-2xl mb-8 border border-indigo-900/40 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-indigo-400/10 pointer-events-none">
            <Sparkle size={160} weight="fill" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wider uppercase mb-3">
              <Sparkle weight="fill" className="text-amber-400" />
              <span>Worship Lyrics &amp; Theme Finder</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 font-serif">
              Keyword <span className="italic text-amber-300 font-normal">Search</span>
            </h1>
            
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed m-0 font-light">
              Search any word (e.g. <em>love</em>, <em>प्यार</em>, <em>शांति</em>, <em>स्तुति</em>) to instantly see where it is used across all song lyrics and pick the right song for your theme.
            </p>
          </div>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="bg-white dark:bg-[#191919] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm mb-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            
            {/* Search input */}
            <div className="relative flex-1 flex items-center">
              <MagnifyingGlass className="absolute left-4 text-blue-500 text-xl pointer-events-none" weight="bold" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search word in lyrics (e.g. love, दया, क्रूस, peace)..."
                className="w-full h-12 pl-12 pr-10 rounded-xl bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-[#333] focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-black dark:text-white transition-all shadow-inner"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#333]"
                  title="Clear search"
                >
                  <X className="text-lg" />
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="relative w-full sm:w-52 shrink-0">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-12 px-3 rounded-xl bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-[#333] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black dark:text-white cursor-pointer shadow-inner appearance-none pr-8 outline-none"
              >
                <option value="All">All categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <Funnel size={16} />
              </div>
            </div>
          </div>

          {/* Quick theme suggestions pills */}
          <div className="pt-2 border-t border-gray-100 dark:border-[#2d2d2d]">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <Fire className="text-amber-500 text-sm" weight="fill" />
              <span>Popular Worship Themes:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_THEMES.map(theme => {
                const isActive = query.toLowerCase() === theme.query.toLowerCase();
                return (
                  <button
                    key={theme.label}
                    onClick={() => setQuery(theme.query)}
                    className={`svc-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-none flex items-center gap-1 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md scale-105' 
                        : 'bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                    }`}
                  >
                    <span>{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search Results Summary */}
        {query.trim() !== '' && (
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider m-0 border-none pb-0">
              Search Results
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              {searchResults.length} {searchResults.length === 1 ? 'song' : 'songs'} matched · {grandTotalOccurrences} {grandTotalOccurrences === 1 ? 'occurrence' : 'occurrences'}
            </span>
          </div>
        )}

        {/* Results List */}
        {query.trim() === '' ? (
          <div className="bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#2d2d2d] rounded-2xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-500 mx-auto flex items-center justify-center mb-4 text-2xl">
              <BookOpen weight="fill" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 border-none m-0">
              Find Songs by Word or Theme
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              Type any word above or click one of the popular theme buttons like <strong>Love</strong>, <strong>अनुग्रह</strong>, or <strong>स्तुति</strong> to explore all matching lyrics.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_THEMES.slice(0, 6).map(theme => (
                <button
                  key={theme.label}
                  onClick={() => setQuery(theme.query)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-[#252525] text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all border border-gray-200 dark:border-[#333]"
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#2d2d2d] rounded-2xl p-12 text-center shadow-sm">
            <MagnifyingGlass className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1 border-none m-0">
              No matching lyrics found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto m-0">
              No songs contain the word &quot;{query}&quot;{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}. Try another word or switch to All categories.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map(({ song, totalMatches, titleMatches, stanzas }, idx) => {
              const isSunday = sundaySongIds.includes(song.id);
              const isRecentlyAdded = !!addedIds[song.id];

              return (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song.id, searchResults.map(r => r.song))}
                  className="group bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#2d2d2d] hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Song Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-[#282828]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-500 w-6">
                        #{idx + 1}
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2 m-0 leading-tight">
                          <span>{highlightMatch(song.title, query)}</span>
                          <ArrowSquareOut className="text-sm opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#282828] text-gray-600 dark:text-gray-400">
                            {song.category}
                          </span>
                          {song.sungCount > 0 && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                              Sung {song.sungCount}x
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                        {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
                      </span>

                      <button
                        onClick={(e) => handleAddSetlist(song.id, e)}
                        className={`svc-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none flex items-center gap-1.5 ${
                          isSunday || isRecentlyAdded
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                        }`}
                        title="Add to Sunday Setlist"
                      >
                        {isSunday || isRecentlyAdded ? (
                          <>
                            <Check weight="bold" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <CalendarPlus weight="bold" />
                            <span>+ Setlist</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Matching Verses/Snippets */}
                  <div className="mt-3.5 space-y-2.5">
                    {stanzas.map((stanza, sIdx) => (
                      <div 
                        key={sIdx}
                        className="p-3 rounded-xl bg-gray-50/80 dark:bg-[#202020] border border-gray-100 dark:border-[#2b2b2b]"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-blue-600 dark:text-[#5e9eff] uppercase tracking-wider">
                            {stanza.type}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {stanza.matchCount} {stanza.matchCount === 1 ? 'time' : 'times'} in this section
                          </span>
                        </div>
                        <div className="space-y-1">
                          {stanza.lines.map((line, lIdx) => (
                            <p 
                              key={lIdx} 
                              className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans m-0"
                            >
                              {highlightMatch(line, query)}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}

                    {titleMatches > 0 && stanzas.length === 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic m-0 pt-1">
                        Matched in song title. Click to view lyrics.
                      </p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
