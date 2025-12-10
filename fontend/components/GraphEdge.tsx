import React from 'react';
import { Line, Text, Group, Arrow } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

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
  onClick: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onContextMenu: (e: KonvaEventObject<PointerEvent>) => void;
}

export const GraphEdge: React.FC<GraphEdgeProps> = ({
  id, sourceX, sourceY, targetX, targetY, weight, label, isDirected, color, onClick, onContextMenu
}) => {
  // Calculate mid point for weight label
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Simple math to shorten line so it doesn't overlap node center (radius 20)
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
  const padding = 22;
  
  const startX = sourceX + padding * Math.cos(angle);
  const startY = sourceY + padding * Math.sin(angle);
  const endX = targetX - padding * Math.cos(angle);
  const endY = targetY - padding * Math.sin(angle);

  return (
    <Group onClick={onClick} onTap={onClick} onContextMenu={onContextMenu}>
      {isDirected ? (
        <Arrow
          points={[startX, startY, endX, endY]}
          stroke={color || '#94a3b8'} // slate-400
          fill={color || '#94a3b8'}
          strokeWidth={4}
          pointerLength={10}
          pointerWidth={10}
          hitStrokeWidth={20} // Easier to click
        />
      ) : (
        <Line
          points={[startX, startY, endX, endY]}
          stroke={color || '#94a3b8'}
          strokeWidth={4}
          hitStrokeWidth={20}
        />
      )}
      
      {/* Weight / Flow Label */}
      <Group x={midX} y={midY}>
        <Text
          text={label ? `${weight} (${label})` : `${weight}`}
          fontSize={12}
          fill="#e2e8f0"
          fontStyle="bold"
          align="center"
          offsetX={10}
          offsetY={10}
          stroke="#1e293b" // outline for readability
          strokeWidth={3}
        />
        <Text
          text={label ? `${weight} (${label})` : `${weight}`}
          fontSize={12}
          fill="#e2e8f0"
          fontStyle="bold"
          align="center"
          offsetX={10}
          offsetY={10}
        />
      </Group>
    </Group>
  );
};