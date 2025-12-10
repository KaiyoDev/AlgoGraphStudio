import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Stage, Layer, Arrow, Rect } from 'react-konva';
import { useGraphStore } from '../store';
import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';
import { KonvaEventObject } from 'konva/lib/Node';

const getParallelEdges = (edges: any[]) => {
    const groups: Record<string, any[]> = {};
    edges.forEach(edge => {
        const pairId = [edge.source, edge.target].sort().join('-');
        if (!groups[pairId]) groups[pairId] = [];
        groups[pairId].push(edge);
    });
    return groups;
};

const SelectionToolbar = ({ 
    selectedNodeIds, 
    selectedEdgeIds,
    nodes,
    edges, 
    scale, 
    position, 
    updateNodePosition,
    updateEdgeWeight
}: any) => {
    const isSingleEdge = selectedEdgeIds.length === 1 && selectedNodeIds.length === 0;
    const isSingleNode = selectedNodeIds.length === 1 && selectedEdgeIds.length === 0;

    if (!isSingleEdge && !isSingleNode) return null;

    let targetX = 0;
    let targetY = 0;
    
    if (isSingleEdge) {
        const edge = edges.find((e: any) => e.id === selectedEdgeIds[0]);
        if (!edge) return null;
        const source = nodes.find((n: any) => n.id === edge.source);
        const target = nodes.find((n: any) => n.id === edge.target);
        if (!source || !target) return null;

        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        targetX = midX * scale + position.x;
        targetY = midY * scale + position.y - 50;
    } else if (isSingleNode) {
        const node = nodes.find((n: any) => n.id === selectedNodeIds[0]);
        if (!node) return null;
        targetX = node.x * scale + position.x;
        targetY = node.y * scale + position.y - 60;
    }

    return (
        <div 
            className="absolute flex items-center gap-2 bg-gray-900/90 backdrop-blur-md border border-white/20 p-2.5 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 animate-in zoom-in fade-in duration-300 slide-in-from-bottom-2 origin-bottom"
            style={{ 
                left: targetX, 
                top: targetY,
                transform: 'translateX(-50%)'
            }}
        >
             {/* Decor arrow */}
             <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-r border-b border-white/20 rotate-45 transform" />

            {isSingleEdge && (() => {
                 const edge = edges.find((e: any) => e.id === selectedEdgeIds[0]);
                 if(!edge) return null;
                 return (
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Weight</span>
                            <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/10">
                                <span className="text-gray-400 text-xs font-bold px-1">W:</span>
                                <input 
                                    type="number" 
                                    value={edge.weight}
                                    onChange={(e) => updateEdgeWeight(edge.id, parseFloat(e.target.value))}
                                    className="w-16 bg-transparent text-blue-400 text-sm font-mono font-bold focus:outline-none text-center"
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    </div>
                 )
            })()}

            {isSingleNode && (() => {
                const node = nodes.find((n: any) => n.id === selectedNodeIds[0]);
                if(!node) return null;
                return (
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Position</span>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/10 hover:border-blue-500/50 transition-colors">
                                    <span className="text-gray-500 text-[10px] font-bold px-1">X</span>
                                    <input 
                                        type="number" 
                                        value={Math.round(node.x)}
                                        onChange={(e) => updateNodePosition(node.id, parseFloat(e.target.value), node.y)}
                                        className="w-12 bg-transparent text-white text-xs font-mono focus:outline-none"
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/10 hover:border-blue-500/50 transition-colors">
                                    <span className="text-gray-500 text-[10px] font-bold px-1">Y</span>
                                    <input 
                                        type="number" 
                                        value={Math.round(node.y)}
                                        onChange={(e) => updateNodePosition(node.id, node.x, parseFloat(e.target.value))}
                                        className="w-12 bg-transparent text-white text-xs font-mono focus:outline-none"
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    );
};

export const GraphCanvas: React.FC = () => {
  const { 
    nodes, edges,
    addNode, updateNodePosition, updateEdgeControlPoint,
    deleteElement, deleteSelected,
    steps, currentStepIndex,
    selectNode, selectEdge, selectedNodeIds, selectedEdgeIds, 
    selectRegion, 
    clearSelection,
    scale, position, setViewport, setMode,
    drawingEdge, setDrawingEdge, isDirected,
    showHelp, toggleHelp, updateEdgeWeight,
    saveHistory, moveNodes, setStageRef
  } = useGraphStore();

  const [selectionBox, setSelectionBox] = useState<{ start: {x: number, y: number}, current: {x: number, y: number} } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState<{x: number, y: number} | null>(null);
  
  // Use useCallback to strictly control when setStageRef is called.
  // We access the current store state directly to avoid redundant updates if the ref hasn't changed.
  const handleStageRef = useCallback((node: any) => {
    if (node && useGraphStore.getState().stageRef !== node) {
        setStageRef(node);
    }
  }, [setStageRef]);

  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      const isInputActive = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isInputActive) {
            deleteSelected();
        }
      }
      
      if (e.key === 'Escape') {
        setDrawingEdge(null);
        clearSelection();
        setSelectionBox(null);
        setIsPanning(false);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          if (!isInputActive) {
              if (e.shiftKey) {
                 useGraphStore.getState().redo();
              } else {
                 useGraphStore.getState().undo();
              }
          }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
          e.preventDefault();
          if (!isInputActive) {
              useGraphStore.getState().redo();
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteSelected, setMode, setDrawingEdge, clearSelection]);

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length 
    ? steps[currentStepIndex] 
    : null;

  const parallelGroups = useMemo(() => getParallelEdges(edges), [edges]);

  const getEdgeControlPoint = (edge: any, sourceNode: any, targetNode: any) => {
      if (edge.controlPoint) return edge.controlPoint;

      const nodeIds = [edge.source, edge.target].sort();
      const pairId = nodeIds.join('-');
      const group = parallelGroups[pairId] || [];
      const total = group.length;

      if (total <= 1) return undefined;

      const u = nodes.find(n => n.id === nodeIds[0]); 
      const v = nodes.find(n => n.id === nodeIds[1]); 
      
      if (!u || !v) return undefined;

      const midX = (u.x + v.x) / 2;
      const midY = (u.y + v.y) / 2;

      const dx = v.x - u.x;
      const dy = v.y - u.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist === 0) return { x: midX, y: midY - 50 }; 

      const nx = -dy / dist;
      const ny = dx / dist;

      const index = group.findIndex(e => e.id === edge.id);
      const CURVE_STEP = 40; 
      const offsetFactor = index - (total - 1) / 2;
      
      const offsetX = midX + nx * offsetFactor * CURVE_STEP;
      const offsetY = midY + ny * offsetFactor * CURVE_STEP;

      return { x: offsetX, y: offsetY };
  };

  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    // Only handle background clicks for pan/select
    if (e.target !== stage) return;
    const evt = e.evt as MouseEvent;

    // Right click to Pan
    if (evt.button === 2) {
        setIsPanning(true);
        setLastPanPosition({ x: evt.clientX, y: evt.clientY });
        if(stage) stage.container().style.cursor = 'grabbing';
        return;
    }

    // Left click to Box Select
    if (evt.button === 0) {
        const ptr = stage?.getPointerPosition();
        if (ptr) {
            const x = (ptr.x - stage!.x()) / stage!.scaleX();
            const y = (ptr.y - stage!.y()) / stage!.scaleY();
            
            setSelectionBox({ 
                start: { x, y }, 
                current: { x, y } 
            });
            clearSelection(); 
        }
    }
  };

  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      const stage = e.target.getStage();
      const evt = e.evt as MouseEvent;

      if (isPanning && lastPanPosition) {
          const dx = evt.clientX - lastPanPosition.x;
          const dy = evt.clientY - lastPanPosition.y;

          setViewport(scale, {
              x: position.x + dx,
              y: position.y + dy
          });
          setLastPanPosition({ x: evt.clientX, y: evt.clientY });
          return;
      }

      if (drawingEdge) {
          const pointer = stage?.getPointerPosition();
          if (pointer && stage) {
              const x = (pointer.x - stage.x()) / stage.scaleX();
              const y = (pointer.y - stage.y()) / stage.scaleY();
              setDrawingEdge({ ...drawingEdge, x, y });
          }
      }

      if (selectionBox) {
          const pointer = stage?.getPointerPosition();
          if (pointer && stage) {
              const x = (pointer.x - stage.x()) / stage.scaleX();
              const y = (pointer.y - stage.y()) / stage.scaleY();
              setSelectionBox({ 
                  ...selectionBox, 
                  current: { x, y } 
              });
          }
      }
  };

  const handleStageMouseUp = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      const stage = e.target.getStage();
      if (isPanning) {
          setIsPanning(false);
          setLastPanPosition(null);
          if(stage) stage.container().style.cursor = 'default';
      }

      if (drawingEdge) {
          const target = e.target;
          if (target === e.target.getStage() || target.className === 'Layer') {
              setDrawingEdge(null);
          }
      }

      if (selectionBox) {
          const sx = Math.min(selectionBox.start.x, selectionBox.current.x);
          const sy = Math.min(selectionBox.start.y, selectionBox.current.y);
          const w = Math.abs(selectionBox.current.x - selectionBox.start.x);
          const h = Math.abs(selectionBox.current.y - selectionBox.start.y);

          selectRegion(sx, sy, w, h);
          setSelectionBox(null);
      }
  };

  const handleStageDblClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (e.target === stage && !isPanning) {
      const pointer = stage?.getPointerPosition();
      if (pointer) {
        addNode(pointer.x, pointer.y);
      }
    }
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.1 || newScale > 5) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setViewport(newScale, newPos);
  };

  const handleNodeClick = (e: KonvaEventObject<MouseEvent | TouchEvent>, nodeId: string) => {
    e.cancelBubble = true;
    const isMulti = e.evt.ctrlKey || e.evt.shiftKey;
    selectNode(nodeId, isMulti);
  };

  const handleNodeDblClick = (e: KonvaEventObject<MouseEvent | TouchEvent>, nodeId: string) => {
     e.cancelBubble = true;
     deleteElement('node', nodeId);
  };

  const handleEdgeClick = (e: KonvaEventObject<MouseEvent | TouchEvent>, edgeId: string) => {
    e.cancelBubble = true;
    const isMulti = e.evt.ctrlKey || e.evt.shiftKey;
    selectEdge(edgeId, isMulti);
  };

  const handleEdgeDblClick = (e: KonvaEventObject<MouseEvent | TouchEvent>, edgeId: string) => {
      e.cancelBubble = true;
      selectEdge(edgeId);
  };

  const drawingSourceNode = drawingEdge ? nodes.find(n => n.id === drawingEdge.sourceId) : null;

  return (
    <div className="flex-1 bg-[#09090b] relative overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
            backgroundImage: `radial-gradient(#334155 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
        }}
      />

      <Stage
        width={window.innerWidth - 320}
        height={window.innerHeight}
        draggable={false} 
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove} 
        onMouseUp={handleStageMouseUp}    
        onTouchStart={handleStageMouseDown}
        onDblClick={handleStageDblClick}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        ref={handleStageRef}
      >
        <Layer>
          {edges.map((edge) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            let color = '#475569'; 
            let isSelected = selectedEdgeIds.includes(edge.id);
            
            if (currentStep?.highlightEdges[edge.id]) {
              color = currentStep.highlightEdges[edge.id];
            } else if (isSelected) {
              color = '#60a5fa'; 
            }

            const controlPoint = getEdgeControlPoint(edge, sourceNode, targetNode);

            return (
              <GraphEdge
                key={edge.id}
                id={edge.id}
                sourceX={sourceNode.x}
                sourceY={sourceNode.y}
                targetX={targetNode.x}
                targetY={targetNode.y}
                weight={edge.weight}
                isDirected={edge.isDirected}
                label={currentStep?.edgeLabels?.[edge.id]}
                color={color}
                controlPoint={controlPoint} 
                isSelected={isSelected}
                onClick={(e) => handleEdgeClick(e, edge.id)}
                onDblClick={(e) => handleEdgeDblClick(e, edge.id)}
                onContextMenu={(e) => e.evt.preventDefault()}
                onControlPointMove={(x, y) => updateEdgeControlPoint(edge.id, x, y)}
              />
            );
          })}

          {drawingEdge && drawingSourceNode && (
             <Arrow
                points={[drawingSourceNode.x, drawingSourceNode.y, drawingEdge.x, drawingEdge.y]}
                stroke="#60a5fa"
                strokeWidth={2}
                dash={[10, 5]}
                pointerLength={isDirected ? 10 : 0}
                pointerWidth={isDirected ? 10 : 0}
                opacity={0.8}
                listening={false}
             />
          )}

          {nodes.map((node) => {
            let color = '#3b82f6'; 
            let isSelected = selectedNodeIds.includes(node.id);
            
            if (currentStep?.highlightNodes[node.id]) {
              color = currentStep.highlightNodes[node.id];
            } else if (drawingEdge?.sourceId === node.id) {
              color = '#f59e0b';
            } else if (isSelected) {
              color = '#2563eb'; 
            }

            return (
              <GraphNode
                key={node.id}
                id={node.id}
                x={node.x}
                y={node.y}
                label={node.label}
                selected={isSelected}
                color={color}
                labelColor={currentStep?.nodeLabels?.[node.id]}
                onClick={(e) => handleNodeClick(e, node.id)}
                onDblClick={(e) => handleNodeDblClick(e, node.id)}
                onDragEnd={(e) => updateNodePosition(node.id, e.target.x(), e.target.y())}
                onContextMenu={(e) => e.evt.preventDefault()}
              />
            );
          })}
          
          {selectionBox && (
              <Rect
                x={Math.min(selectionBox.start.x, selectionBox.current.x)}
                y={Math.min(selectionBox.start.y, selectionBox.current.y)}
                width={Math.abs(selectionBox.current.x - selectionBox.start.x)}
                height={Math.abs(selectionBox.current.y - selectionBox.start.y)}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#60a5fa"
                strokeWidth={1}
                dash={[5, 5]}
                listening={false}
              />
          )}

        </Layer>
      </Stage>
      
      <SelectionToolbar 
         selectedNodeIds={selectedNodeIds}
         selectedEdgeIds={selectedEdgeIds}
         nodes={nodes}
         edges={edges}
         scale={scale}
         position={position}
         updateNodePosition={updateNodePosition}
         updateEdgeWeight={updateEdgeWeight}
      />
      
      {showHelp && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 w-[550px] max-w-[90%] transform transition-all animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
                    💡 Hướng Dẫn Nhanh
                </h2>
                <button onClick={toggleHelp} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xl">&times;</button>
            </div>
            
            <div className="space-y-5 text-sm text-gray-300">
                <div className="flex items-center gap-4 group">
                    <div className="bg-blue-500/10 text-blue-400 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border border-blue-500/20 group-hover:scale-110 transition-transform">x2</div>
                    <div>
                        <strong className="text-white block text-base mb-0.5">Tạo Nút (Node)</strong>
                        <span className="text-gray-400">Double Click chuột trái vào vùng trống bất kỳ.</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 group">
                    <div className="bg-amber-500/10 text-amber-400 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border border-amber-500/20 group-hover:scale-110 transition-transform">🖱️</div>
                    <div>
                        <strong className="text-white block text-base mb-0.5">Tạo Cạnh (Edge)</strong>
                        <span className="text-gray-400">Giữ <strong className="text-white">Chuột Phải</strong> vào nút nguồn và kéo sang nút đích.</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 group">
                    <div className="bg-purple-500/10 text-purple-400 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border border-purple-500/20 group-hover:scale-110 transition-transform">✏️</div>
                    <div>
                        <strong className="text-white block text-base mb-0.5">Chỉnh Sửa</strong>
                        <span className="text-gray-400">Click chọn đối tượng để hiện thanh công cụ sửa đổi.</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 group">
                    <div className="bg-red-500/10 text-red-400 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border border-red-500/20 group-hover:scale-110 transition-transform">Del</div>
                    <div>
                        <strong className="text-white block text-base mb-0.5">Xóa</strong>
                        <span className="text-gray-400">Chọn đối tượng và nhấn phím <kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 text-xs text-white font-mono">Delete</kbd>.</span>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={toggleHelp}
                className="mt-8 w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all active:scale-95"
            >
                Bắt đầu sáng tạo
            </button>
            </div>
        </div>
      )}
    </div>
  );
};