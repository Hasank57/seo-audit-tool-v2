import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Loader2, 
  Search, 
  Globe, 
  TrendingUp, 
  Bot, 
  Download,
  CheckCircle2,
  Zap,
  Users,
  ArrowRight
} from 'lucide-react';
// Using mock API for static deployment demonstration
import { mockApiService as apiService } from '@/services/mockApi';
import type { SEOHealthData, SearchVisibilityData, GEOData, TrafficData } from '@/types';
import { SEOHealthPanel } from './SEOHealthPanel';
import { SearchVisibilityPanel } from './SearchVisibilityPanel';
import { GEOPanel } from './GEOPanel';
import { TrafficPanel } from './TrafficPanel';

interface ModuleConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const modules: ModuleConfig[] = [
  {
    id: 'seo',
    label: 'SEO Health',
    description: 'Analyze technical SEO, Core Web Vitals, and performance',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'search',
    label: 'Search Visibility',
    description: 'Check Google/Bing indexing and search performance',
    icon: <Search className="w-5 h-5" />,
  },
  {
    id: 'geo',
    label: 'GEO Analysis',
    description: 'Assess AI chatbot visibility (ChatGPT, Gemini)',
    icon: <Bot className="w-5 h-5" />,
  },
  {
    id: 'traffic',
    label: 'Traffic Estimation',
    description: 'Estimate website traffic and sources',
    icon: <TrendingUp className="w-5 h-5" />,
  },
];

