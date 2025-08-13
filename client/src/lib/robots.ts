// SEO - Robots.txt and Sitemap generation
export function generateRobotsTxt(): string {
  const baseUrl = window.location.origin;
  
  return `User-agent: *
Allow: /
Allow: /dashboard
Allow: /pricing
Allow: /turkish-exams
Allow: /ai-learning
Allow: /social
Allow: /analytics
Allow: /gamification

# Disallow admin and private pages
Disallow: /admin/
Disallow: /api/
Disallow: /private/

# Disallow authentication pages
Disallow: /auth
Disallow: /login
Disallow: /register

# Disallow user-specific content
Disallow: /quiz/
Disallow: /user/
Disallow: /profile/

# Crawl delay
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml`;
}

export function generateSitemap(): string {
  const baseUrl = window.location.origin;
  const currentDate = new Date().toISOString().split('T')[0];
  
  const urls = [
    {
      loc: baseUrl,
      priority: '1.0',
      changefreq: 'daily',
      lastmod: currentDate
    },
    {
      loc: `${baseUrl}/dashboard`,
      priority: '0.9',
      changefreq: 'daily',
      lastmod: currentDate
    },
    {
      loc: `${baseUrl}/pricing`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: currentDate
    },
    {
      loc: `${baseUrl}/turkish-exams`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: currentDate
    },
    {
      loc: `${baseUrl}/ai-learning`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: currentDate
    },
    {
      loc: `${baseUrl}/social`,
      priority: '0.6',
      changefreq: 'weekly',
      lastmod: currentDate
    },
    {
      loc: `${baseUrl}/analytics`,
      priority: '0.6',
      changefreq: 'weekly',
      lastmod: currentDate
    },
    {
      loc: `${baseUrl}/gamification`,
      priority: '0.5',
      changefreq: 'monthly',
      lastmod: currentDate
    }
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemapXml;
}