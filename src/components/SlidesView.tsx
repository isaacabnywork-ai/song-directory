'use client';
import { useState } from 'react';
import { Song } from '@/types';
import { ArrowLeft, Minus, Plus, TextAa, PencilSimple, CaretLeft, CaretRight } from '@phosphor-icons/react';

interface SlidesViewProps {
  songs: Song[];
  onClose: () => void;
}

export default function SlidesView({ songs, onClose }: SlidesViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [showChords, setShowChords] = useState(true);

  if (songs.length === 0) return null;

  const song = songs[currentIndex];

  const renderLyrics = () => {
    const text = song.lyrics || "Lyrics haven't been added yet.";
    const lines = text.split('\n');
    
    return lines.map((line, lineIdx) => {
      if (!line.trim()) {
        return <div key={lineIdx} className="h-6"></div>;
      }

      const parts = line.split(/(\[[^\]]+\])/);
      let ch = '';
      
      return (
        <div key={lineIdx} className="flex flex-wrap items-end mb-1 md:mb-2">
          {parts.map((part, partIdx) => {
            if (part.startsWith('[')) {
              const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
              ch = part.slice(1, -1).replace(/([A-G][#b]?)/g, (m) => {
                let b = m;
                if (b === 'Bb') b = 'A#';
                if (b === 'Eb') b = 'D#';
                if (b === 'Ab') b = 'G#';
                if (b === 'Db') b = 'C#';
                if (b === 'Gb') b = 'F#';
                const i = notes.indexOf(b);
                if (i === -1) return m;
                return notes[(i + transpose + 12) % 12];
              });
              return null;
            } else if (part.length > 0 || ch) {
              const currentCh = ch;
              ch = '';
              return (
                <div key={partIdx} className="inline-flex flex-col">
                  <span className={`chord text-[#2684FF] dark:text-[#5e9eff] font-bold text-[0.8em] font-sans h-[1.3em] leading-none select-none ${showChords ? '' : 'hidden'}`}>
                    {currentCh}
                  </span>
                  <span className="leading-normal whitespace-pre-wrap break-words">{part || ''}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    });
  };

  return (
    <main className="view-section active-view fixed inset-0 z-[100] bg-white dark:bg-[#191919] text-[#37352f] dark:text-white flex-col overflow-y-auto" style={{ display: 'flex' }}>
      {/* Presentation Top Toolbar */}
      <div className="sticky top-0 left-0 right-0 bg-white/90 dark:bg-[#191919]/90 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-[#373737] flex flex-wrap justify-between items-center gap-4 z-50">
        <button 
          onClick={onClose}
          className="svc-btn flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white border-none bg-transparent p-0"
        >
          <ArrowLeft weight="bold" className="mr-2" /> <span className="font-medium">Exit Presentation</span>
        </button>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#f1f1ef] dark:bg-[#2b2b2b] rounded p-0.5">
            <button onClick={() => setTranspose(t => t - 1)} className="svc-btn px-2 py-1 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-[#373737] border-none bg-transparent"><Minus weight="bold" /></button>
            <span className="text-xs font-semibold px-2 w-16 text-center text-[#37352f] dark:text-white">Key: {transpose > 0 ? `+${transpose}` : transpose}</span>
            <button onClick={() => setTranspose(t => t + 1)} className="svc-btn px-2 py-1 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-[#373737] border-none bg-transparent"><Plus weight="bold" /></button>
          </div>

          <div className="flex items-center bg-[#f1f1ef] dark:bg-[#2b2b2b] rounded p-0.5">
            <button onClick={() => setFontSize(f => Math.max(16, f - 2))} className="svc-btn px-2 py-1 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-[#373737] border-none bg-transparent"><TextAa className="text-sm" /></button>
            <button onClick={() => setFontSize(f => Math.min(72, f + 2))} className="svc-btn px-2 py-1 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-[#373737] border-none bg-transparent"><TextAa className="text-lg" /></button>
          </div>

          <button 
            onClick={() => setShowChords(!showChords)}
            className="svc-btn px-3 py-1.5 bg-[#e8f3ff] text-[#0b5cff] dark:bg-[rgba(38,132,255,0.15)] dark:text-[#5e9eff] text-xs font-semibold rounded border-none"
          >
            {showChords ? 'Hide Chords' : 'Show Chords'}
          </button>

          <button className="svc-btn px-3 py-1.5 bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#37352f] dark:text-white text-xs font-semibold rounded hover:bg-gray-200 dark:hover:bg-[#373737] flex items-center justify-center gap-1 border-none">
            <PencilSimple weight="fill" /> <span>Edit</span>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 pt-10 pb-32 relative text-left">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-black dark:text-white tracking-tight">{song.title}</h1>
        <div className="text-[#37352f] dark:text-[rgba(255,255,255,0.9)] font-sans transition-opacity duration-200 md:columns-2 md:gap-12" style={{ fontSize: `${fontSize}px` }}>
          {renderLyrics()}
        </div>
      </div>
      
      {/* Presentation Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#191919]/90 backdrop-blur-md border-t border-gray-200 dark:border-[#373737] p-4 flex justify-between items-center z-50">
        <button 
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="svc-btn flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#2b2b2b] hover:bg-gray-200 dark:hover:bg-[#373737] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border-none text-black dark:text-white"
        >
          <CaretLeft weight="bold" /> <span className="font-medium">Prev Song</span>
        </button>
        
        <div className="text-gray-500 font-mono text-sm tracking-widest font-bold">
          {currentIndex + 1} / {songs.length}
        </div>
        
        <button 
          onClick={() => setCurrentIndex(i => Math.min(songs.length - 1, i + 1))}
          disabled={currentIndex === songs.length - 1}
          className="svc-btn flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#2b2b2b] hover:bg-gray-200 dark:hover:bg-[#373737] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border-none text-black dark:text-white"
        >
          <span className="font-medium">Next Song</span> <CaretRight weight="bold" />
        </button>
      </div>
    </main>
  );
}
