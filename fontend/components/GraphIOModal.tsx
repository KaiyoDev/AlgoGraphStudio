import React, { useState, useEffect } from 'react';
import { useGraphStore } from '../store';
import { NodeData, EdgeData } from '../types';

interface GraphIOModalProps {
  onClose: () => void;
}

export const GraphIOModal: React.FC<GraphIOModalProps> = ({ onClose }) => {
  const { nodes, edges, isDirected, setGraph, stageRef, scale, position } = useGraphStore();

  const [activeTab, setActiveTab] = useState<'data' | 'image'>('data');

  const [textInput, setTextInput] = useState('');
  const [inputType, setInputType] = useState<'edge-list' | 'adj-matrix'>('edge-list');
  const [indexing, setIndexing] = useState<0 | 1>(1); 
  const [isWeighted, setIsWeighted] = useState(true);
  const [directedState, setDirectedState] = useState(isDirected);
  const [layoutType, setLayoutType] = useState<'circle' | 'grid' | 'random'>('circle');

  useEffect(() => {
    if (activeTab === 'data') {
        generateTextFromGraph();
    }
  }, [inputType, indexing, directedState, activeTab]);

  const generateTextFromGraph = () => {
    if (nodes.length === 0) {
        setTextInput('');
        return;
    }

    const sortedNodes = [...nodes].sort((a, b) => {
        const numA = parseInt(a.id);
        const numB = parseInt(b.id);
        return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.id.localeCompare(b.id);
    });

    if (inputType === 'edge-list') {
      const lines = edges.map(e => `${e.source} ${e.target} ${e.weight}`);
      setTextInput(`${lines.join('\n')}`);
    } else {
      const nodeToIndex = new Map(sortedNodes.map((n, i) => [n.id, i]));
      const size = sortedNodes.length;
      const matrix = Array(size).fill(0).map(() => Array(size).fill(0));

      edges.forEach(e => {
        const u = nodeToIndex.get(e.source);
        const v = nodeToIndex.get(e.target);
        if (u !== undefined && v !== undefined) {
            matrix[u][v] = e.weight;
            if (!directedState) matrix[v][u] = e.weight;
        }
      });

      const text = matrix.map(row => row.join(' ')).join('\n');
      setTextInput(text);
    }
  };

  const handleImport = () => {
    const lines = textInput.trim().split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return;

    let newNodes: NodeData[] = [];
    let newEdges: EdgeData[] = [];
    const nodeSet = new Set<string>();

    if (inputType === 'edge-list') {
        lines.forEach((line, idx) => {
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
                const u = parts[0];
                const v = parts[1];
                const w = parts[2] ? parseFloat(parts[2]) : (isWeighted ? 1 : 0); 

                nodeSet.add(u);
                nodeSet.add(v);

                newEdges.push({
                    id: `e-${idx}`,
                    source: u,
                    target: v,
                    weight: w,
                    isDirected: directedState
                });
            }
        });

        Array.from(nodeSet).forEach(id => {
            newNodes.push({ id, x: 0, y: 0, label: id }); 
        });

    } else {
        const size = lines.length;
        for (let i = 0; i < size; i++) {
            const id = String(i + indexing);
            newNodes.push({ id, x: 0, y: 0, label: id });
        }

        lines.forEach((line, r) => {
            const vals = line.split(/\s+/).map(Number);
            vals.forEach((val, c) => {
                if (val !== 0) {
                    const source = String(r + indexing);
                    const target = String(c + indexing);
                    newEdges.push({
                        id: `e-${r}-${c}`,
                        source,
                        target,
                        weight: val,
                        isDirected: directedState
                    });
                }
            });
        });
    }

    const centerX = (window.innerWidth - 320) / 2;
    const centerY = window.innerHeight / 2;
    
    if (layoutType === 'circle') {
        const radius = Math.min(centerX, centerY) * 0.7;
        const angleStep = (2 * Math.PI) / newNodes.length;
        newNodes = newNodes.map((n, i) => ({
            ...n,
            x: centerX + radius * Math.cos(i * angleStep) - 100,
            y: centerY + radius * Math.sin(i * angleStep) - 50
        }));
    } else if (layoutType === 'grid') {
        const cols = Math.ceil(Math.sqrt(newNodes.length));
        const spacing = 150;
        newNodes = newNodes.map((n, i) => ({
            ...n,
            x: 100 + (i % cols) * spacing,
            y: 100 + Math.floor(i / cols) * spacing
        }));
    } else {
        newNodes = newNodes.map(n => ({
            ...n,
            x: Math.random() * (window.innerWidth - 400) + 50,
            y: Math.random() * (window.innerHeight - 100) + 50
        }));
    }

    setGraph({
        nodes: newNodes,
        edges: newEdges,
        isDirected: directedState
    });
    
    onClose();
  };

  const downloadImage = (format: 'png' | 'svg') => {
      if (nodes.length === 0) {
          alert("Không có đồ thị để xuất.");
          return;
      }

      // Calculate Bounding Box of the graph content (World Coordinates)
      const xs = nodes.map(n => n.x);
      const ys = nodes.map(n => n.y);
      const padding = 50; 
      const minX = Math.min(...xs) - padding;
      const minY = Math.min(...ys) - padding;
      const maxX = Math.max(...xs) + padding;
      const maxY = Math.max(...ys) + padding;
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;

      if (format === 'png') {
          if (!stageRef) {
              alert("Canvas chưa sẵn sàng. Vui lòng thử lại.");
              return;
          }
          try {
            // Map World Coordinates to Screen Coordinates for cropping
            // pixelRatio controls quality.
            // mimeType is image/png.
            // x, y, width, height define the crop rectangle in the view.
            
            // NOTE: Konva toDataURL config x,y are relative to the stage viewport top-left.
            // We need to calculate where our bounding box is currently located on screen.
            const screenX = minX * scale + position.x;
            const screenY = minY * scale + position.y;
            const screenWidth = contentWidth * scale;
            const screenHeight = contentHeight * scale;

            const dataURL = stageRef.toDataURL({ 
                pixelRatio: 3, 
                mimeType: 'image/png',
                x: screenX,
                y: screenY,
                width: screenWidth,
                height: screenHeight
            });
            downloadURI(dataURL, `graph-${Date.now()}.png`);
          } catch(e) {
              console.error("Lỗi xuất ảnh:", e);
              alert("Không thể xuất ảnh PNG.");
          }
      } else {
          const svgString = generateSVG(minX, minY, contentWidth, contentHeight);
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          downloadURI(url, `graph-${Date.now()}.svg`);
      }
  };

  const downloadURI = (uri: string, name: string) => {
      const link = document.createElement('a');
      link.download = name;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const generateSVG = (minX: number, minY: number, width: number, height: number) => {
      if (nodes.length === 0) return '<svg></svg>';

      const getParallelEdges = (edgeList: EdgeData[]) => {
            const groups: Record<string, EdgeData[]> = {};
            edgeList.forEach(edge => {
                const pairId = [edge.source, edge.target].sort().join('-');
                if (!groups[pairId]) groups[pairId] = [];
                groups[pairId].push(edge);
            });
            return groups;
      };
      const parallelGroups = getParallelEdges(edges);

      let svgContent = '';
      
      svgContent += `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
            </marker>
        </defs>
      `;

      edges.forEach(edge => {
          const u = nodes.find(n => n.id === edge.source);
          const v = nodes.find(n => n.id === edge.target);
          if (!u || !v) return;

          let pathData = '';
          const isSelfLoop = edge.source === edge.target;
          
          if (isSelfLoop) {
              const r = 20; const offset = 50;
              pathData = `M ${u.x} ${u.y} C ${u.x - offset} ${u.y - offset}, ${u.x + offset} ${u.y - offset}, ${u.x + r} ${u.y - r}`;
          } else {
              let cx, cy;
              if (edge.controlPoint) {
                  cx = edge.controlPoint.x;
                  cy = edge.controlPoint.y;
              } else {
                  const nodeIds = [edge.source, edge.target].sort();
                  const pairId = nodeIds.join('-');
                  const group = parallelGroups[pairId] || [];
                  const index = group.findIndex(e => e.id === edge.id);
                  const total = group.length;

                  const midX = (u.x + v.x) / 2;
                  const midY = (u.y + v.y) / 2;
                  
                  if (total > 1) {
                      const dx = v.x - u.x;
                      const dy = v.y - u.y;
                      const dist = Math.sqrt(dx*dx + dy*dy);
                      const nx = -dy / dist;
                      const ny = dx / dist;
                      const CURVE_STEP = 40;
                      const offsetFactor = index - (total - 1) / 2;
                      cx = midX + nx * offsetFactor * CURVE_STEP;
                      cy = midY + ny * offsetFactor * CURVE_STEP;
                  } else {
                      cx = midX;
                      cy = midY;
                  }
              }
              pathData = `M ${u.x} ${u.y} Q ${cx} ${cy} ${v.x} ${v.y}`;
          }
          
          const markerEnd = (edge.isDirected || isDirected) ? 'url(#arrowhead)' : '';
          svgContent += `<path d="${pathData}" stroke="#475569" stroke-width="2" fill="none" marker-end="${markerEnd}" />`;
          
          let lx, ly;
          if (isSelfLoop) {
             lx = u.x; ly = u.y - 60;
          } else {
              const midX = (u.x + v.x) / 2; 
              const midY = (u.y + v.y) / 2;
              lx = 0.25 * u.x + 0.5 * midX + 0.25 * v.x; 
              ly = 0.25 * u.y + 0.5 * midY + 0.25 * v.y;
          }
          
          svgContent += `
            <text x="${lx}" y="${ly}" font-family="sans-serif" font-size="12" fill="#e2e8f0" text-anchor="middle" font-weight="bold" stroke="#0f172a" stroke-width="3" paint-order="stroke">${edge.weight}</text>
            <text x="${lx}" y="${ly}" font-family="sans-serif" font-size="12" fill="#e2e8f0" text-anchor="middle" font-weight="bold">${edge.weight}</text>
          `;
      });

      nodes.forEach(node => {
          svgContent += `
            <g>
                <circle cx="${node.x}" cy="${node.y}" r="20" fill="#3b82f6" stroke="#1e293b" stroke-width="2" />
                <text x="${node.x}" y="${node.y}" dy="5" font-family="sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold">${node.label || node.id}</text>
            </g>
          `;
      });

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}" style="background-color: #0d1117;">${svgContent}</svg>`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 w-[900px] max-w-full h-[600px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="p-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                📂 Quản lý dữ liệu
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="flex border-b border-gray-800 bg-gray-900">
            <button 
                className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'data' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveTab('data')}
            >
                Nhập / Xuất Dữ Liệu
            </button>
            <button 
                className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'image' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveTab('image')}
            >
                Xuất Hình Ảnh
            </button>
        </div>

        {activeTab === 'data' ? (
        <>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/2 p-4 flex flex-col gap-2 border-r border-gray-800 bg-gray-900/50">
                    <label className="text-sm font-bold text-gray-400 uppercase">Dữ liệu đầu vào</label>
                    <div className="text-xs text-gray-500 mb-1">
                        {inputType === 'edge-list' 
                            ? 'Định dạng: Nguồn Đích [Trọng số]' 
                            : 'Định dạng: Ma trận vuông các trọng số'}
                    </div>
                    <textarea 
                        className="flex-1 bg-gray-950 border border-gray-700 rounded-lg p-3 font-mono text-sm text-green-400 focus:outline-none focus:border-blue-500 resize-none"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        spellCheck={false}
                        placeholder={inputType === 'edge-list' ? "1 2 10\n2 3 5" : "0 10 0\n10 0 5\n0 5 0"}
                    />
                </div>

                <div className="w-1/2 p-6 flex flex-col gap-6 bg-gray-900 overflow-y-auto custom-scrollbar">
                    
                    <div>
                        <h3 className="text-sm font-bold text-gray-300 mb-2">Tùy chọn chỉ số (Indexing)</h3>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    checked={indexing === 0} 
                                    onChange={() => setIndexing(0)}
                                    className="accent-blue-500"
                                />
                                <span className="text-gray-400 group-hover:text-gray-200 transition-colors">0-Indexed</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    checked={indexing === 1} 
                                    onChange={() => setIndexing(1)}
                                    className="accent-blue-500"
                                />
                                <span className="text-gray-400 group-hover:text-gray-200 transition-colors">1-Indexed</span>
                            </label>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 italic">*Ảnh hưởng khi tạo node từ Ma trận kề</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-300 mb-2">Kiểu dữ liệu (Input Type)</h3>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    checked={inputType === 'edge-list'} 
                                    onChange={() => setInputType('edge-list')}
                                    className="accent-blue-500"
                                />
                                <span className="text-gray-400 group-hover:text-gray-200 transition-colors">Danh sách cạnh (Edge List)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    checked={inputType === 'adj-matrix'} 
                                    onChange={() => setInputType('adj-matrix')}
                                    className="accent-blue-500"
                                />
                                <span className="text-gray-400 group-hover:text-gray-200 transition-colors">Ma trận kề (Adjacency Matrix)</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-300 mb-2">Thuộc tính đồ thị</h3>
                        <div className="grid grid-cols-2 gap-3">
                             <button 
                                onClick={() => setDirectedState(!directedState)}
                                className={`px-3 py-2 rounded border text-sm font-medium transition-all ${
                                    directedState 
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                                    : 'bg-gray-800 border-gray-700 text-gray-400'
                                }`}
                             >
                                {directedState ? 'Có hướng (Directed)' : 'Vô hướng (Undirected)'}
                             </button>
                             <button 
                                onClick={() => setIsWeighted(!isWeighted)}
                                className={`px-3 py-2 rounded border text-sm font-medium transition-all ${
                                    isWeighted 
                                    ? 'bg-amber-600/20 border-amber-500 text-amber-400' 
                                    : 'bg-gray-800 border-gray-700 text-gray-400'
                                }`}
                             >
                                {isWeighted ? 'Có trọng số' : 'Không trọng số'}
                             </button>
                        </div>
                    </div>

                     <div>
                        <h3 className="text-sm font-bold text-gray-300 mb-2">Bố cục hiển thị (Layout)</h3>
                        <div className="flex gap-2">
                            {['circle', 'grid', 'random'].map((type) => (
                                 <button 
                                    key={type}
                                    onClick={() => setLayoutType(type as any)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
                                        layoutType === type
                                        ? 'bg-purple-600 border-purple-400 text-white'
                                        : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                                    }`}
                                 >
                                    {type === 'circle' ? 'Hình tròn' : type === 'grid' ? 'Lưới' : 'Ngẫu nhiên'}
                                 </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-end gap-3">
                <button 
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-all border border-gray-700"
                >
                    Đóng
                </button>
                <button 
                    onClick={handleImport}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-900/30"
                >
                    Xác nhận & Vẽ
                </button>
            </div>
        </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 p-10 gap-8">
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">Lưu đồ thị của bạn</h3>
                    <p className="text-gray-400">Chọn định dạng để tải xuống</p>
                </div>

                <div className="flex gap-6">
                    <button 
                        onClick={() => downloadImage('png')}
                        className="group flex flex-col items-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-2xl hover:bg-gray-750 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20 transition-all w-48"
                    >
                         <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-3xl">🖼️</span>
                         </div>
                         <div className="text-center">
                             <span className="block font-bold text-white text-lg">PNG</span>
                             <span className="text-xs text-gray-500">Ảnh chất lượng cao (Raster)</span>
                         </div>
                    </button>

                    <button 
                        onClick={() => downloadImage('svg')}
                        className="group flex flex-col items-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-2xl hover:bg-gray-750 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/20 transition-all w-48"
                    >
                         <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-3xl">✒️</span>
                         </div>
                         <div className="text-center">
                             <span className="block font-bold text-white text-lg">SVG</span>
                             <span className="text-xs text-gray-500">Ảnh vector (Scalable)</span>
                         </div>
                    </button>
                </div>
                
                <p className="text-xs text-gray-600 max-w-md text-center mt-4">
                    Lưu ý: Xuất PNG sẽ chụp lại trạng thái hiển thị hiện tại. Xuất SVG sẽ tạo lại hình ảnh vector dựa trên dữ liệu đồ thị (có thể khác biệt nhỏ về font chữ).
                </p>
            </div>
        )}

      </div>
    </div>
  );
};