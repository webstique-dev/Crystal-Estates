import { projects } from '../data/site'
import { newsArticles } from '../data/news'

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crystalestates.in'
  const now = new Date().toISOString()

  const staticRoutes = [
    '',
    '/about',
    '/projects',
    '/services',
    '/gallery',
    '/news',
    '/sell-your-land',
    '/faq',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/projects' ? 0.9 : 0.8,
  }))

  const projectRoutes = projects.map((proj) => ({
    url: `${baseUrl}/projects/${proj.slug || proj.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const newsRoutes = newsArticles.map((art) => ({
    url: `${baseUrl}/news/${art.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...projectRoutes, ...newsRoutes]
}