export function Dashboard() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(['seo', 'search', 'geo', 'traffic']);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const [seoData, setSeoData] = useState<SEOHealthData | null>(null);
  const [searchData, setSearchData] = useState<SearchVisibilityData | null>(null);
  const [geoData, setGeoData] = useState<GEOData | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const runAudit = async () => {
    if (!url) {
      toast.error('Please enter a URL to analyze');
      return;
    }

    if (selectedModules.length === 0) {
      toast.error('Please select at least one audit module');
      return;
    }

    // Validate URL
    let validatedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      validatedUrl = `https://${url}`;
    }

    setIsLoading(true);
    setLoadingProgress(0);
    setSeoData(null);
    setSearchData(null);
    setGeoData(null);
    setTrafficData(null);

    const totalModules = selectedModules.length;
    let completedModules = 0;

    try {
      // SEO Health Module
      if (selectedModules.includes('seo')) {
        setLoadingMessage('Analyzing SEO Health...');
        const seoResult = await apiService.analyzeSEOHealth(validatedUrl, 'mobile');
        setSeoData(seoResult);
        completedModules++;
        setLoadingProgress((completedModules / totalModules) * 100);
      }

      // Search Visibility Module
      if (selectedModules.includes('search')) {
        setLoadingMessage('Checking Search Visibility...');
        const searchResult = await apiService.analyzeSearchVisibility(validatedUrl);
        setSearchData(searchResult);
        completedModules++;
        setLoadingProgress((completedModules / totalModules) * 100);
      }

      // GEO Module
      if (selectedModules.includes('geo')) {
        setLoadingMessage('Analyzing AI Chatbot Visibility...');
        const domain = validatedUrl.replace(/^https?:\/\//, '').split('/')[0];
        const keywordList = keywords ? keywords.split(',').map(k => k.trim()) : ['SEO tools', 'website optimization'];
        const geoResult = await apiService.analyzeGEO(domain, keywordList);
        setGeoData(geoResult);
        completedModules++;
        setLoadingProgress((completedModules / totalModules) * 100);
      }

      // Traffic Module
      if (selectedModules.includes('traffic')) {
        setLoadingMessage('Estimating Traffic...');
        const trafficResult = await apiService.estimateTraffic(validatedUrl);
        setTrafficData(trafficResult);
        completedModules++;
        setLoadingProgress((completedModules / totalModules) * 100);
      }

      toast.success('Audit completed successfully!');
    } catch (error) {
      console.error('Audit error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during the audit');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const generateReport = async () => {
    if (!url) {
      toast.error('Please run an audit first');
      return;
    }

    setLoadingMessage('Generating PDF report...');
    setIsLoading(true);

    try {
      const blob = await apiService.generateReport({
        url,
        seo_data: seoData || undefined,
        search_data: searchData || undefined,
        geo_data: geoData || undefined,
        traffic_data: trafficData || undefined,
        include_sections: selectedModules,
      });

      // Download the PDF
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `SEO_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const hasResults = seoData || searchData || geoData || trafficData;

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Website Audit Configuration
          </CardTitle>
          <CardDescription>
            Enter a URL and select the modules you want to analyze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Keywords Input (for GEO) */}
          <div className="space-y-2">
            <Label htmlFor="keywords">
              Target Keywords <span className="text-slate-400">(for GEO analysis, comma-separated)</span>
            </Label>
            <Input
              id="keywords"
              placeholder="SEO tools, marketing software, analytics platform"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Module Selection */}
          <div className="space-y-3">
            <Label>Select Audit Modules</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModules.includes(module.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => !isLoading && toggleModule(module.id)}
                >
                  <Checkbox
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={() => toggleModule(module.id)}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={selectedModules.includes(module.id) ? 'text-blue-600' : 'text-slate-500'}>
                        {module.icon}
                      </span>
                      <span className="font-medium">{module.label}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={runAudit}
              disabled={isLoading || !url}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {loadingMessage}
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Run Audit
                </>
              )}
            </Button>
            
            {hasResults && (
              <Button
                onClick={generateReport}
                disabled={isLoading}
                variant="outline"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export PDF
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-2">
              <Progress value={loadingProgress} className="h-2" />
              <p className="text-sm text-slate-500 text-center">
                {Math.round(loadingProgress)}% complete
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {hasResults && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {seoData && <TabsTrigger value="seo">SEO Health</TabsTrigger>}
            {searchData && <TabsTrigger value="search">Search Visibility</TabsTrigger>}
            {geoData && <TabsTrigger value="geo">GEO</TabsTrigger>}
            {trafficData && <TabsTrigger value="traffic">Traffic</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewPanel 
              seoData={seoData} 
              searchData={searchData} 
              geoData={geoData} 
              trafficData={trafficData} 
            />
          </TabsContent>

          {/* SEO Health Tab */}
          {seoData && (
            <TabsContent value="seo">
              <SEOHealthPanel data={seoData} />
            </TabsContent>
          )}

          {/* Search Visibility Tab */}
          {searchData && (
            <TabsContent value="search">
              <SearchVisibilityPanel data={searchData} />
            </TabsContent>
          )}

          {/* GEO Tab */}
          {geoData && (
            <TabsContent value="geo">
              <GEOPanel data={geoData} />
            </TabsContent>
          )}

          {/* Traffic Tab */}
          {trafficData && (
            <TabsContent value="traffic">
              <TrafficPanel data={trafficData} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}

// Overview Panel Component
interface OverviewPanelProps {
  seoData: SEOHealthData | null;
  searchData: SearchVisibilityData | null;
  geoData: GEOData | null;
  trafficData: TrafficData | null;
}

function OverviewPanel({ seoData, searchData, geoData, trafficData }: OverviewPanelProps) {
  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'text-slate-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'bg-slate-100';
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 50) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Audit Overview</h2>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SEO Score */}
        {seoData && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">SEO Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(seoData.seo_score)}`}>
                    {seoData.seo_score ?? 'N/A'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBg(seoData.seo_score)}`}>
                  <Zap className={`w-6 h-6 ${getScoreColor(seoData.seo_score)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Score */}
        {seoData && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Performance</p>
                  <p className={`text-3xl font-bold ${getScoreColor(seoData.performance_score)}`}>
                    {seoData.performance_score ?? 'N/A'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBg(seoData.performance_score)}`}>
                  <BarChartIcon className={`w-6 h-6 ${getScoreColor(seoData.performance_score)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Indexed Pages */}
        {searchData?.index_status && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Indexed Pages</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {searchData.index_status.indexed_pages}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Mention Rate */}
        {geoData && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">AI Mention Rate</p>
                  <p className={`text-3xl font-bold ${getScoreColor(geoData.summary.mention_rate * 100)}`}>
                    {Math.round(geoData.summary.mention_rate * 100)}%
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBg(geoData.summary.mention_rate * 100)}`}>
                  <Bot className={`w-6 h-6 ${getScoreColor(geoData.summary.mention_rate * 100)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Visits */}
        {trafficData && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Est. Monthly Visits</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {trafficData.metrics.monthly_visits.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Top Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {seoData?.recommendations?.slice(0, 2).map((rec, i) => (
                <div key={`seo-${i}`} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{rec}</p>
                </div>
              ))}
              {searchData?.recommendations?.slice(0, 2).map((rec, i) => (
                <div key={`search-${i}`} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Search className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{rec}</p>
                </div>
              ))}
              {geoData?.recommendations?.slice(0, 2).map((rec, i) => (
                <div key={`geo-${i}`} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Bot className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{rec}</p>
                </div>
              ))}
              {trafficData?.recommendations?.slice(0, 2).map((rec, i) => (
                <div key={`traffic-${i}`} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{rec}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Module Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {seoData && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">SEO Health</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {seoData.opportunities.length} opportunities found
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        )}

        {searchData && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Search Visibility</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {searchData.search_performance.length} top queries tracked
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        )}

        {geoData && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">GEO Analysis</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {geoData.summary.mentions_found} AI mentions found
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        )}

        {trafficData && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Traffic Estimation</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {trafficData.traffic_sources.length} traffic sources identified
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper icon component
function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
