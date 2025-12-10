import React, { useState } from 'react';
import { useGraphStore } from '../store';
import { AlgorithmType, ToolMode } from '../types';
import { runAlgorithm } from '../services/api';
import { generateGraphWithGemini } from '../services/geminiService';

export const Sidebar: React.FC = () => {
  const { 
    mode, setMode, isDirected, setDirected, 
    setGraph, loadSteps, nodes, edges 
  } = useGraphStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [loadingAlgo, setLoadingAlgo] = useState(false);

  const tools: { id: ToolMode; label: string; icon: string; desc: string }[] = [
    { id: 'pointer', label: 'Chọn', icon: '👆', desc: 'Di chuyển & Chọn' },
    { id: 'node', label: 'Nút', icon: '🟢', desc: 'Click để tạo nút' },
    { id: 'edge', label: 'Cạnh', icon: '🔗', desc: 'Nối 2 nút' },
    { id: 'delete', label: 'Xóa', icon: '🗑️', desc: 'Xóa đối tượng' },
  ];

  const algorithms = Object.values(AlgorithmType);

  const handleRunAlgorithm = async (algo: AlgorithmType) => {
    setLoadingAlgo(true);
    try {
      const graphData = { nodes, edges, isDirected };
      const result = await runAlgorithm(algo, graphData);
      loadSteps(result.steps);
    } catch (e) {
      alert("Lỗi khi khởi chạy thuật toán. Vui lòng kiểm tra Console.");
    } finally {
      setLoadingAlgo(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    const data = await generateGraphWithGemini(aiPrompt);
    if (data) {
      setGraph(data);
    } else {
      alert("Lỗi tạo đồ thị AI. Vui lòng thử lại.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="w-[320px] bg-[#0d1117] border-r border-gray-800 flex flex-col h-full text-sm shadow-2xl z-20">
      {/* Header */}
      <div className="p-5 border-b border-gray-800 bg-gray-900/50">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">
          AlgoGraph
        </h1>
        <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">STUDIO EDITION</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Tools Section */}
        <div className="p-5">
          <h2 className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-3">Công cụ thiết kế</h2>
          <div className="grid grid-cols-2 gap-3">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border ${
                  mode === t.id 
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                    : 'bg-gray-800/40 border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                <span className="text-2xl mb-1">{t.icon}</span>
                <span className="font-medium text-xs">{t.label}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-4 bg-gray-800/30 p-3 rounded-lg border border-gray-800 flex items-center justify-between">
            <span className="text-gray-300 font-medium">Đồ thị có hướng</span>
            <div 
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isDirected ? 'bg-blue-600' : 'bg-gray-600'}`}
              onClick={() => setDirected(!isDirected)}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${isDirected ? 'left-6' : 'left-1'}`} />
            </div>
          </div>
        </div>

        {/* Algorithms Section */}
        <div className="px-5 pb-5">
           <h2 className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-3">Thuật toán</h2>
           <div className="space-y-1">
             {algorithms.map(algo => (
               <button
                 key={algo}
                 onClick={() => handleRunAlgorithm(algo)}
                 disabled={loadingAlgo || nodes.length === 0}
                 className="w-full text-left px-4 py-3 bg-gray-800/20 hover:bg-gray-800/80 border border-transparent hover:border-gray-700 rounded-lg text-gray-300 capitalize text-sm transition-all flex items-center justify-between group disabled:opacity-40 disabled:cursor-not-allowed"
               >
                 <span className="group-hover:text-blue-400 transition-colors">{algo.replace('_', ' ')}</span>
                 {loadingAlgo ? (
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
                 ) : (
                    <span className="text-gray-600 group-hover:text-gray-400">→</span>
                 )}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* AI Assistant Section - Sticky Bottom */}
      <div className="p-5 border-t border-gray-800 bg-gradient-to-b from-[#0d1117] to-[#161b22]">
        <h2 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2">
           <span className="text-lg">✨</span> Trợ lý AI (Gemini 3)
        </h2>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <textarea
            className="relative w-full h-20 bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-300 text-xs focus:border-purple-500 focus:outline-none resize-none placeholder-gray-600"
            placeholder="VD: 'Tạo đồ thị 6 nút có hướng cho thuật toán Dijkstra'"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
        </div>
        <button
          onClick={handleAiGenerate}
          disabled={isGenerating}
          className="mt-3 w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-semibold text-xs shadow-lg shadow-purple-900/20 flex justify-center items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Đang suy nghĩ...' : 'Tạo Đồ thị với AI'}
        </button>
      </div>
    </div>
  );
};