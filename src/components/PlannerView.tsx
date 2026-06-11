'use client';
import { Song } from '@/types';
import { ArrowLeft, CalendarStar, PresentationChart, ListPlus, Trash } from '@phosphor-icons/react';

interface PlannerViewProps {
  songs: Song[];
  onBack: () => void;
  onRemove: (id: number) => void;
  onPresent: () => void;
}

export default function PlannerView({ songs, onBack, onRemove, onPresent }: PlannerViewProps) {
  return (
    <main className="view-section active-view overflow-y-auto bg-gray-50 dark:bg-[#0f0f0f] pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <button 
          onClick={onBack}
          className="svc-btn mb-6 flex items-center justify-start gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white border-none bg-transparent p-0"
        >
          <ArrowLeft weight="bold" /> <span>Back to Menu</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3 border-none pb-0 m-0">
              <CalendarStar weight="fill" className="text-blue-500" /> This Sunday&apos;s Songs
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 m-0">Your setlist for the upcoming service.</p>
          </div>
          {songs.length > 0 && (
            <button 
              onClick={onPresent}
              className="svc-btn px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg flex items-center justify-center gap-2 border-none"
            >
              <PresentationChart weight="fill" className="text-xl" /> <span>Present Setlist</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {songs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#191919] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <ListPlus weight="duotone" className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No songs added yet.</p>
            </div>
          ) : (
            songs.map((song, i) => (
              <div key={song.id} className="flex items-center justify-between bg-white dark:bg-[#191919] p-4 rounded-xl border border-gray-200 dark:border-[#333] shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-bold w-6 text-center">{i + 1}</span>
                  <div>
                    <h3 className="font-bold text-black dark:text-white">{song.title}</h3>
                    <p className="text-xs text-gray-500">{song.category}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onRemove(song.id)}
                  className="svc-btn p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash weight="bold" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
