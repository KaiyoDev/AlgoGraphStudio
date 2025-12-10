import React, { useEffect } from 'react';
import { useGraphStore } from '../store';

export const PlayerControls: React.FC = () => {
  const { 
    steps, currentStepIndex, isPlaying, playbackSpeed,
    nextStep, prevStep, setIsPlaying, setStep, setPlaybackSpeed
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
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[600px] max-w-[90%] bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 z-30 animate-in slide-in-from-bottom-5 fade-in duration-300">
      
      {/* Step Info & Slider */}
      <div className="flex items-center gap-4 px-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-16">
            Tiến độ
        </span>
        <div className="flex-1 relative h-6 flex items-center">
            <input 
              type="range" 
              min="0" 
              max={steps.length - 1} 
              value={currentStepIndex < 0 ? 0 : currentStepIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setStep(parseInt(e.target.value));
              }}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
            />
        </div>
        <span className="text-xs font-mono text-blue-300 bg-blue-900/30 px-2 py-1 rounded border border-blue-500/30 min-w-[50px] text-center">
            {currentStepIndex + 1}/{steps.length}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between items-center px-2 pt-1 border-t border-gray-700/50">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => { setIsPlaying(false); setStep(0); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 text-gray-300 transition-colors" title="Về đầu">
            ⏮️
          </button>
          <button onClick={() => { setIsPlaying(false); prevStep(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 text-gray-300 transition-colors" title="Lùi">
            ◀️
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className={`mx-2 h-10 px-6 rounded-full font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isPlaying 
                ? 'bg-amber-500 hover:bg-amber-400 text-black' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isPlaying ? '⏸ TẠM DỪNG' : '▶ PHÁT'}
          </button>

          <button onClick={() => { setIsPlaying(false); nextStep(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 text-gray-300 transition-colors" title="Tiếp">
            ▶️
          </button>
        </div>
        
        {/* Speed Control */}
        <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Tốc độ</span>
            <select 
                value={playbackSpeed} 
                onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                className="bg-transparent text-gray-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
                <option value={1500} className="bg-gray-800">0.5x (Chậm)</option>
                <option value={800} className="bg-gray-800">1.0x (Thường)</option>
                <option value={300} className="bg-gray-800">2.0x (Nhanh)</option>
                <option value={100} className="bg-gray-800">MAX</option>
            </select>
        </div>
      </div>
    </div>
  );
};