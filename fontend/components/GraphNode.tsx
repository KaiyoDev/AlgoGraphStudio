import React, { useState, useRef, useEffect } from 'react';
import { Circle, Text, Group, Rect } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useGraphStore } from '../store';

interface GraphNodeProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  color?: string; 
  labelColor?: string;
  selected: boolean;
  onClick: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDblClick: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void; // Vẫn giữ prop này nhưng component sẽ xử lý logic chính ở DragMove
  onContextMenu: (e: KonvaEventObject<PointerEvent>) => void;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  id, x, y, label, color, labelColor, selected, onClick, onDblClick, onContextMenu
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [justConnected, setJustConnected] = useState(false);
  const { setDrawingEdge, addEdge, drawingEdge, saveHistory, selectedNodeIds, moveNodes, updateNodePosition } = useGraphStore();
  
  // Ref để theo dõi vị trí kéo cho việc tính delta (di chuyển nhóm)
  const lastDragPos = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
      // Reset lastDragPos khi tọa độ thay đổi từ bên ngoài (ví dụ undo/redo)
      lastDragPos.current = { x, y };
  }, [x, y]);

  const handleMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    const isShift = e.evt.shiftKey;
    const stage = e.target.getStage();
    
    if (drawingEdge) {
        if (drawingEdge.sourceId !== id) {
            stage!.container().style.cursor = 'crosshair'; // Visual cue for target
        }
    } else if (isShift) {
        stage!.container().style.cursor = 'crosshair';
    } else {
        stage!.container().style.cursor = 'grab';
    }
    setIsHovered(true);
  };

  const handleMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    if (!drawingEdge) {
        e.target.getStage()!.container().style.cursor = 'default';
    }
    setIsHovered(false);
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const evt = e.evt as MouseEvent;
    
    // Điều kiện vẽ cạnh: Giữ Shift + Left HOẶC Right Click Drag
    const isShiftLeft = evt.shiftKey && evt.button === 0;
    const isRightClick = evt.button === 2;

    if (isShiftLeft || isRightClick) {
        e.cancelBubble = true; 
        
        if (isRightClick) {
             evt.preventDefault();
        }
        
        const stage = e.target.getStage();
        const ptr = stage?.getPointerPosition();
        if (ptr) {
            saveHistory();
            setDrawingEdge({ sourceId: id, x: x, y: y });
        }
    }
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      // Logic kết thúc vẽ cạnh khi thả chuột vào node đích
      if (drawingEdge) {
          if (drawingEdge.sourceId !== id) {
             addEdge(drawingEdge.sourceId, id);
             // Visual Cue: Success Flash
             setJustConnected(true);
             setTimeout(() => setJustConnected(false), 500);
          }
          // Luôn luôn clear state vẽ cạnh khi thả chuột trên node
          setDrawingEdge(null);
          setIsHovered(false); 
          e.target.getStage()!.container().style.cursor = 'default';
      }
  };

  // Determine Visual State
  const isTarget = !!drawingEdge && drawingEdge.sourceId !== id && isHovered;
  
  // Dynamic Styles
  let strokeColor = '#1e293b'; 
  let strokeWidth = 2;
  let shadowColor = color || '#3b82f6';
  let shadowBlur = isHovered ? 15 : 5;
  let shadowOpacity = isHovered ? 0.6 : 0.3;
  let outerRadius = 28;
  let outerOpacity = 0.3;
  let outerFill = color || '#3b82f6';

  if (justConnected) {
      strokeColor = '#4ade80'; // Green Success
      strokeWidth = 4;
      shadowColor = '#4ade80';
      shadowBlur = 30;
      shadowOpacity = 0.8;
      outerRadius = 35;
      outerFill = '#4ade80';
      outerOpacity = 0.6;
  } else if (isTarget) {
      strokeColor = '#facc15'; // Yellow Potential Target
      strokeWidth = 4;
      shadowColor = '#facc15';
      shadowBlur = 20;
      shadowOpacity = 0.7;
      outerRadius = 32;
      outerFill = '#facc15';
      outerOpacity = 0.5;
  } else if (selected || (drawingEdge && drawingEdge.sourceId === id)) {
      strokeColor = '#ffffff';
      strokeWidth = selected ? 3 : 2;
  }

  return (
    <Group
      x={x}
      y={y}
      draggable
      
      onDragStart={(e) => {
        const evt = e.evt as unknown as MouseEvent;
        const isRightClick = evt.button === 2;
        
        // Ngăn chặn kéo nếu đang vẽ cạnh
        if (evt.shiftKey || isRightClick || drawingEdge) {
            e.target.stopDrag();
            return;
        }
        
        saveHistory();
        e.target.getStage()!.container().style.cursor = 'grabbing';
        
        // Lưu vị trí bắt đầu
        lastDragPos.current = { x: x, y: y };
      }}
      
      onDragMove={(e) => {
          // Tính toán delta kể từ frame trước
          const currentX = e.target.x();
          const currentY = e.target.y();
          
          const prevX = lastDragPos.current?.x ?? x;
          const prevY = lastDragPos.current?.y ?? y;
          
          const dx = currentX - prevX;
          const dy = currentY - prevY;

          // Cập nhật vị trí lastDragPos cho frame tiếp theo
          lastDragPos.current = { x: currentX, y: currentY };

          // Xử lý di chuyển
          if (selected && selectedNodeIds.length > 1) {
              // Nếu đang chọn nhiều node: Di chuyển cả nhóm
              const moves = selectedNodeIds.map(nodeId => ({ id: nodeId, dx, dy }));
              moveNodes(moves);
          } else {
              // Nếu chọn 1 node (hoặc không chọn nhưng đang kéo): Di chuyển node này
              // Gọi trực tiếp updateNodePosition để cập nhật store, 
              // store sẽ kích hoạt re-render cho Edge dính theo
              updateNodePosition(id, currentX, currentY);
          }
      }}

      onDragEnd={(e) => {
          lastDragPos.current = null;
          e.target.getStage()!.container().style.cursor = 'default';
      }}
      
      onClick={onClick}
      onTap={onClick}
      onDblClick={onDblClick}
      onContextMenu={onContextMenu}
      
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}

      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Outer Glow / Halo */}
      {(isHovered || selected || (drawingEdge && drawingEdge.sourceId === id) || isTarget || justConnected) && (
        <Circle
          radius={outerRadius}
          fill={outerFill}
          opacity={outerOpacity}
          listening={false}
        />
      )}

      <Circle
        radius={20}
        fill={color || '#3b82f6'}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        shadowColor={shadowColor}
        shadowBlur={shadowBlur}
        shadowOpacity={shadowOpacity}
      />
      
      <Text
        text={label || id}
        fontSize={14}
        fill="white"
        align="center"
        verticalAlign="middle"
        offsetX={10}
        offsetY={7}
        fontStyle="bold"
        listening={false}
      />

      {labelColor && (
        <Group x={15} y={-25}>
            <Rect 
                fill="rgba(0,0,0,0.7)" 
                cornerRadius={4} 
                width={30}
                height={20}
                offsetX={5}
                offsetY={2}
            />
            <Text
            text={labelColor}
            fontSize={12}
            fill="#fca5a5"
            fontStyle="bold"
            />
        </Group>
      )}
    </Group>
  );
};