import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Globe, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import type { SearchVisibilityData } from '@/types';

interface SearchVisibilityPanelProps {
  data: SearchVisibilityData;
}

export function SearchVisibilityPanel({ data }: SearchVisibilityPanelProps) {
  const getIndexStatusColor = (indexed: number, total: number) => {
    const ratio = indexed / Math.max(total, 1);
    if (ratio >= 0.9) return 'text-green-600';
    if (ratio >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Search Visibility</h2>
          <p className="text-slate-500">Indexing status and search performance</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            Google
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Search className="w-3 h-3" />
            Bing
          </Badge>
        </div>
      </div>

      {/* Index Status Cards */}
      {data.index_status && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Total Pages</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {data.index_status.total_pages.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Indexed</span>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <p className={`text-3xl font-bold ${getIndexStatusColor(data.index_status.indexed_pages, data.index_status.total_pages)}`}>
                {data.index_status.indexed_pages.toLocaleString()}
              </p>
              <Progress 
                value={(data.index_status.indexed_pages / Math.max(data.index_status.total_pages, 1)) * 100}
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Not Indexed</span>
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {data.index_status.not_indexed_pages.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Index Rate</span>
                <BarChart3 className="w-4 h-4 text-slate-400" />
              </div>
              <p className={`text-3xl font-bold ${getIndexStatusColor(data.index_status.indexed_pages, data.index_status.total_pages)}`}>
                {((data.index_status.indexed_pages / Math.max(data.index_status.total_pages, 1)) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Errors and Warnings */}
      {(data.index_status?.errors || data.index_status?.warnings) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Indexing Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.index_status.errors !== undefined && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Errors</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {data.index_status.errors}
                  </p>
                </div>
              )}
              
              {data.index_status.warnings !== undefined && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Warnings</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">
                    {data.index_status.warnings}
                  </p>
                </div>
              )}
              
              {data.index_status.pending_pages !== undefined && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {data.index_status.pending_pages}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Performance */}
      {data.search_performance && data.search_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Top Search Queries
            </CardTitle>
            <CardDescription>
              Performance data from Google Search Console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {data.search_performance.map((perf, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{perf.query}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-slate-500">Clicks</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {perf.clicks.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Impressions</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {perf.impressions.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">CTR</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {(perf.ctr * 100).toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Position</p>
                            <p className={`text-lg font-semibold ${
                              perf.position <= 10 ? 'text-green-600' : 
                              perf.position <= 20 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {perf.position.toFixed(1)}
                            </p>
                          </div>
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

      {/* Sitemaps */}
      {data.sitemaps && data.sitemaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Sitemap Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sitemaps.map((sitemap, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900">{sitemap.path}</h4>
                        {sitemap.is_pending && (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {sitemap.is_sitemaps_index && (
                          <Badge variant="outline">Index</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        {sitemap.last_submitted && (
                          <span>Submitted: {new Date(sitemap.last_submitted).toLocaleDateString()}</span>
                        )}
                        {sitemap.last_downloaded && (
                          <span>Downloaded: {new Date(sitemap.last_downloaded).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sitemap.errors > 0 && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          {sitemap.errors} errors
                        </Badge>
                      )}
                      {sitemap.warnings > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="w-3 h-3" />
                          {sitemap.warnings} warnings
                        </Badge>
                      )}
                      {sitemap.errors === 0 && sitemap.warnings === 0 && (
                        <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          OK
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Search Visibility Recommendations
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
