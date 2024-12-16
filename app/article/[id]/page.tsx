'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditArticle({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [article, setArticle] = useState({ title: '', content: '' })

  useEffect(() => {
    // 在实际应用中，这里应该从API获取文章数据
    // 现在我们只是模拟从本地存储中获取数据
    const storedArticles = JSON.parse(localStorage.getItem('articles') || '[]')
    const foundArticle = storedArticles.find((a: Article) => a.id === parseInt(params.id))
    if (foundArticle) {
      setArticle(foundArticle)
    }
  }, [params.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 在实际应用中，这里应该发送PUT请求到API
    // 现在我们只是更新本地存储
    const storedArticles = JSON.parse(localStorage.getItem('articles') || '[]')
    const updatedArticles = storedArticles.map((a: Article) => 
      a.id === parseInt(params.id) ? { ...a, ...article } : a
    )
    localStorage.setItem('articles', JSON.stringify(updatedArticles))
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-4xl font-bold text-green-800 mb-8">编辑博客</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            标题
          </label>
          <input
            type="text"
            id="title"
            value={article.title}
            onChange={(e) => setArticle({ ...article, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            内容
          </label>
          <textarea
            id="content"
            value={article.content}
            onChange={(e) => setArticle({ ...article, content: e.target.value })}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          ></textarea>
        </div>
        <div className="flex justify-end space-x-2">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            取消
          </Link>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  )
}

