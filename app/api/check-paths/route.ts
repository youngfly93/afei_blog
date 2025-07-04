import { NextResponse } from 'next/server'
import { existsSync } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const projectRoot = process.cwd()
    const imagesDir = path.join(projectRoot, 'public', 'static', 'images')
    const dataDir = path.join(projectRoot, 'data')
    const projectsDataPath = path.join(dataDir, 'projectsData.ts')

    const pathInfo = {
      projectRoot,
      paths: {
        imagesDir: {
          absolute: imagesDir,
          relative: './public/static/images/',
          exists: existsSync(imagesDir)
        },
        dataDir: {
          absolute: dataDir,
          relative: './data/',
          exists: existsSync(dataDir)
        },
        projectsData: {
          absolute: projectsDataPath,
          relative: './data/projectsData.ts',
          exists: existsSync(projectsDataPath)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '路径检查完成',
      data: pathInfo
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: '路径检查失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}