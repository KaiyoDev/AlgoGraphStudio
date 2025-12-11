import React, { useState, useRef } from 'react';
import { Text, Group, Arrow, Path, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useGraphStore } from '../store';

interface GraphEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  weight: number;
  label?: string; // Dynamic label from algo steps
  isDirected: boolean;
  color?: string;
  controlPoint?: { x: number; y: number }; // Manual control point
  isSelected: boolean; // To show control handle
  onClick: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDblClick: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onContextMenu: (e: KonvaEventObject<PointerEvent>) => void;
  onControlPointMove: (x: number, y: number) => void;
  onPathDragStart?: () => void; // Callback khi bắt đầu drag trên path
}

export const GraphEdge: React.FC<GraphEdgeProps> = ({
  id, sourceX, sourceY, targetX, targetY, weight, label, isDirected, color, 
  controlPoint, isSelected, onClick, onDblClick, onContextMenu, onControlPointMove, onPathDragStart
}) => {
  const { saveHistory } = useGraphStore(); // Get saveHistory action
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPathDragging, setIsPathDragging] = useState(false);
  const pathDragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const isSelfLoop = sourceX === targetX && sourceY === targetY;
  const strokeColor = color || '#94a3b8';
  
  // 1. SELF LOOP HANDLING
  if (isSelfLoop) {
    // Vẽ một vòng tròn (Cubic Bezier) phía trên bên trái nút
    const r = 20; 
    const loopOffset = 50; 
    
    // Control points for the loop
    const p1x = sourceX - r; 
    const p1y = sourceY - r;
    const cp1x = sourceX - loopOffset;
    const cp1y = sourceY - loopOffset;
    const cp2x = sourceX + loopOffset;
    const cp2y = sourceY - loopOffset;
    const p2x = sourceX + r;
    const p2y = sourceY - r;

    // SVG Path data syntax
    const pathData = `M ${p1x} ${p1y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2x} ${p2y}`;

    return (
        <Group onClick={onClick} onTap={onClick} onDblClick={onDblClick} onContextMenu={onContextMenu}>
            <Path
                data={pathData}
                stroke={strokeColor}
                strokeWidth={isSelected ? 4 : 3}
                hitStrokeWidth={20}
                shadowColor={isSelected ? strokeColor : undefined}
                shadowBlur={10}
            />
             {isDirected && (
                <Arrow
                    points={[p2x-5, p2y-10, p2x, p2y]} 
                    pointerLength={10}
                    pointerWidth={10}
                    fill={strokeColor}
                    stroke={strokeColor}
                    strokeWidth={4}
                />
            )}
            <Text
                x={sourceX}
                y={sourceY - loopOffset - 10}
                text={label ? `${weight} (${label})` : `${weight}`}
                fontSize={12}
                fill="#e2e8f0"
                fontStyle="bold"
                align="center"
                offsetX={10}
            />
        </Group>
    );
  }

  // 2. CONNECTING EDGE (Straight or Curved)
  
  // Determine Control Point (CP)
  let cx, cy;
  if (controlPoint) {
      cx = controlPoint.x;
      cy = controlPoint.y;
  } else {
      // Default midpoint
      cx = (sourceX + targetX) / 2;
      cy = (sourceY + targetY) / 2;
  }

  // Quadratic Bezier Path: M start Q control end
  const pathData = `M ${sourceX} ${sourceY} Q ${cx} ${cy} ${targetX} ${targetY}`;
  
  // Tính toán vị trí nhãn nằm trên đường cong Bezier tại t=0.5
  // Công thức Bezier bậc 2 tại t=0.5: P = 0.25*P0 + 0.5*P1 + 0.25*P2
  const labelX = 0.25 * sourceX + 0.5 * cx + 0.25 * targetX;
  const labelY = 0.25 * sourceY + 0.5 * cy + 0.25 * targetY;

  // Calculate Arrow Head Angle/Position
  const dx = targetX - cx;
  const dy = targetY - cy;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const padding = 20; // Radius of node
  
  const arrowX = targetX - (dx / dist) * padding;
  const arrowY = targetY - (dy / dist) * padding;

  // Xử lý kéo trực tiếp trên cạnh để uốn cong
  const handlePathMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const evt = e.evt as MouseEvent;
    // Chỉ kéo khi nhấn giữ chuột trái (không phải right click)
    if (evt.button === 0) {
      const stage = e.target.getStage();
      if (stage) {
        const pointer = stage.getPointerPosition();
        if (pointer) {
          pathDragStartPosRef.current = { x: pointer.x, y: pointer.y };
          // Gọi callback để GraphCanvas biết edge nào đang được drag
          if (onPathDragStart) {
            onPathDragStart();
          }
        }
      }
    }
  };

  return (
    <Group>
       {/* The Edge Path - có thể kéo trực tiếp để uốn cong */}
       <Path
          data={pathData}
          stroke={strokeColor}
          strokeWidth={isSelected ? 4 : 3}
          hitStrokeWidth={20}
          shadowColor={isSelected ? strokeColor : undefined}
          shadowBlur={isSelected ? 5 : 0}
          onClick={(e) => {
            // Chỉ click khi không đang drag (kiểm tra xem có di chuyển chuột đáng kể không)
            if (pathDragStartPosRef.current) {
              const stage = e.target.getStage();
              if (stage) {
                const pointer = stage.getPointerPosition();
                if (pointer) {
                  const dx = Math.abs(pointer.x - pathDragStartPosRef.current.x);
                  const dy = Math.abs(pointer.y - pathDragStartPosRef.current.y);
                  // Nếu di chuyển ít hơn 5px, coi như là click, không phải drag
                  if (dx < 5 && dy < 5) {
                    onClick(e);
                  }
                }
              }
              pathDragStartPosRef.current = null;
            } else {
              onClick(e);
            }
          }}
          onTap={onClick} 
          onDblClick={onDblClick} 
          onContextMenu={onContextMenu}
          onMouseDown={handlePathMouseDown}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
          onMouseEnter={() => setIsHovered(true)}
       />
      
      {/* Arrow Head */}
      {isDirected && (
        <Arrow
           points={[cx, cy, arrowX, arrowY]} 
           stroke="transparent" 
           fill={strokeColor}
           pointerLength={10}
           pointerWidth={10}
        />
      )}
      {/* Re-implementing manual Arrow Head to ensure it looks right on curves */}
      {isDirected && (
           <Arrow
              points={[arrowX - (dx/dist)*0.1, arrowY - (dy/dist)*0.1, arrowX, arrowY]}
              stroke={strokeColor}
              fill={strokeColor}
              strokeWidth={4}
              pointerLength={10}
              pointerWidth={10}
              listening={false}
           />
      )}

      {/* Label (Placed on the curve at t=0.5) */}
      <Group x={labelX} y={labelY} listening={false}>
         {/* Background outline for readability */}
        <Text
          text={label ? `${weight} (${label})` : `${weight}`}
          fontSize={12}
          fill="#e2e8f0"
          fontStyle="bold"
          align="center"
          offsetX={10}
          offsetY={6}
          stroke="#0f172a" 
          strokeWidth={4}
        />
        <Text
          text={label ? `${weight} (${label})` : `${weight}`}
          fontSize={12}
          fill="#e2e8f0"
          fontStyle="bold"
          align="center"
          offsetX={10}
          offsetY={6}
        />
      </Group>

    </Group>
  );
};