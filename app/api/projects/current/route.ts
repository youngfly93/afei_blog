import { NextResponse } from 'next/server'
import path from 'path'

export async function GET() {
  try {
    // 动态导入当前的项目数据
    const projectsDataPath = path.join(process.cwd(), 'data', 'projectsData')
    
    // 删除 require 缓存以获取最新数据
    delete require.cache[require.resolve('@/data/projectsData')]
    
    // 重新导入数据
    const { default: projectsData } = await import('@/data/projectsData')

    return NextResponse.json({
      success: true,
      projects: projectsData || []
    })

  } catch (error) {
    console.error('读取项目数据失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '读取项目数据失败',
        projects: []
      },
      { status: 500 }
    )
  }
}