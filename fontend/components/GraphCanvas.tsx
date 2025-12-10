import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Circle, Rect } from 'react-konva';
import { useGraphStore } from '../store';
import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';
import { KonvaEventObject } from 'konva/lib/Node';

export const GraphCanvas: React.FC = () => {
  const { 
    nodes, edges, mode, 
    addNode, updateNodePosition, addEdge, 
    tempSourceNodeId, setTempSource, deleteElement, deleteSelected,
    steps, currentStepIndex,
    selectNode, selectEdge, selectedNodeId, selectedEdgeId,
    scale, position, setViewport, setMode
  } = useGraphStore();

  const stageRef = useRef<any>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
      // Escape key to cancel current action/selection
      if (e.key === 'Escape') {
        setMode('pointer');
        setTempSource(null);
        selectNode(null);
        selectEdge(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, setMode, setTempSource, selectNode, selectEdge]);

  // Get current step state for highlights
  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length 
    ? steps[currentStepIndex] 
    : null;

  const handleStageClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    // If clicked on empty stage (background)
    if (e.target === stage) {
      if (mode === 'node') {
        const pointer = stage?.getPointerPosition();
        if (pointer) {
          addNode(pointer.x, pointer.y);
        }
      }
      // Deselect if clicking background
      if (mode === 'pointer') {
        selectNode(null);
        selectEdge(null);
      }
      // Cancel edge creation
      if (mode === 'edge') {
        setTempSource(null);
      }
    }
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit zoom
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
    
    if (mode === 'delete') {
      deleteElement('node', nodeId);
      return;
    }

    if (mode === 'edge') {
      if (tempSourceNodeId === null) {
        setTempSource(nodeId);
      } else {
        addEdge(tempSourceNodeId, nodeId);
        setTempSource(null);
      }
    }

    if (mode === 'pointer') {
      selectNode(nodeId);
    }
  };

  const handleEdgeClick = (e: KonvaEventObject<MouseEvent | TouchEvent>, edgeId: string) => {
    e.cancelBubble = true;
    if (mode === 'delete') {
      deleteElement('edge', edgeId);
      return;
    }
    if (mode === 'pointer') {
      selectEdge(edgeId);
    }
  };

  const handleContextMenu = (e: KonvaEventObject<PointerEvent>, type: 'node' | 'edge', id: string) => {
    e.evt.preventDefault();
    deleteElement(type, id);
  };

  return (
    <div className="flex-1 bg-gray-950 relative overflow-hidden cursor-crosshair">
      <Stage
        width={window.innerWidth - 320} // Subtract Sidebar width
        height={window.innerHeight}
        draggable={mode === 'pointer'} // Only drag stage in pointer mode
        onMouseDown={handleStageClick}
        onTouchStart={handleStageClick}
        onWheel={handleWheel}
        onDragEnd={(e) => {
           // Update viewport position in store after drag
           if (e.target === e.target.getStage()) {
               setViewport(scale, { x: e.target.x(), y: e.target.y() });
           }
        }}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        ref={stageRef}
      >
        <Layer>
          {/* Edges */}
          {edges.map((edge) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            let color = '#475569'; // default gray-600
            let width = 4;
            
            // Highlight logic
            if (currentStep?.highlightEdges[edge.id]) {
              color = currentStep.highlightEdges[edge.id];
              width = 6;
            } else if (selectedEdgeId === edge.id) {
              color = '#60a5fa'; // Blue-400 for selection
              width = 6;
            }

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
                onClick={(e) => handleEdgeClick(e, edge.id)}
                onContextMenu={(e) => handleContextMenu(e, 'edge', edge.id)}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            let color = '#3b82f6'; // default blue-500
            let isSelected = selectedNodeId === node.id;
            
            // Highlight logic
            if (currentStep?.highlightNodes[node.id]) {
              color = currentStep.highlightNodes[node.id];
            } else if (tempSourceNodeId === node.id) {
              color = '#f59e0b'; // Amber for source
            } else if (isSelected) {
              color = '#2563eb'; // Darker blue for selection
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
                onDragEnd={(e) => updateNodePosition(node.id, e.target.x(), e.target.y())}
                onContextMenu={(e) => handleContextMenu(e, 'node', node.id)}
              />
            );
          })}
        </Layer>
      </Stage>
      
      {/* Helper UI Overlays */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        {mode === 'edge' && tempSourceNodeId && (
            <div className="bg-blue-600/90 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            🔗 Chọn nút đích để nối
            </div>
        )}
        <div className="text-[10px] text-gray-500 bg-gray-900/50 p-2 rounded border border-gray-800">
           Zoom: Lăn chuột | Pan: Kéo chuột (Chế độ Chọn) | Xóa: Delete
        </div>
      </div>
    </div>
  );
};