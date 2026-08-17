'use client';
import React, { useState, useRef } from 'react';
import { Song } from '@/types';
import { useAdmin } from '@/context/AdminContext';
import { 
  ArrowLeft, Minus, Plus, TextAa, PencilSimple, 
  CalendarPlus, CheckCircle, UploadSimple, DownloadSimple, MusicNote, Trash, Printer, 
  CaretLeft, CaretRight, Play, CornersOut, CornersIn, CalendarBlank, X, Clock
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
  isSunday?: boolean;
  onPresentSetlist?: () => void;
}

export default function SongView({ song, onBack, onAddToSunday, onUpdate, onDelete, onNext, onPrev, hasNext, hasPrev, isSunday, onPresentSetlist }: SongViewProps) {
  const { isAdmin } = useAdmin();
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [showChords, setShowChords] = useState(true);
  const [twoColumns, setTwoColumns] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editBlocks, setEditBlocks] = useState<{id: string, type: string, content: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const parseToBlocks = (text: string) => {
    const stanzas = text.replace(/\r\n/g, '\n').split(/\n{2,}/);
    return stanzas.map((stanza) => {
      if (!stanza.trim()) return null;
      const lines = stanza.split('\n');
      let type = 'Verse';
      let content = stanza;
      
      const firstLine = lines[0].trim();
      if (firstLine.indexOf('[') === -1 && 
         (firstLine.endsWith(':') || /^(Chorus|Verse|Bridge|Pre-Chorus|Intro|Outro|Tag|Ending|Interlude)/i.test(firstLine))) {
        
        const match = firstLine.match(/^(Chorus|Verse|Bridge|Pre-Chorus|Intro|Outro|Tag|Ending|Interlude)/i);
        if (match) {
          type = match[0];
          type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        } else {
          type = firstLine.replace(':', '');
        }
        content = lines.slice(1).join('\n');
      }
      
      return { id: Math.random().toString(), type, content };
    }).filter(Boolean) as {id: string, type: string, content: string}[];
  };

  const serializeBlocks = (blocks: {id: string, type: string, content: string}[]) => {
    let verseCount = 1;
    return blocks.map(b => {
      let label = b.type;
      if (b.type === 'Verse') {
        label = `Verse ${verseCount++}`;
      }
      return `${label}:\n${b.content.trim()}`;
    }).join('\n\n');
  };
  
  // Autoplay state
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [scrollSpeed] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  React.useEffect(() => {
    let animationFrameId: number;
    const scrollLoop = () => {
      if (isAutoPlaying) {
        window.scrollBy(0, scrollSpeed * 0.1);
        animationFrameId = requestAnimationFrame(scrollLoop);
      }
    };

    if (isAutoPlaying) {
      animationFrameId = requestAnimationFrame(scrollLoop);
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  }, [isAutoPlaying, scrollSpeed]);

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

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(err => {
          console.error(`Error attempting to exit full-screen mode: ${err.message}`);
        });
      }
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveLyrics = async () => {
    try {
      const newLyrics = serializeBlocks(editBlocks);
      const res = await fetch(`/api/songs/${song.id}`, {
        method: 'PUT',
        body: JSON.stringify({ lyrics: newLyrics }),
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

  // Mark as sung modal state
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markDate, setMarkDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isMarking, setIsMarking] = useState(false);

  // Compute last Sunday
  const getLastSunday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? 7 : day;
    d.setDate(d.getDate() - diff);
    return d.toISOString().split('T')[0];
  };

  const getPreviousSunday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (day === 0 ? 7 : day) + 7;
    d.setDate(d.getDate() - diff);
    return d.toISOString().split('T')[0];
  };

  const handleConfirmMarkAsSung = async () => {
    if (!markDate) return;
    setIsMarking(true);
    try {
      const res = await fetch(`/api/history`, {
        method: 'POST',
        body: JSON.stringify({ 
          songId: song.id, 
          sungAt: new Date(markDate + 'T10:00:00').toISOString() 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        setShowMarkModal(false);
        showToast(`Marked as sung on ${new Date(markDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}!`, 'success');
      } else {
        showToast('Failed to mark as sung', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to mark as sung', 'error');
    } finally {
      setIsMarking(false);
    }
  };

  const handleDeleteHistoryItem = async (historyId: number) => {
    try {
      const res = await fetch(`/api/history?historyId=${historyId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.song) {
          onUpdate(data.song);
          showToast('History date removed', 'success');
        }
      } else {
        showToast('Failed to delete history record', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to delete history record', 'error');
    }
  };

  const handleAddToSunday = async () => {
    try {
      await onAddToSunday();
      showToast('Added to Sunday Setlist', 'success');
    } catch {
      showToast('Failed to add to setlist', 'error');
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

  const handleCopySong = () => {
    let cleanText = "";
    if (song.lyrics) {
      cleanText = showChords ? song.lyrics.replace(/\[/g, '(').replace(/\]/g, ') ') : song.lyrics.replace(/\[[^\]]+\]/g, '');
    }
    navigator.clipboard.writeText(`${song.title}\n${song.artist}\n\n${cleanText}`);
    alert('Copied to clipboard');
  };

  const handleDownloadWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const content = document.getElementById("lyrics-content")?.innerHTML || "";
    const sourceHTML = header + `<h1>${song.title}</h1><h3>${song.artist}</h3>` + content + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${song.title}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const renderLyrics = () => {
    const text = song.lyrics || "Lyrics haven't been added yet.\nClick 'Edit' to add them using [C]ChordPro format.";
    const stanzas = text.replace(/\r\n/g, '\n').split(/\n{2,}/);
    
    return stanzas.map((stanza, stanzaIdx) => {
      if (!stanza.trim()) return null;

      const lines = stanza.split('\n');

      return (
        <div key={stanzaIdx} className={`mb-6 flex gap-4 break-inside-avoid`}>
          <div className="flex-1">
            {lines.map((line, lineIdx) => {
              if (!line.trim() && lines.length > 1) return <div key={lineIdx} className="h-4"></div>;

              const isLabelLine = line.indexOf('[') === -1 && 
                (line.trim().endsWith(':') || 
                 /^(Chorus|Verse|Bridge|Pre-Chorus|Intro|Outro|Tag|Ending|Interlude)/i.test(line.trim()));

              const parts = line.split(/(\[[^\]]+\])/);

              return (
                <div key={lineIdx} className={`mb-1 md:mb-2 leading-relaxed ${isLabelLine ? 'font-bold text-[#2684FF] dark:text-[#5e9eff] mt-2 mb-1' : ''}`}>
                  {parts.map((part, partIdx) => {
                    if (part.startsWith('[')) {
                      const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                      const ch = part.slice(1, -1).replace(/([A-G][#b]?)/g, (m) => {
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
                      return (
                        <span key={partIdx} className={`chord text-[#2684FF] dark:text-[#5e9eff] font-bold text-[0.9em] mx-1 select-none ${showChords ? '' : 'hidden'}`}>
                          ({ch})
                        </span>
                      );
                    } else if (part.length > 0) {
                      return (
                        <span key={partIdx} className="whitespace-pre-wrap break-words">{part}</span>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <main className="view-section active-view overflow-y-auto bg-white dark:bg-[#191919] pb-20 print:pb-0 print:bg-white print:text-black">
      <div className="max-w-5xl mx-auto px-6 pt-10 print:pt-0 print:px-0">
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
          
          <div className="flex items-center gap-2 print:hidden">
            {isSunday && onPresentSetlist && (
              <button 
                onClick={onPresentSetlist}
                className="svc-btn px-4 py-1.5 bg-blue-500 text-white font-bold rounded shadow-sm hover:bg-blue-600 flex items-center justify-center gap-2 border-none"
              >
                <Play weight="fill" className="text-sm" /> <span>Present</span>
              </button>
            )}
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
                onClick={toggleFullscreen}
                className="svc-btn px-3 py-1.5 bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#37352f] dark:text-white text-xs font-semibold rounded hover:bg-gray-200 dark:hover:bg-[#373737] flex items-center justify-center gap-1 border-none"
              >
                {isFullscreen ? <><CornersIn weight="bold" /> <span>Exit Fullscreen</span></> : <><CornersOut weight="bold" /> <span>Fullscreen</span></>}
              </button>

              {isAdmin && (
                <>
                  <button 
                    onClick={() => {
                      setIsEditing(true);
                      const blocks = parseToBlocks(song.lyrics || '');
                      if (blocks.length === 0) {
                        blocks.push({ id: Math.random().toString(), type: 'Verse', content: '' });
                      }
                      setEditBlocks(blocks);
                    }}
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
                </>
              )}
            </div>
          )}
          {isEditing && (
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => { setIsEditing(false); setEditBlocks([]); }}
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
                {isAdmin && (
                  <button 
                    onClick={handleEditTitle} 
                    className="svc-btn p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white bg-transparent border-none rounded print:hidden"
                    title="Edit Title"
                  >
                    <PencilSimple weight="bold" className="text-xl md:text-2xl" />
                  </button>
                )}
              </h1>
              <p className="text-base text-gray-500 font-medium flex items-center gap-2 m-0 mt-2 print:text-gray-700">
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 dark:bg-[#2b2b2b] rounded text-gray-600 dark:text-gray-300 print:hidden">
                  Sung: {song.sungCount} times
                </span>
              </p>
            </div>

            {isAdmin && (
              <div className="flex flex-col gap-2 shrink-0 print:hidden">
                <button 
                  onClick={handleAddToSunday}
                  className="svc-btn px-3 py-1.5 bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#37352f] dark:text-white font-medium rounded hover:bg-gray-200 dark:hover:bg-[#373737] flex items-center justify-center gap-1.5 text-sm border-none w-full"
                >
                  <CalendarPlus weight="bold" className="text-base text-[#2684FF] dark:text-[#5e9eff]" /> <span>{isSunday ? 'Added to Sunday' : 'Add to Sunday'}</span>
                </button>
                <button 
                  onClick={() => {
                    setMarkDate(new Date().toISOString().split('T')[0]);
                    setShowMarkModal(true);
                  }}
                  className="svc-btn px-3 py-1.5 bg-green-50 dark:bg-[rgba(34,197,94,0.1)] text-green-600 dark:text-green-400 font-medium rounded hover:bg-green-100 dark:hover:bg-[rgba(34,197,94,0.2)] flex items-center justify-center gap-1.5 text-sm border-none w-full"
                >
                  <CalendarBlank weight="bold" className="text-base" /> <span>Mark as Sung</span>
                </button>
                
                {song.history && song.history.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 dark:bg-[#1f1f1f] p-2.5 rounded-xl border border-gray-200 dark:border-[#2d2d2d] max-h-36 overflow-y-auto">
                    <div className="font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                      <span>Sung History ({song.history.length}x):</span>
                    </div>
                    <div className="space-y-1">
                      {song.history.map(h => (
                        <div key={h.id} className="flex items-center justify-between text-[11px] py-0.5 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-[#282828] last:border-none">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(h.sungAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <button
                            onClick={() => handleDeleteHistoryItem(h.id)}
                            className="text-red-400 hover:text-red-600 p-0.5"
                            title="Delete this date"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
              {isAdmin && (
                <>
                  <input type="file" accept="audio/*" ref={fileInputRef} className="hidden" onChange={handleUploadAudio} />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="svc-btn text-xs px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-[rgba(38,132,255,0.15)] dark:text-[#5e9eff] rounded hover:bg-blue-100 flex items-center gap-1 border-none"
                  >
                    <UploadSimple weight="bold" /> {isUploading ? 'Uploading...' : (song.audioUrl ? 'Replace Audio' : 'Upload Audio')}
                  </button>
                </>
              )}
            </div>
          </div>
          {song.audioUrl ? (
            <audio src={song.audioUrl} controls className="w-full mt-2 outline-none h-10" />
          ) : (
            <p className="text-xs text-gray-400 m-0">No audio track uploaded yet.</p>
          )}
        </div>

        <div className="flex flex-wrap justify-between items-center mb-4 gap-2 print:hidden">
          <h2 className="text-lg font-bold text-[#37352f] dark:text-white">Lyrics</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopySong}
              className="svc-btn text-xs px-2 py-1 bg-transparent text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1 border border-gray-200 dark:border-[#373737] rounded"
            >
              Copy
            </button>
            <button 
              onClick={handleDownloadWord}
              className="svc-btn text-xs px-2 py-1 bg-transparent text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1 border border-gray-200 dark:border-[#373737] rounded"
            >
              Word
            </button>
            <button 
              onClick={handlePrintLyrics}
              className="svc-btn text-xs px-2 py-1 bg-transparent text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1 border border-gray-200 dark:border-[#373737] rounded"
            >
              <Printer weight="bold" /> PDF
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-4 print:hidden">
            {editBlocks.map((block, idx) => (
              <div key={block.id} className="bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#373737] rounded-lg p-4 relative focus-within:border-[#2684FF] transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <select
                    value={block.type}
                    onChange={(e) => {
                      const newBlocks = [...editBlocks];
                      newBlocks[idx].type = e.target.value;
                      setEditBlocks(newBlocks);
                    }}
                    className="bg-[#f1f1ef] dark:bg-[#2b2b2b] text-sm font-bold text-gray-700 dark:text-gray-300 rounded px-2 py-1 outline-none border-none cursor-pointer"
                  >
                    <option value="Verse">Verse</option>
                    <option value="Chorus">Chorus</option>
                    <option value="Bridge">Bridge</option>
                    <option value="Pre-Chorus">Pre-Chorus</option>
                    <option value="Intro">Intro</option>
                    <option value="Outro">Outro</option>
                    <option value="Tag">Tag</option>
                    <option value="Ending">Ending</option>
                  </select>
                  <button 
                    onClick={() => {
                      const newBlocks = [...editBlocks];
                      newBlocks.splice(idx, 1);
                      setEditBlocks(newBlocks);
                    }}
                    className="text-gray-400 hover:text-red-500 bg-transparent border-none p-1 cursor-pointer"
                  >
                    <Trash weight="bold" />
                  </button>
                </div>
                <textarea
                  value={block.content}
                  onChange={(e) => {
                    const newBlocks = [...editBlocks];
                    newBlocks[idx].content = e.target.value;
                    setEditBlocks(newBlocks);
                  }}
                  className="w-full min-h-[100px] text-base bg-transparent text-[#37352f] dark:text-white font-mono outline-none resize-y leading-relaxed"
                  placeholder={`Type ${block.type.toLowerCase()} lyrics here. Use [C]Chord format.`}
                />
              </div>
            ))}
            
            <div className="flex flex-wrap gap-2 mt-2">
              <button 
                onClick={() => setEditBlocks([...editBlocks, { id: Math.random().toString(), type: 'Verse', content: '' }])}
                className="px-4 py-2 bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#37352f] dark:text-white font-semibold rounded hover:bg-gray-200 dark:hover:bg-[#373737] flex items-center justify-center gap-2 border-none text-sm cursor-pointer"
              >
                <Plus weight="bold" /> Add Verse
              </button>
              <button 
                onClick={() => setEditBlocks([...editBlocks, { id: Math.random().toString(), type: 'Chorus', content: '' }])}
                className="px-4 py-2 bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#37352f] dark:text-white font-semibold rounded hover:bg-gray-200 dark:hover:bg-[#373737] flex items-center justify-center gap-2 border-none text-sm cursor-pointer"
              >
                <Plus weight="bold" /> Add Chorus
              </button>
              <button 
                onClick={() => setEditBlocks([...editBlocks, { id: Math.random().toString(), type: 'Bridge', content: '' }])}
                className="px-4 py-2 bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#37352f] dark:text-white font-semibold rounded hover:bg-gray-200 dark:hover:bg-[#373737] flex items-center justify-center gap-2 border-none text-sm cursor-pointer"
              >
                <Plus weight="bold" /> Add Bridge
              </button>
            </div>
          </div>
        ) : (
          <div 
            id="lyrics-content"
            ref={containerRef}
            className={`text-[#37352f] dark:text-[rgba(255,255,255,0.9)] font-sans print:text-black print:dark:text-black cursor-pointer ${twoColumns ? 'md:columns-2 md:gap-12 md:[column-rule:1px_solid_#e5e7eb] dark:md:[column-rule:1px_solid_#374151]' : ''} ${isFullscreen ? 'bg-white dark:bg-[#191919] p-8 md:p-16 h-screen overflow-y-auto' : ''}`} 
            style={{ fontSize: `${fontSize}px` }}
            onClick={() => setIsAutoPlaying(prev => !prev)}
            title="Click to toggle autoplay"
          >
            {renderLyrics()}
          </div>
        )}
      </div>

      {/* Mark As Sung Date Picker Modal */}
      {showMarkModal && (
        <div 
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowMarkModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#202020] rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-[#333] animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#333] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <CalendarBlank weight="fill" className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight m-0">
                    Mark as Sung
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px] m-0">
                    {song.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowMarkModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c]"
              >
                <X className="text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Select Service Date
                </label>
                <input 
                  type="date"
                  value={markDate}
                  onChange={(e) => setMarkDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-[#181818] border border-gray-300 dark:border-[#3a3a3a] text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-inner"
                />
              </div>

              {/* Quick Date Presets */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                  Quick Pick:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMarkDate(new Date().toISOString().split('T')[0])}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      markDate === new Date().toISOString().split('T')[0]
                        ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                        : 'bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarkDate(getLastSunday())}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      markDate === getLastSunday()
                        ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                        : 'bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Last Sunday
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarkDate(getPreviousSunday())}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      markDate === getPreviousSunday()
                        ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                        : 'bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    2 Wks Ago
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-[#333]">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-[#3a3a3a] text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMarkAsSung}
                  disabled={isMarking || !markDate}
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle weight="bold" className="text-lg" />
                  <span>{isMarking ? 'Saving...' : 'Confirm & Record'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium transition-all duration-300 ${toast.type === 'success' ? 'bg-[#22c55e] text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle weight="fill" className="text-lg" /> : <div className="font-bold">!</div>}
          {toast.message}
        </div>
      )}
    </main>
  );
}
