'use client';
import { Song, ServiceItem } from '@/types';
import { ArrowLeft, CalendarStar, PresentationChart, ListPlus, Trash } from '@phosphor-icons/react';

interface PlannerViewProps {
  songs: Song[];
  serviceItems?: ServiceItem[];
  onBack: () => void;
  onRemove: (id: number) => void;
  onPresent: () => void;
  onOpenSong: (id: number) => void;
}

export default function PlannerView({ songs, serviceItems, onBack, onRemove, onPresent, onOpenSong }: PlannerViewProps) {
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
              <CalendarStar weight="fill" className="text-blue-500" /> Sunday Planner
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

        {/* Display Order of Service if it exists */}
        {serviceItems && serviceItems.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-black dark:text-white flex items-center gap-2">
                <ListPlus weight="fill" className="text-blue-500" /> Order of Service
              </h3>
            </div>
            <div className="bg-white dark:bg-[#191919] rounded-xl border border-gray-200 dark:border-[#333] shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-[#222] text-xs text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-[#333]">
                  <tr>
                    <th className="px-4 py-3 w-20 border-r border-gray-200 dark:border-[#333]">Time</th>
                    <th className="px-4 py-3 w-20 border-r border-gray-200 dark:border-[#333]">Time</th>
                    <th className="px-4 py-3 w-1/4 border-r border-gray-200 dark:border-[#333]">Event</th>
                    <th className="px-4 py-3 w-1/5 border-r border-gray-200 dark:border-[#333]">Responsible</th>
                    <th className="px-4 py-3">Content</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceItems.map((item, idx) => (
                    <tr key={idx} className={`border-b border-gray-100 dark:border-[#2a2a2a] ${item.isHeader ? 'bg-gray-100 dark:bg-[#2a2a2a] font-bold' : ''}`}>
                      {item.isHeader ? (
                        <td colSpan={5} className="px-4 py-3 text-center text-black dark:text-white text-base">
                          {item.event}
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap border-r border-gray-200 dark:border-[#333] align-top">{item.startTime}</td>
                          <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap border-r border-gray-200 dark:border-[#333] align-top">{item.endTime}</td>
                          <td className="px-4 py-3 font-medium text-black dark:text-white border-r border-gray-200 dark:border-[#333] align-top">{item.event}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-[#333] align-top">{item.responsible}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap align-top">{item.content}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-bold text-xl text-black dark:text-white flex items-center gap-2">
            Songs List
          </h3>
        </div>

        <div className="space-y-3">
          {songs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#191919] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <ListPlus weight="duotone" className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No songs added yet.</p>
            </div>
          ) : (
            songs.map((song, i) => (
              <div 
                key={song.id} 
                className="flex items-center justify-between bg-white dark:bg-[#191919] p-4 rounded-xl border border-gray-200 dark:border-[#333] shadow-sm hover:border-blue-500 cursor-pointer group"
                onClick={() => onOpenSong(song.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-bold w-6 text-center">{i + 1}</span>
                  <div>
                    <h3 className="font-bold text-black dark:text-white group-hover:text-blue-500">{song.title}</h3>
                    <p className="text-xs text-gray-500">{song.category}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(song.id); }}
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
