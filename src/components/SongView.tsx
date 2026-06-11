'use client';
import React, { useState, useRef } from 'react';
import { Song } from '@/types';
import { 
  ArrowLeft, Minus, Plus, TextAa, PencilSimple, 
  CalendarPlus, User, CheckCircle, UploadSimple, DownloadSimple, MusicNote, Trash, Printer, CaretLeft, CaretRight, Play, Pause, Gauge
} from '@phosphor-icons/react';

interface SongViewProps {
  song: Song;
  onBack: () => void;
  onAddToSunday: () => void;
  onUpdate: (updatedSong: Song) => void;
  onDelete: (id: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function SongView({ song, onBack, onAddToSunday, onUpdate, onDelete, onNext, onPrev, hasNext, hasPrev }: SongViewProps) {
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [showChords, setShowChords] = useState(true);
  const [twoColumns, setTwoColumns] = useState(true);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editLyrics, setEditLyrics] = useState(song.lyrics || '');
  const [isUploading, setIsUploading] = useState(false);
  
  // Autoplay state
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const requestRef = useRef<number | null>(null);

  const scrollLoop = React.useCallback(() => {
    if (isAutoPlaying) {
      window.scrollBy(0, scrollSpeed * 0.1);
      requestRef.current = requestAnimationFrame(scrollLoop);
    }
  }, [isAutoPlaying, scrollSpeed]);

  React.useEffect(() => {
    if (isAutoPlaying) {
      requestRef.current = requestAnimationFrame(scrollLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, [isAutoPlaying, scrollLoop]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsAutoPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveLyrics = async () => {
    try {
      const res = await fetch(`/api/songs/${song.id}`, {
        method: 'PUT',
        body: JSON.stringify({ lyrics: editLyrics }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save lyrics');
    }
  };

  const handleMarkAsSung = async () => {
    try {
      const newCount = song.sungCount + 1;
      const res = await fetch(`/api/songs/${song.id}`, {
        method: 'PUT',
        body: JSON.stringify({ sungCount: newCount }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to mark as sung');
    }
  };

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      
      const { url } = await uploadRes.json();
      
      // Update song with new audioUrl
      const updateRes = await fetch(`/api/songs/${song.id}`, {
        method: 'PUT',
        body: JSON.stringify({ audioUrl: url }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (updateRes.ok) {
        const updated = await updateRes.json();
        onUpdate(updated);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to upload audio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSong = async () => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    try {
      const res = await fetch(`/api/songs/${song.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(song.id);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete song');
    }
  };

  const handleEditTitle = async () => {
    const newTitle = prompt('Enter new song title:', song.title);
    if (newTitle && newTitle.trim() !== song.title) {
      try {
        const res = await fetch(`/api/songs/${song.id}`, {
          method: 'PUT',
          body: JSON.stringify({ title: newTitle.trim() }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const updated = await res.json();
          onUpdate(updated);
        }
      } catch (e) {
        console.error(e);
        alert('Failed to update title');
      }
    }
  };

  const handlePrintLyrics = () => {
    window.print();
  };

  const renderLyrics = () => {
    const text = song.lyrics || "Lyrics haven't been added yet.\nClick 'Edit' to add them using [C]ChordPro format.";
    const lines = text.split('\n');
    
    return lines.map((line, lineIdx) => {
      if (!line.trim()) {
        return <div key={lineIdx} className="h-6"></div>;
      }

      const parts = line.split(/(\[[^\]]+\])/);
      let ch = '';
      
      return (
        <div key={lineIdx} className="flex flex-wrap items-end mb-1 md:mb-2 break-inside-avoid">
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
                  <span className="leading-normal whitespace-pre">{part || ''}</span>
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
    <main className="view-section active-view overflow-y-auto bg-white dark:bg-[#191919] pb-20 print:pb-0 print:bg-white print:text-black">
      <div className="max-w-3xl mx-auto px-6 pt-10 print:pt-0 print:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="svc-btn flex items-center justify-start gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white font-medium border-none bg-transparent p-0"
            >
              <ArrowLeft weight="bold" /> <span>Back</span>
            </button>
            <div className="flex items-center gap-1 bg-[#f1f1ef] dark:bg-[#2b2b2b] rounded-lg p-0.5">
              <button 
                onClick={onPrev} 
                disabled={!hasPrev}
                className={`svc-btn p-1 rounded text-gray-500 dark:text-gray-400 border-none bg-transparent flex items-center justify-center ${hasPrev ? 'hover:bg-gray-200 dark:hover:bg-[#373737] hover:text-black dark:hover:text-white' : 'opacity-30 cursor-not-allowed'}`}
                title="Previous Song"
              >
                <CaretLeft weight="bold" className="text-lg" />
              </button>
              <button 
                onClick={onNext} 
                disabled={!hasNext}
                className={`svc-btn p-1 rounded text-gray-500 dark:text-gray-400 border-none bg-transparent flex items-center justify-center ${hasNext ? 'hover:bg-gray-200 dark:hover:bg-[#373737] hover:text-black dark:hover:text-white' : 'opacity-30 cursor-not-allowed'}`}
                title="Next Song"
              >
                <CaretRight weight="bold" className="text-lg" />
              </button>
            </div>
          </div>

          {!isEditing && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-[#f1f1ef] dark:bg-[#2b2b2b] rounded p-0.5">
                <button onClick={() => setTranspose(t => t - 1)} className="svc-btn px-2 py-1 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-[#373737] border-none bg-transparent"><Minus weight="bold" /></button>
                <span className="text-xs font-semibold px-2 w-16 text-center text-[#37352f] dark:text-white">Key: {transpose > 0 ? `+${transpose}` : transpose}</span>
                <button onClick={() => setTranspose(t => t + 1)} className="svc-btn px-2 py-1 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-[#373737] border-none bg-transparent"><Plus weight="bold" /></button>
              </div>

              <div className="flex items-center bg-[#f1f1ef] dark:bg-[#2b2b2b] rounded p-0.5">
                <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className="svc-btn px-2 py-1 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-[#373737] border-none bg-transparent"><TextAa className="text-sm" /></button>
                <button onClick={() => setFontSize(f => Math.min(48, f + 2))} className="svc-btn px-2 py-1 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-[#373737] border-none bg-transparent"><TextAa className="text-lg" /></button>
              </div>



              <button 
                onClick={() => setShowChords(!showChords)}
                className="svc-btn px-3 py-1.5 bg-[#e8f3ff] text-[#0b5cff] dark:bg-[rgba(38,132,255,0.15)] dark:text-[#5e9eff] text-xs font-semibold rounded border-none"
              >
                {showChords ? 'Hide Chords' : 'Show Chords'}
              </button>

              <button 
                onClick={() => setTwoColumns(!twoColumns)}
                className="svc-btn px-3 py-1.5 bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#37352f] dark:text-white text-xs font-semibold rounded hover:bg-gray-200 dark:hover:bg-[#373737] border-none"
              >
                {twoColumns ? 'Single Column' : 'Two Columns'}
              </button>

              <button 
                onClick={() => setIsEditing(true)}
                className="svc-btn px-3 py-1.5 bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#37352f] dark:text-white text-xs font-semibold rounded hover:bg-gray-200 dark:hover:bg-[#373737] flex items-center justify-center gap-1 border-none"
              >
                <PencilSimple weight="fill" /> <span>Edit</span>
              </button>
              <button 
                onClick={handleDeleteSong}
                className="svc-btn px-3 py-1.5 bg-red-50 text-red-600 dark:bg-[rgba(239,68,68,0.1)] dark:text-red-400 text-xs font-semibold rounded hover:bg-red-100 dark:hover:bg-[rgba(239,68,68,0.2)] flex items-center justify-center gap-1 border-none"
              >
                <Trash weight="fill" /> <span>Delete</span>
              </button>
            </div>
          )}
          {isEditing && (
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => { setIsEditing(false); setEditLyrics(song.lyrics || ''); }}
                className="svc-btn px-3 py-1.5 bg-gray-200 text-black text-xs font-semibold rounded hover:bg-gray-300 border-none"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveLyrics}
                className="svc-btn px-3 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 border-none"
              >
                Save Lyrics
              </button>
            </div>
          )}
        </div>

        <div className="mb-8 pb-6 border-b border-gray-100 dark:border-[#2b2b2b] print:border-none print:mb-4 print:pb-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#37352f] dark:text-white tracking-tight leading-tight border-none pb-0 m-0 print:text-black flex items-center gap-2">
                {song.title}
                <button 
                  onClick={handleEditTitle} 
                  className="svc-btn p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white bg-transparent border-none rounded print:hidden"
                  title="Edit Title"
                >
                  <PencilSimple weight="bold" className="text-xl md:text-2xl" />
                </button>
              </h1>
              <p className="text-base text-gray-500 font-medium flex items-center gap-2 m-0 mt-2 print:text-gray-700">
                <User weight="fill" /> {song.artist}
                <span className="ml-4 flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 dark:bg-[#2b2b2b] rounded text-gray-600 dark:text-gray-300 print:hidden">
                  Sung: {song.sungCount} times
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0 print:hidden">
              <button 
                onClick={onAddToSunday}
                className="svc-btn px-3 py-1.5 bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#37352f] dark:text-white font-medium rounded hover:bg-gray-200 dark:hover:bg-[#373737] flex items-center justify-center gap-1.5 text-sm border-none w-full"
              >
                <CalendarPlus weight="bold" className="text-base text-[#2684FF] dark:text-[#5e9eff]" /> <span>Add to Sunday</span>
              </button>
              <button 
                onClick={handleMarkAsSung}
                className="svc-btn px-3 py-1.5 bg-green-50 dark:bg-[rgba(34,197,94,0.1)] text-green-600 dark:text-green-400 font-medium rounded hover:bg-green-100 dark:hover:bg-[rgba(34,197,94,0.2)] flex items-center justify-center gap-1.5 text-sm border-none w-full"
              >
                <CheckCircle weight="bold" className="text-base" /> <span>Mark as Sung</span>
              </button>
            </div>
          </div>
        </div>

        {/* Audio Section */}
        <div className="mb-10 p-4 bg-gray-50 dark:bg-[#202020] rounded-xl border border-gray-100 dark:border-[#2b2b2b] print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <MusicNote weight="bold" /> Audio Track
            </h3>
            <div className="flex gap-2">
              {song.audioUrl && (
                <a 
                  href={song.audioUrl} 
                  download 
                  className="svc-btn text-xs px-3 py-1.5 bg-gray-200 dark:bg-[#373737] text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1 border-none no-underline"
                >
                  <DownloadSimple weight="bold" /> Download Audio
                </a>
              )}
              <input type="file" accept="audio/*" ref={fileInputRef} className="hidden" onChange={handleUploadAudio} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="svc-btn text-xs px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-[rgba(38,132,255,0.15)] dark:text-[#5e9eff] rounded hover:bg-blue-100 flex items-center gap-1 border-none"
              >
                <UploadSimple weight="bold" /> {isUploading ? 'Uploading...' : (song.audioUrl ? 'Replace Audio' : 'Upload Audio')}
              </button>
            </div>
          </div>
          {song.audioUrl ? (
            <audio src={song.audioUrl} controls className="w-full mt-2 outline-none h-10" />
          ) : (
            <p className="text-xs text-gray-400 m-0">No audio track uploaded yet.</p>
          )}
        </div>

        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="text-lg font-bold text-[#37352f] dark:text-white">Lyrics</h2>
          <button 
            onClick={handlePrintLyrics}
            className="svc-btn text-xs px-2 py-1 bg-transparent text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1 border border-gray-200 dark:border-[#373737] rounded"
          >
            <Printer weight="bold" /> Print Song
          </button>
        </div>

        {isEditing ? (
          <textarea
            value={editLyrics}
            onChange={(e) => setEditLyrics(e.target.value)}
            className="w-full h-96 p-4 text-base bg-white dark:bg-[#191919] text-[#37352f] dark:text-white font-mono border-2 border-gray-200 dark:border-[#373737] rounded-lg outline-none focus:border-[#2684FF] transition-colors resize-y leading-relaxed print:hidden"
            placeholder="Type lyrics here. Use [C]Chord format for chords."
          />
        ) : (
          <div 
            className={`text-[#37352f] dark:text-[rgba(255,255,255,0.9)] font-sans print:text-black print:dark:text-black cursor-pointer ${twoColumns ? 'md:columns-2 md:gap-12 md:[column-rule:1px_solid_#e5e7eb] dark:md:[column-rule:1px_solid_#374151]' : ''}`} 
            style={{ fontSize: `${fontSize}px` }}
            onClick={() => setIsAutoPlaying(prev => !prev)}
            title="Click to toggle autoplay"
          >
            {renderLyrics()}
          </div>
        )}
      </div>
    </main>
  );
}
