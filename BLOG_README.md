# Blog System Documentation

This landing page now includes an automated blog section that automatically extracts and displays blog posts from the `src/blog/` directory using **standard web metadata schemas**.

## How It Works

1. **Blog Post Structure**: Each blog post should be an HTML file in the `src/blog/` directory
2. **Standard Metadata**: The system automatically extracts metadata from standard schemas (Open Graph, Twitter Cards, Schema.org)
3. **Automatic Population**: Blog posts are automatically displayed on the landing page
4. **Build Integration**: The blog section is populated during the webpack build process

## Creating a New Blog Post

1. Create a new HTML file in `src/blog/` with a descriptive filename (e.g., `2025-08-24-docker-rewrite.html`)

2. Include the required metadata using **standard web schemas**:

### **Required Metadata (Open Graph)**
```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="article">
<meta property="og:title" content="Your Blog Post Title">
<meta property="og:description" content="A brief summary of your blog post content.">
<meta property="og:article:published_time" content="2025-08-24T00:00:00+00:00">
```

### **Recommended Additional Metadata**
```html
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Your Blog Post Title">
<meta name="twitter:description" content="A brief summary of your blog post content.">

<!-- Standard SEO -->
<meta name="author" content="Author Name">
<meta name="keywords" content="Tag1, Tag2, Tag3">
<meta name="description" content="A brief summary of your blog post content.">

<!-- Blog System Specific -->
<meta name="blog:readTime" content="5 min read">
```

### **Schema.org Structured Data (Optional but Recommended)**
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Your Blog Post Title",
    "description": "A brief summary of your blog post content.",
    "author": {
        "@type": "Person",
        "name": "Author Name"
    },
    "datePublished": "2025-08-24T00:00:00+00:00",
    "keywords": ["Tag1", "Tag2", "Tag3"]
}
</script>
```

3. Add your blog content in the `<body>` section

4. Run `npm run build` to rebuild the site

## Metadata Priority

The system extracts metadata in this priority order:
1. **Open Graph (og:)** - Best for social media sharing
2. **Twitter Card (twitter:)** - Twitter-specific optimization
3. **Standard meta tags** - Basic SEO
4. **Schema.org JSON-LD** - Semantic web and search engines

## Required Fields

- **Title**: `og:title` or `twitter:title` or `<title>` tag
- **Summary**: `og:description` or `twitter:description` or `meta name="description"`
- **Date**: `og:article:published_time` (ISO 8601 format)

## Optional Fields

- **Author**: `og:article:author` or `meta name="author"`
- **Tags**: `og:article:tag` (multiple) or `meta name="keywords"`
- **Read Time**: `meta name="blog:readTime"` (for our internal system)

## Benefits of Standard Schemas

✅ **SEO Optimized**: Search engines understand standard metadata  
✅ **Social Media Ready**: Perfect sharing on Facebook, Twitter, LinkedIn  
✅ **Semantic Web**: Compatible with RDF, knowledge graphs, and AI tools  
✅ **Future Proof**: Standards evolve but remain backward compatible  
✅ **Tool Integration**: Works with social media preview tools, link shorteners, etc.  
✅ **Accessibility**: Screen readers and assistive technologies can better understand content  

## Features

- **Automatic Sorting**: Blog posts are automatically sorted by date (newest first)
- **Landing Page Display**: Latest 6 blog posts are displayed on the landing page
- **Responsive Design**: Blog cards are responsive and match the site's design
- **Tag Display**: Tags are automatically extracted and displayed as colored badges
- **Read More Links**: Each blog post preview includes a "Read More →" link
- **Standard Compliance**: Uses industry-standard metadata schemas

## Technical Details

- Uses a custom PostHTML plugin (`posthtml-blog-posts.js`)
- Integrates with the existing webpack build process
- Automatically handles file reading and metadata extraction from multiple sources
- No manual configuration required - just add blog post files with standard metadata
- Supports fallback metadata extraction if primary sources are missing

## Example Blog Post Structure

See `src/blog/2025-08-24-docker-rewrite.html` for a complete example of a blog post with all standard metadata schemas properly implemented.

## Build Commands

- `npm run build` - Build the site with blog posts
- `npm run build:prod` - Build for production
- `npm run quality` - Run all quality checks
- `npm test` - Run tests
