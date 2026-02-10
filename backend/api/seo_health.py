"""
SEO Health Module
Analyzes technical and on-page SEO factors using Google PageSpeed Insights API
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
import httpx
import os

router = APIRouter()

# PageSpeed Insights API configuration
PAGESPEED_API_KEY = ""
PAGESPEED_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

# Demo data for when API key is not available
def get_demo_seo_data(url: str, strategy: str) -> Dict[str, Any]:
    """Return demo SEO data when API key is not configured"""
    import random
    return {
        "url": url,
        "strategy": strategy,
        "performance_score": random.randint(60, 95),
        "seo_score": random.randint(70, 95),
        "accessibility_score": random.randint(65, 90),
        "best_practices_score": random.randint(75, 98),
        "core_web_vitals": {
            "lcp": round(random.uniform(1.5, 3.5), 2),
            "lcp_category": random.choice(["good", "needs_improvement", "poor"]),
            "fid": random.randint(10, 150),
            "fid_category": random.choice(["good", "needs_improvement"]),
            "cls": round(random.uniform(0.01, 0.25), 3),
            "cls_category": random.choice(["good", "needs_improvement", "poor"]),
            "fcp": round(random.uniform(1.0, 2.5), 2),
            "fcp_category": "good",
            "ttfb": round(random.uniform(0.4, 1.2), 2),
            "ttfb_category": "good"
        },
        "opportunities": [
            {
                "title": "Eliminate render-blocking resources",
                "description": "Resources are blocking the first paint of your page.",
                "score": 0.42,
                "savings": "1.2s",
                "priority": "high"
            },
            {
                "title": "Properly size images",
                "description": "Serve images that are appropriately-sized.",
                "score": 0.65,
                "savings": "0.8s",
                "priority": "medium"
            }
        ],
        "diagnostics": [],
        "metadata": {
            "lighthouse_version": "11.0.0",
            "fetch_time": "2024-01-15T10:30:00Z",
            "demo_mode": True
        },
        "recommendations": [
            "⚠️ Performance needs improvement. Consider lazy loading images.",
            "📋 SEO Score could be improved. Check meta tags and headings.",
            "♿ Accessibility score needs attention. Add alt text to images."
        ]
    }


class SEOHealthRequest(BaseModel):
    url: HttpUrl
    strategy: Optional[str] = "mobile"  # mobile or desktop


class CoreWebVitals(BaseModel):
    lcp: Optional[float] = None  # Largest Contentful Paint
    lcp_category: Optional[str] = None
    fid: Optional[float] = None  # First Input Delay
    fid_category: Optional[str] = None
    cls: Optional[float] = None  # Cumulative Layout Shift
    cls_category: Optional[str] = None
    fcp: Optional[float] = None  # First Contentful Paint
    fcp_category: Optional[str] = None
    ttfb: Optional[float] = None  # Time to First Byte
    ttfb_category: Optional[str] = None


class Opportunity(BaseModel):
    title: str
    description: str
    score: Optional[float] = None
    savings: Optional[str] = None
    priority: str


class SEOHealthResponse(BaseModel):
    url: str
    strategy: str
    performance_score: Optional[int] = None
    seo_score: Optional[int] = None
    accessibility_score: Optional[int] = None
    best_practices_score: Optional[int] = None
    core_web_vitals: CoreWebVitals
    opportunities: List[Opportunity]
    diagnostics: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    recommendations: List[str]


def categorize_metric(value: float, metric_type: str) -> str:
    """Categorize Core Web Vitals metrics"""
    thresholds = {
        "lcp": {"good": 2.5, "needs_improvement": 4.0},
        "fid": {"good": 100, "needs_improvement": 300},
        "cls": {"good": 0.1, "needs_improvement": 0.25},
        "fcp": {"good": 1.8, "needs_improvement": 3.0},
        "ttfb": {"good": 0.8, "needs_improvement": 1.8},
    }
    
    if metric_type not in thresholds:
        return "unknown"
    
    t = thresholds[metric_type]
    if value <= t["good"]:
        return "good"
    elif value <= t["needs_improvement"]:
        return "needs_improvement"
    else:
        return "poor"


def extract_core_web_vitals(lighthouse_result: Dict) -> CoreWebVitals:
    """Extract Core Web Vitals from Lighthouse result"""
    audits = lighthouse_result.get("audits", {})
    
    # LCP - Largest Contentful Paint
    lcp_data = audits.get("largest-contentful-paint", {})
    lcp = lcp_data.get("numericValue", 0) / 1000 if lcp_data else None
    
    # FID - First Input Delay (estimated from Total Blocking Time)
    tbt_data = audits.get("total-blocking-time", {})
    fid = tbt_data.get("numericValue", 0) / 1000 * 0.1 if tbt_data else None  # Rough estimation
    
    # CLS - Cumulative Layout Shift
    cls_data = audits.get("cumulative-layout-shift", {})
    cls = cls_data.get("numericValue", 0) if cls_data else None
    
    # FCP - First Contentful Paint
    fcp_data = audits.get("first-contentful-paint", {})
    fcp = fcp_data.get("numericValue", 0) / 1000 if fcp_data else None
    
    # TTFB - Time to First Byte
    ttfb_data = audits.get("server-response-time", {})
    ttfb = ttfb_data.get("numericValue", 0) / 1000 if ttfb_data else None
    
    return CoreWebVitals(
        lcp=round(lcp, 3) if lcp else None,
        lcp_category=categorize_metric(lcp, "lcp") if lcp else None,
        fid=round(fid, 3) if fid else None,
        fid_category=categorize_metric(fid, "fid") if fid else None,
        cls=round(cls, 3) if cls else None,
        cls_category=categorize_metric(cls, "cls") if cls else None,
        fcp=round(fcp, 3) if fcp else None,
        fcp_category=categorize_metric(fcp, "fcp") if fcp else None,
        ttfb=round(ttfb, 3) if ttfb else None,
        ttfb_category=categorize_metric(ttfb, "ttfb") if ttfb else None,
    )


def extract_opportunities(lighthouse_result: Dict) -> List[Opportunity]:
    """Extract optimization opportunities from Lighthouse result"""
    opportunities = []
    audits = lighthouse_result.get("audits", {})
    
    opportunity_audits = [
        "render-blocking-resources",
        "unused-css-rules",
        "unused-javascript",
        "modern-image-formats",
        "efficiently-encode-images",
        "offscreen-images",
        "minify-css",
        "minify-javascript",
        "remove-unused-css",
        "remove-unused-javascript",
        "uses-optimized-images",
        "uses-text-compression",
        "uses-responsive-images",
        "prioritize-lcp-image",
        "font-display",
    ]
    
    for audit_id in opportunity_audits:
        audit = audits.get(audit_id)
        if audit and audit.get("score") is not None and audit.get("score") < 1:
            opportunity = Opportunity(
                title=audit.get("title", audit_id),
                description=audit.get("description", ""),
                score=audit.get("score"),
                savings=audit.get("displayValue", ""),
                priority="high" if audit.get("score", 1) < 0.5 else "medium"
            )
            opportunities.append(opportunity)
    
    # Sort by score (lower score = higher priority)
    opportunities.sort(key=lambda x: x.score or 1)
    return opportunities


def extract_diagnostics(lighthouse_result: Dict) -> List[Dict[str, Any]]:
    """Extract diagnostic information from Lighthouse result"""
    diagnostics = []
    audits = lighthouse_result.get("audits", {})
    
    diagnostic_audits = [
        "mainthread-work-breakdown",
        "bootup-time",
        "uses-long-cache-ttl",
        "total-byte-weight",
        "dom-size",
        "network-requests",
        "network-rtt",
        "network-server-latency",
        "main-thread-tasks",
        "diagnostics",
        "metrics",
        "screenshot-thumbnails",
        "final-screenshot",
        "script-treemap-data",
    ]
    
    for audit_id in diagnostic_audits:
        audit = audits.get(audit_id)
        if audit:
            diagnostics.append({
                "id": audit_id,
                "title": audit.get("title", ""),
                "description": audit.get("description", ""),
                "value": audit.get("displayValue", ""),
                "score": audit.get("score"),
                "details": audit.get("details", {})
            })
    
    return diagnostics


def generate_recommendations(response: SEOHealthResponse) -> List[str]:
    """Generate actionable recommendations based on audit results"""
    recommendations = []
    
    # Performance recommendations
    if response.performance_score is not None:
        if response.performance_score < 50:
            recommendations.append("🚨 Critical: Performance score is very low. Prioritize optimizing images, reducing JavaScript, and implementing code splitting.")
        elif response.performance_score < 90:
            recommendations.append("⚠️ Performance needs improvement. Consider lazy loading images and deferring non-critical JavaScript.")
    
    # SEO recommendations
    if response.seo_score is not None:
        if response.seo_score < 90:
            recommendations.append("📋 SEO Score could be improved. Check meta tags, headings structure, and ensure proper canonical URLs.")
    
    # Accessibility recommendations
    if response.accessibility_score is not None:
        if response.accessibility_score < 90:
            recommendations.append("♿ Accessibility score needs attention. Add alt text to images and ensure proper color contrast.")
    
    # Core Web Vitals recommendations
    cwv = response.core_web_vitals
    if cwv.lcp_category == "poor":
        recommendations.append("🐌 LCP is poor. Optimize your largest content element (usually hero image) and improve server response time.")
    if cwv.cls_category == "poor":
        recommendations.append("📐 CLS is poor. Reserve space for images and ads to prevent layout shifts.")
    if cwv.fid_category == "poor":
        recommendations.append("👆 FID is poor. Reduce JavaScript execution time and break up long tasks.")
    
    # Opportunities-based recommendations
    for opp in response.opportunities[:3]:  # Top 3 opportunities
        if opp.priority == "high":
            recommendations.append(f"🔧 High Priority: {opp.title} - {opp.description[:100]}...")
    
    if not recommendations:
        recommendations.append("✅ Great job! Your website is well-optimized. Continue monitoring for any changes.")
    
    return recommendations


@router.post("/analyze", response_model=SEOHealthResponse)
async def analyze_seo_health(request: SEOHealthRequest):
    """
    Analyze SEO health of a website using Google PageSpeed Insights API
    """
    # If no API key, return demo data
    if not PAGESPEED_API_KEY:
        demo_data = get_demo_seo_data(str(request.url), request.strategy)
        return SEOHealthResponse(**demo_data)
    
    try:
        params = {
            "url": str(request.url),
            "strategy": request.strategy,
            "category": ["PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES", "SEO"],
            "key": PAGESPEED_API_KEY
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(PAGESPEED_API_URL, params=params)
            response.raise_for_status()
            data = response.json()
        
        # Extract Lighthouse results
        lighthouse = data.get("lighthouseResult", {})
        categories = lighthouse.get("categories", {})
        
        # Get scores
        performance = categories.get("performance", {})
        seo = categories.get("seo", {})
        accessibility = categories.get("accessibility", {})
        best_practices = categories.get("best-practices", {})
        
        # Build response
        seo_response = SEOHealthResponse(
            url=str(request.url),
            strategy=request.strategy,
            performance_score=int(performance.get("score", 0) * 100) if performance.get("score") is not None else None,
            seo_score=int(seo.get("score", 0) * 100) if seo.get("score") is not None else None,
            accessibility_score=int(accessibility.get("score", 0) * 100) if accessibility.get("score") is not None else None,
            best_practices_score=int(best_practices.get("score", 0) * 100) if best_practices.get("score") is not None else None,
            core_web_vitals=extract_core_web_vitals(lighthouse),
            opportunities=extract_opportunities(lighthouse),
            diagnostics=extract_diagnostics(lighthouse),
            metadata={
                "lighthouse_version": lighthouse.get("lighthouseVersion", ""),
                "fetch_time": lighthouse.get("fetchTime", ""),
                "user_agent": lighthouse.get("userAgent", ""),
                "environment": lighthouse.get("environment", {}),
            },
            recommendations=[]
        )
        
        # Generate recommendations
        seo_response.recommendations = generate_recommendations(seo_response)
        
        return seo_response
        
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"PageSpeed Insights API error: {e.response.text}"
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Request to PageSpeed Insights API timed out. Please try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing SEO health: {str(e)}"
        )


@router.get("/scores")
async def get_seo_scores(
    url: HttpUrl = Query(..., description="URL to analyze"),
    strategy: str = Query("mobile", description="Analysis strategy: mobile or desktop")
):
    """
    Get quick SEO scores for a URL (GET endpoint)
    """
    request = SEOHealthRequest(url=url, strategy=strategy)
    return await analyze_seo_health(request)
