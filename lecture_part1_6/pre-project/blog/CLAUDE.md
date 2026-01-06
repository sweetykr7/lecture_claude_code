# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

### Core Framework
- **Next.js**: v16.0.10 (App Router, React Server Components)
- **React**: v19.2.1
- **TypeScript**: v5 (with `strict: false` but `strictNullChecks: true`)
- **Package Manager**: pnpm v10.27.0

### Styling & UI
- **Tailwind CSS**: v4.0.0-alpha.13 (CSS-first configuration)
- **PostCSS**: v8.4.35
- **@tailwindcss/postcss**: v4.0.0-alpha.13
- **Geist Font**: v1.2.2 (Sans & Mono variants)

### Content & Rendering
- **next-mdx-remote**: v4.4.1 (Server-side MDX rendering)
- **sugar-high**: v0.6.0 (Syntax highlighting)

### Analytics & Monitoring
- **@vercel/analytics**: v1.1.3
- **@vercel/speed-insights**: v1.0.9

### Development Tools
- **@types/node**: v20.11.17
- **@types/react**: v18.2.55
- **@types/react-dom**: v18.2.19

---

## Project Commands

```bash
# Development
pnpm dev          # Start development server (default: http://localhost:3000)

# Production
pnpm build        # Build optimized production bundle
pnpm start        # Start production server

# Note: Always use pnpm (not npm or yarn)
```

---

## Content & Data Structure

### Blog Post Storage
All blog posts are stored as **MDX files** in the filesystem at:
```
app/blog/posts/*.mdx
```

### MDX Frontmatter Schema
Each `.mdx` file must have YAML frontmatter with this exact structure:

```yaml
---
title: 'Post Title Here'
publishedAt: '2024-04-09'
summary: 'Brief description of the post content'
---
```

**Required Fields:**
- `title` (string): Post title displayed in listings and post page
- `publishedAt` (string): ISO date format `YYYY-MM-DD`
- `summary` (string): Post description used for SEO meta tags and previews

**Optional Fields:**
- `image` (string): Custom OG image path (defaults to dynamic generation if omitted)

