import type { SEOHealthData, SearchVisibilityData, GEOData, TrafficData } from '@/types';

// Use relative URL when deployed together with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async fetchWithErrorHandling(url: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // SEO Health Endpoints
  async analyzeSEOHealth(url: string, strategy: string = 'mobile'): Promise<SEOHealthData> {
    const response = await this.fetchWithErrorHandling(
      `${this.baseUrl}/api/seo/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, strategy }),
      }
    );
    return response;
  }

  async getSEOScores(url: string, strategy: string = 'mobile'): Promise<SEOHealthData> {
    const response = await this.fetchWithErrorHandling(
      `${this.baseUrl}/api/seo/scores?url=${encodeURIComponent(url)}&strategy=${strategy}`
    );
    return response;
  }

  // Search Visibility Endpoints
  async analyzeSearchVisibility(url: string): Promise<SearchVisibilityData> {
    const response = await this.fetchWithErrorHandling(
      `${this.baseUrl}/api/search/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      }
    );
    return response;
  }

  async getIndexStatus(url: string): Promise<SearchVisibilityData> {
    const response = await this.fetchWithErrorHandling(
      `${this.baseUrl}/api/search/index-status?url=${encodeURIComponent(url)}`
    );
    return response;
  }

  // GEO Endpoints
  async analyzeGEO(domain: string, keywords: string[]): Promise<GEOData> {
    const response = await this.fetchWithErrorHandling(
      `${this.baseUrl}/api/geo/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, keywords }),
      }
    );
    return response;
  }

  async quickGEOCheck(domain: string, keywords: string): Promise<GEOData> {
    const response = await this.fetchWithErrorHandling(
      `${this.baseUrl}/api/geo/check?domain=${encodeURIComponent(domain)}&keywords=${encodeURIComponent(keywords)}`
    );
    return response;
  }

  // Traffic Estimation Endpoints
  async estimateTraffic(url: string): Promise<TrafficData> {
    const response = await this.fetchWithErrorHandling(
      `${this.baseUrl}/api/traffic/estimate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      }
    );
    return response;
  }

  async quickTrafficEstimate(url: string): Promise<TrafficData> {
    const response = await this.fetchWithErrorHandling(
      `${this.baseUrl}/api/traffic/estimate?url=${encodeURIComponent(url)}`
    );
    return response;
  }

  // Report Generation
  async generateReport(data: {
    url: string;
    seo_data?: SEOHealthData;
    search_data?: SearchVisibilityData;
    geo_data?: GEOData;
    traffic_data?: TrafficData;
    include_sections: string[];
    company_name?: string;
  }): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/report/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to generate report');
    }

    return await response.blob();
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.fetchWithErrorHandling(`${this.baseUrl}/api/health`);
    return response;
  }
}

export const apiService = new ApiService();
export default apiService;
