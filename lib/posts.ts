export type PostSummary = {
    id: string;
    slug: string;
    title: string;
    summary?: string;
    image?: string;
    publishedAt?: string;
    updatedAt?: string;
    tags: string[];
    readingTime: string;
    draft: boolean;
    coAuthors?: string[];
};

export type PostDetail = PostSummary & {
    content: string;
};

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export async function getPosts(limit?: number): Promise<PostSummary[]> {
    if (!process.env.NOTION_API_KEY) {
        console.warn("NOTION_API_KEY missing.");
        return [];
    }

    if (!NOTION_DATABASE_ID) {
        console.warn("NOTION_DATABASE_ID missing.");
        return [];
    }

    try {
        const response = await notion.blocks.children.list({
            block_id: NOTION_DATABASE_ID,
        });

        interface NotionBlock {
            id: string;
            type: string;
            child_page?: { title: string };
            created_time: string;
        }

        const pages = (response.results as unknown as NotionBlock[])
            .filter((block) => block.type === "child_page" && block.child_page)
            .map((block) => ({
                id: block.id,
                slug: slugify(block.child_page!.title),
                title: block.child_page!.title,
                summary: `Note on ${block.child_page!.title}`,
                publishedAt: block.created_time,
                tags: ["Tech Notes"],
                readingTime: "5 min read",
                draft: false,
            }))
            .sort(
                (a, b) =>
                    new Date(b.publishedAt).getTime() -
                    new Date(a.publishedAt).getTime(),
            );

        return limit ? pages.slice(0, limit) : pages;
    } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error.code === "object_not_found") {
            console.error(
                `Notion object not found: ${NOTION_DATABASE_ID}. Please check your ID and permissions.`,
            );
        } else {
            console.error("Error fetching posts from Notion:", err);
        }
        return [];
    }
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
    if (!process.env.NOTION_API_KEY) {
        return null;
    }

    try {
        const posts = await getPosts();
        const postSummary = posts.find((p) => p.slug === slug);

        if (!postSummary) return null;

        // Fetch page content using notion-to-md
        const mdblocks = await n2m.pageToMarkdown(postSummary.id);
        const mdString = n2m.toMarkdownString(mdblocks);

        return {
            ...postSummary,
            content: sanitizeMarkdown(
                mdString.parent || "_No content available._",
            ),
        };
    } catch (err) {
        console.error(`Error fetching post ${slug} from Notion:`, err);
        return null;
    }
}

function sanitizeMarkdown(content: string) {
    // Escape common HTML tags often used as text in Notion (e.g., <header>, </div>, <br/>)
    // to prevent MDX parser from failing on unclosed/unexpected tags.
    // We wrap them in backticks to treat them as inline code.
    return content.replace(/<\/?[a-zA-Z]+[0-9]*\s*\/?>/g, (match) => {
        return `\`${match}\``;
    });
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
