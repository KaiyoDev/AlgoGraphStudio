import React, { useEffect, useRef } from 'react';
import { useGraphStore } from '../store';

export const LogPanel: React.FC = () => {
  const { steps, currentStepIndex } = useGraphStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentStepIndex]);

  if (steps.length === 0) return null;

  return (
    <div className="absolute top-6 right-6 w-96 max-h-[50vh] flex flex-col z-20 animate-in slide-in-from-right-10 fade-in duration-500">
      
      {/* Glass Container */}
      <div className="flex-1 bg-gray-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-white/5 p-3 border-b border-white/5 flex justify-between items-center backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <h3 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider ml-2">Terminal Output</h3>
            </div>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Running...
            </span>
        </div>
        
        {/* Log List */}
        <div className="overflow-y-auto p-3 space-y-1 custom-scrollbar flex-1 font-mono text-sm relative">
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-gray-950/50 to-transparent z-10 pointer-events-none"/>
          
          {steps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;
            
            return (
                <div 
                    key={idx} 
                    className={`relative pl-3 py-2 pr-2 rounded transition-all duration-300 border-l-2 ${
                        isActive 
                            ? 'bg-blue-500/10 border-blue-400 text-blue-100 translate-x-1 shadow-[0_2px_10px_rgba(59,130,246,0.1)]' 
                            : isPast
                                ? 'bg-transparent border-gray-700/30 text-gray-500 opacity-70'
                                : 'bg-transparent border-transparent text-gray-600 opacity-40'
                    }`}
                >
                    <div className="flex gap-3">
                        <span className={`text-[10px] mt-0.5 select-none ${isActive ? 'text-blue-400 font-bold' : 'text-gray-600'}`}>
                            {String(idx + 1).padStart(2, '0')}
                        </span>
                        <p className={`leading-snug text-xs ${isActive ? 'text-gray-100' : ''}`}>
                            {step.description}
                        </p>
                    </div>
                </div>
            );
          })}
          <div ref={bottomRef} className="h-2" />
        </div>
      </div>
    </div>
  );
};