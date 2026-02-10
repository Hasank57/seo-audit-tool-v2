"""
SEO Audit Tool - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from pydantic_settings import BaseSettings
import os

from api.seo_health import router as seo_health_router
from api.search_visibility import router as search_visibility_router
from api.geo_module import router as geo_router
from api.traffic_estimation import router as traffic_router
from api.report import router as report_router


# Settings class for environment variables
class Settings(BaseSettings):
    pagespeed_api_key: str = ""
    gemini_api_key: str = ""
    bing_api_key: str = ""
    apify_api_token: str = ""
    cors_origins: str = "*"
    debug: bool = False
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Pass settings to API modules
import api.seo_health as seo_module
seo_module.PAGESPEED_API_KEY = settings.pagespeed_api_key

import api.geo_module as geo_module
geo_module.GEMINI_API_KEY = settings.gemini_api_key
geo_module.APIFY_API_TOKEN = settings.apify_api_token

import api.search_visibility as search_module
search_module.BING_API_KEY = settings.bing_api_key


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    print("=" * 50)
    print("SEO Audit Tool Starting...")
    print(f"PageSpeed API Key: {'✅ Configured' if settings.pagespeed_api_key else '⚠️ Not configured - using demo mode'}")
    print(f"Gemini API Key: {'✅ Configured' if settings.gemini_api_key else '⚠️ Not configured - using demo mode'}")
    print(f"Bing API Key: {'✅ Configured' if settings.bing_api_key else '⚠️ Not configured - using demo mode'}")
    print("=" * 50)
    yield
    print("Shutting down SEO Audit Tool...")


app = FastAPI(
    title="SEO Audit Tool API",
    description="Comprehensive website audit tool for SEO health, search visibility, GEO, and traffic estimation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
origins = settings.cors_origins.split(",") if settings.cors_origins else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(seo_health_router, prefix="/api/seo", tags=["SEO Health"])
app.include_router(search_visibility_router, prefix="/api/search", tags=["Search Visibility"])
app.include_router(geo_router, prefix="/api/geo", tags=["Generative Engine Optimization"])
app.include_router(traffic_router, prefix="/api/traffic", tags=["Traffic Estimation"])
app.include_router(report_router, prefix="/api/report", tags=["Reporting"])


@app.get("/api")
async def api_root():
    return {
        "message": "SEO Audit Tool API",
        "version": "1.0.0",
        "apis_configured": {
            "pagespeed": bool(settings.pagespeed_api_key),
            "gemini": bool(settings.gemini_api_key),
            "bing": bool(settings.bing_api_key),
        },
        "endpoints": {
            "seo_health": "/api/seo/analyze",
            "search_visibility": "/api/search/analyze",
            "geo": "/api/geo/analyze",
            "traffic": "/api/traffic/estimate",
            "report": "/api/report/generate"
        }
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "apis": {
            "pagespeed": bool(settings.pagespeed_api_key),
            "gemini": bool(settings.gemini_api_key),
            "bing": bool(settings.bing_api_key),
        }
    }


# Serve static files from the dist directory (built frontend)
dist_path = os.path.join(os.path.dirname(__file__), "..", "dist")
if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")
    
    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(dist_path, "index.html"))
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if not full_path.startswith("api/"):
            file_path = os.path.join(dist_path, full_path)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                return FileResponse(file_path)
            return FileResponse(os.path.join(dist_path, "index.html"))
        return {"detail": "Not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
