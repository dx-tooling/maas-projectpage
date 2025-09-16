/*
 * Markdown-to-HTML loader for blog posts
 * - Parses front matter with gray-matter
 * - Renders markdown with markdown-it
 * - Wraps content in our blog HTML template (with Tailwind classes)
 * - Leaves <include> tags for PostHTML to resolve
 */

const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");
const path = require("path");

/**
 * @param {string} source Markdown file contents
 */
module.exports = function markdownToHtmlLoader(source) {
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
    });

    const { data, content } = matter(source);

    const title = data.title || "Untitled";
    const description = data.description || data.summary || "";
    const author = data.author || "Unknown";
    const published = data.published_time || data.date || "";
    const tags = Array.isArray(data.tags)
        ? data.tags
        : typeof data.tags === "string"
          ? data.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
          : [];
    const readTime = data.readTime || data.read_time || "";

    // Compute canonical URL path based on filename
    const resourcePath = this.resourcePath; // absolute path of the .md
    const fileBase = path.basename(resourcePath, path.extname(resourcePath));
    const pageUrl = `https://mcp-as-a-service.com/blog/${fileBase}.html`;

    const rendered = md.render(content);

    const headTags = [
        `<title>${escapeHtml(title)} - MCP-as-a-Service Blog</title>`,
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        description ? `<meta name="description" content="${escapeHtml(description)}">` : "",
        `<meta name="author" content="${escapeHtml(author)}">`,
        '<meta name="robots" content="index, follow">',
        tags.length ? `<meta name="keywords" content="${escapeHtml(tags.join(", "))}">` : "",
        // Open Graph
        '<meta property="og:type" content="article">',
        `<meta property="og:url" content="${pageUrl}">`,
        `<meta property="og:title" content="${escapeHtml(title)}">`,
        description ? `<meta property="og:description" content="${escapeHtml(description)}">` : "",
        '<meta property="og:site_name" content="MCP-as-a-Service">',
        '<meta property="og:locale" content="en_US">',
        published ? `<meta property="article:published_time" content="${escapeHtml(published)}">` : "",
        `<meta property="article:author" content="${escapeHtml(author)}">`,
        ...tags.map((t) => `<meta property="article:tag" content="${escapeHtml(t)}">`),
        // Twitter
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:site" content="@dx_tooling">',
        '<meta name="twitter:creator" content="@manuelkiessling">',
        `<meta name="twitter:title" content="${escapeHtml(title)}">`,
        description ? `<meta name="twitter:description" content="${escapeHtml(description)}">` : "",
        // Blog system specific
        readTime ? `<meta name="blog:readTime" content="${escapeHtml(readTime)}">` : "",
    ]
        .filter(Boolean)
        .join("\n        ");

    const tagBadges = tags
        .map(
            (t) =>
                `<span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">${escapeHtml(t)}</span>`,
        )
        .join("\n                        ");

    const dateDisplay = published
        ? new Date(published).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "";

    const html = `<!DOCTYPE html>
<html lang="en" class="h-full scroll-smooth">
<head>
        ${headTags}

        <!-- Include FOUC guard script -->
        <include src="partials/theme-fouc-guard.html"></include>
        <!-- Link to CSS will be injected here by HtmlWebpackPlugin -->
</head>
<body class="h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-x-hidden">
    <include src="partials/nav.html"></include>
    <div class="container mx-auto px-4 py-12 max-w-4xl">
        <header class="mb-8">
            <nav class="mb-6">
                <a href="../index.html" class="text-blue-600 dark:text-blue-400 hover:underline">← Back to Home</a>
            </nav>
            <div class="mb-6">
                <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    ${published ? `<time datetime="${escapeHtml(String(published))}">${escapeHtml(dateDisplay)}</time>` : ""}
                    ${readTime ? `<span>•</span><span>${escapeHtml(readTime)}</span>` : ""}
                    <span>•</span>
                    <span>${escapeHtml(author)}</span>
                </div>
                <div class="flex flex-wrap gap-2">
                    ${tagBadges}
                </div>
            </div>
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">${escapeHtml(
                title,
            )}</h1>
            ${description ? `<p class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">${escapeHtml(description)}</p>` : ""}
        </header>
        <article class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-li:marker:text-gray-400 dark:prose-li:marker:text-gray-500 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-code:text-pink-600 dark:prose-code:text-pink-400">
            ${rendered}
        </article>
        <footer class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
                <a href="../index.html" class="text-blue-600 dark:text-blue-400 hover:underline">← Back to Home</a>
            </div>
        </footer>
    </div>
    <!-- The script tag will be injected by HtmlWebpackPlugin -->
</body>
</html>`;

    return html;
};

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
