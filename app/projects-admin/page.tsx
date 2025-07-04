'use client'

import { useState, useRef, useEffect } from 'react'

interface Project {
  title: string
  description: string
  href: string
  imgSrc: string
}

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const [currentProject, setCurrentProject] = useState<Project>({
    title: '',
    description: '',
    href: '',
    imgSrc: ''
  })

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 加载当前项目数据
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/api/projects/current')
        const result = await response.json()
        
        if (result.success) {
          setProjects(result.projects)
        }
      } catch (error) {
        console.error('加载项目数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 检查文件大小 (1MB)
    if (file.size > 1024 * 1024) {
      alert('图片大小不能超过 1MB')
      return
    }

    setUploading(true)

    try {
      // 上传图片到服务器
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // 设置预览
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)

        // 更新项目信息
        setCurrentProject(prev => ({
          ...prev,
          imgSrc: result.url
        }))

        alert(`图片上传成功！\n保存路径：${result.filePath || result.message}`)
      } else {
        alert(result.message || '图片上传失败')
      }
    } catch (error) {
      console.error('上传错误:', error)
      alert('图片上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const generateProjectConfig = () => {
    const projectsConfig = `interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
${projects.map(project => `  {
    title: '${project.title}',
    description: \`${project.description}\`,
    imgSrc: '${project.imgSrc}',
    href: '${project.href}',
  }`).join(',\n')}
]

export default projectsData`

    return projectsConfig
  }

  const saveProjectsToServer = async () => {
    setSaving(true)
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projects: projects,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('项目配置已保存成功！更改已应用到网站。')
        // 不需要刷新页面，数据已经在本地状态中
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

  const downloadConfig = () => {
    const config = generateProjectConfig()
    const blob = new Blob([config], { type: 'text/typescript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'projectsData.ts'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const addProject = () => {
    if (!currentProject.title || !currentProject.description || !currentProject.href) {
      alert('请填写必填字段')
      return
    }

    if (editingIndex !== null) {
      // 编辑现有项目
      const updatedProjects = [...projects]
      updatedProjects[editingIndex] = currentProject
      setProjects(updatedProjects)
      setEditingIndex(null)
    } else {
      // 添加新项目
      setProjects([...projects, currentProject])
    }

    // 重置表单
    setCurrentProject({
      title: '',
      description: '',
      href: '',
      imgSrc: ''
    })
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const editProject = (index: number) => {
    setCurrentProject(projects[index])
    setEditingIndex(index)
    setImagePreview(projects[index].imgSrc.startsWith('data:') ? projects[index].imgSrc : '')
  }

  const deleteProject = (index: number) => {
    if (confirm('确定要删除这个项目吗？')) {
      setProjects(projects.filter((_, i) => i !== index))
    }
  }

  const cancelEdit = () => {
    setCurrentProject({
      title: '',
      description: '',
      href: '',
      imgSrc: ''
    })
    setEditingIndex(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">项目管理</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">正在加载项目数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">项目管理</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：添加/编辑项目表单 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">
            {editingIndex !== null ? '编辑项目' : '添加新项目'}
          </h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">项目名称 *</label>
            <input
              type="text"
              value={currentProject.title}
              onChange={(e) => setCurrentProject(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="输入项目名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GitHub 链接 *</label>
            <input
              type="url"
              value={currentProject.href}
              onChange={(e) => setCurrentProject(prev => ({ ...prev, href: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://github.com/username/repository"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">项目描述 *</label>
            <textarea
              value={currentProject.description}
              onChange={(e) => setCurrentProject(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="详细描述项目功能和特点..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">项目图片</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              {uploading ? '正在上传图片...' : '支持 PNG、JPG、SVG 格式，大小不超过 1MB（会自动保存到服务器）'}
            </p>
          </div>

          {imagePreview && (
            <div>
              <label className="block text-sm font-medium mb-2">图片预览</label>
              <img
                src={imagePreview}
                alt="预览"
                className="w-full max-w-xs h-48 object-cover border border-gray-300 rounded-md"
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={addProject}
              className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
            >
              {editingIndex !== null ? '更新项目' : '添加项目'}
            </button>
            
            {editingIndex !== null && (
              <button
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors"
              >
                取消编辑
              </button>
            )}
          </div>
        </div>

        {/* 右侧：项目列表 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">当前项目列表</h2>
          
          {projects.length === 0 ? (
            <p className="text-gray-500">还没有项目，添加第一个项目吧！</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editProject(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteProject(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 text-sm truncate max-w-xs"
                    >
                      {project.href}
                    </a>
                    {project.imgSrc && (
                      <span className="text-green-600 text-sm">📷 有图片</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-6 space-y-4">
            <button
              onClick={saveProjectsToServer}
              disabled={saving}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? '正在保存...' : '🚀 直接保存到服务器'}
            </button>

            <button
              onClick={downloadConfig}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              📥 下载配置文件 (备用方式)
            </button>
            
            <div className="p-4 bg-green-50 rounded-md">
              <h3 className="font-medium text-green-900 mb-2">✨ 全自动功能：</h3>
              <ol className="text-sm text-green-800 space-y-1">
                <li>1. 上传图片 → 自动保存到 <code className="bg-green-100 px-1 rounded">./public/static/images/</code></li>
                <li>2. 填写项目信息</li>
                <li>3. 点击"直接保存到服务器" → 自动更新 <code className="bg-green-100 px-1 rounded">./data/projectsData.ts</code></li>
                <li>4. 无需手动操作任何文件！</li>
              </ol>
            </div>

            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">💡 备用方式：</h3>
              <p className="text-sm text-blue-800">
                如果自动保存失败，可以使用"下载配置文件"按钮，然后手动替换文件。
              </p>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/check-paths')
                    const result = await response.json()
                    console.log('路径信息:', result)
                    alert('路径检查完成，请查看控制台输出')
                  } catch (error) {
                    console.error('路径检查失败:', error)
                  }
                }}
                className="mt-2 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-800"
              >
                🔍 检查文件路径
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}