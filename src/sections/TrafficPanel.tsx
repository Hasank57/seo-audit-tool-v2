import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Globe, 
  Search, 
  Share2,
  Mail,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MousePointer,
  Target
} from 'lucide-react';
import type { TrafficData } from '@/types';

interface TrafficPanelProps {
  data: TrafficData;
}

export function TrafficPanel({ data }: TrafficPanelProps) {
  const getTrendIcon = (trend: string | undefined) => {
    if (trend === 'increasing') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'decreasing' || trend === 'slight_decrease') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-yellow-600" />;
  };

  const getConfidenceBadge = (level: string) => {
    if (level === 'high') return <Badge className="bg-green-100 text-green-800">High Confidence</Badge>;
    if (level === 'medium') return <Badge className="bg-yellow-100 text-yellow-800">Medium Confidence</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low Confidence</Badge>;
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'organic search':
        return <Search className="w-4 h-4" />;
      case 'direct':
        return <Target className="w-4 h-4" />;
      case 'social media':
        return <Share2 className="w-4 h-4" />;
      case 'referral':
        return <Globe className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'paid search':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getBounceRateColor = (rate: number | undefined) => {
    if (rate === undefined) return 'text-slate-400';
    if (rate < 0.4) return 'text-green-600';
    if (rate < 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Traffic Estimation</h2>
          <p className="text-slate-500">Estimated traffic overview for {data.url}</p>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon(data.growth_trend)}
          {getConfidenceBadge(data.confidence_level)}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800">{data.disclaimer}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Monthly Visits</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data.metrics.monthly_visits.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Range: {data.metrics.monthly_visits_min.toLocaleString()} - {data.metrics.monthly_visits_max.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Avg. Visit Duration</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data.metrics.avg_visit_duration || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Pages per Visit</span>
              <MousePointer className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data.metrics.pages_per_visit?.toFixed(2) || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Bounce Rate</span>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
            <p className={`text-2xl font-bold ${getBounceRateColor(data.metrics.bounce_rate)}`}>
              {data.metrics.bounce_rate ? `${(data.metrics.bounce_rate * 100).toFixed(1)}%` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            Traffic Sources
          </CardTitle>
          <CardDescription>
            Estimated breakdown of traffic by source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.traffic_sources.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{getSourceIcon(source.source)}</span>
                    <span className="font-medium text-slate-900">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">
                      {source.estimated_visits.toLocaleString()} visits
                    </span>
                    <span className="font-semibold text-slate-900 w-12 text-right">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
                <Progress value={source.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-600" />
            Top Countries
          </CardTitle>
          <CardDescription>
            Geographic distribution of traffic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.top_countries.slice(0, 6).map((country, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCountryFlag(country.country_code)}</span>
                  <span className="font-medium text-slate-900">{country.country}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">
                    {country.estimated_visits.toLocaleString()}
                  </span>
                  <Badge variant="secondary">{country.percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-600" />
            Top Keywords
          </CardTitle>
          <CardDescription>
            Keywords driving organic traffic to the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {data.top_keywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{keyword.keyword}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      {keyword.volume && <span>Volume: {keyword.volume.toLocaleString()}</span>}
                      {keyword.cpc && <span>CPC: ${keyword.cpc.toFixed(2)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Position:</span>
                    <Badge 
                      variant={keyword.position && keyword.position <= 10 ? 'default' : 'secondary'}
                      className={keyword.position && keyword.position <= 10 ? 'bg-green-100 text-green-800' : ''}
                    >
                      {keyword.position || 'N/A'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Traffic Recommendations
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

// Helper function to get country flag emoji
function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CA': '🇨🇦',
    'DE': '🇩🇪',
    'FR': '🇫🇷',
    'IN': '🇮🇳',
    'AU': '🇦🇺',
    'BR': '🇧🇷',
    'JP': '🇯🇵',
    'OT': '🌍',
  };
  return flags[countryCode] || '🌍';
}

// Helper icon component
function PieChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  );
}
