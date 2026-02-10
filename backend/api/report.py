"""
Report Generation Module
Generates PDF reports from audit results
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
import os
import tempfile

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

router = APIRouter()


class ReportRequest(BaseModel):
    url: HttpUrl
    seo_data: Optional[Dict[str, Any]] = None
    search_data: Optional[Dict[str, Any]] = None
    geo_data: Optional[Dict[str, Any]] = None
    traffic_data: Optional[Dict[str, Any]] = None
    include_sections: List[str] = ["seo", "search", "geo", "traffic"]
    company_name: Optional[str] = None


def create_pdf_report(request: ReportRequest, output_path: str):
    """Create a PDF report from audit data"""
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a365d'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor('#4a5568'),
        spaceAfter=20,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#2d3748'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubheading',
        parent=styles['Heading3'],
        fontSize=13,
        textColor=colors.HexColor('#4a5568'),
        spaceAfter=8,
        spaceBefore=8
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#2d3748'),
        spaceAfter=6,
        alignment=TA_JUSTIFY
    )
    
    # Title Page
    elements.append(Spacer(1, 2*inch))
    elements.append(Paragraph("SEO Audit Report", title_style))
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph(f"Website: {request.url}", subtitle_style))
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}", subtitle_style))
    
    if request.company_name:
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph(f"Prepared for: {request.company_name}", subtitle_style))
    
    elements.append(PageBreak())
    
    # Executive Summary
    elements.append(Paragraph("Executive Summary", heading_style))
    elements.append(Spacer(1, 0.2*inch))
    
    summary_text = f"""
    This comprehensive SEO audit report provides detailed analysis of <b>{request.url}</b>.
    The audit covers four key areas: SEO Health, Search Visibility, Generative Engine Optimization (GEO),
    and Traffic Estimation. Each section includes actionable recommendations to improve your online presence.
    """
    elements.append(Paragraph(summary_text, body_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Quick Stats Table
    if request.seo_data:
        elements.append(Paragraph("Key Metrics Overview", subheading_style))
        
        stats_data = [["Metric", "Score", "Status"]]
        
        seo = request.seo_data
        if "performance_score" in seo:
            score = seo.get("performance_score", 0)
            status = "Good" if score >= 90 else "Needs Improvement" if score >= 50 else "Poor"
            stats_data.append(["Performance", f"{score}/100", status])
        
        if "seo_score" in seo:
            score = seo.get("seo_score", 0)
            status = "Good" if score >= 90 else "Needs Improvement" if score >= 50 else "Poor"
            stats_data.append(["SEO", f"{score}/100", status])
        
        if "accessibility_score" in seo:
            score = seo.get("accessibility_score", 0)
            status = "Good" if score >= 90 else "Needs Improvement" if score >= 50 else "Poor"
            stats_data.append(["Accessibility", f"{score}/100", status])
        
        if request.traffic_data and "metrics" in request.traffic_data:
            visits = request.traffic_data["metrics"].get("monthly_visits", 0)
            stats_data.append(["Est. Monthly Visits", f"{visits:,}", "Estimated"])
        
        stats_table = Table(stats_data, colWidths=[2.5*inch, 1.5*inch, 2*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f7fafc')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f7fafc'), colors.white]),
        ]))
        elements.append(stats_table)
        elements.append(Spacer(1, 0.3*inch))
    
    elements.append(PageBreak())
    
    # SEO Health Section
    if "seo" in request.include_sections and request.seo_data:
        elements.append(Paragraph("1. SEO Health Analysis", heading_style))
        elements.append(Spacer(1, 0.2*inch))
        
        seo = request.seo_data
        
        # Scores
        elements.append(Paragraph("Performance Scores", subheading_style))
        scores_data = [["Category", "Score", "Rating"]]
        
        score_mapping = [
            ("Performance", seo.get("performance_score")),
            ("SEO", seo.get("seo_score")),
            ("Accessibility", seo.get("accessibility_score")),
            ("Best Practices", seo.get("best_practices_score")),
        ]
        
        for category, score in score_mapping:
            if score is not None:
                rating = "⭐ Excellent" if score >= 90 else "✓ Good" if score >= 70 else "⚠ Needs Work" if score >= 50 else "❌ Poor"
                scores_data.append([category, f"{score}/100", rating])
        
        scores_table = Table(scores_data, colWidths=[2*inch, 1.5*inch, 2*inch])
        scores_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f7fafc'), colors.white]),
        ]))
        elements.append(scores_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Core Web Vitals
        if "core_web_vitals" in seo:
            elements.append(Paragraph("Core Web Vitals", subheading_style))
            cwv = seo["core_web_vitals"]
            
            cwv_data = [["Metric", "Value", "Target", "Status"]]
            cwv_mapping = [
                ("LCP (Largest Contentful Paint)", cwv.get("lcp"), "< 2.5s", cwv.get("lcp_category")),
                ("FID (First Input Delay)", cwv.get("fid"), "< 100ms", cwv.get("fid_category")),
                ("CLS (Cumulative Layout Shift)", cwv.get("cls"), "< 0.1", cwv.get("cls_category")),
                ("FCP (First Contentful Paint)", cwv.get("fcp"), "< 1.8s", cwv.get("fcp_category")),
                ("TTFB (Time to First Byte)", cwv.get("ttfb"), "< 0.8s", cwv.get("ttfb_category")),
            ]
            
            for metric, value, target, status in cwv_mapping:
                if value is not None:
                    status_icon = "✓" if status == "good" else "⚠" if status == "needs_improvement" else "❌"
                    cwv_data.append([metric, str(value), target, status_icon])
            
            cwv_table = Table(cwv_data, colWidths=[2.2*inch, 1*inch, 1*inch, 1*inch])
            cwv_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f7fafc'), colors.white]),
            ]))
            elements.append(cwv_table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Recommendations
        if "recommendations" in seo and seo["recommendations"]:
            elements.append(Paragraph("SEO Recommendations", subheading_style))
            for rec in seo["recommendations"][:5]:  # Limit to top 5
                elements.append(Paragraph(f"• {rec}", body_style))
            elements.append(Spacer(1, 0.2*inch))
        
        elements.append(PageBreak())
    
    # Search Visibility Section
    if "search" in request.include_sections and request.search_data:
        elements.append(Paragraph("2. Search Visibility Analysis", heading_style))
        elements.append(Spacer(1, 0.2*inch))
        
        search = request.search_data
        
        if "index_status" in search and search["index_status"]:
            elements.append(Paragraph("Index Status", subheading_style))
            index = search["index_status"]
            
            index_data = [
                ["Metric", "Value"],
                ["Total Pages", str(index.get("total_pages", "N/A"))],
                ["Indexed Pages", str(index.get("indexed_pages", "N/A"))],
                ["Not Indexed", str(index.get("not_indexed_pages", "N/A"))],
            ]
            
            if index.get("pending_pages"):
                index_data.append(["Pending", str(index["pending_pages"])])
            if index.get("errors"):
                index_data.append(["Errors", str(index["errors"])])
            if index.get("warnings"):
                index_data.append(["Warnings", str(index["warnings"])])
            
            index_table = Table(index_data, colWidths=[3*inch, 3*inch])
            index_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f7fafc'), colors.white]),
            ]))
            elements.append(index_table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Search Performance
        if "search_performance" in search and search["search_performance"]:
            elements.append(Paragraph("Top Search Queries", subheading_style))
            
            perf_data = [["Query", "Clicks", "Impressions", "CTR", "Position"]]
            for perf in search["search_performance"][:5]:
                perf_data.append([
                    perf.get("query", ""),
                    str(perf.get("clicks", 0)),
                    str(perf.get("impressions", 0)),
                    f"{perf.get('ctr', 0)*100:.2f}%",
                    f"{perf.get('position', 0):.1f}"
                ])
            
            perf_table = Table(perf_data, colWidths=[2.5*inch, 0.8*inch, 1.2*inch, 0.8*inch, 0.8*inch])
            perf_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f7fafc'), colors.white]),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
            ]))
            elements.append(perf_table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Recommendations
        if "recommendations" in search and search["recommendations"]:
            elements.append(Paragraph("Search Visibility Recommendations", subheading_style))
            for rec in search["recommendations"][:5]:
                elements.append(Paragraph(f"• {rec}", body_style))
            elements.append(Spacer(1, 0.2*inch))
        
        elements.append(PageBreak())
    
    # GEO Section
    if "geo" in request.include_sections and request.geo_data:
        elements.append(Paragraph("3. Generative Engine Optimization (GEO)", heading_style))
        elements.append(Spacer(1, 0.2*inch))
        
        geo = request.geo_data
        
        if "summary" in geo:
            elements.append(Paragraph("AI Visibility Summary", subheading_style))
            summary = geo["summary"]
            
            summary_text = f"""
            <b>Total Checks:</b> {summary.get('total_checks', 0)}<br/>
            <b>Mentions Found:</b> {summary.get('mentions_found', 0)}<br/>
            <b>Mention Rate:</b> {summary.get('mention_rate', 0)*100:.1f}%<br/>
            <b>Average Rank:</b> {summary.get('average_rank', 'N/A')}<br/>
            """
            elements.append(Paragraph(summary_text, body_style))
            elements.append(Spacer(1, 0.2*inch))
            
            # Sentiment breakdown
            if "sentiment_breakdown" in summary:
                elements.append(Paragraph("Sentiment Analysis", subheading_style))
                sentiment = summary["sentiment_breakdown"]
                
                for sent_type, count in sentiment.items():
                    if count > 0:
                        icon = "😊" if sent_type == "positive" else "😞" if sent_type == "negative" else "😐"
                        elements.append(Paragraph(f"{icon} {sent_type.capitalize()}: {count}", body_style))
                elements.append(Spacer(1, 0.2*inch))
        
        # Recommendations
        if "recommendations" in geo and geo["recommendations"]:
            elements.append(Paragraph("GEO Recommendations", subheading_style))
            for rec in geo["recommendations"][:5]:
                elements.append(Paragraph(f"• {rec}", body_style))
            elements.append(Spacer(1, 0.2*inch))
        
        elements.append(PageBreak())
    
    # Traffic Section
    if "traffic" in request.include_sections and request.traffic_data:
        elements.append(Paragraph("4. Traffic Estimation", heading_style))
        elements.append(Spacer(1, 0.2*inch))
        
        traffic = request.traffic_data
        
        if "metrics" in traffic:
            elements.append(Paragraph("Traffic Metrics", subheading_style))
            metrics = traffic["metrics"]
            
            metrics_text = f"""
            <b>Estimated Monthly Visits:</b> {metrics.get('monthly_visits', 0):,} 
            (Range: {metrics.get('monthly_visits_min', 0):,} - {metrics.get('monthly_visits_max', 0):,})<br/>
            <b>Average Visit Duration:</b> {metrics.get('avg_visit_duration', 'N/A')}<br/>
            <b>Pages per Visit:</b> {metrics.get('pages_per_visit', 'N/A')}<br/>
            <b>Bounce Rate:</b> {metrics.get('bounce_rate', 0)*100:.1f}%<br/>
            <b>Confidence Level:</b> {traffic.get('confidence_level', 'N/A').capitalize()}<br/>
            <b>Growth Trend:</b> {traffic.get('growth_trend', 'N/A').capitalize()}<br/>
            """
            elements.append(Paragraph(metrics_text, body_style))
            elements.append(Spacer(1, 0.2*inch))
        
        # Traffic Sources
        if "traffic_sources" in traffic and traffic["traffic_sources"]:
            elements.append(Paragraph("Traffic Sources", subheading_style))
            
            sources_data = [["Source", "Percentage", "Est. Visits"]]
            for source in traffic["traffic_sources"]:
                sources_data.append([
                    source.get("source", ""),
                    f"{source.get('percentage', 0)}%",
                    f"{source.get('estimated_visits', 0):,}"
                ])
            
            sources_table = Table(sources_data, colWidths=[2.5*inch, 1.5*inch, 2*inch])
            sources_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f7fafc'), colors.white]),
            ]))
            elements.append(sources_table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Top Keywords
        if "top_keywords" in traffic and traffic["top_keywords"]:
            elements.append(Paragraph("Top Keywords", subheading_style))
            
            kw_data = [["Keyword", "Position", "Volume", "CPC"]]
            for kw in traffic["top_keywords"][:5]:
                kw_data.append([
                    kw.get("keyword", ""),
                    str(kw.get("position", "N/A")),
                    f"{kw.get('volume', 0):,}" if kw.get("volume") else "N/A",
                    f"${kw.get('cpc', 0):.2f}" if kw.get("cpc") else "N/A"
                ])
            
            kw_table = Table(kw_data, colWidths=[3*inch, 1*inch, 1*inch, 1*inch])
            kw_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f7fafc'), colors.white]),
            ]))
            elements.append(kw_table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Recommendations
        if "recommendations" in traffic and traffic["recommendations"]:
            elements.append(Paragraph("Traffic Recommendations", subheading_style))
            for rec in traffic["recommendations"][:5]:
                elements.append(Paragraph(f"• {rec}", body_style))
            elements.append(Spacer(1, 0.2*inch))
    
    # Footer
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph(
        "<i>This report was generated automatically by the SEO Audit Tool. "
        "Traffic estimates and AI visibility data are approximations and should be used for guidance only. "
        "For exact figures, please consult your analytics platforms.</i>",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.gray, alignment=TA_CENTER)
    ))
    
    # Build PDF
    doc.build(elements)


@router.post("/generate")
async def generate_report(request: ReportRequest):
    """
    Generate a PDF report from audit data
    """
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
            output_path = tmp_file.name
        
        # Generate PDF
        create_pdf_report(request, output_path)
        
        # Return file
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename=f"SEO_Audit_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating report: {str(e)}"
        )


@router.get("/template")
async def get_report_template():
    """
    Get a sample report template structure
    """
    return {
        "template": {
            "sections": [
                {
                    "id": "executive_summary",
                    "title": "Executive Summary",
                    "description": "Overview of all audit findings"
                },
                {
                    "id": "seo_health",
                    "title": "SEO Health Analysis",
                    "description": "Technical and on-page SEO factors"
                },
                {
                    "id": "search_visibility",
                    "title": "Search Visibility",
                    "description": "Google and Bing indexing status"
                },
                {
                    "id": "geo",
                    "title": "Generative Engine Optimization",
                    "description": "AI chatbot visibility analysis"
                },
                {
                    "id": "traffic",
                    "title": "Traffic Estimation",
                    "description": "Estimated website traffic overview"
                }
            ]
        }
    }
