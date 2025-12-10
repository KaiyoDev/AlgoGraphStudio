import React, { useState } from 'react';
import { Circle, Text, Group, Rect } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

interface GraphNodeProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  color?: string; // Highlight color
  labelColor?: string; // Extra label (e.g. distance)
  selected: boolean;
  onClick: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onContextMenu: (e: KonvaEventObject<PointerEvent>) => void;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  id, x, y, label, color, labelColor, selected, onClick, onDragEnd, onContextMenu
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    e.target.getStage()!.container().style.cursor = 'grab';
    setIsHovered(true);
  };

  const handleMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    e.target.getStage()!.container().style.cursor = 'default';
    setIsHovered(false);
  };

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={onDragEnd}
      onClick={onClick}
      onTap={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragStart={(e) => {
        e.target.getStage()!.container().style.cursor = 'grabbing';
      }}
    >
      {/* Glow Effect when hovered or selected */}
      {(isHovered || selected) && (
        <Circle
          radius={28}
          fill={color || '#3b82f6'}
          opacity={0.3}
          listening={false}
        />
      )}

      {/* Main Node Circle */}
      <Circle
        radius={20}
        fill={color || '#3b82f6'}
        stroke={selected ? '#ffffff' : '#1e293b'}
        strokeWidth={selected ? 3 : 2}
        shadowColor={color || '#3b82f6'}
        shadowBlur={isHovered ? 15 : 5}
        shadowOpacity={isHovered ? 0.6 : 0.3}
      />
      
      {/* Node Label (ID) */}
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

      {/* Algorithm Label (e.g., Distance/Cost) */}
      {labelColor && (
        <Group x={15} y={-25}>
            <Rect 
                fill="rgba(0,0,0,0.7)" 
                cornerRadius={4} 
                width={30} // Approximate width
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