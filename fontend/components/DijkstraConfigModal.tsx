import React, { useState, useEffect, useRef } from 'react';
import { useGraphStore } from '../store';
import { NodeData } from '../types';

interface DijkstraConfigModalProps {
  onConfirm: (source: string, target: string | undefined) => void;
  onClose: () => void;
}

export const DijkstraConfigModal: React.FC<DijkstraConfigModalProps> = ({ onConfirm, onClose }) => {
  const { nodes, selectedNodeIds } = useGraphStore();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Khởi tạo với nodes đã chọn (nếu có)
  const [sourceId, setSourceId] = useState<string>(selectedNodeIds[0] || '');
  const [targetId, setTargetId] = useState<string>(selectedNodeIds.length >= 2 ? selectedNodeIds[1] : '');

  // Sắp xếp nodes theo ID
  const sortedNodes = [...nodes].sort((a, b) => {
    const numA = parseInt(a.id);
    const numB = parseInt(b.id);
    return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.id.localeCompare(b.id);
  });

  const handleConfirm = () => {
    if (!sourceId) {
      alert('Vui lòng chọn nút nguồn!');
      return;
    }
    onConfirm(sourceId, targetId || undefined);
  };

  const handleClose = () => {
    onClose();
  };

  // Xử lý phím ESC để đóng
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="bg-gray-800/50 border-t border-red-500/30 rounded-b-xl p-4">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-3">⚠️ Đồ thị chưa có nút nào!</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors text-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={modalRef}
      className="bg-gray-800/50 border-t border-blue-500/50 rounded-b-xl p-3 mt-2 overflow-hidden"
      style={{
        animation: 'fadeInSlideDown 0.3s ease-out forwards'
      }}
    >
      {/* Layout ngang: Source, Target, Preview và nút bấm cùng một hàng */}
      <div className="flex items-end gap-2 flex-wrap">
        {/* Source Node */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[10px] font-semibold text-gray-400 mb-1">
            Nguồn <span className="text-red-400">*</span>
          </label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:border-gray-600"
          >
            <option value="">-- Chọn --</option>
            {sortedNodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.id} {node.label ? `(${node.label})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 pt-5">
          <span className="text-blue-400 text-lg">→</span>
        </div>

        {/* Target Node */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[10px] font-semibold text-gray-400 mb-1">
            Đích <span className="text-gray-500 text-[9px]">(Tùy chọn)</span>
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all hover:border-gray-600"
          >
            <option value="">-- Tất cả --</option>
            {sortedNodes.map(node => (
              <option key={node.id} value={node.id} disabled={node.id === sourceId}>
                {node.id} {node.label ? `(${node.label})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Preview nhỏ */}
        {sourceId && (
          <div className="flex-shrink-0 px-2 py-1.5 bg-blue-900/20 border border-blue-500/20 rounded-lg">
            <p className="text-[10px] text-blue-300 font-semibold">
              <span className="text-green-300">{sourceId}</span>
              {targetId ? (
                <> → <span className="text-cyan-300">{targetId}</span></>
              ) : (
                <> → tất cả</>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 rounded-lg text-gray-300 hover:text-white transition-all font-medium text-xs"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!sourceId}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all text-xs"
          >
            Chạy
          </button>
        </div>
      </div>
    </div>
  );
};

