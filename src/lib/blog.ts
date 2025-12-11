import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
    readingTime: string;
    image?: string;
}

export interface BlogPostWithContent extends BlogPost {
    content: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

/**
 * Get all blog posts metadata
 */
export async function getAllPosts(): Promise<BlogPost[]> {
    if (!fs.existsSync(BLOG_DIR)) {
        return [];
    }

    const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.mdx'));

    const posts = files.map(filename => {
        const slug = filename.replace('.mdx', '');
        const filePath = path.join(BLOG_DIR, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        const stats = readingTime(content);

        return {
            slug,
            title: data.title || 'Untitled',
            description: data.description || '',
            date: data.date || new Date().toISOString(),
            tags: data.tags || [],
            readingTime: stats.text,
            image: data.image,
        };
    });

    // Sort by date (newest first)
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPostWithContent | null> {
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const stats = readingTime(content);

    return {
        slug,
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        readingTime: stats.text,
        image: data.image,
        content,
    };
}

/**
 * Get all post slugs for static generation
 */
export function getAllPostSlugs(): string[] {
    if (!fs.existsSync(BLOG_DIR)) {
        return [];
    }

    return fs.readdirSync(BLOG_DIR)
        .filter(file => file.endsWith('.mdx'))
        .map(file => file.replace('.mdx', ''));
}
