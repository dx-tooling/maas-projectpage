# Blog System Documentation (Markdown-based)

This landing page now includes an automated blog system that sources posts from Markdown files in `src/blog/` using front matter for metadata. During the webpack build, Markdown is converted to Living Styleguide-compatible HTML pages and the landing page sections ("Latest Updates" and compact "Newest updates") are populated automatically.

## How It Works

1. **Blog Post Files**: Each blog post is a Markdown file in `src/blog/` with a `.md` extension.
2. **Front Matter Metadata**: Posts include YAML front matter for title, date, tags, etc.
3. **Build Integration**: A custom loader renders Markdown to HTML and wraps it in our blog template. The PostHTML plugin reads front matter to populate the lists.

## Creating a New Blog Post

1. Create a new Markdown file in `src/blog/`, e.g., `2025-09-16-awesome-update.md`.
2. Add YAML front matter at the top:

```md
---
title: Awesome Update Title
description: A short summary of what changed and why it matters.
author: Your Name
published_time: 2025-09-16T00:00:00+00:00
tags: [Feature, Infra]
readTime: 5 min read
---

Your Markdown content starts here...
```

3. Write your post in standard Markdown. You can use code blocks, lists, headings, and inline HTML if needed.
4. Run `npm run build` to regenerate pages.

## Required Fields (Front Matter)

- **title**: String
- **description**: String (used as preview summary)
- **published_time**: ISO 8601 date string

## Optional Fields

- **author**: String (defaults to `Unknown`)
- **tags**: Array of strings or comma-separated string
- **readTime**: String, e.g., `4 min read`

## Features

- **Automatic Sorting**: Posts are sorted by `published_time` (newest first)
- **Landing Page Display**: Latest 6 posts shown; compact list shows latest 3
- **Responsive HTML**: Generated pages use the same Tailwind classes and partials (`nav`, `theme-fouc-guard`)
- **SEO/Open Graph**: Pages include meta tags rendered from front matter

## Technical Details

- Markdown is rendered by a custom loader at `loaders/markdown-to-html.js` using `gray-matter` + `markdown-it`.
- Webpack discovers `src/blog/*.md` and emits `dist/blog/<slug>.html` via `HtmlWebpackPlugin`.
- `posthtml-blog-posts.js` reads `.md` files' front matter to build the homepage sections.

## Build Commands

- `npm run build` - Build the site
- `npm run build:prod` - Production build
- `npm run quality` - Prettier + ESLint + Type checks
- `npm test` - Run tests
