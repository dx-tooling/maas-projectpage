const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

module.exports = function blogPostsPlugin() {
    return function (tree) {
        const blogDir = path.resolve(__dirname, "src/blog");
        const blogPosts = [];

        // Read all blog post files
        try {
            const files = fs.readdirSync(blogDir);

            files.forEach((file) => {
                const filePath = path.join(blogDir, file);
                const content = fs.readFileSync(filePath, "utf8");

                if (file.endsWith(".html")) {
                    // Extract metadata from standard schemas
                    // Priority: Open Graph > Twitter > Standard meta > Schema.org JSON-LD

                    // Open Graph (og:)
                    const ogTitleMatch = content.match(/<meta property="og:title" content="([^"]+)"/);
                    const ogDescriptionMatch = content.match(/<meta property="og:description" content="([^"]+)"/);
                    const ogPublishedTimeMatch = content.match(
                        /<meta property="article:published_time" content="([^"]+)"/,
                    );
                    const ogAuthorMatch = content.match(/<meta property="article:author" content="([^"]+)"/);
                    const ogTags = content.match(/<meta property="article:tag" content="([^"]+)"/g);

                    // Twitter Card (twitter:)
                    const twitterTitleMatch = content.match(/<meta name="twitter:title" content="([^"]+)"/);
                    const twitterDescriptionMatch = content.match(/<meta name="twitter:description" content="([^"]+)"/);

                    // Standard meta tags
                    const titleMatch = content.match(/<title>([^<]+)<\/title>/);
                    const descriptionMatch = content.match(/<meta name="description" content="([^"]+)"/);
                    const authorMatch = content.match(/<meta name="author" content="([^"]+)"/);
                    const keywordsMatch = content.match(/<meta name="keywords" content="([^"]+)"/);

                    // Blog system specific (read time)
                    const readTimeMatch = content.match(/<meta name="blog:readTime" content="([^"]+)"/);

                    // Determine the best values to use
                    const title = ogTitleMatch?.[1] || twitterTitleMatch?.[1] || titleMatch?.[1];
                    const summary = ogDescriptionMatch?.[1] || twitterDescriptionMatch?.[1] || descriptionMatch?.[1];
                    const date = ogPublishedTimeMatch?.[1];
                    const author = ogAuthorMatch?.[1] || authorMatch?.[1];

                    // Extract tags from multiple sources
                    let tags = [];
                    if (ogTags) {
                        ogTags.forEach((tagMeta) => {
                            const tagMatch = tagMeta.match(/content="([^"]+)"/);
                            if (tagMatch) tags.push(tagMatch[1]);
                        });
                    } else if (keywordsMatch) {
                        tags = keywordsMatch[1].split(",").map((tag) => tag.trim());
                    }

                    // Extract read time
                    const readTime = readTimeMatch ? readTimeMatch[1] : "";

                    // If we have the essential metadata, create the blog post
                    if (title && summary && date) {
                        // Parse the date and format it for display
                        let displayDate;
                        try {
                            const dateObj = new Date(date);
                            if (!isNaN(dateObj.getTime())) {
                                displayDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD format
                            } else {
                                displayDate = date; // Use original if parsing fails
                            }
                        } catch {
                            displayDate = date; // Use original if parsing fails
                        }

                        blogPosts.push({
                            title: title,
                            summary: summary,
                            date: displayDate,
                            author: author || "Unknown",
                            tags: tags,
                            readTime: readTime,
                            filename: file,
                            url: `blog/${file}`,
                        });
                    }
                }

                if (file.endsWith(".md")) {
                    // Parse front matter
                    const { data } = matter(content);
                    const title = data.title;
                    const summary = data.description || data.summary;
                    const date = data.published_time || data.date;
                    const author = data.author || "Unknown";
                    const tags = Array.isArray(data.tags)
                        ? data.tags
                        : typeof data.tags === "string"
                          ? data.tags
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)
                          : [];
                    const readTime = data.readTime || data.read_time || "";

                    if (title && summary && date) {
                        const base = path.basename(file, path.extname(file));
                        blogPosts.push({
                            title,
                            summary,
                            date,
                            author,
                            tags,
                            readTime,
                            filename: `${base}.html`,
                            url: `blog/${base}.html`,
                        });
                    }
                }
            });
        } catch (error) {
            console.warn("Warning: Could not read blog directory:", error.message);
        }

        // Sort blog posts by date (newest first)
        blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Limit to latest 6 posts for the landing page
        const latestPosts = blogPosts.slice(0, 6);
        const latestCompactPosts = blogPosts.slice(0, 3);

        // Find the blog section and populate it
        tree.walk((node) => {
            if (node.tag === "div" && node.attrs && node.attrs.id === "blog-posts-container") {
                // Clear existing content and add blog posts
                node.content = latestPosts.map((post) => {
                    const tags = post.tags.map((tag) => ({
                        tag: "span",
                        attrs: {
                            class: "px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded",
                        },
                        content: tag,
                    }));

                    return {
                        tag: "div",
                        attrs: { class: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4" },
                        content: [
                            {
                                tag: "div",
                                attrs: {
                                    class: "flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2",
                                },
                                content: [
                                    {
                                        tag: "span",
                                        content: new Date(post.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }),
                                    },
                                    { tag: "span", content: "•" },
                                    { tag: "span", content: post.readTime },
                                ],
                            },
                            {
                                tag: "h3",
                                attrs: { class: "text-xl font-semibold text-gray-900 dark:text-white" },
                                content: post.title,
                            },
                            {
                                tag: "p",
                                attrs: { class: "text-gray-600 dark:text-gray-300 text-sm leading-relaxed" },
                                content: post.summary,
                            },
                            {
                                tag: "div",
                                attrs: { class: "flex flex-wrap gap-2 mb-4" },
                                content: tags,
                            },
                            {
                                tag: "a",
                                attrs: {
                                    href: post.url,
                                    class: "inline-block text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium",
                                },
                                content: "Read More →",
                            },
                        ],
                    };
                });
            }

            // Populate compact list under hero section
            if (node.tag === "div" && node.attrs && node.attrs.id === "blog-posts-compact-container") {
                node.content = latestCompactPosts.map((post) => {
                    return {
                        tag: "a",
                        attrs: {
                            href: post.url,
                            class: "group glass-card rounded-md px-4 py-3 shadow-premium flex items-center justify-between gap-4 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 transition-colors cursor-pointer no-underline",
                        },
                        content: [
                            {
                                tag: "span",
                                attrs: { class: "shrink-0 text-sm text-gray-600 dark:text-gray-300" },
                                content: new Date(post.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                }),
                            },
                            {
                                tag: "div",
                                attrs: { class: "min-w-0 flex-1" },
                                content: [
                                    {
                                        tag: "p",
                                        attrs: {
                                            class: "truncate text-sm font-medium text-gray-900 dark:text-gray-100",
                                        },
                                        content: post.title,
                                    },
                                ],
                            },
                            {
                                tag: "span",
                                attrs: {
                                    class: "shrink-0 text-blue-700 dark:text-blue-300 group-hover:underline text-sm font-medium",
                                },
                                content: "Read More →",
                            },
                        ],
                    };
                });
            }
            return node;
        });

        return tree;
    };
};
