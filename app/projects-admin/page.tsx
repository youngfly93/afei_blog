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
    imgSrc: '',
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
        setCurrentProject((prev) => ({
          ...prev,
          imgSrc: result.url,
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
${projects
  .map(
    (project) => `  {
    title: '${project.title}',
    description: \`${project.description}\`,
    imgSrc: '${project.imgSrc}',
    href: '${project.href}',
  }`
  )
  .join(',\n')}
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
      imgSrc: '',
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
      imgSrc: '',
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
        <div className="py-8 text-center">
          <div className="border-primary-600 mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="mt-2 text-gray-500">正在加载项目数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">项目管理</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 左侧：添加/编辑项目表单 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">
            {editingIndex !== null ? '编辑项目' : '添加新项目'}
          </h2>

          <div>
            <label htmlFor="project-title" className="mb-2 block text-sm font-medium">
              项目名称 *
            </label>
            <input
              id="project-title"
              type="text"
              value={currentProject.title}
              onChange={(e) => setCurrentProject((prev) => ({ ...prev, title: e.target.value }))}
              className="focus:ring-primary-500 w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:outline-none"
              placeholder="输入项目名称"
            />
          </div>

          <div>
            <label htmlFor="project-href" className="mb-2 block text-sm font-medium">
              GitHub 链接 *
            </label>
            <input
              id="project-href"
              type="url"
              value={currentProject.href}
              onChange={(e) => setCurrentProject((prev) => ({ ...prev, href: e.target.value }))}
              className="focus:ring-primary-500 w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:outline-none"
              placeholder="https://github.com/username/repository"
            />
          </div>

          <div>
            <label htmlFor="project-description" className="mb-2 block text-sm font-medium">
              项目描述 *
            </label>
            <textarea
              id="project-description"
              value={currentProject.description}
              onChange={(e) =>
                setCurrentProject((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              className="focus:ring-primary-500 w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:outline-none"
              placeholder="详细描述项目功能和特点..."
            />
          </div>

          <div>
            <label htmlFor="project-image" className="mb-2 block text-sm font-medium">
              项目图片
            </label>
            <input
              id="project-image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="focus:ring-primary-500 w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:outline-none disabled:bg-gray-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              {uploading
                ? '正在上传图片...'
                : '支持 PNG、JPG、SVG 格式，大小不超过 1MB（会自动保存到服务器）'}
            </p>
          </div>

          {imagePreview && (
            <div>
              <p className="mb-2 block text-sm font-medium">图片预览</p>
              <img
                src={imagePreview}
                alt="预览"
                className="h-48 w-full max-w-xs rounded-md border border-gray-300 object-cover"
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={addProject}
              className="bg-primary-600 hover:bg-primary-700 rounded-md px-6 py-3 text-white transition-colors"
            >
              {editingIndex !== null ? '更新项目' : '添加项目'}
            </button>

            {editingIndex !== null && (
              <button
                onClick={cancelEdit}
                className="rounded-md bg-gray-500 px-6 py-3 text-white transition-colors hover:bg-gray-600"
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
                  className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editProject(index)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteProject(index)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  <p className="mb-3 line-clamp-3 text-sm text-gray-600">{project.description}</p>

                  <div className="flex items-center justify-between">
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 max-w-xs truncate text-sm"
                    >
                      {project.href}
                    </a>
                    {project.imgSrc && <span className="text-sm text-green-600">📷 有图片</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 border-t pt-6">
            <button
              onClick={saveProjectsToServer}
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 w-full rounded-md px-6 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving ? '正在保存...' : '🚀 直接保存到服务器'}
            </button>

            <button
              onClick={downloadConfig}
              className="w-full rounded-md bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
            >
              📥 下载配置文件 (备用方式)
            </button>

            <div className="rounded-md bg-green-50 p-4">
              <h3 className="mb-2 font-medium text-green-900">✨ 全自动功能：</h3>
              <ol className="space-y-1 text-sm text-green-800">
                <li>
                  1. 上传图片 → 自动保存到{' '}
                  <code className="rounded bg-green-100 px-1">./public/static/images/</code>
                </li>
                <li>2. 填写项目信息</li>
                <li>
                  3. 点击"直接保存到服务器" → 自动更新{' '}
                  <code className="rounded bg-green-100 px-1">./data/projectsData.ts</code>
                </li>
                <li>4. 无需手动操作任何文件！</li>
              </ol>
            </div>

            <div className="rounded-md bg-blue-50 p-4">
              <h3 className="mb-2 font-medium text-blue-900">💡 备用方式：</h3>
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
                className="mt-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 hover:bg-blue-200"
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
