// SEO Health Types
export interface CoreWebVitals {
  lcp: number | null;
  lcp_category: string | null;
  fid: number | null;
  fid_category: string | null;
  cls: number | null;
  cls_category: string | null;
  fcp: number | null;
  fcp_category: string | null;
  ttfb: number | null;
  ttfb_category: string | null;
}

export interface Opportunity {
  title: string;
  description: string;
  score: number | null;
  savings: string | null;
  priority: string;
}

export interface SEOHealthData {
  url: string;
  strategy: string;
  performance_score: number | null;
  seo_score: number | null;
  accessibility_score: number | null;
  best_practices_score: number | null;
  core_web_vitals: CoreWebVitals;
  opportunities: Opportunity[];
  diagnostics: any[];
  metadata: any;
  recommendations: string[];
}

// Search Visibility Types
export interface IndexStatus {
  total_pages: number;
  indexed_pages: number;
  not_indexed_pages: number;
  pending_pages?: number;
  errors?: number;
  warnings?: number;
}

export interface SearchPerformance {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SitemapStatus {
  path: string;
  last_submitted?: string;
  last_downloaded?: string;
  warnings: number;
  errors: number;
  is_pending: boolean;
  is_sitemaps_index: boolean;
}

export interface SearchVisibilityData {
  url: string;
  google_data?: any;
  bing_data?: any;
  index_status: IndexStatus | null;
  search_performance: SearchPerformance[];
  sitemaps: SitemapStatus[];
  recommendations: string[];
}

// GEO Types
export interface BrandMention {
  platform: string;
  query: string;
  mentioned: boolean;
  context?: string;
  sentiment?: string;
  rank?: number;
  competitors_mentioned?: string[];
}

export interface GEOSummary {
  total_checks: number;
  mentions_found: number;
  mention_rate: number;
  sentiment_breakdown: Record<string, number>;
  average_rank?: number;
}

export interface GEOData {
  domain: string;
  keywords: string[];
  mentions: BrandMention[];
  summary: GEOSummary;
  recommendations: string[];
  raw_responses?: any;
}

// Traffic Estimation Types
export interface TrafficSource {
  source: string;
  percentage: number;
  estimated_visits: number;
}

export interface CountrySource {
  country: string;
  country_code: string;
  percentage: number;
  estimated_visits: number;
}

export interface TopKeyword {
  keyword: string;
  position?: number;
  volume?: number;
  cpc?: number;
}

export interface TrafficMetrics {
  monthly_visits: number;
  monthly_visits_min: number;
  monthly_visits_max: number;
  avg_visit_duration?: string;
  pages_per_visit?: number;
  bounce_rate?: number;
}

export interface TrafficData {
  url: string;
  disclaimer: string;
  metrics: TrafficMetrics;
  traffic_sources: TrafficSource[];
  top_countries: CountrySource[];
  top_keywords: TopKeyword[];
  growth_trend?: string;
  confidence_level: string;
  recommendations: string[];
}

// Audit State
export interface AuditState {
  url: string;
  isLoading: boolean;
  activeModules: string[];
  seoData: SEOHealthData | null;
  searchData: SearchVisibilityData | null;
  geoData: GEOData | null;
  trafficData: TrafficData | null;
  error: string | null;
}
