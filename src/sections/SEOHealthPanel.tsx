import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layout,
  Gauge,
  TrendingUp,
  Minus
} from 'lucide-react';
import type { SEOHealthData } from '@/types';

interface SEOHealthPanelProps {
  data: SEOHealthData;
}

export function SEOHealthPanel({ data }: SEOHealthPanelProps) {
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="secondary">N/A</Badge>;
    if (score >= 90) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Good</Badge>;
    if (score >= 50) return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Needs Improvement</Badge>;
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Poor</Badge>;
  };

  const getCWVCategoryIcon = (category: string | null) => {
    if (category === 'good') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (category === 'needs_improvement') return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    if (category === 'poor') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  const getCWVBadge = (category: string | null) => {
    if (category === 'good') return <Badge className="bg-green-100 text-green-800">Good</Badge>;
    if (category === 'needs_improvement') return <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>;
    if (category === 'poor') return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
    return <Badge variant="secondary">N/A</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">SEO Health Analysis</h2>
          <p className="text-slate-500">Analyzed with {data.strategy} strategy</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Lighthouse v{data.metadata?.lighthouse_version || 'N/A'}
        </Badge>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Performance</span>
              <Gauge className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getScoreColor(data.performance_score)}`}>
                {data.performance_score ?? 'N/A'}
              </span>
              <span className="text-slate-400">/100</span>
            </div>
            <div className="mt-2">
              {getScoreBadge(data.performance_score)}
            </div>
            <Progress 
              value={data.performance_score || 0} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">SEO</span>
              <SearchIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getScoreColor(data.seo_score)}`}>
                {data.seo_score ?? 'N/A'}
              </span>
              <span className="text-slate-400">/100</span>
            </div>
            <div className="mt-2">
              {getScoreBadge(data.seo_score)}
            </div>
            <Progress 
              value={data.seo_score || 0} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Accessibility</span>
              <Layout className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getScoreColor(data.accessibility_score)}`}>
                {data.accessibility_score ?? 'N/A'}
              </span>
              <span className="text-slate-400">/100</span>
            </div>
            <div className="mt-2">
              {getScoreBadge(data.accessibility_score)}
            </div>
            <Progress 
              value={data.accessibility_score || 0} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Best Practices</span>
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getScoreColor(data.best_practices_score)}`}>
                {data.best_practices_score ?? 'N/A'}
              </span>
              <span className="text-slate-400">/100</span>
            </div>
            <div className="mt-2">
              {getScoreBadge(data.best_practices_score)}
            </div>
            <Progress 
              value={data.best_practices_score || 0} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Core Web Vitals
          </CardTitle>
          <CardDescription>
            Essential metrics for user experience and search ranking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LCP */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-700">LCP</span>
                {getCWVCategoryIcon(data.core_web_vitals.lcp_category)}
              </div>
              <p className="text-sm text-slate-500 mb-1">Largest Contentful Paint</p>
              <p className="text-2xl font-bold text-slate-900">
                {data.core_web_vitals.lcp ? `${data.core_web_vitals.lcp}s` : 'N/A'}
              </p>
              <div className="mt-2 flex items-center justify-between">
                {getCWVBadge(data.core_web_vitals.lcp_category)}
                <span className="text-xs text-slate-400">Target: &lt; 2.5s</span>
              </div>
            </div>

            {/* FID */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-700">FID</span>
                {getCWVCategoryIcon(data.core_web_vitals.fid_category)}
              </div>
              <p className="text-sm text-slate-500 mb-1">First Input Delay</p>
              <p className="text-2xl font-bold text-slate-900">
                {data.core_web_vitals.fid ? `${data.core_web_vitals.fid}ms` : 'N/A'}
              </p>
              <div className="mt-2 flex items-center justify-between">
                {getCWVBadge(data.core_web_vitals.fid_category)}
                <span className="text-xs text-slate-400">Target: &lt; 100ms</span>
              </div>
            </div>

            {/* CLS */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-700">CLS</span>
                {getCWVCategoryIcon(data.core_web_vitals.cls_category)}
              </div>
              <p className="text-sm text-slate-500 mb-1">Cumulative Layout Shift</p>
              <p className="text-2xl font-bold text-slate-900">
                {data.core_web_vitals.cls ?? 'N/A'}
              </p>
              <div className="mt-2 flex items-center justify-between">
                {getCWVBadge(data.core_web_vitals.cls_category)}
                <span className="text-xs text-slate-400">Target: &lt; 0.1</span>
              </div>
            </div>

            {/* FCP */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-700">FCP</span>
                {getCWVCategoryIcon(data.core_web_vitals.fcp_category)}
              </div>
              <p className="text-sm text-slate-500 mb-1">First Contentful Paint</p>
              <p className="text-2xl font-bold text-slate-900">
                {data.core_web_vitals.fcp ? `${data.core_web_vitals.fcp}s` : 'N/A'}
              </p>
              <div className="mt-2 flex items-center justify-between">
                {getCWVBadge(data.core_web_vitals.fcp_category)}
                <span className="text-xs text-slate-400">Target: &lt; 1.8s</span>
              </div>
            </div>

            {/* TTFB */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-700">TTFB</span>
                {getCWVCategoryIcon(data.core_web_vitals.ttfb_category)}
              </div>
              <p className="text-sm text-slate-500 mb-1">Time to First Byte</p>
              <p className="text-2xl font-bold text-slate-900">
                {data.core_web_vitals.ttfb ? `${data.core_web_vitals.ttfb}s` : 'N/A'}
              </p>
              <div className="mt-2 flex items-center justify-between">
                {getCWVBadge(data.core_web_vitals.ttfb_category)}
                <span className="text-xs text-slate-400">Target: &lt; 0.8s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities */}
      {data.opportunities && data.opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Optimization Opportunities
            </CardTitle>
            <CardDescription>
              Recommendations to improve your website performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {data.opportunities.map((opp, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900">{opp.title}</h4>
                          <Badge 
                            variant={opp.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {opp.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{opp.description}</p>
                        {opp.savings && (
                          <p className="text-sm text-green-600 mt-2 font-medium">
                            Potential savings: {opp.savings}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          opp.score && opp.score < 0.5 ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          <span className={`text-sm font-bold ${
                            opp.score && opp.score < 0.5 ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {opp.score ? Math.round(opp.score * 100) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Actionable Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recommendations?.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper icon component
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
