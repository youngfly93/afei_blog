import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { projects, imageData } = await request.json()

    // 1. 保存图片文件
    if (imageData && imageData.length > 0) {
      const imagesDir = path.join(process.cwd(), 'public', 'static', 'images')
      
      // 确保图片目录存在
      if (!existsSync(imagesDir)) {
        await mkdir(imagesDir, { recursive: true })
      }

      for (const image of imageData) {
        if (image.data && image.filename) {
          // 从 base64 数据中提取实际的图片数据
          const base64Data = image.data.replace(/^data:image\/[a-z]+;base64,/, '')
          const buffer = Buffer.from(base64Data, 'base64')
          
          const imagePath = path.join(imagesDir, image.filename)
          await writeFile(imagePath, buffer)
        }
      }
    }

    // 2. 生成并保存 projectsData.ts 文件
    const projectsConfig = `interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
${projects.map((project: any) => `  {
    title: '${project.title.replace(/'/g, "\\'")}',
    description: \`${project.description.replace(/`/g, '\\`')}\`,
    imgSrc: '${project.imgSrc}',
    href: '${project.href}',
  }`).join(',\n')}
]

export default projectsData`

    const projectsDataPath = path.join(process.cwd(), 'data', 'projectsData.ts')
    await writeFile(projectsDataPath, projectsConfig, 'utf8')

    return NextResponse.json({ 
      success: true, 
      message: '项目配置已保存成功！',
      savedImages: imageData?.length || 0
    })

  } catch (error) {
    console.error('保存项目配置失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '保存失败，请检查服务器配置',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // 读取当前的项目配置
    const projectsDataPath = path.join(process.cwd(), 'data', 'projectsData.ts')
    
    if (!existsSync(projectsDataPath)) {
      return NextResponse.json({ projects: [] })
    }

    // 这里简单返回空数组，实际项目中可以解析 TS 文件
    // 或者考虑将项目数据存储在 JSON 文件中
    return NextResponse.json({ projects: [] })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '读取项目配置失败' },
      { status: 500 }
    )
  }
}