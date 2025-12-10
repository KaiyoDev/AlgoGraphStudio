import React from 'react';
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
}

export const GraphEdge: React.FC<GraphEdgeProps> = ({
  id, sourceX, sourceY, targetX, targetY, weight, label, isDirected, color, 
  controlPoint, isSelected, onClick, onDblClick, onContextMenu, onControlPointMove
}) => {
  const { saveHistory } = useGraphStore(); // Get saveHistory action

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

  return (
    <Group>
       {/* The Edge Path */}
       <Path
          data={pathData}
          stroke={strokeColor}
          strokeWidth={isSelected ? 4 : 3}
          hitStrokeWidth={20}
          shadowColor={isSelected ? strokeColor : undefined}
          shadowBlur={isSelected ? 5 : 0}
          onClick={onClick} 
          onTap={onClick} 
          onDblClick={onDblClick} 
          onContextMenu={onContextMenu}
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

      {/* Control Handle (Only if Selected) - Vẫn nằm ở Control Point thực tế để kéo */}
      {isSelected && (
          <Circle
            x={cx}
            y={cy}
            radius={6}
            fill="#ffffff"
            stroke="#2563eb"
            strokeWidth={2}
            draggable
            onDragStart={() => {
                saveHistory(); // Save state before starting to drag curve
            }}
            onDragMove={(e) => {
                onControlPointMove(e.target.x(), e.target.y());
            }}
            onMouseEnter={(e) => {
                 e.target.getStage()!.container().style.cursor = 'move';
                 e.target.scale({ x: 1.5, y: 1.5 });
            }}
            onMouseLeave={(e) => {
                 e.target.getStage()!.container().style.cursor = 'default';
                 e.target.scale({ x: 1, y: 1 });
            }}
          />
      )}
    </Group>
  );
};