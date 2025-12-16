import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BASE_URL = 'https://shrey715.vercel.app'

function getBlogPosts(): { slug: string; lastModified: Date }[] {
    const blogDir = path.join(process.cwd(), 'content/blog')

    if (!fs.existsSync(blogDir)) {
        return []
    }

    const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.mdx'))

    return files.map(file => {
        const filePath = path.join(blogDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const { data } = matter(fileContent)
        const slug = file.replace('.mdx', '')

        return {
            slug,
            lastModified: data.date ? new Date(data.date) : new Date(),
        }
    })
}

export default function sitemap(): MetadataRoute.Sitemap {
    const blogPosts = getBlogPosts()

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ]

    const blogPages: MetadataRoute.Sitemap = blogPosts.map(post => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
    }))

    return [...staticPages, ...blogPages]
}
