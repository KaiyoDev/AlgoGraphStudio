// components/AlgorithmConfigModal.tsx
import React, { useState } from 'react';
import { useGraphStore } from '../store';
import { AlgorithmType } from '../types';

interface Props {
  algoType: AlgorithmType;
  onConfirm: (config: { source?: string; target?: string }) => void;
  onClose: () => void;
}

export const AlgorithmConfigModal: React.FC<Props> = ({ algoType, onConfirm, onClose }) => {
  const { nodes, selectedNodeIds } = useGraphStore();
  
  // Logic xác định thuật toán nào cần input gì
  // - Shortest Path & Max Flow: Cần Nguồn + Đích
  const needsSourceAndTarget = [
      AlgorithmType.DIJKSTRA, 
      AlgorithmType.BELLMAN_FORD, 
      AlgorithmType.FORD_FULKERSON
  ].includes(algoType);

  // - Travel & Prim: Cần Nguồn
  const needsSourceOnly = [
      AlgorithmType.BFS, 
      AlgorithmType.DFS, 
      AlgorithmType.PRIM,
      AlgorithmType.FLEURY,
      AlgorithmType.HIERHOLZER
  ].includes(algoType);

  // Các thuật toán còn lại (Kruskal, Coloring...) có thể không cần chọn node cụ thể hoặc chọn tự động
  const needsInput = needsSourceAndTarget || needsSourceOnly;

  const [sourceId, setSourceId] = useState<string>(selectedNodeIds[0] || '');
  const [targetId, setTargetId] = useState<string>(selectedNodeIds[1] || '');
  
  // Sắp xếp node để hiển thị đẹp
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));

  const handleRun = () => {
      if ((needsSourceOnly || needsSourceAndTarget) && !sourceId) {
          alert("Vui lòng chọn nút nguồn!");
          return;
      }
      onConfirm({
          source: sourceId || undefined,
          target: (needsSourceAndTarget && targetId) ? targetId : undefined
      });
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur border border-blue-500/30 rounded-xl p-4 w-72 shadow-2xl animate-in slide-in-from-left-5 fade-in">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-blue-400 font-bold text-sm uppercase">{algoType.replace('_', ' ')}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3">
            {(needsSourceOnly || needsSourceAndTarget) && (
                <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">CHỌN NÚT NGUỒN (START)</label>
                    <select 
                        value={sourceId} 
                        onChange={e => setSourceId(e.target.value)}
                        className="w-full bg-black/40 border border-gray-600 rounded p-1.5 text-xs text-white focus:border-blue-500 outline-none"
                    >
                        <option value="">-- Chọn nút --</option>
                        {sortedNodes.map(n => <option key={n.id} value={n.id}>{n.id} {n.label ? `(${n.label})` : ''}</option>)}
                    </select>
                </div>
            )}

            {needsSourceAndTarget && (
                <div>
                     <label className="text-[10px] text-gray-400 font-bold block mb-1">CHỌN NÚT ĐÍCH (TARGET)</label>
                    <select 
                        value={targetId} 
                        onChange={e => setTargetId(e.target.value)}
                        className="w-full bg-black/40 border border-gray-600 rounded p-1.5 text-xs text-white focus:border-blue-500 outline-none"
                    >
                        <option value="">-- Chọn nút (Tùy chọn) --</option>
                        {sortedNodes.map(n => (
                            <option key={n.id} value={n.id} disabled={n.id === sourceId}>
                                {n.id} {n.label ? `(${n.label})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            {!needsInput && (
                <p className="text-xs text-gray-400 italic">
                    Thuật toán này sẽ chạy trên toàn bộ đồ thị.
                </p>
            )}

            <div className="pt-2 flex justify-end gap-2">
                <button onClick={onClose} className="px-3 py-1.5 rounded text-xs text-gray-300 hover:bg-white/10">Hủy</button>
                <button 
                    onClick={handleRun}
                    className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/50"
                >
                    Chạy Ngay
                </button>
            </div>
        </div>
    </div>
  );
};