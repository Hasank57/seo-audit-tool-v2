"""
Generative Engine Optimization (GEO) Module
Assesses brand visibility and sentiment within AI chatbot responses
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
import httpx
import os
import re

router = APIRouter()

# API configurations
GEMINI_API_KEY = ""
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
APIFY_API_TOKEN = ""

# Demo data for when API key is not available
def get_demo_geo_data(domain: str, keywords: List[str]) -> Dict[str, Any]:
    """Return demo GEO data when API key is not configured"""
    import random
    
    demo_keywords = keywords if keywords else ["SEO tools", "website optimization"]
    mentions = [
        {
            "platform": "gemini",
            "query": f"What is {domain}?",
            "mentioned": True,
            "context": f"{domain} is a well-known platform offering comprehensive solutions for businesses.",
            "sentiment": "positive",
            "rank": random.randint(1, 5),
            "competitors_mentioned": ["competitorA.com", "competitorB.io"]
        },
        {
            "platform": "chatgpt",
            "query": f"What is {domain}?",
            "mentioned": random.choice([True, False]),
            "context": f"{domain} provides excellent services in the industry." if random.random() > 0.3 else None,
            "sentiment": random.choice(["positive", "neutral"]),
            "rank": random.randint(1, 5) if random.random() > 0.3 else None,
            "competitors_mentioned": ["competitorA.com"]
        },
        {
            "platform": "gemini",
            "query": f"What are the best tools for {demo_keywords[0]}?",
            "mentioned": random.choice([True, True, False]),
            "context": f"Here are the best tools: 1. CompetitorA, 2. {domain}, 3. CompetitorB" if random.random() > 0.3 else None,
            "sentiment": "positive" if random.random() > 0.3 else "neutral",
            "rank": random.randint(1, 5),
            "competitors_mentioned": ["competitorA.com", "competitorB.io"]
        },
        {
            "platform": "chatgpt",
            "query": f"What are the best tools for {demo_keywords[0]}?",
            "mentioned": random.choice([True, False]),
            "context": None,
            "sentiment": None,
            "competitors_mentioned": ["competitorA.com", "competitorB.io", "competitorC.net"]
        }
    ]
    
    mentions_found = sum(1 for m in mentions if m["mentioned"])
    
    return {
        "domain": domain,
        "keywords": demo_keywords,
        "mentions": mentions,
        "summary": {
            "total_checks": len(mentions),
            "mentions_found": mentions_found,
            "mention_rate": mentions_found / len(mentions),
            "sentiment_breakdown": {
                "positive": sum(1 for m in mentions if m.get("sentiment") == "positive"),
                "neutral": sum(1 for m in mentions if m.get("sentiment") == "neutral"),
                "negative": sum(1 for m in mentions if m.get("sentiment") == "negative")
            },
            "average_rank": round(random.uniform(1.5, 4.5), 1) if mentions_found > 0 else None
        },
        "recommendations": [
            f"{'✅' if mentions_found / len(mentions) > 0.5 else '⚠️'} AI visibility: {mentions_found}/{len(mentions)} mentions found",
            "📝 Create authoritative content that AI models can reference",
            "🔗 Build high-quality backlinks to increase training data presence",
            "⭐ Encourage online reviews to influence sentiment",
            "🏆 Aim to be featured in 'best of' lists and comparisons"
        ],
        "demo_mode": True
    }


class GEORequest(BaseModel):
    domain: str
    keywords: List[str]
    check_competitors: Optional[bool] = True


class BrandMention(BaseModel):
    platform: str  # gemini, chatgpt
    query: str
    mentioned: bool
    context: Optional[str] = None
    sentiment: Optional[str] = None  # positive, negative, neutral
    rank: Optional[int] = None  # Position in list (if applicable)
    competitors_mentioned: Optional[List[str]] = None


class GEOSummary(BaseModel):
    total_checks: int
    mentions_found: int
    mention_rate: float
    sentiment_breakdown: Dict[str, int]
    average_rank: Optional[float] = None


class GEOResponse(BaseModel):
    domain: str
    keywords: List[str]
    mentions: List[BrandMention]
    summary: GEOSummary
    recommendations: List[str]
    raw_responses: Optional[Dict[str, Any]] = None


def clean_domain(domain: str) -> str:
    """Clean and normalize domain name"""
    domain = domain.lower().strip()
    domain = re.sub(r'^https?://', '', domain)
    domain = re.sub(r'^www\.', '', domain)
    domain = domain.rstrip('/')
    return domain


def extract_sentiment(text: str, brand: str) -> str:
    """Extract sentiment from text about a brand"""
    text_lower = text.lower()
    brand_lower = brand.lower()
    
    # Simple sentiment analysis based on keywords
    positive_words = ['best', 'excellent', 'great', 'amazing', 'top', 'leading', 'recommended', 'popular', 'trusted']
    negative_words = ['worst', 'bad', 'poor', 'terrible', 'avoid', 'issues', 'problems', 'scam', 'unreliable']
    
    # Find context around brand mention
    brand_pos = text_lower.find(brand_lower)
    if brand_pos == -1:
        return "neutral"
    
    # Get context window (100 chars before and after)
    start = max(0, brand_pos - 100)
    end = min(len(text), brand_pos + len(brand) + 100)
    context = text_lower[start:end]
    
    pos_count = sum(1 for word in positive_words if word in context)
    neg_count = sum(1 for word in negative_words if word in context)
    
    if pos_count > neg_count:
        return "positive"
    elif neg_count > pos_count:
        return "negative"
    return "neutral"


def extract_rank(text: str, brand: str) -> Optional[int]:
    """Extract ranking position from list-style responses"""
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if brand.lower() in line.lower():
            # Check if line starts with a number
            match = re.match(r'^\s*(\d+)\s*[.\-)]\s*', line)
            if match:
                return int(match.group(1))
            # If no number, return position in list
            return i + 1
    return None


def extract_competitors(text: str, brand: str) -> List[str]:
    """Extract competitor mentions from text"""
    # Common competitor indicators
    competitor_patterns = [
        r'(?:competitors?|alternatives?|similar|like|vs|versus)\s+(?:include|are|:)\s+([^\.]+)',
        r'(?:other|top)\s+(?:popular\s+)?(?:options?|tools?|platforms?)\s+(?:include|:)\s+([^\.]+)',
    ]
    
    competitors = []
    text_lower = text.lower()
    
    for pattern in competitor_patterns:
        matches = re.findall(pattern, text_lower)
        for match in matches:
            # Split by common separators
            items = re.split(r',|\band\b|\bor\b', match)
            for item in items:
                item = item.strip()
                if item and brand.lower() not in item and len(item) > 2:
                    competitors.append(item)
    
    return list(set(competitors))[:5]  # Return unique competitors, max 5


async def query_gemini(prompt: str) -> Dict[str, Any]:
    """Query Gemini API with a prompt"""
    try:
        if not GEMINI_API_KEY:
            # Return simulated response for demo
            return {
                "simulated": True,
                "response": f"Simulated Gemini response for: {prompt[:50]}...",
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": generate_simulated_response(prompt)
                        }]
                    }
                }]
            }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()
            return response.json()
            
    except Exception as e:
        return {
            "error": str(e),
            "simulated": True,
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": generate_simulated_response(prompt)
                    }]
                }
            }]
        }


def generate_simulated_response(prompt: str) -> str:
    """Generate simulated AI response for demo purposes"""
    domain_match = re.search(r'(?:about|is|are)\s+(\w+\.\w+)', prompt.lower())
    keyword_match = re.search(r'(?:for|tools?)\s+([\w\s]+)\?', prompt.lower())
    
    domain = domain_match.group(1) if domain_match else "example.com"
    keyword = keyword_match.group(1).strip() if keyword_match else "SEO tools"
    
    if "what is" in prompt.lower() or "who are" in prompt.lower():
        return f"""
{domain} is a well-known platform in the {keyword} space. They offer comprehensive solutions for businesses.

