// components/Sidebar.tsx
import React, { useState } from 'react';
import { useGraphStore } from '../store';
import { AlgorithmType } from '../types';
import { runAlgorithm } from '../services/api';
import { GraphIOModal } from './GraphIOModal';
import { AlgorithmConfigModal } from './AlgorithmConfigModal'; // Nhớ tạo file này ở bước 3

// Định nghĩa cấu trúc menu dựa trên Bảng yêu cầu
const ALGO_MENU = [
  {
    category: "Shortest Path",
    color: "text-green-400",
    items: [
      { id: AlgorithmType.DIJKSTRA, label: "Dijkstra", desc: "Trọng số không âm" },
      { id: AlgorithmType.BELLMAN_FORD, label: "Bellman-Ford", desc: "Trọng số âm" }
    ]
  },
  {
    category: "Travel",
    color: "text-blue-400",
    items: [
      { id: AlgorithmType.BFS, label: "BFS", desc: "Duyệt chiều rộng" },
      { id: AlgorithmType.DFS, label: "DFS", desc: "Duyệt chiều sâu" }
    ]
  },
  {
    category: "Bipartite",
    color: "text-purple-400",
    items: [
      { id: AlgorithmType.BFS_COLORING, label: "BFS 2-Coloring", desc: "Kiểm tra 2 phía" }
    ]
  },
  {
    category: "Minimum Spanning Tree",
    color: "text-yellow-400",
    items: [
      { id: AlgorithmType.PRIM, label: "Prim", desc: "Tốt cho đồ thị dày" },
      { id: AlgorithmType.KRUSKAL, label: "Kruskal", desc: "Tốt cho đồ thị thưa" }
    ]
  },
  {
    category: "Max Flow",
    color: "text-red-400",
    items: [
      { id: AlgorithmType.FORD_FULKERSON, label: "Ford-Fulkerson", desc: "Luồng cực đại" }
    ]
  },
  {
    category: "Eulerian Circuit",
    color: "text-orange-400",
    items: [
      { id: AlgorithmType.FLEURY, label: "Fleury", desc: "Chu trình Euler" },
      { id: AlgorithmType.HIERHOLZER, label: "Hierholzer", desc: "Hiệu quả hơn Fleury" }
    ]
  }
];

export const Sidebar: React.FC = () => {
  // Lấy dữ liệu từ Store (Đây là lý do code cũ bị lỗi, vì biến này phải nằm trong component)
  const { 
    isDirected, setDirected, 
    loadSteps, nodes, edges,
    undo, redo, past, future,
    showHelp, toggleHelp,
  } = useGraphStore();

  // State cục bộ
  const [loadingAlgo, setLoadingAlgo] = useState(false);
  const [showIO, setShowIO] = useState(false);
  const [activeAlgo, setActiveAlgo] = useState<AlgorithmType | null>(null);
  
  // State để quản lý mở/đóng các nhóm (mặc định mở nhóm đầu tiên)
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Shortest Path");

  // Hàm xử lý chạy thuật toán (Đã đưa vào trong component để hết lỗi đỏ)
  const handleConfigConfirm = async (config: { source?: string, target?: string }) => {
    if (!activeAlgo) return;
    
    // Đóng modal config
    const algoToRun = activeAlgo;
    setActiveAlgo(null);

    setLoadingAlgo(true);
    try {
        const graphData = { nodes, edges, isDirected };
        // Gọi API backend
        const result = await runAlgorithm(algoToRun, graphData, config);
        loadSteps(result.steps);
    } catch (e) {
        console.error(e);
        alert("Lỗi khi chạy thuật toán (Kiểm tra Backend).");
    } finally {
        setLoadingAlgo(false);
    }
  };

  return (
    <>
    <div className="w-[320px] bg-gray-900/95 backdrop-blur-xl border-r border-white/5 flex flex-col h-full text-sm shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-20 relative">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

      {/* 1. Header */}
      <div className="p-6 border-b border-white/5 relative z-10">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200 tracking-tight">
          AlgoGraph
        </h1>
        <p className="text-gray-400 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase opacity-70">Studio Edition</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 relative z-10">
        
        {/* 2. Controls (Undo/Redo/IO) */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={undo} disabled={past.length === 0} className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/80 border border-white/5 rounded-xl text-gray-200 flex items-center justify-center disabled:opacity-30">
                <span className="text-xs font-bold">↩ Undo</span>
            </button>
            <button onClick={redo} disabled={future.length === 0} className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/80 border border-white/5 rounded-xl text-gray-200 flex items-center justify-center disabled:opacity-30">
                <span className="text-xs font-bold">Redo ↪</span>
            </button>
          </div>

          <button onClick={() => setShowIO(true)} className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-300 font-bold transition-all">
              📂 Nhập / Xuất Dữ Liệu
          </button>
          
          {/* Toggle Directed/Undirected */}
          <div 
            className={`p-3 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer transition-colors ${edges.length > 0 ? 'opacity-50 cursor-not-allowed bg-gray-800/20' : 'bg-gray-800/30 hover:bg-gray-800/50'}`}
            onClick={() => { if (edges.length === 0) setDirected(!isDirected); }}
          >
            <span className="text-gray-300 font-semibold text-xs">Đồ thị {isDirected ? 'Có hướng' : 'Vô hướng'}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isDirected ? 'bg-blue-500' : 'bg-gray-600'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isDirected ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        {/* 3. Algorithm Menu (Accordion Style) */}
        <div className="space-y-4 pb-8">
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Chức năng & Thuật toán</p>
           
           <div className="flex flex-col gap-2">
             {ALGO_MENU.map((group) => {
               const isOpen = expandedGroup === group.category;
               return (
                 <div key={group.category} className="border border-white/5 rounded-xl overflow-hidden bg-gray-800/10">
                    {/* Header Nhóm */}
                    <button 
                        onClick={() => setExpandedGroup(isOpen ? null : group.category)}
                        className={`w-full flex items-center justify-between p-3 transition-colors ${isOpen ? 'bg-white/5' : 'hover:bg-white/5'}`}
                    >
                        <span className={`text-xs font-bold ${group.color}`}>{group.category}</span>
                        {/* Thay toàn bộ dòng <span ...>Kb</span> bằng đoạn SVG này */}
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        >
                            <path d="m6 9 6 6 6-6"/>
                        </svg>
                    </button>

                    {/* Danh sách Thuật toán bên trong */}
                    {isOpen && (
                        <div className="bg-black/20 p-2 space-y-1">
                            {group.items.map(algo => (
                                <button
                                    key={algo.id}
                                    onClick={() => setActiveAlgo(algo.id)}
                                    disabled={loadingAlgo || nodes.length === 0}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-all flex flex-col gap-0.5 group disabled:opacity-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-200 text-sm font-medium group-hover:text-white">{algo.label}</span>
                                        {loadingAlgo && activeAlgo === algo.id && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>}
                                    </div>
                                    <span className="text-[10px] text-gray-500 italic group-hover:text-gray-400">{algo.desc}</span>
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
    
    {/* Modals */}
    {showIO && <GraphIOModal onClose={() => setShowIO(false)} />}
    
    {/* Modal Cấu hình Thuật toán (Hiển thị khi chọn thuật toán) */}
    {activeAlgo && (
        <div className="fixed left-[330px] top-20 z-50">
            <AlgorithmConfigModal 
                algoType={activeAlgo}
                onConfirm={handleConfigConfirm}
                onClose={() => setActiveAlgo(null)}
            />
        </div>
    )}
    </>
  );
};