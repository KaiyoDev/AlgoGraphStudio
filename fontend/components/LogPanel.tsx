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
    <div className="absolute top-6 right-6 w-80 max-h-[40vh] bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl flex flex-col overflow-hidden z-20 animate-in slide-in-from-right-5 fade-in duration-300">
      <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-3 border-b border-gray-700 flex justify-between items-center backdrop-blur-sm">
        <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Nhật ký thực thi
        </h3>
        <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Console</span>
      </div>
      
      <div className="overflow-y-auto p-3 space-y-2.5 custom-scrollbar flex-1 bg-gray-950/50">
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className={`text-xs p-2.5 rounded-lg border transition-all duration-200 ${
              idx === currentStepIndex 
                ? 'bg-blue-900/20 border-blue-500/40 text-blue-100 shadow-sm translate-x-1' 
                : 'bg-transparent border-transparent text-gray-500 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex gap-2">
                <span className={`font-mono text-[10px] mt-0.5 ${idx === currentStepIndex ? 'text-blue-400' : 'text-gray-600'}`}>
                    #{String(idx + 1).padStart(2, '0')}
                </span>
                <p className="leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};