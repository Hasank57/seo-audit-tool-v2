import type { SEOHealthData, SearchVisibilityData, GEOData, TrafficData } from '@/types';

// Mock data for demonstration when backend is not available

const mockSEOData = (url: string): SEOHealthData => ({
  url,
  strategy: 'mobile',
  performance_score: 72,
  seo_score: 85,
  accessibility_score: 78,
  best_practices_score: 92,
  core_web_vitals: {
    lcp: 2.4,
    lcp_category: 'good',
    fid: 45,
    fid_category: 'good',
    cls: 0.12,
    cls_category: 'needs_improvement',
    fcp: 1.6,
    fcp_category: 'good',
    ttfb: 0.65,
    ttfb_category: 'good',
  },
  opportunities: [
    {
      title: 'Eliminate render-blocking resources',
      description: 'Resources are blocking the first paint of your page. Consider delivering critical JS/CSS inline and deferring all non-critical JS/styles.',
      score: 0.42,
      savings: '1.2s',
      priority: 'high',
    },
    {
      title: 'Properly size images',
      description: 'Serve images that are appropriately-sized to save cellular data and improve load time.',
      score: 0.65,
      savings: '0.8s',
      priority: 'medium',
    },
    {
      title: 'Reduce unused JavaScript',
      description: 'Remove unused JavaScript to reduce bytes consumed by network activity.',
      score: 0.58,
      savings: '0.5s',
      priority: 'medium',
    },
  ],
  diagnostics: [],
  metadata: {
    lighthouse_version: '11.0.0',
    fetch_time: new Date().toISOString(),
  },
  recommendations: [
    '⚠️ Performance needs improvement. Consider lazy loading images and deferring non-critical JavaScript.',
    '📋 SEO Score could be improved. Check meta tags, headings structure, and ensure proper canonical URLs.',
    '♿ Accessibility score needs attention. Add alt text to images and ensure proper color contrast.',
    '🔧 High Priority: Eliminate render-blocking resources - Resources are blocking the first paint of your page...',
  ],
});

const mockSearchData = (url: string): SearchVisibilityData => ({
  url,
  google_data: { status: 'verified' },
  bing_data: { status: 'verified' },
  index_status: {
    total_pages: 156,
    indexed_pages: 142,
    not_indexed_pages: 14,
    pending_pages: 3,
    errors: 2,
    warnings: 5,
  },
  search_performance: [
    { query: 'best seo tools 2024', clicks: 1250, impressions: 25000, ctr: 0.05, position: 8.5 },
    { query: 'website audit checklist', clicks: 890, impressions: 18500, ctr: 0.048, position: 10.2 },
    { query: 'seo optimization guide', clicks: 650, impressions: 15200, ctr: 0.043, position: 12.8 },
    { query: 'core web vitals explained', clicks: 520, impressions: 12800, ctr: 0.041, position: 9.3 },
    { query: 'google ranking factors', clicks: 480, impressions: 22100, ctr: 0.022, position: 15.7 },
  ],
  sitemaps: [
    {
      path: '/sitemap.xml',
      last_submitted: '2024-01-15T10:30:00Z',
      last_downloaded: '2024-01-15T12:45:00Z',
      warnings: 2,
      errors: 1,
      is_pending: false,
      is_sitemaps_index: false,
    },
    {
      path: '/sitemap-posts.xml',
      last_submitted: '2024-01-15T10:30:00Z',
      last_downloaded: '2024-01-15T12:45:00Z',
      warnings: 0,
      errors: 0,
      is_pending: false,
      is_sitemaps_index: false,
    },
  ],
  recommendations: [
    '📉 Only 91.0% of your pages are indexed. Submit a sitemap to Google Search Console and check for crawl errors.',
    '🚨 Found 2 indexing errors. Fix these in Google Search Console to improve visibility.',
    '⚠️ Found 5 indexing warnings. Review and address these to ensure proper indexing.',
    '📊 Your average CTR is 4.08%. Improve meta titles and descriptions to increase click-through rates.',
    '🎯 Average position is 11.3. Focus on SEO improvements to reach the first page (position 1-10).',
  ],
});

const mockGEOData = (domain: string, _keywords?: string[]): GEOData => ({
  domain,
  keywords: _keywords || ['SEO tools', 'website optimization'],
  mentions: [
    {
      platform: 'gemini',
      query: `What is ${domain}?`,
      mentioned: true,
      context: `${domain} is a well-known platform in the SEO tools space. They offer comprehensive solutions for businesses looking to improve their online visibility.`,
      sentiment: 'positive',
      rank: 3,
      competitors_mentioned: ['competitorA.com', 'competitorB.io', 'competitorC.net'],
    },
    {
      platform: 'chatgpt',
      query: `What is ${domain}?`,
      mentioned: true,
      context: `${domain} provides excellent SEO audit capabilities and is widely used by digital marketing professionals.`,
      sentiment: 'positive',
      rank: 2,
      competitors_mentioned: ['competitorA.com', 'competitorB.io'],
    },
    {
      platform: 'gemini',
      query: 'What are the best tools for SEO tools?',
      mentioned: true,
      context: 'Here are the best tools for SEO: 1. CompetitorA.com - Industry leader, 2. ${domain} - Highly recommended, 3. CompetitorB.io - Great for beginners',
      sentiment: 'positive',
      rank: 2,
      competitors_mentioned: ['competitorA.com', 'competitorB.io'],
    },
    {
      platform: 'chatgpt',
      query: 'What are the best tools for SEO tools?',
      mentioned: false,
      context: undefined,
      sentiment: undefined,
      competitors_mentioned: ['competitorA.com', 'competitorB.io', 'competitorC.net'],
    },
  ],
  summary: {
    total_checks: 4,
    mentions_found: 3,
    mention_rate: 0.75,
    sentiment_breakdown: { positive: 3, neutral: 0, negative: 0 },
    average_rank: 2.3,
  },
  recommendations: [
    '✅ Strong AI visibility: 75% mention rate. Maintain your content strategy to preserve this advantage.',
    '🎯 Average ranking position is 2.3. Work on becoming a top-3 mentioned brand in your category.',
    '🎯 Target keywords analyzed: SEO tools, website optimization. Create comprehensive content around these topics to increase AI mentions.',
    '📝 Create authoritative, well-structured content that AI models can easily reference.',
    '🔗 Build high-quality backlinks from reputable sources to increase training data presence.',
  ],
});

