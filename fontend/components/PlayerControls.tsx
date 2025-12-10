import React, { useEffect } from 'react';
import { useGraphStore } from '../store';

export const PlayerControls: React.FC = () => {
  const { 
    steps, currentStepIndex, isPlaying, playbackSpeed,
    nextStep, prevStep, setIsPlaying, setStep, setPlaybackSpeed, resetPlayer
  } = useGraphStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        nextStep();
      }, playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, nextStep]);

  if (steps.length === 0) return null;

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[640px] max-w-[95%] z-30 animate-in slide-in-from-bottom-10 fade-in duration-500">
      
      {/* Main Glass Container */}
      <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-1.5 flex flex-col gap-0 relative overflow-hidden group">
        
        {/* Progress Bar Container */}
        <div className="px-6 pt-4 pb-1 relative">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
             <span>Tiến trình thuật toán</span>
             <span className="text-blue-400">{currentStepIndex + 1} / {steps.length}</span>
          </div>
          
          <div className="relative h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden group/slider cursor-pointer">
             {/* Progress Fill */}
             <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300 ease-out"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
             />
             {/* Interaction Layer */}
             <input 
              type="range" 
              min="0" 
              max={steps.length - 1} 
              value={currentStepIndex < 0 ? 0 : currentStepIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setStep(parseInt(e.target.value));
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between px-4 py-2">
            
            {/* Playback Buttons */}
            <div className="flex items-center gap-2">
              <button onClick={() => { setIsPlaying(false); setStep(0); }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90" title="Về đầu">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11 19V5l-7 7 7 7zm9 0V5h-2v14h2z"/></svg>
              </button>
              <button onClick={() => { setIsPlaying(false); prevStep(); }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90" title="Lùi 1 bước">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 6c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1s-1-.45-1-1V7c0-.55.45-1 1-1zm3.66 6.82l5.77 4.07c.66.47 1.58-.01 1.58-.82V7.93c0-.81-.91-1.28-1.58-.82l-5.77 4.07c-.57.4-.57 1.24 0 1.64z"/></svg>
              </button>
              
              {/* Main Play Button */}
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={`w-14 h-14 mx-2 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10 ${
                    isPlaying 
                    ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                    : 'bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]'
                }`}
              >
                {isPlaying ? (
                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                    <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>

              <button onClick={() => { setIsPlaying(false); nextStep(); }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90" title="Tiếp 1 bước">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 17.11l5.77-4.07c.56-.4.56-1.24 0-1.63L5 7.34C4.34 6.87 3.43 7.35 3.43 8.16v7.68c0 .81.91 1.29 1.57.82V17.11zm10.66-.29c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1z"/></svg>
              </button>
              <button onClick={() => { setIsPlaying(false); setStep(steps.length-1); }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90" title="Đến cuối">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 19h2V5H4v14zm11-7l-7-7v14l7-7zm2-7v14h2V5h-2z"/></svg>
              </button>
            </div>

            <div className="h-8 w-px bg-white/10 mx-2" />
            
            {/* Speed Control */}
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <select 
                    value={playbackSpeed} 
                    onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                    className="bg-transparent text-gray-300 text-xs font-bold focus:outline-none cursor-pointer hover:text-white transition-colors"
                >
                    <option value={1500} className="bg-gray-800">0.5x</option>
                    <option value={800} className="bg-gray-800">1.0x</option>
                    <option value={300} className="bg-gray-800">2.0x</option>
                    <option value={100} className="bg-gray-800">MAX</option>
                </select>
            </div>

            {/* Exit Button */}
            <button
                onClick={resetPlayer}
                className="ml-4 w-9 h-9 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:rotate-90 active:scale-90"
                title="Dừng thuật toán"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};