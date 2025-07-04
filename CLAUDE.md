# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 blog starter template with Tailwind CSS v4, TypeScript, and MDX support. It's designed for technical blogs and portfolios with excellent performance and SEO.

## Key Commands

### Development
```bash
# Start development server (port 3000)
npm run dev

# Build for production + generate RSS feed
npm run build

# Start production server
npm run serve

# Analyze bundle size
npm run analyze
```

### Code Quality
```bash
# Run ESLint with auto-fix on all relevant directories
npm run lint

# Lint-staged runs automatically on commit via Husky
# - ESLint for JS/TS files
# - Prettier for all supported files
```

## Architecture & Structure

### Content Management
- **MDX Processing**: Uses ContentLayer v2 for type-safe content
- **Blog Posts**: Located in `data/blog/` as MDX files
- **Authors**: Defined in `data/authors/` as MDX files
- **Frontmatter**: Required fields are `title` and `date`. Optional: `tags`, `draft`, `summary`, `images`, `authors`, `layout`

### Routing & Layouts
- **App Router**: Uses Next.js 13+ App Router (`app/` directory)
- **Dynamic Routes**: Blog posts at `/blog/[...slug]`, tags at `/tags/[tag]`
- **Layouts**: Multiple post layouts available (`PostLayout`, `PostSimple`, `PostBanner`)

### Component Architecture
- **Server Components**: Default for all components unless client interactivity needed
- **Client Components**: Mark with `'use client'` when using hooks, browser APIs, or event handlers
- **Styling**: Tailwind CSS v4 with CSS-based configuration in `css/tailwind.css`

### Key Dependencies
- Next.js 15.2.4 with React 19
- Tailwind CSS v4 (latest CSS-based config syntax)
- TypeScript (non-strict mode)
- Pliny for blog utilities (analytics, comments, newsletter)
- KBar for search functionality

## Development Patterns

### Import Aliases
```typescript
@/components  // React components
@/layouts     // Page layouts
@/data        // Content and configuration
@/css         // Stylesheets
```

### TypeScript Configuration
- Non-strict mode enabled
- Path aliases configured
- ES6 target with JSX preserve

### ESLint Rules
- Prettier integration for formatting
- Some TypeScript rules disabled (no-unused-vars, explicit-module-boundary-types)
- React prop-types disabled (using TypeScript)

### Security & Performance
- CSP headers configured in `next.config.js`
- Image optimization via next/image
- Static site generation where possible
- Bundle size kept minimal (~85kB first load)

## Common Tasks

### Adding a Blog Post
1. Create MDX file in `data/blog/` with proper frontmatter
2. Images go in `public/static/images/`
3. Build will auto-generate tag counts and search index

### Modifying Site Metadata
Edit `data/siteMetadata.js` for:
- Site title, description, URLs
- Social links
- Analytics configuration
- Comment system settings

### Customizing Navigation
Edit `data/headerNavLinks.ts` to modify main navigation items

### Testing Changes
Since no test framework is configured:
1. Run `npm run lint` to check code quality
2. Build locally with `npm run build` to catch errors
3. Test in development with `npm run dev`

## Important Notes

- Never commit `.env` files or API keys
- Follow existing code style (check neighboring files)
- Tailwind CSS v4 uses CSS syntax, not JS config
- ContentLayer generates types - don't edit `.contentlayer/` directory
- MDX components are defined in `components/MDXComponents.tsx`
- Always test dark mode when making UI changes