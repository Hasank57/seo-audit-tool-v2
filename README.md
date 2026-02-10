# SEO Audit Tool

A comprehensive website audit tool that analyzes any given website for SEO health, search engine visibility (Google/Bing), and Generative Engine Optimization (GEO) for AI chatbots (ChatGPT/Gemini). The tool provides actionable recommendations for increasing online traffic.

![SEO Audit Tool](https://img.shields.io/badge/SEO-Audit%20Tool-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green)
![React](https://img.shields.io/badge/React-18.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)

## Features

### 1. SEO Health Module
- **Performance Score**: Page load speed and optimization
- **SEO Score**: On-page SEO factors
- **Accessibility Score**: WCAG compliance
- **Best Practices Score**: Web development best practices
- **Core Web Vitals**: LCP, FID, CLS, FCP, TTFB metrics
- **Opportunities**: Actionable optimization recommendations

### 2. Search Visibility Module
- **Index Status**: Google/Bing indexed pages
- **Search Performance**: Top queries, clicks, impressions, CTR
- **Sitemap Status**: XML sitemap validation
- **Error Detection**: Indexing errors and warnings

### 3. Generative Engine Optimization (GEO) Module
- **AI Chatbot Visibility**: Brand mentions in Gemini and ChatGPT
- **Sentiment Analysis**: Positive, neutral, negative sentiment tracking
- **Competitor Analysis**: Compare with competitor mentions
- **Ranking Position**: Track position in AI-generated lists

### 4. Traffic Estimation Module
- **Monthly Visits**: Estimated traffic volume
- **Traffic Sources**: Organic, direct, social, referral breakdown
- **Geographic Distribution**: Top countries by traffic
- **Top Keywords**: Keywords driving organic traffic

### 5. Reporting
- **PDF Export**: Generate comprehensive audit reports
- **Visual Dashboard**: Interactive charts and metrics
- **Actionable Insights**: Prioritized recommendations

## Tech Stack

### Backend
- **FastAPI** (Python) - High-performance API framework
- **Google PageSpeed Insights API** - SEO metrics
- **Google Search Console API** - Search visibility data
- **Bing Webmaster Tools API** - Bing search data
- **Gemini API** - AI chatbot analysis
- **ReportLab** - PDF generation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

## Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd seo_audit_tool
```

2. **Run the startup script**
```bash
chmod +x start.sh
./start.sh
```

This will:
- Set up Python virtual environment
- Install backend dependencies
- Install frontend dependencies
- Start both servers

### Manual Setup

#### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
npm install
npm run dev
```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Google APIs
PAGESPEED_API_KEY=your_pagespeed_api_key
GEMINI_API_KEY=your_gemini_api_key

# Bing Webmaster
BING_API_KEY=your_bing_api_key

# Apify (for ChatGPT scraping)
APIFY_API_TOKEN=your_apify_token

# Optional: For production
DEBUG=false
CORS_ORIGINS=http://localhost:3000
```

### Getting API Keys

1. **Google PageSpeed Insights API**
   - Visit: https://developers.google.com/speed/docs/insights/v5/get-started
   - Create a project and enable the PageSpeed Insights API
   - Generate an API key

2. **Gemini API**
   - Visit: https://ai.google.dev/
   - Create an API key for Gemini

3. **Google Search Console API**
   - Visit: https://console.cloud.google.com/
   - Enable the Search Console API
   - Set up OAuth 2.0 credentials

4. **Bing Webmaster Tools API**
   - Visit: https://www.bing.com/webmasters/help/webmaster-api-3af9a44c
   - Generate an API key

## Usage

1. **Open the application**
   - Navigate to `http://localhost:3000`

2. **Enter a URL**
   - Input the website URL you want to analyze
   - Add target keywords (comma-separated) for GEO analysis

3. **Select Modules**
   - Choose which audit modules to run
   - All modules are selected by default

4. **Run Audit**
   - Click "Run Audit" to start the analysis
   - Wait for results (may take 1-2 minutes)

5. **Review Results**
   - View the Overview tab for key metrics
   - Explore individual module tabs for detailed analysis
   - Check recommendations for actionable insights

6. **Export Report**
   - Click "Export PDF" to download a comprehensive report

## API Endpoints

### SEO Health
- `POST /api/seo/analyze` - Analyze SEO health
- `GET /api/seo/scores` - Get quick SEO scores

### Search Visibility
- `POST /api/search/analyze` - Analyze search visibility
- `GET /api/search/index-status` - Get index status
- `GET /api/search/oauth-url` - Get Google OAuth URL

### GEO Analysis
- `POST /api/geo/analyze` - Analyze AI chatbot visibility
- `GET /api/geo/check` - Quick GEO check

### Traffic Estimation
- `POST /api/traffic/estimate` - Estimate traffic
- `GET /api/traffic/estimate` - Quick traffic estimate
- `GET /api/traffic/compare` - Compare multiple URLs

### Reporting
- `POST /api/report/generate` - Generate PDF report
- `GET /api/report/template` - Get report template

## Project Structure

```
seo_audit_tool/
├── backend/
│   ├── api/
│   │   ├── seo_health.py       # SEO Health module
│   │   ├── search_visibility.py # Search Visibility module
│   │   ├── geo_module.py        # GEO module
│   │   ├── traffic_estimation.py # Traffic module
│   │   └── report.py            # PDF report generation
│   ├── main.py                  # FastAPI entry point
│   └── requirements.txt         # Python dependencies
├── src/
│   ├── sections/
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── SEOHealthPanel.tsx   # SEO results panel
│   │   ├── SearchVisibilityPanel.tsx # Search results panel
│   │   ├── GEOPanel.tsx         # GEO results panel
│   │   └── TrafficPanel.tsx     # Traffic results panel
│   ├── services/
│   │   └── api.ts               # API service
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # React entry point
├── start.sh                     # Startup script
└── README.md                    # This file
```

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### SEO Health Analysis
![SEO Health](screenshots/seo-health.png)

### Search Visibility
![Search Visibility](screenshots/search-visibility.png)

### GEO Analysis
![GEO Analysis](screenshots/geo-analysis.png)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Google PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/get-started)
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Gemini API](https://ai.google.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Support

For support, email support@seoaudittool.com or open an issue on GitHub.

## Roadmap

- [ ] Add more AI platform support (Claude, Perplexity)
- [ ] Implement historical data tracking
- [ ] Add competitor comparison feature
- [ ] Create scheduled audit functionality
- [ ] Build API rate limiting and caching
- [ ] Add user authentication and saved reports
- [ ] Implement real-time notifications

---

Built with ❤️ using FastAPI and React
