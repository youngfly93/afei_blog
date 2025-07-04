import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: '没有找到文件' },
        { status: 400 }
      )
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: '只支持图片文件' },
        { status: 400 }
      )
    }

    // 检查文件大小 (1MB)
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: '图片大小不能超过 1MB' },
        { status: 400 }
      )
    }

    // 确保图片目录存在
    const imagesDir = path.join(process.cwd(), 'public', 'static', 'images')
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true })
    }

    // 生成安全的文件名
    const timestamp = Date.now()
    const extension = path.extname(file.name)
    const filename = `project-${timestamp}${extension}`
    
    // 保存文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(imagesDir, filename)
    
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      filename,
      url: `/static/images/${filename}`,
      filePath: `./public/static/images/${filename}`,
      message: `图片已保存到 ./public/static/images/${filename}`
    })

  } catch (error) {
    console.error('图片上传失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '图片上传失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}