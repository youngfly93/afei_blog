import React from 'react';

interface ConnectionPointProps {
  position: 'top' | 'right' | 'bottom' | 'left';
  onDragStart: (e: React.DragEvent, position: string) => void;
  onDragEnter: (e: React.DragEvent, position: string) => void;
  onDragEnd: () => void;
  isActive?: boolean;
}

const ConnectionPoint: React.FC<ConnectionPointProps> = ({
  position,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isActive = false,
}) => {
  const getPositionStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: '12px',
      height: '12px',
      transform: 'translate(-50%, -50%)',
      zIndex: 10,
    };

    switch (position) {
      case 'top':
        return { ...baseStyle, top: '0', left: '50%' };
      case 'right':
        return { ...baseStyle, top: '50%', right: '0', transform: 'translate(50%, -50%)' };
      case 'bottom':
        return { ...baseStyle, bottom: '0', left: '50%', transform: 'translate(-50%, 50%)' };
      case 'left':
        return { ...baseStyle, top: '50%', left: '0', transform: 'translate(-50%, -50%)' };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      className={`rounded-full border-2 ${
        isActive ? 'bg-blue-500 border-blue-600' : 'bg-white border-gray-300'
      } hover:border-blue-500 hover:bg-blue-100 transition-colors cursor-pointer`}
      style={getPositionStyle()}
      draggable
      onDragStart={(e) => onDragStart(e, position)}
      onDragEnter={(e) => onDragEnter(e, position)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    />
  );
};

export default ConnectionPoint; 