'use client';
import { MusicNotes, ArrowRight } from '@phosphor-icons/react';

export default function LandingView({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="view-section active-view flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-[#0f0f0f] flex">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-20 h-20 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl transform rotate-3">
          <MusicNotes weight="fill" className="text-4xl text-white dark:text-black" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-black dark:text-white border-none pb-0 m-0">
          Satya Vachan Church
        </h1>
        <p className="text-xl md:text-2xl font-light text-gray-500 dark:text-gray-400 mb-12 mt-2">
          Music Directory &amp; Resources
        </p>

        <button 
          onClick={onEnter}
          className="svc-btn group relative px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium text-lg overflow-hidden shadow-lg border-none outline-none m-0"
        >
          <span className="relative z-10 flex items-center gap-2">
            Enter Library
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>
    </main>
  );
}
