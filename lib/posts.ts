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

        const pages = response.results
            .filter((block: any) => block.type === "child_page")
            .map((block: any) => ({
                id: block.id,
                slug: slugify(block.child_page.title),
                title: block.child_page.title,
                summary: `Note on ${block.child_page.title}`,
                publishedAt: block.child_page.created_time,
                tags: ["Tech Notes"],
                readingTime: "5 min read",
                draft: false,
            }))
            .sort(
                (a: any, b: any) =>
                    new Date(b.publishedAt).getTime() -
                    new Date(a.publishedAt).getTime(),
            );

        return limit ? pages.slice(0, limit) : pages;
    } catch (err: any) {
        if (err.code === "object_not_found") {
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
            content: mdString.parent || "_No content available._",
        };
    } catch (err) {
        console.error(`Error fetching post ${slug} from Notion:`, err);
        return null;
    }
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