const mockTrafficData = (url: string): TrafficData => ({
  url,
  disclaimer: 'These figures are estimates based on available data and algorithms. They should not be considered as exact figures. Use official analytics tools for accurate measurements.',
  metrics: {
    monthly_visits: 125000,
    monthly_visits_min: 87500,
    monthly_visits_max: 162500,
    avg_visit_duration: '3m 45s',
    pages_per_visit: 3.2,
    bounce_rate: 0.42,
  },
  traffic_sources: [
    { source: 'Organic Search', percentage: 45.5, estimated_visits: 56875 },
    { source: 'Direct', percentage: 28.3, estimated_visits: 35375 },
    { source: 'Referral', percentage: 12.8, estimated_visits: 16000 },
    { source: 'Social Media', percentage: 8.4, estimated_visits: 10500 },
    { source: 'Paid Search', percentage: 3.5, estimated_visits: 4375 },
    { source: 'Email', percentage: 1.5, estimated_visits: 1875 },
  ],
  top_countries: [
    { country: 'United States', country_code: 'US', percentage: 35.0, estimated_visits: 43750 },
    { country: 'United Kingdom', country_code: 'GB', percentage: 12.0, estimated_visits: 15000 },
    { country: 'Canada', country_code: 'CA', percentage: 8.0, estimated_visits: 10000 },
    { country: 'Germany', country_code: 'DE', percentage: 7.0, estimated_visits: 8750 },
    { country: 'France', country_code: 'FR', percentage: 6.0, estimated_visits: 7500 },
    { country: 'India', country_code: 'IN', percentage: 5.0, estimated_visits: 6250 },
    { country: 'Australia', country_code: 'AU', percentage: 5.0, estimated_visits: 6250 },
    { country: 'Other', country_code: 'OT', percentage: 22.0, estimated_visits: 27500 },
  ],
  top_keywords: [
    { keyword: 'seo audit tool', position: 3, volume: 12500, cpc: 8.5 },
    { keyword: 'website analyzer', position: 5, volume: 8200, cpc: 6.2 },
    { keyword: 'seo checker', position: 8, volume: 22100, cpc: 4.8 },
    { keyword: 'site audit', position: 4, volume: 6800, cpc: 7.1 },
    { keyword: 'seo analysis', position: 12, volume: 15400, cpc: 5.5 },
    { keyword: 'website seo test', position: 6, volume: 4200, cpc: 3.9 },
    { keyword: 'page speed test', position: 15, volume: 33100, cpc: 2.8 },
    { keyword: 'core web vitals check', position: 9, volume: 5800, cpc: 4.2 },
  ],
  growth_trend: 'increasing',
  confidence_level: 'medium',
  recommendations: [
    '📊 Moderate traffic level. Optimize conversion rates and expand your keyword targeting.',
    '🔍 Organic search is 45.5% of traffic. Good SEO performance - maintain your efforts.',
    '👋 Direct traffic is 28.3%. Strong brand awareness indicated.',
    '📱 Social media traffic is 8.4%. Consider expanding social media presence.',
    '🎯 Focus on high-volume, low-competition keywords for quick wins.',
    '📧 Implement email marketing to increase returning visitors.',
  ],
});

class MockApiService {
  async analyzeSEOHealth(url: string, _strategy?: string): Promise<SEOHealthData> {
    await this.delay(1000);
    return mockSEOData(url);
  }

  async analyzeSearchVisibility(url: string): Promise<SearchVisibilityData> {
    await this.delay(1200);
    return mockSearchData(url);
  }

  async analyzeGEO(domain: string, keywords?: string[]): Promise<GEOData> {
    await this.delay(1500);
    return mockGEOData(domain, keywords);
  }

  async estimateTraffic(url: string): Promise<TrafficData> {
    await this.delay(1000);
    return mockTrafficData(url);
  }

  async generateReport(_data: unknown): Promise<Blob> {
    await this.delay(2000);
    // Return a simple text blob as mock PDF
    const content = 'This is a mock PDF report. In production, this would be a real PDF generated by the backend.';
    return new Blob([content], { type: 'text/plain' });
  }

  async healthCheck(): Promise<{ status: string }> {
    return { status: 'mock' };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockApiService = new MockApiService();
