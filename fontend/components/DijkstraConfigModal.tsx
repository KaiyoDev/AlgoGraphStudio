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

  // Xử lý phím ESC để đóng và click outside
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    // Delay để tránh đóng ngay khi click vào nút
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="bg-gray-900 border border-red-500/30 rounded-xl p-4 shadow-2xl transition-all duration-200 ease-out">
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
      className="bg-gray-900 border border-blue-500/50 rounded-xl p-5 shadow-2xl backdrop-blur-xl"
      style={{
        animation: 'fadeInSlideDown 0.3s ease-out forwards'
      }}
      onClick={(e) => e.stopPropagation()}
    >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              ⚡ Cấu hình Dijkstra
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Chọn nút nguồn và nút đích</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800/50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3">
          {/* Source Node */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Nút nguồn (Source) <span className="text-red-400">*</span>
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full bg-gray-800/80 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:border-gray-600"
            >
              <option value="">-- Chọn nút nguồn --</option>
              {sortedNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.id} {node.label ? `(${node.label})` : ''}
                </option>
              ))}
            </select>
            {sourceId && (
              <p className="text-[10px] text-green-400/90 mt-1 flex items-center gap-1">
                <span>✓</span> <span className="font-semibold">{sourceId}</span>
              </p>
            )}
          </div>

          {/* Target Node */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Nút đích (Target) <span className="text-gray-500 text-[10px]">(Tùy chọn)</span>
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-gray-800/80 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all hover:border-gray-600"
            >
              <option value="">-- Để trống để tìm đường đến tất cả --</option>
              {sortedNodes.map(node => (
                <option key={node.id} value={node.id} disabled={node.id === sourceId}>
                  {node.id} {node.label ? `(${node.label})` : ''}
                </option>
              ))}
            </select>
            {targetId ? (
              <p className="text-[10px] text-cyan-400/90 mt-1 flex items-center gap-1">
                <span>✓</span> Đích: <span className="font-semibold">{targetId}</span>
              </p>
            ) : (
              <p className="text-[10px] text-gray-500/80 mt-1">
                💡 Để trống để tìm đường đến tất cả các nút
              </p>
            )}
          </div>

          {/* Preview */}
          {sourceId && (
            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-500/30 rounded-lg p-2.5 transition-all duration-200">
              <p className="text-[10px] text-blue-300/90 font-semibold mb-1">📋 Xem trước:</p>
              <p className="text-xs text-blue-200/90">
                Từ <span className="font-bold text-green-300">{sourceId}</span>
                {targetId ? (
                  <>
                    {' → '}
                    <span className="font-bold text-cyan-300">{targetId}</span>
                  </>
                ) : (
                  <> → tất cả các nút</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleClose}
            className="flex-1 px-3 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all font-medium text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!sourceId}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all shadow-lg hover:shadow-blue-500/30 text-sm"
          >
            Chạy →
          </button>
        </div>
      </div>
    </div>
  );
};

