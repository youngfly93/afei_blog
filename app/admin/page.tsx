'use client'

import { useState, useEffect } from 'react'

interface Article {
  filename: string
  title: string
  date: string
  tags: string[]
  draft: boolean
  summary: string
  content: string
  fullContent: string
}

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // 表单状态
  const [currentArticle, setCurrentArticle] = useState({
    filename: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    draft: false,
    summary: '',
    content: ''
  })
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isNew, setIsNew] = useState(true)

  // 加载文章列表
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await fetch('/api/blog')
        const result = await response.json()
        
        if (result.success) {
          setArticles(result.articles)
        }
      } catch (error) {
        console.error('加载文章失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // 直接保存到服务器
  const saveArticleToServer = async () => {
    if (!currentArticle.title || !currentArticle.content) {
      alert('请填写标题和内容')
      return
    }

    setSaving(true)

    try {
      const filename = currentArticle.filename || generateSlug(currentArticle.title)
      const tagsArray = currentArticle.tags.split(',').map(tag => tag.trim()).filter(tag => tag)

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          title: currentArticle.title,
          date: currentArticle.date,
          tags: tagsArray,
          draft: currentArticle.draft,
          summary: currentArticle.summary,
          content: currentArticle.content,
          isNew
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('文章已保存成功！')
        // 重新加载文章列表
        const loadResponse = await fetch('/api/blog')
        const loadResult = await loadResponse.json()
        if (loadResult.success) {
          setArticles(loadResult.articles)
        }
        
        // 重置表单
        resetForm()
      } else {
        alert(result.message || '保存失败，请重试')
      }
    } catch (error) {
      console.error('保存错误:', error)
      alert('保存失败，请检查网络连接')
    } finally {
      setSaving(false)
    }
  }

  // 下载文件（备用方法）
  const downloadFile = () => {
    if (!currentArticle.title || !currentArticle.content) {
      alert('请填写标题和内容')
      return
    }

    const tagsArray = currentArticle.tags.split(',').map(tag => `'${tag.trim()}'`).join(', ')
    const fileContent = `---
title: '${currentArticle.title}'
date: '${currentArticle.date}'
tags: [${tagsArray}]
draft: ${currentArticle.draft}
summary: '${currentArticle.summary}'
---

${currentArticle.content}`

    const blob = new Blob([fileContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generateSlug(currentArticle.title)}.mdx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 编辑文章
  const editArticle = (index: number) => {
    const article = articles[index]
    setCurrentArticle({
      filename: article.filename,
      title: article.title,
      date: article.date,
      tags: article.tags.join(', '),
      draft: article.draft,
      summary: article.summary,
      content: article.content
    })
    setEditingIndex(index)
    setIsNew(false)
  }

  // 删除文章
  const deleteArticle = async (index: number) => {
    const article = articles[index]
    
    if (!confirm(`确定要删除文章"${article.title}"吗？`)) {
      return
    }

    try {
      const response = await fetch('/api/blog', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: article.filename
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('文章已删除')
        // 重新加载文章列表
        const loadResponse = await fetch('/api/blog')
        const loadResult = await loadResponse.json()
        if (loadResult.success) {
          setArticles(loadResult.articles)
        }
      } else {
        alert(result.message || '删除失败')
      }
    } catch (error) {
      console.error('删除错误:', error)
      alert('删除失败，请重试')
    }
  }

  // 重置表单
  const resetForm = () => {
    setCurrentArticle({
      filename: '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      tags: '',
      draft: false,
      summary: '',
      content: ''
    })
    setEditingIndex(null)
    setIsNew(true)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">文章管理</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">正在加载文章列表...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">文章管理</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：编辑器 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">
            {isNew ? '写新文章' : `编辑文章`}
          </h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">文章标题 *</label>
            <input
              type="text"
              value={currentArticle.title}
              onChange={(e) => setCurrentArticle(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="输入文章标题"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">发布日期</label>
              <input
                type="date"
                value={currentArticle.date}
                onChange={(e) => setCurrentArticle(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentArticle.draft}
                  onChange={(e) => setCurrentArticle(prev => ({ ...prev, draft: e.target.checked }))}
                  className="mr-2"
                />
                保存为草稿
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">文章摘要</label>
            <input
              type="text"
              value={currentArticle.summary}
              onChange={(e) => setCurrentArticle(prev => ({ ...prev, summary: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="简要描述文章内容"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">标签 (用逗号分隔)</label>
            <input
              type="text"
              value={currentArticle.tags}
              onChange={(e) => setCurrentArticle(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="技术, 学习笔记, React"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">文章内容 (Markdown) *</label>
            <textarea
              value={currentArticle.content}
              onChange={(e) => setCurrentArticle(prev => ({ ...prev, content: e.target.value }))}
              rows={15}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder="在这里写你的文章内容，支持 Markdown 语法..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={saveArticleToServer}
              disabled={saving}
              className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? '保存中...' : '🚀 直接保存'}
            </button>
            
            <button
              onClick={downloadFile}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              📥 下载文件
            </button>
            
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors"
            >
              清空表单
            </button>
          </div>
        </div>

        {/* 右侧：文章列表 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">现有文章</h2>
          
          {articles.length === 0 ? (
            <p className="text-gray-500">还没有文章，写第一篇吧！</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {articles.map((article, index) => (
                <div
                  key={article.filename}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    editingIndex === index ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2">{article.title}</h3>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => editArticle(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteArticle(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.date}</span>
                    <div className="flex items-center gap-2">
                      {article.draft && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">草稿</span>
                      )}
                      {article.tags.length > 0 && (
                        <span>{article.tags.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-6">
            <div className="p-4 bg-green-50 rounded-md">
              <h3 className="font-medium text-green-900 mb-2">✨ 全自动功能：</h3>
              <ol className="text-sm text-green-800 space-y-1">
                <li>1. 填写文章信息和内容</li>
                <li>2. 点击"🚀 直接保存" → 自动保存到 <code className="bg-green-100 px-1 rounded">./data/blog/</code></li>
                <li>3. 立即在博客中显示，无需重启！</li>
                <li>4. 支持编辑、删除现有文章</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}