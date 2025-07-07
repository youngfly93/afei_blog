import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readdir, readFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// 获取所有博客文章
export async function GET() {
  try {
    const blogDir = path.join(process.cwd(), 'data', 'blog')

    if (!existsSync(blogDir)) {
      return NextResponse.json({ success: true, articles: [] })
    }

    const files = await readdir(blogDir)
    const mdxFiles = files.filter((file) => file.endsWith('.mdx'))

    const articles = await Promise.all(
      mdxFiles.map(async (filename) => {
        const filePath = path.join(blogDir, filename)
        const content = await readFile(filePath, 'utf8')

        // 解析 frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
        const frontmatter: any = {}
        let body = content

        if (frontmatterMatch) {
          const frontmatterText = frontmatterMatch[1]
          body = content.slice(frontmatterMatch[0].length).trim()

          // 简单解析 frontmatter（实际项目中可能需要更robust的解析）
          frontmatterText.split('\n').forEach((line) => {
            const match = line.match(/^(\w+):\s*(.+)$/)
            if (match) {
              const [, key, value] = match
              if (key === 'tags') {
                // 解析数组格式 ['tag1', 'tag2']
                frontmatter[key] = value
                  .replace(/[\[\]']/g, '')
                  .split(',')
                  .map((t) => t.trim())
              } else if (key === 'draft') {
                frontmatter[key] = value === 'true'
              } else {
                frontmatter[key] = value.replace(/^['"]|['"]$/g, '')
              }
            }
          })
        }

        return {
          filename: filename.replace('.mdx', ''),
          title: frontmatter.title || filename,
          date: frontmatter.date || '',
          tags: frontmatter.tags || [],
          draft: frontmatter.draft || false,
          summary: frontmatter.summary || '',
          content: body,
          fullContent: content,
        }
      })
    )

    // 按日期排序
    articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ success: true, articles })
  } catch (error) {
    console.error('读取博客文章失败:', error)
    return NextResponse.json({ success: false, message: '读取博客文章失败' }, { status: 500 })
  }
}

// 保存博客文章
export async function POST(request: NextRequest) {
  try {
    const { filename, title, date, tags, draft, summary, content, isNew } = await request.json()

    if (!filename || !title || !content) {
      return NextResponse.json({ success: false, message: '缺少必要字段' }, { status: 400 })
    }

    const blogDir = path.join(process.cwd(), 'data', 'blog')

    // 确保目录存在
    if (!existsSync(blogDir)) {
      await writeFile(blogDir, '', { flag: 'wx' }).catch(() => {})
    }

    // 生成文件内容
    const tagsString = tags.map((tag: string) => `'${tag}'`).join(', ')
    const fileContent = `---
title: '${title.replace(/'/g, "\\\'")}'
date: '${date}'
tags: [${tagsString}]
draft: ${draft}
summary: '${summary.replace(/'/g, "\\\'")}'
---

${content}`

    // 生成安全的文件名
    const safeFilename = filename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_]/g, '-') + '.mdx'
    const filePath = path.join(blogDir, safeFilename)

    await writeFile(filePath, fileContent, 'utf8')

    return NextResponse.json({
      success: true,
      message: `文章已保存到 ./data/blog/${safeFilename}`,
      filename: safeFilename,
    })
  } catch (error) {
    console.error('保存博客文章失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '保存博客文章失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

// 删除博客文章
export async function DELETE(request: NextRequest) {
  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json({ success: false, message: '缺少文件名' }, { status: 400 })
    }

    const blogDir = path.join(process.cwd(), 'data', 'blog')
    const filePath = path.join(blogDir, filename + '.mdx')

    if (!existsSync(filePath)) {
      return NextResponse.json({ success: false, message: '文件不存在' }, { status: 404 })
    }

    await unlink(filePath)

    return NextResponse.json({
      success: true,
      message: `文章 ${filename} 已删除`,
    })
  } catch (error) {
    console.error('删除博客文章失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '删除博客文章失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
