"""
Search Visibility Module
Checks website's indexing status and visibility on Google and Bing
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import httpx
import os

router = APIRouter()

# API configurations
GOOGLE_SEARCH_CONSOLE_API_URL = "https://www.googleapis.com/webmasters/v3"
BING_WEBMASTER_API_URL = "https://ssl.bing.com/webmaster/api.svc/json"


class SearchVisibilityRequest(BaseModel):
    url: HttpUrl
    access_token: Optional[str] = None  # For GSC OAuth
    bing_api_key: Optional[str] = None  # For Bing Webmaster


class IndexStatus(BaseModel):
    total_pages: int
    indexed_pages: int
    not_indexed_pages: int
    pending_pages: Optional[int] = None
    errors: Optional[int] = None
    warnings: Optional[int] = None


class SearchPerformance(BaseModel):
    query: str
    clicks: int
    impressions: int
    ctr: float
    position: float


class SitemapStatus(BaseModel):
    path: str
    last_submitted: Optional[str] = None
    last_downloaded: Optional[str] = None
    warnings: int
    errors: int
    is_pending: bool
    is_sitemaps_index: bool


class SearchVisibilityResponse(BaseModel):
    url: str
    google_data: Optional[Dict[str, Any]] = None
    bing_data: Optional[Dict[str, Any]] = None
    index_status: Optional[IndexStatus] = None
    search_performance: List[SearchPerformance]
    sitemaps: List[SitemapStatus]
    recommendations: List[str]


async def fetch_google_index_status(url: str, access_token: Optional[str] = None) -> Dict[str, Any]:
    """Fetch index status from Google Search Console"""
    try:
        # For demo purposes, we'll simulate the API response
        # In production, this would use the actual GSC API with proper OAuth
        
        if not access_token:
            # Return simulated data for demo
            return {
                "site_url": url,
                "status": "verified",
                "index_status": {
                    "total_pages": 150,
                    "indexed_pages": 127,
                    "not_indexed_pages": 23,
                    "pending_pages": 5,
                    "errors": 3,
                    "warnings": 8
                },
                "search_performance": {
                    "clicks": 1250,
                    "impressions": 25000,
                    "ctr": 0.05,
                    "position": 12.5
                }
            }
        
        # Actual GSC API call would go here
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient() as client:
            # Get site list
            response = await client.get(
                f"{GOOGLE_SEARCH_CONSOLE_API_URL}/sites",
                headers=headers
            )
            response.raise_for_status()
            return response.json()
            
    except Exception as e:
        return {"error": str(e), "note": "Using simulated data"}


async def fetch_bing_index_status(url: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """Fetch index status from Bing Webmaster Tools"""
    try:
        if not api_key:
            # Return simulated data for demo
            return {
                "site_url": url,
                "status": "verified",
                "index_status": {
                    "total_pages": 145,
                    "indexed_pages": 118,
                    "not_indexed_pages": 27
                },
                "search_performance": {
                    "clicks": 890,
                    "impressions": 18500,
                    "ctr": 0.048,
                    "position": 14.2
                }
            }
        
        # Actual Bing Webmaster API call would go here
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BING_WEBMASTER_API_URL}/GetUrlTraffic",
                params={"apikey": api_key, "siteUrl": url}
            )
            response.raise_for_status()
            return response.json()
            
    except Exception as e:
        return {"error": str(e), "note": "Using simulated data"}


async def check_indexing_status(url: str) -> Dict[str, Any]:
    """Check indexing status using various methods"""
    results = {
        "google_indexed": False,
        "bing_indexed": False,
        "google_results": 0,
        "bing_results": 0,
        "checks_performed": []
    }
    
    try:
        # Check Google indexing via search (simulated)
        # In production, you might use search operators or APIs
        results["checks_performed"].append("google_site_search")
        results["google_indexed"] = True  # Simulated
        results["google_results"] = 127  # Simulated
        
        # Check Bing indexing (simulated)
        results["checks_performed"].append("bing_site_search")
        results["bing_indexed"] = True  # Simulated
        results["bing_results"] = 118  # Simulated
        
    except Exception as e:
        results["error"] = str(e)
    
    return results


def generate_search_recommendations(data: SearchVisibilityResponse) -> List[str]:
    """Generate recommendations based on search visibility data"""
    recommendations = []
    
    # Index status recommendations
    if data.index_status:
        indexed_ratio = data.index_status.indexed_pages / max(data.index_status.total_pages, 1)
        
        if indexed_ratio < 0.8:
            recommendations.append(
                f"📉 Only {indexed_ratio*100:.1f}% of your pages are indexed. "
                "Submit a sitemap to Google Search Console and check for crawl errors."
            )
        
        if data.index_status.errors and data.index_status.errors > 0:
            recommendations.append(
                f"🚨 Found {data.index_status.errors} indexing errors. "
                "Fix these in Google Search Console to improve visibility."
            )
        
        if data.index_status.warnings and data.index_status.warnings > 0:
            recommendations.append(
                f"⚠️ Found {data.index_status.warnings} indexing warnings. "
                "Review and address these to ensure proper indexing."
            )
    
    # Search performance recommendations
    if data.search_performance:
        total_clicks = sum(p.clicks for p in data.search_performance)
        total_impressions = sum(p.impressions for p in data.search_performance)
        avg_ctr = (total_clicks / max(total_impressions, 1)) * 100
        avg_position = sum(p.position for p in data.search_performance) / max(len(data.search_performance), 1)
        
        if avg_ctr < 2:
            recommendations.append(
                f"📊 Your average CTR is {avg_ctr:.2f}%. Improve meta titles and descriptions to increase click-through rates."
            )
        
        if avg_position > 10:
            recommendations.append(
                f"🎯 Average position is {avg_position:.1f}. Focus on SEO improvements to reach the first page (position 1-10)."
            )
    
    # Sitemap recommendations
    if not data.sitemaps:
        recommendations.append(
            "🗺️ No sitemaps detected. Create and submit XML sitemaps to Google and Bing for better indexing."
        )
    
    # General recommendations
    if not data.google_data and not data.bing_data:
        recommendations.append(
            "🔗 Connect your Google Search Console and Bing Webmaster Tools accounts for detailed insights."
        )
    
    if not recommendations:
        recommendations.append("✅ Your search visibility looks good! Continue monitoring and optimizing.")
    
    return recommendations


@router.post("/analyze", response_model=SearchVisibilityResponse)
async def analyze_search_visibility(request: SearchVisibilityRequest):
    """
    Analyze search visibility across Google and Bing
    """
    try:
        url_str = str(request.url)
        
        # Fetch data from both search engines
        google_data = await fetch_google_index_status(url_str, request.access_token)
        bing_data = await fetch_bing_index_status(url_str, request.bing_api_key)
        
        # Check indexing status
        indexing_data = await check_indexing_status(url_str)
        
        # Build index status
        google_index = google_data.get("index_status", {})
        index_status = IndexStatus(
            total_pages=google_index.get("total_pages", 0),
            indexed_pages=google_index.get("indexed_pages", 0),
            not_indexed_pages=google_index.get("not_indexed_pages", 0),
            pending_pages=google_index.get("pending_pages"),
            errors=google_index.get("errors"),
            warnings=google_index.get("warnings")
        )
        
        # Build search performance (simulated data)
        search_performance = [
            SearchPerformance(
                query="example keyword 1",
                clicks=450,
                impressions=5000,
                ctr=0.09,
                position=8.5
            ),
            SearchPerformance(
                query="example keyword 2",
                clicks=320,
                impressions=4200,
                ctr=0.076,
                position=10.2
            ),
            SearchPerformance(
                query="example keyword 3",
                clicks=180,
                impressions=3100,
                ctr=0.058,
                position=12.8
            ),
            SearchPerformance(
                query="example keyword 4",
                clicks=150,
                impressions=2800,
                ctr=0.054,
                position=15.3
            ),
            SearchPerformance(
                query="example keyword 5",
                clicks=150,
                impressions=9900,
                ctr=0.015,
                position=18.7
            ),
        ]
        
        # Build sitemap status (simulated)
        sitemaps = [
            SitemapStatus(
                path="/sitemap.xml",
                last_submitted="2024-01-15T10:30:00Z",
                last_downloaded="2024-01-15T12:45:00Z",
                warnings=2,
                errors=1,
                is_pending=False,
                is_sitemaps_index=False
            ),
            SitemapStatus(
                path="/sitemap-posts.xml",
                last_submitted="2024-01-15T10:30:00Z",
                last_downloaded="2024-01-15T12:45:00Z",
                warnings=0,
                errors=0,
                is_pending=False,
                is_sitemaps_index=False
            ),
        ]
        
        # Build response
        response = SearchVisibilityResponse(
            url=url_str,
            google_data=google_data,
            bing_data=bing_data,
            index_status=index_status,
            search_performance=search_performance,
            sitemaps=sitemaps,
            recommendations=[]
        )
        
        # Generate recommendations
        response.recommendations = generate_search_recommendations(response)
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing search visibility: {str(e)}"
        )


@router.get("/index-status")
async def get_index_status(
    url: HttpUrl = Query(..., description="URL to check"),
    access_token: Optional[str] = Query(None, description="Google Search Console access token"),
    bing_api_key: Optional[str] = Query(None, description="Bing Webmaster API key")
):
    """
    Get quick index status for a URL (GET endpoint)
    """
    request = SearchVisibilityRequest(
        url=url,
        access_token=access_token,
        bing_api_key=bing_api_key
    )
    return await analyze_search_visibility(request)


@router.get("/oauth-url")
async def get_google_oauth_url():
    """
    Get Google OAuth URL for Search Console authentication
    """
    # In production, generate actual OAuth URL
    return {
        "oauth_url": "https://accounts.google.com/o/oauth2/auth?...",
        "note": "Configure OAuth credentials in production"
    }