### Content Examples
Based on existing posts:
- [spaces-vs-tabs.mdx](app/blog/posts/spaces-vs-tabs.mdx): Uses headers (##), paragraphs, no code blocks
- [static-typing.mdx](app/blog/posts/static-typing.mdx): Includes fenced code blocks with language tags (```ts, ```csharp)
- [vim.mdx](app/blog/posts/vim.mdx): Standard markdown prose with multiple H2 sections

### Data Flow
1. **File Read**: `getBlogPosts()` in [app/blog/utils.ts](app/blog/utils.ts) reads all `.mdx` files from `app/blog/posts/`
2. **Parsing**: `parseFrontmatter()` extracts YAML metadata using regex `/---\s*([\s\S]*?)\s*---/`
3. **Slug Generation**: Filename (without `.mdx` extension) becomes the URL slug
4. **Sorting**: Posts sorted by `publishedAt` date (newest first)

---

## Code Style & Conventions

### Component Patterns

#### 1. Component Definition Style
**Named function exports** (not arrow functions):
```tsx
// ✅ Correct pattern used throughout
export function ComponentName() {
  return <div>...</div>
}

// ❌ NOT used in this codebase
export const ComponentName = () => { }
```

**Default function exports** for pages:
```tsx
// ✅ Page components
export default function Page() {
  return <section>...</section>
}
```

#### 2. Type Annotations
- **Props**: Use inline type definitions, NOT separate interfaces
  ```tsx
  // ✅ Used in layout.tsx
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) { }
  ```

- **Metadata**: Export as typed constants
  ```tsx
  // ✅ Pattern from blog/page.tsx
  export const metadata = {
    title: 'Blog',
    description: 'Read my blog.',
  }
  ```

#### 3. Component Organization
- **Small helper components** defined at top of file (e.g., `ArrowIcon` in [footer.tsx](app/components/footer.tsx))
- **Main component** exported last
- **Data/config objects** defined before component (e.g., `navItems` in [nav.tsx](app/components/nav.tsx))

### Styling Conventions

#### Tailwind Usage
**Class patterns observed:**
- Responsive design: Mobile-first, use `md:` and `lg:` prefixes
  ```tsx
  className="flex flex-col md:flex-row"  // Stack on mobile, row on desktop
  ```

- Dark mode: Always provide dark mode variants
  ```tsx
  className="text-neutral-600 dark:text-neutral-400"
  ```

- Spacing: Use margin utilities, prefer `space-x-*` and `space-y-*` for child spacing
  ```tsx
  className="flex flex-row space-x-0 md:space-x-2"
  ```

- Typography: Use semantic size classes
  - Page titles: `text-2xl font-semibold tracking-tighter`
  - Headings: `font-medium tracking-tight`
  - Body: `text-neutral-800 dark:text-neutral-200`

#### Custom CSS (global.css)
- **`.prose` class**: Applied to MDX article containers, provides custom typography styles
  - Headings get automatic anchor link styling
  - Code blocks: `bg-neutral-50 dark:bg-neutral-900` with custom scrollbar hiding
  - Links: Underlined with transition effects
  - Images: No default margins (for Next.js Image compatibility)

- **Syntax highlighting**: CSS variables for `sugar-high` tokens
  ```css
  --sh-class, --sh-identifier, --sh-keyword, --sh-string, --sh-comment, etc.
  ```

- **Selection color**: Custom `::selection` with brand blue (`#47a3f3`)

### Data Rendering Patterns

#### MDX Content Rendering
**Flow**: Raw MDX → `parseFrontmatter()` → `CustomMDX` component → Rendered HTML

**Custom MDX Components** ([app/components/mdx.tsx](app/components/mdx.tsx)):
```tsx
// Pattern: Override default markdown elements
let components = {
  h1: createHeading(1),  // Auto-generates slugified anchors
  h2: createHeading(2),
  // ... h3-h6
  Image: RoundedImage,    // Wraps next/image
  a: CustomLink,          // Smart internal/external link handling
  code: Code,             // Syntax highlighting via sugar-high
  Table,                  // Custom table component
}
```

**Heading slugification**: Lowercase, replace spaces with hyphens, remove special chars
```tsx
slugify('Hello World!') // → 'hello-world'
```

#### Date Formatting
Use `formatDate()` from [app/blog/utils.ts](app/blog/utils.ts):
```tsx
formatDate('2024-04-09', false)  // → "April 9, 2024"
formatDate('2024-04-09', true)   // → "April 9, 2024 (8mo ago)"
```

#### Sorting Posts
**Always** sort by date descending:
```tsx
allBlogs.sort((a, b) => {
  if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
    return -1
  }
  return 1
})
```

### File Naming & Structure
- **Pages**: `page.tsx` (Next.js App Router convention)
- **Components**: Lowercase filename matching component name (e.g., `nav.tsx` exports `Navbar`)
- **Utilities**: `utils.ts` for helper functions
- **Routes**: `route.ts` or `route.tsx` for API routes

---

## SEO Principles

This project is **heavily optimized for SEO** with multiple layers:

### 1. Sitemap Generation ([app/sitemap.ts](app/sitemap.ts))
- **Dynamic sitemap**: Auto-generates from blog posts
- **URL structure**: Uses `baseUrl` constant (`https://portfolio-blog-starter.vercel.app`)
- **Includes**: Homepage, `/blog` page, and all individual post pages
- **Last modified**: Posts use `publishedAt`, static pages use current date

**⚠️ CRITICAL**: Update `baseUrl` in [app/sitemap.ts](app/sitemap.ts:3) when deploying to production

### 2. Robots.txt ([app/robots.ts](app/robots.ts))
- Allows all user agents (`*`)
- References sitemap URL dynamically

### 3. Dynamic OG Images ([app/og/route.tsx](app/og/route.tsx))
- **Route**: `/og?title=<encoded-title>`
- **Technology**: Next.js `ImageResponse` API
- **Size**: 1200×630px (optimal for social media)
- **Fallback**: If post has no custom `image` field, uses this dynamic generator

### 4. Metadata Generation
Each blog post page ([app/blog/[slug]/page.tsx](app/blog/[slug]/page.tsx)) generates:

**OpenGraph tags**:
```tsx
openGraph: {
  title, description, type: 'article',
  publishedTime,
  url: `${baseUrl}/blog/${post.slug}`,
  images: [{ url: ogImage }]
}
```

**Twitter Card**:
```tsx
twitter: {
  card: 'summary_large_image',
  title, description,
  images: [ogImage]
}
```

### 5. JSON-LD Structured Data
Every post includes `BlogPosting` schema:
```tsx
<script type="application/ld+json">
{
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline, datePublished, dateModified,
  description, image, url,
  author: { '@type': 'Person', name: 'My Portfolio' }
}
</script>
```

### 6. RSS Feed ([app/rss/route.ts](app/rss/route.ts))
- **Route**: `/rss`
- **Format**: RSS 2.0 XML
- **Content**: All posts sorted by date (newest first)
- **Headers**: `Content-Type: text/xml`

### 7. Root Layout SEO ([app/layout.tsx](app/layout.tsx))
- **Metadata base**: Sets canonical base URL
- **Title template**: `%s | Next.js Portfolio Starter`
- **Robots meta**: Enables indexing, sets snippet/preview limits
- **Locale**: `en_US`

---

## Architecture Principles

### Server-Side First
- **No client components** except analytics (`'use client'` not used in pages/components)
- All rendering happens via React Server Components (RSC)
- MDX rendered server-side via `next-mdx-remote/rsc`

### Static Generation
- Blog posts pre-rendered at build time via `generateStaticParams()`
- No runtime database queries
- Filesystem is the "database"

### URL Structure
```
/                          → Home page with recent posts
/blog                      → All blog posts listing
/blog/[slug]              → Individual post (slug = filename)
/og?title=...             → Dynamic OG image generator
/rss                      → RSS feed
/sitemap.xml              → Auto-generated sitemap
/robots.txt               → Auto-generated robots file
```

### Configuration Constants
**Single source of truth for base URL**:
```tsx
// app/sitemap.ts
export const baseUrl = 'https://portfolio-blog-starter.vercel.app'
```
This constant is imported in:
- [app/layout.tsx](app/layout.tsx) (metadataBase)
- [app/blog/[slug]/page.tsx](app/blog/[slug]/page.tsx) (OG images, JSON-LD)
- [app/rss/route.ts](app/rss/route.ts) (feed URLs)
- [app/robots.ts](app/robots.ts) (sitemap reference)

---

## Development Guidelines

### Adding New Blog Posts
1. Create `app/blog/posts/my-new-post.mdx`
2. Add required frontmatter (title, publishedAt, summary)
3. Write content using standard markdown
4. Post automatically appears in listings (no config needed)
5. Sitemap and RSS regenerate on next build

### Modifying Styles
- **Tailwind classes**: Edit component files directly
- **Global prose styles**: Edit [app/global.css](app/global.css)
- **Syntax highlighting colors**: Modify CSS variables in [global.css](app/global.css:8-30)

### Customization Checklist
When forking this project:
- [ ] Update `baseUrl` in [app/sitemap.ts](app/sitemap.ts:3)
- [ ] Change site name in [app/layout.tsx](app/layout.tsx:14-15)
- [ ] Update author name in [app/blog/[slug]/page.tsx](app/blog/[slug]/page.tsx:80)
- [ ] Modify navigation links in [app/components/nav.tsx](app/components/nav.tsx:3-13)
- [ ] Update footer links in [app/components/footer.tsx](app/components/footer.tsx:21-55)
- [ ] Replace sample posts in `app/blog/posts/`
