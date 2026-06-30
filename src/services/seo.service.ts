import { api } from '@/config/api';
import type { SEOPageData } from '@/types/seo';

class SEOService {
  async resolvePage(path: string): Promise<SEOPageData> {
    const response = await api.get(`/seo/resolve/${path}/`);
    return response.data;
  }

  async generateAll(): Promise<{ count: number }> {
    const response = await api.post('/seo/generate/');
    return response.data;
  }

  getSitemapUrl(): string {
    return `${api.defaults.baseURL}/seo/sitemap.xml`;
  }

  getRobotsUrl(): string {
    return `${api.defaults.baseURL}/seo/robots.txt`;
  }
}

export const seoService = new SEOService();