Some of their main competitors include:
1. CompetitorA.com - Leading provider with excellent features
2. CompetitorB.io - Popular choice for small businesses
3. {domain} - Great for enterprise solutions
4. CompetitorC.net - Budget-friendly option
5. CompetitorD.co - Newer player with innovative features

{domain} is particularly known for their user-friendly interface and reliable service.
"""
    elif "best" in prompt.lower() or "tools" in prompt.lower():
        return f"""
Here are the best tools for {keyword}:

1. CompetitorA.com - Industry leader with 95% customer satisfaction
2. {domain} - Highly recommended for its comprehensive features
3. CompetitorB.io - Great for beginners and small teams
4. CompetitorC.net - Enterprise-focused with advanced analytics
5. CompetitorD.co - Affordable option with good basic features

{domain} stands out for its excellent customer support and regular updates.
"""
    else:
        return f"""
Based on my knowledge, {domain} is a significant player in the {keyword} market.

Key points about {domain}:
- Established reputation in the industry
- Used by many professionals
- Offers competitive features
- Generally positive user reviews

Competitors in this space include CompetitorA, CompetitorB, and CompetitorC.
"""


async def query_chatgpt(prompt: str) -> Dict[str, Any]:
    """Query ChatGPT via Apify scraper"""
    try:
        if not APIFY_API_TOKEN:
            # Return simulated response for demo
            return {
                "simulated": True,
                "response": generate_simulated_response(prompt)
            }
        
        # Apify ChatGPT scraper would go here
        # For now, return simulated data
        return {
            "simulated": True,
            "response": generate_simulated_response(prompt)
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "simulated": True,
            "response": generate_simulated_response(prompt)
        }


def generate_geo_recommendations(response: GEOResponse) -> List[str]:
    """Generate GEO recommendations based on analysis"""
    recommendations = []
    summary = response.summary
    
    # Mention rate recommendations
    if summary.mention_rate < 0.3:
        recommendations.append(
            f"🚨 Low AI visibility: Your brand is only mentioned in {summary.mention_rate*100:.0f}% of queries. "
            "Increase content marketing and PR efforts to improve brand recognition."
        )
    elif summary.mention_rate < 0.7:
        recommendations.append(
            f"⚠️ Moderate AI visibility: {summary.mention_rate*100:.0f}% mention rate. "
            "Continue building authority through quality content and backlinks."
        )
    else:
        recommendations.append(
            f"✅ Strong AI visibility: {summary.mention_rate*100:.0f}% mention rate. "
            "Maintain your content strategy to preserve this advantage."
        )
    
    # Sentiment recommendations
    sentiment = summary.sentiment_breakdown
    total_sentiment = sum(sentiment.values())
    
    if total_sentiment > 0:
        positive_ratio = sentiment.get("positive", 0) / total_sentiment
        negative_ratio = sentiment.get("negative", 0) / total_sentiment
        
        if positive_ratio < 0.5:
            recommendations.append(
                "📉 Low positive sentiment detected. Focus on improving customer experience and gathering positive reviews."
            )
        
        if negative_ratio > 0.2:
            recommendations.append(
                "⚠️ Negative sentiment detected. Address customer concerns and improve your online reputation."
            )
    
    # Ranking recommendations
    if summary.average_rank and summary.average_rank > 3:
        recommendations.append(
            f"📊 Average ranking position is {summary.average_rank:.1f}. "
            "Work on becoming a top-3 mentioned brand in your category."
        )
    
    # Keyword-specific recommendations
    if response.keywords:
        recommendations.append(
            f"🎯 Target keywords analyzed: {', '.join(response.keywords)}. "
            "Create comprehensive content around these topics to increase AI mentions."
        )
    
    # General GEO recommendations
    recommendations.extend([
        "📝 Create authoritative, well-structured content that AI models can easily reference.",
        "🔗 Build high-quality backlinks from reputable sources to increase training data presence.",
        "📱 Maintain active presence on platforms likely to be in training data (Wikipedia, Reddit, Quora).",
        "⭐ Encourage and manage online reviews to influence sentiment in AI responses.",
        "🏆 Aim to be featured in 'best of' lists and comparison articles."
    ])
    
    return recommendations


@router.post("/analyze", response_model=GEOResponse)
async def analyze_geo(request: GEORequest):
    """
    Analyze Generative Engine Optimization for a domain
    """
    try:
        domain = clean_domain(request.domain)
        mentions = []
        all_responses = {"gemini": {}, "chatgpt": {}}
        
        # Define queries to test
        queries = [
            f"What is {domain}?",
            f"Who are the main competitors of {domain}?",
        ]
        
        # Add keyword-based queries
        for keyword in request.keywords[:3]:  # Limit to 3 keywords
            queries.append(f"What are the best tools for {keyword}?")
            queries.append(f"Compare top {keyword} platforms")
        
        # Query both AI platforms
        for query in queries:
            # Query Gemini
            gemini_response = await query_gemini(query)
            gemini_text = gemini_response.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            all_responses["gemini"][query] = gemini_text
            
            gemini_mention = BrandMention(
                platform="gemini",
                query=query,
                mentioned=domain.lower() in gemini_text.lower(),
                context=gemini_text[:500] if domain.lower() in gemini_text.lower() else None,
                sentiment=extract_sentiment(gemini_text, domain) if domain.lower() in gemini_text.lower() else None,
                rank=extract_rank(gemini_text, domain) if domain.lower() in gemini_text.lower() else None,
                competitors_mentioned=extract_competitors(gemini_text, domain) if request.check_competitors else None
            )
            mentions.append(gemini_mention)
            
            # Query ChatGPT (simulated)
            chatgpt_response = await query_chatgpt(query)
            chatgpt_text = chatgpt_response.get("response", "")
            all_responses["chatgpt"][query] = chatgpt_text
            
            chatgpt_mention = BrandMention(
                platform="chatgpt",
                query=query,
                mentioned=domain.lower() in chatgpt_text.lower(),
                context=chatgpt_text[:500] if domain.lower() in chatgpt_text.lower() else None,
                sentiment=extract_sentiment(chatgpt_text, domain) if domain.lower() in chatgpt_text.lower() else None,
                rank=extract_rank(chatgpt_text, domain) if domain.lower() in chatgpt_text.lower() else None,
                competitors_mentioned=extract_competitors(chatgpt_text, domain) if request.check_competitors else None
            )
            mentions.append(chatgpt_mention)
        
        # Calculate summary
        total_checks = len(mentions)
        mentions_found = sum(1 for m in mentions if m.mentioned)
        mention_rate = mentions_found / total_checks if total_checks > 0 else 0
        
        sentiment_breakdown = {"positive": 0, "negative": 0, "neutral": 0}
        ranks = []
        
        for m in mentions:
            if m.sentiment:
                sentiment_breakdown[m.sentiment] = sentiment_breakdown.get(m.sentiment, 0) + 1
            if m.rank:
                ranks.append(m.rank)
        
        summary = GEOSummary(
            total_checks=total_checks,
            mentions_found=mentions_found,
            mention_rate=round(mention_rate, 2),
            sentiment_breakdown=sentiment_breakdown,
            average_rank=round(sum(ranks) / len(ranks), 1) if ranks else None
        )
        
        # Build response
        response = GEOResponse(
            domain=domain,
            keywords=request.keywords,
            mentions=mentions,
            summary=summary,
            recommendations=[],
            raw_responses=all_responses if os.getenv("DEBUG") else None
        )
        
        # Generate recommendations
        response.recommendations = generate_geo_recommendations(response)
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing GEO: {str(e)}"
        )


@router.get("/check")
async def quick_geo_check(
    domain: str = Query(..., description="Domain to check"),
    keywords: str = Query(..., description="Comma-separated keywords")
):
    """
    Quick GEO check for a domain (GET endpoint)
    """
    keyword_list = [k.strip() for k in keywords.split(",")]
    request = GEORequest(domain=domain, keywords=keyword_list)
    return await analyze_geo(request)
