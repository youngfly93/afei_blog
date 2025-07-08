import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import Image from 'next/image'
import TrueFocus from './TrueFocus'

const Header = () => {
  let headerClass = 'flex items-center w-full bg-transparent justify-between py-10'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass}>
      <Link href="/" aria-label={siteMetadata.headerTitle}>
        <div className="flex items-center space-x-3">
          <Image
            src="/static/images/logo.png"
            alt="afei logo"
            width={60}
            height={60}
            className="rounded-lg"
          />
          <TrueFocus
            sentence="Hello Afei"
            manualMode={false}
            blurAmount={3}
            borderColor="#0f4c3a"
            glowColor="rgba(15, 76, 58, 0.6)"
            animationDuration={1}
            pauseBetweenAnimations={2}
          />
        </div>
      </Link>
      <div className="flex items-center space-x-4 leading-5 sm:-mr-6 sm:space-x-6">
        <div className="no-scrollbar hidden items-center space-x-4 overflow-x-auto sm:flex">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="hover:text-primary-600 dark:hover:text-primary-400 text-primary-700 dark:text-primary-300 font-medium whitespace-nowrap"
              >
                {link.title}
              </Link>
            ))}
        </div>
        <SearchButton />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
