/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://shrey715.vercel.app',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
    },
};
