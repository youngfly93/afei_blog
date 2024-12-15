'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ArticleCard from './components/ArticleCard'
import AddBlogModal from './components/AddBlogModal'
import ConnectionLine from './components/ConnectionLine'

interface Position {
  x: number;
  y: number;
}

interface Connection {
  startCard: string;
  endCard: string;
  startPosition: string;
  endPosition: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  color?: string;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [positions, setPositions] = useState<{ [key: string]: Position }>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnection, setActiveConnection] = useState<{
    startCard: string;
    startPosition: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedArticles = JSON.parse(localStorage.getItem('articles') || '[]');
    const storedPositions = JSON.parse(localStorage.getItem('positions') || '{}');
    const storedConnections = JSON.parse(localStorage.getItem('connections') || '[]');
    setArticles(storedArticles);
    setPositions(storedPositions);
    setConnections(storedConnections);
  }, []);

  const handleAddBlog = (newBlog: Omit<Article, 'id' | 'createdAt'>) => {
    const id = (articles.length + 1).toString();
    const updatedArticles = [...articles, { 
      ...newBlog, 
      id,
      createdAt: new Date().toISOString()
    }];
    setArticles(updatedArticles);
    localStorage.setItem('articles', JSON.stringify(updatedArticles));
    setIsModalOpen(false);
  };

  const handleDeleteBlog = (id: string) => {
    const updatedArticles = articles.filter(article => article.id !== id);
    const updatedPositions = { ...positions };
    delete updatedPositions[id];
    const updatedConnections = connections.filter(
      conn => conn.startCard !== id && conn.endCard !== id
    );
    
    setArticles(updatedArticles);
    setPositions(updatedPositions);
    setConnections(updatedConnections);
    localStorage.setItem('articles', JSON.stringify(updatedArticles));
    localStorage.setItem('positions', JSON.stringify(updatedPositions));
    localStorage.setItem('connections', JSON.stringify(updatedConnections));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const x = e.clientX - container.left;
    const y = e.clientY - container.top;

    const updatedPositions = {
      ...positions,
      [draggedId]: { x, y }
    };

    setPositions(updatedPositions);
    localStorage.setItem('positions', JSON.stringify(updatedPositions));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => {
    // Reset any drag state if needed
  };

  const handleConnectionStart = (cardId: string, position: string) => {
    setActiveConnection({ startCard: cardId, startPosition: position });
  };

  const handleConnectionEnter = (cardId: string, position: string) => {
    if (activeConnection && activeConnection.startCard !== cardId) {
      const newConnection = {
        startCard: activeConnection.startCard,
        endCard: cardId,
        startPosition: activeConnection.startPosition,
        endPosition: position
      };

      const connectionExists = connections.some(
        conn =>
          (conn.startCard === newConnection.startCard &&
            conn.endCard === newConnection.endCard &&
            conn.startPosition === newConnection.startPosition &&
            conn.endPosition === newConnection.endPosition) ||
          (conn.startCard === newConnection.endCard &&
            conn.endCard === newConnection.startCard &&
            conn.startPosition === newConnection.endPosition &&
            conn.endPosition === newConnection.startPosition)
      );

      if (!connectionExists) {
        const updatedConnections = [...connections, newConnection];
        setConnections(updatedConnections);
        localStorage.setItem('connections', JSON.stringify(updatedConnections));
      }

      setActiveConnection(null);
    }
  };

  const handleConnectionEnd = () => {
    setActiveConnection(null);
  };

  const handleDeleteConnection = (index: number) => {
    const updatedConnections = [...connections];
    updatedConnections.splice(index, 1);
    setConnections(updatedConnections);
    localStorage.setItem('connections', JSON.stringify(updatedConnections));
  };

  const handleEditBlog = (id: string, updates: {
    title: string;
    content: string;
    author: string;
    color: string;
  }) => {
    const updatedArticles = articles.map(article =>
      article.id === id ? { ...article, ...updates } : article
    );
    setArticles(updatedArticles);
    localStorage.setItem('articles', JSON.stringify(updatedArticles));
  };

  const getConnectionPoint = (cardId: string, position: string): Position => {
    const cardPosition = positions[cardId] || { x: 0, y: 0 };
    const CARD_WIDTH = 300;  // 卡片宽度
    const CARD_HEIGHT = 200; // 卡片总高度（包括padding）

    switch (position) {
      case 'top':
        return { 
          x: cardPosition.x + CARD_WIDTH / 2, 
          y: cardPosition.y // 顶部边缘
        };
      case 'right':
        return { 
          x: cardPosition.x + CARD_WIDTH, // 右侧边缘
          y: cardPosition.y + CARD_HEIGHT / 2
        };
      case 'bottom':
        return { 
          x: cardPosition.x + CARD_WIDTH / 2, 
          y: cardPosition.y + CARD_HEIGHT // 底部边缘
        };
      case 'left':
        return { 
          x: cardPosition.x, // 左侧边缘
          y: cardPosition.y + CARD_HEIGHT / 2
        };
      default:
        return cardPosition;
    }
  };

  return (
    <main className="min-h-screen bg-green-50 p-8">
      <h1 className="text-4xl font-bold text-green-800 mb-8">afei的思想风暴</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed top-4 right-4 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <div 
        ref={containerRef}
        className="relative min-h-[600px]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <svg 
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'all' }}
        >
          {connections.map((conn, index) => (
            <ConnectionLine
              key={index}
              start={getConnectionPoint(conn.startCard, conn.startPosition)}
              end={getConnectionPoint(conn.endCard, conn.endPosition)}
              startPosition={conn.startPosition}
              endPosition={conn.endPosition}
              onClick={() => handleDeleteConnection(index)}
            />
          ))}
        </svg>
        {articles.map((article, index) => (
          <ArticleCard 
            key={article.id} 
            {...article} 
            index={index}
            position={positions[article.id]}
            onDragStart={(e) => handleDragStart(e, article.id)}
            onDragEnd={handleDragEnd}
            onDelete={handleDeleteBlog}
            onEdit={handleEditBlog}
            onConnectionStart={handleConnectionStart}
            onConnectionEnter={handleConnectionEnter}
            onConnectionEnd={handleConnectionEnd}
            activeConnections={
              activeConnection
                ? {
                    [`${activeConnection.startCard}-${activeConnection.startPosition}`]: true
                  }
                : {}
            }
          />
        ))}
      </div>
      <Link
        href="https://github.com/afei1993-creator/cusor"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
      </Link>
      {isModalOpen && <AddBlogModal onClose={() => setIsModalOpen(false)} onAddBlog={handleAddBlog} />}
    </main>
  );
}

