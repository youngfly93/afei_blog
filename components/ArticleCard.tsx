import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

interface ArticleCardProps {
  id: number;
  title: string;
  excerpt: string;
  onDelete: (id: number) => void;
}

export default function ArticleCard({ id, title, excerpt, onDelete }: ArticleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/article/${id}`} className="block">
        <h2 className="text-xl font-bold text-green-700 mb-2">{title}</h2>
        <p className="text-gray-600">{excerpt}</p>
      </Link>
      {isHovered && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(id);
          }}
          className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 transition-colors"
          aria-label="删除博客"
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  )
}

