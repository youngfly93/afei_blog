'use client'

import Link from '@/components/Link'
import Tag from '@/components/Tag'
import ProfileCard from '@/components/ProfileCard'
import TrueFocusCard from '@/components/TrueFocusCard'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'

const MAX_DISPLAY = 5

export default function Home({ posts }) {
  const handleContactClick = () => {
    console.log('Contact clicked')
    // 这里可以添加联系逻辑，比如跳转到联系页面或发邮件
  }

  return (
    <>
      {/* 响应式两列布局 */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
        {/* 左侧卡片区域 */}
        <div className="flex-shrink-0 lg:-ml-8 lg:w-80 xl:-ml-12 xl:w-96">
          <div className="sticky top-8 space-y-12">
            {/* TrueFocus 卡片 */}
            <TrueFocusCard />

            {/* ProfileCard 向下移动 */}
            <ProfileCard
              name="afei"
              title="全栈开发者"
              handle="afei"
              status="在线"
              contactText="联系我"
              onContactClick={handleContactClick}
            />
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="min-w-0 flex-1">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="space-y-2 pt-6 pb-8 md:space-y-5">
              <h1 className="text-primary-800 dark:text-primary-200 text-3xl leading-9 font-extrabold tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
                Latest
              </h1>
              <p className="text-primary-600 dark:text-primary-400 text-lg leading-7">
                {siteMetadata.description}
              </p>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {!posts.length && 'No posts found.'}
              {posts.slice(0, MAX_DISPLAY).map((post) => {
                const { slug, date, title, summary, tags } = post
                return (
                  <li key={slug} className="py-12">
                    <article>
                      <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                        <dl>
                          <dt className="sr-only">Published on</dt>
                          <dd className="text-primary-600 dark:text-primary-400 text-base leading-6 font-medium">
                            <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                          </dd>
                        </dl>
                        <div className="space-y-5 xl:col-span-3">
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-2xl leading-8 font-bold tracking-tight">
                                <Link
                                  href={`/blog/${slug}`}
                                  className="text-primary-800 dark:text-primary-200"
                                >
                                  {title}
                                </Link>
                              </h2>
                              <div className="flex flex-wrap">
                                {tags.map((tag) => (
                                  <Tag key={tag} text={tag} />
                                ))}
                              </div>
                            </div>
                            <div className="prose text-primary-600 dark:text-primary-400 max-w-none">
                              {summary}
                            </div>
                          </div>
                          <div className="text-base leading-6 font-medium">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                              aria-label={`Read more: "${title}"`}
                            >
                              Read more &rarr;
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          </div>
          {posts.length > MAX_DISPLAY && (
            <div className="flex justify-end text-base leading-6 font-medium">
              <Link
                href="/blog"
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                aria-label="All posts"
              >
                All Posts &rarr;
              </Link>
            </div>
          )}
          {siteMetadata.newsletter?.provider && (
            <div className="flex items-center justify-center pt-4">
              <NewsletterForm />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
