import React, { useState } from 'react';
import Link from 'next/link';
import ConnectionPoint from './ConnectionPoint';
import EditBlogModal from './EditBlogModal';

interface Position {
  x: number;
  y: number;
}

interface ArticleCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  color?: string;
  index: number;
  position?: Position;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: {
    title: string;
    content: string;
    author: string;
    color: string;
  }) => void;
  onConnectionStart: (cardId: string, position: string) => void;
  onConnectionEnter: (cardId: string, position: string) => void;
  onConnectionEnd: () => void;
  activeConnections?: { [key: string]: boolean };
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  content,
  author,
  createdAt,
  color = 'bg-white',
  index,
  position,
  onDragStart,
  onDragEnd,
  onDelete,
  onEdit,
  onConnectionStart,
  onConnectionEnter,
  onConnectionEnd,
  activeConnections = {}
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const style: React.CSSProperties = position
    ? {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '300px',
        transform: 'translate(0, 0)',
        zIndex: 1
      }
    : {
        position: 'relative',
        width: '300px',
        transform: 'translate(0, 0)',
      };

  const handleCardDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('type', 'card');
    onDragStart(e, index);
  };

  const handleConnectionDragStart = (e: React.DragEvent, position: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('type', 'connection');
    onConnectionStart(id, position);
  };

  const handleConnectionDragEnter = (e: React.DragEvent, position: string) => {
    e.stopPropagation();
    e.preventDefault();
    onConnectionEnter(id, position);
  };

  const handleCardClick = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = (id: string, updates: any) => {
    onEdit(id, updates);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div 
        className={`${color} rounded-lg shadow-md p-6 mb-4 cursor-move transition-transform hover:scale-[1.02]`}
        style={style}
        draggable
        onDragStart={handleCardDragStart}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleCardClick}
      >
        <h2 className="text-xl font-bold mb-2 hover:text-blue-600">{title}</h2>
        <p className="text-gray-600 mb-4">{content.substring(0, 150)}...</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>By {author}</span>
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {['top', 'right', 'bottom', 'left'].map((pos) => (
          <ConnectionPoint
            key={pos}
            position={pos as 'top' | 'right' | 'bottom' | 'left'}
            onDragStart={handleConnectionDragStart}
            onDragEnter={handleConnectionDragEnter}
            onDragEnd={onConnectionEnd}
            isActive={activeConnections[`${id}-${pos}`]}
          />
        ))}
      </div>

      {isEditModalOpen && (
        <EditBlogModal
          article={{ id, title, content, author, color }}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ArticleCard; 