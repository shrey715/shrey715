import { MetadataRoute } from 'next'

// Required for `output: export` (static HTML export for the college-forum mirror).
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: 'https://shrey715.vercel.app/sitemap.xml',
    }
}
