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
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 mt-4">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className="text-black dark:text-white shrink-0">
            <circle cx="50" cy="50" r="46" />
            <path d="M50 22v56M32 42h36" strokeLinecap="round" />
          </svg>
          <div className="flex flex-col text-center md:text-left text-black dark:text-white leading-[1.1] uppercase tracking-[0.1em] font-bold">
            <span className="text-4xl md:text-5xl">Satya Vachan</span>
            <span className="text-4xl md:text-5xl">Church</span>
          </div>
        </div>
        
        <p className="text-xl md:text-2xl font-light text-gray-500 dark:text-gray-400 mb-12">
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
