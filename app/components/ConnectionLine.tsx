import React, { useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface ConnectionLineProps {
  start: Point;
  end: Point;
  startPosition: string;
  endPosition: string;
  onClick?: () => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  start,
  end,
  startPosition,
  endPosition,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getControlPoints = (): [Point, Point] => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const controlLen = Math.min(Math.abs(dx), Math.abs(dy), 100);

    let cp1: Point = { x: start.x, y: start.y };
    let cp2: Point = { x: end.x, y: end.y };

    switch (startPosition) {
      case 'right':
        cp1.x += controlLen;
        break;
      case 'left':
        cp1.x -= controlLen;
        break;
      case 'bottom':
        cp1.y += controlLen;
        break;
      case 'top':
        cp1.y -= controlLen;
        break;
    }

    switch (endPosition) {
      case 'right':
        cp2.x += controlLen;
        break;
      case 'left':
        cp2.x -= controlLen;
        break;
      case 'bottom':
        cp2.y += controlLen;
        break;
      case 'top':
        cp2.y -= controlLen;
        break;
    }

    return [cp1, cp2];
  };

  const [cp1, cp2] = getControlPoints();
  const path = `M ${start.x},${start.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${end.x},${end.y}`;

  // Calculate arrow points
  const angle = Math.atan2(end.y - cp2.y, end.x - cp2.x);
  const arrowLength = 10;

  const arrowPoint1 = {
    x: end.x - arrowLength * Math.cos(angle - Math.PI / 6),
    y: end.y - arrowLength * Math.sin(angle - Math.PI / 6)
  };

  const arrowPoint2 = {
    x: end.x - arrowLength * Math.cos(angle + Math.PI / 6),
    y: end.y - arrowLength * Math.sin(angle + Math.PI / 6)
  };

  // Calculate the midpoint of the path for the delete button
  const t = 0.5; // Parameter for the point on the Bezier curve (0.5 = middle)
  const midX = Math.pow(1-t, 3) * start.x + 
               3 * Math.pow(1-t, 2) * t * cp1.x + 
               3 * (1-t) * Math.pow(t, 2) * cp2.x + 
               Math.pow(t, 3) * end.x;
  const midY = Math.pow(1-t, 3) * start.y + 
               3 * Math.pow(1-t, 2) * t * cp1.y + 
               3 * (1-t) * Math.pow(t, 2) * cp2.y + 
               Math.pow(t, 3) * end.y;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <g 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ pointerEvents: 'all' }}
    >
      {/* Invisible wider path for easier hovering and clicking */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        style={{ pointerEvents: 'stroke' }}
        onClick={handleClick}
      />
      {/* Visible path */}
      <path
        d={path}
        fill="none"
        stroke={isHovered ? '#3b82f6' : '#94a3b8'}
        strokeWidth="2"
        pointerEvents="none"
      />
      {/* Arrow */}
      <path
        d={`M ${end.x},${end.y} L ${arrowPoint1.x},${arrowPoint1.y} L ${arrowPoint2.x},${arrowPoint2.y} Z`}
        fill={isHovered ? '#3b82f6' : '#94a3b8'}
        pointerEvents="none"
      />
      {/* Delete button */}
      {isHovered && (
        <g
          transform={`translate(${midX}, ${midY})`}
          onClick={handleClick}
          style={{ pointerEvents: 'all', cursor: 'pointer' }}
        >
          <circle
            r="12"
            fill="white"
            stroke="#ef4444"
            strokeWidth="2"
          />
          <line
            x1="-6"
            y1="-6"
            x2="6"
            y2="6"
            stroke="#ef4444"
            strokeWidth="2"
          />
          <line
            x1="-6"
            y1="6"
            x2="6"
            y2="-6"
            stroke="#ef4444"
            strokeWidth="2"
          />
        </g>
      )}
    </g>
  );
};

export default ConnectionLine; 