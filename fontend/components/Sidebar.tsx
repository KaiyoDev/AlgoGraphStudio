import React, { useState, useRef } from 'react';
import { useGraphStore } from '../store';
import { AlgorithmType } from '../types';
import { runAlgorithm } from '../services/api';
import { GraphIOModal } from './GraphIOModal';
import { DijkstraConfigModal } from './DijkstraConfigModal';

export const Sidebar: React.FC = () => {
  const { 
    isDirected, setDirected, 
    loadSteps, nodes, edges,
    undo, redo, past, future,
    showHelp, toggleHelp,
    selectedNodeIds
  } = useGraphStore();

  const [loadingAlgo, setLoadingAlgo] = useState(false);
  const [showIO, setShowIO] = useState(false);
  const [showDijkstraConfig, setShowDijkstraConfig] = useState(false);
  const dijkstraButtonRef = useRef<HTMLDivElement>(null);

  const algorithms = Object.values(AlgorithmType);

  const handleRunAlgorithm = async (algo: AlgorithmType) => {
    // Nếu là Dijkstra, hiển thị modal chọn nút
    if (algo === AlgorithmType.DIJKSTRA) {
      setShowDijkstraConfig(true);
      return;
    }

    // Các thuật toán khác chạy bình thường
    setLoadingAlgo(true);
    try {
      const graphData = { nodes, edges, isDirected };
      
      const params: { source?: string; target?: string; start_node?: string } = {};
      if (algo === AlgorithmType.PRIM && selectedNodeIds.length >= 1) {
        params.start_node = selectedNodeIds[0];
      }
      
      const result = await runAlgorithm(algo, graphData, Object.keys(params).length > 0 ? params : undefined);
      loadSteps(result.steps);
    } catch (e) {
      alert("Lỗi khi khởi chạy thuật toán. Vui lòng kiểm tra Console.");
    } finally {
      setLoadingAlgo(false);
    }
  };

  const handleDijkstraConfirm = async (source: string, target: string | undefined) => {
    setShowDijkstraConfig(false);
    setLoadingAlgo(true);
    try {
      const graphData = { nodes, edges, isDirected };
      const params: { source: string; target?: string } = { source };
      if (target) {
        params.target = target;
      }
      
      const result = await runAlgorithm(AlgorithmType.DIJKSTRA, graphData, params);
      loadSteps(result.steps);
    } catch (e) {
      alert("Lỗi khi khởi chạy thuật toán. Vui lòng kiểm tra Console.");
    } finally {
      setLoadingAlgo(false);
    }
  };

  return (
    <>
    <div className="w-[320px] bg-gray-900/95 backdrop-blur-xl border-r border-white/5 flex flex-col h-full text-sm shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-20 relative">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-white/5 relative z-10">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200 tracking-tight drop-shadow-sm">
          AlgoGraph
        </h1>
        <p className="text-gray-400 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase opacity-70">Studio Edition</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 relative z-10">
        
        {/* Main Actions Group */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Điều khiển</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={undo}
                disabled={past.length === 0}
                className="group relative px-4 py-2.5 bg-gray-800/50 hover:bg-gray-700/80 disabled:opacity-30 disabled:hover:bg-gray-800/50 border border-white/5 rounded-xl text-gray-200 flex items-center justify-center transition-all duration-200 overflow-hidden"
                title="Hoàn tác (Ctrl+Z)"
            >
                <span className="relative z-10 flex items-center gap-2 font-medium group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                  Undo
                </span>
            </button>
            <button 
                onClick={redo}
                disabled={future.length === 0}
                className="group relative px-4 py-2.5 bg-gray-800/50 hover:bg-gray-700/80 disabled:opacity-30 disabled:hover:bg-gray-800/50 border border-white/5 rounded-xl text-gray-200 flex items-center justify-center transition-all duration-200 overflow-hidden"
                title="Làm lại (Ctrl+Y)"
            >
                <span className="relative z-10 flex items-center gap-2 font-medium group-hover:text-white transition-colors">
                  Redo
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                </span>
            </button>
          </div>

          <button
            onClick={() => setShowIO(true)}
             className="w-full group flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-gray-800/50 to-gray-800/30 hover:from-blue-600/20 hover:to-cyan-600/20 border border-white/5 hover:border-blue-500/30 rounded-xl text-gray-300 hover:text-blue-200 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-900/20"
          >
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">📂</span> 
              <span className="font-semibold">Nhập / Xuất Dữ Liệu</span>
          </button>

          <button
            onClick={toggleHelp}
            className={`w-full group flex items-center justify-center gap-3 p-3 rounded-xl transition-all duration-300 border ${
              showHelp 
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                : 'bg-gray-800/30 border-dashed border-gray-600/50 text-gray-400 hover:bg-gray-800 hover:border-gray-500 hover:text-gray-200'
            }`}
          >
            <span className={`text-lg transition-transform duration-300 ${showHelp ? 'rotate-12 scale-110' : 'group-hover:rotate-12'}`}>💡</span>
            <span className="font-semibold">Hướng dẫn sử dụng</span>
          </button>
          
          <div 
            className={`group p-3 rounded-xl border border-white/5 flex items-center justify-between transition-all duration-200 ${
              edges.length > 0 
                ? 'bg-gray-800/20 cursor-not-allowed opacity-60' 
                : 'bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer'
            }`}
            onClick={() => {
              if (edges.length > 0) {
                alert('Không thể thay đổi loại đồ thị khi đã có cạnh. Vui lòng xóa tất cả cạnh trước khi chuyển đổi.');
                return;
              }
              setDirected(!isDirected);
            }}
            title={edges.length > 0 ? 'Không thể thay đổi loại đồ thị khi đã có cạnh' : ''}
          >
            <div className="flex flex-col">
              <span className="text-gray-200 font-semibold text-sm">Chế độ Đồ thị</span>
              <span className={`text-[10px] font-medium transition-colors ${
                edges.length > 0 
                  ? 'text-gray-600' 
                  : 'text-gray-500 group-hover:text-blue-400'
              }`}>
                {isDirected ? 'Có hướng (Directed)' : 'Vô hướng (Undirected)'}
                {edges.length > 0 && ' (Đã khóa)'}
              </span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
              isDirected ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-gray-700'
            } ${edges.length > 0 ? 'opacity-50' : ''}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isDirected ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />

        {/* Algorithms List */}
        <div className="space-y-3 pb-10">
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Thuật toán</p>
           
           <div className="space-y-1.5 relative">
             {algorithms.map((algo, index) => {
               const isDijkstra = algo === AlgorithmType.DIJKSTRA;
               
               return (
                 <div 
                   key={algo} 
                   ref={isDijkstra ? dijkstraButtonRef : null}
                   className="space-y-1 relative"
                 >
                   <button
                     onClick={() => handleRunAlgorithm(algo)}
                     disabled={loadingAlgo || nodes.length === 0}
                     className={`w-full relative group overflow-hidden text-left px-4 py-3.5 bg-gray-800/20 hover:bg-gray-800 border border-transparent hover:border-gray-700/50 rounded-xl text-gray-400 hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale ${
                       isDijkstra && showDijkstraConfig ? 'bg-blue-900/30 border-blue-500/50' : ''
                     }`}
                   >
                     <div className="absolute inset-0 w-1 bg-blue-500/0 group-hover:bg-blue-500/100 transition-all duration-200 rounded-l-full" />
                     
                     <div className="flex items-center justify-between relative z-10">
                       <span className="font-medium capitalize tracking-wide group-hover:translate-x-1 transition-transform duration-200">
                         {algo.replace('_', ' ')}
                       </span>
                       {loadingAlgo ? (
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-0"/>
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"/>
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"/>
                          </div>
                       ) : (
                          <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                       )}
                     </div>
                   </button>
                   
                   {/* Hiển thị form config ngay dưới nút Dijkstra trong sidebar */}
                   {isDijkstra && showDijkstraConfig && (
                     <DijkstraConfigModal
                       onConfirm={handleDijkstraConfirm}
                       onClose={() => setShowDijkstraConfig(false)}
                     />
                   )}
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
    
    {/* Render IO Modal if active */}
    {showIO && <GraphIOModal onClose={() => setShowIO(false)} />}
    </>
  );
};