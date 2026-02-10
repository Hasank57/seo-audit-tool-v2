import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  Target,
  BarChart3
} from 'lucide-react';
import type { GEOData } from '@/types';

interface GEOPanelProps {
  data: GEOData;
}

export function GEOPanel({ data }: GEOPanelProps) {
  const getSentimentBadge = (sentiment: string | undefined) => {
    if (sentiment === 'positive') return <Badge className="bg-green-100 text-green-800">Positive</Badge>;
    if (sentiment === 'negative') return <Badge className="bg-red-100 text-red-800">Negative</Badge>;
    if (sentiment === 'neutral') return <Badge className="bg-yellow-100 text-yellow-800">Neutral</Badge>;
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const getMentionRateColor = (rate: number) => {
    if (rate >= 0.7) return 'text-green-600';
    if (rate >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMentionRateBg = (rate: number) => {
    if (rate >= 0.7) return 'bg-green-100';
    if (rate >= 0.4) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Group mentions by platform
  const geminiMentions = data.mentions.filter(m => m.platform === 'gemini');
  const chatgptMentions = data.mentions.filter(m => m.platform === 'chatgpt');

  const geminiMentioned = geminiMentions.filter(m => m.mentioned).length;
  const chatgptMentioned = chatgptMentions.filter(m => m.mentioned).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Generative Engine Optimization</h2>
          <p className="text-slate-500">AI chatbot visibility analysis for {data.domain}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            Gemini
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bot className="w-3 h-3 text-green-500" />
            ChatGPT
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Total Checks</span>
              <Target className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {data.summary.total_checks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Mentions Found</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {data.summary.mentions_found}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Mention Rate</span>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
            <p className={`text-3xl font-bold ${getMentionRateColor(data.summary.mention_rate)}`}>
              {Math.round(data.summary.mention_rate * 100)}%
            </p>
            <Progress 
              value={data.summary.mention_rate * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Avg. Rank</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {data.summary.average_rank?.toFixed(1) || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Gemini Visibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Mentions</p>
                <p className="text-2xl font-bold text-slate-900">
                  {geminiMentioned} <span className="text-slate-400 text-lg">/ {geminiMentions.length}</span>
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                getMentionRateBg(geminiMentioned / Math.max(geminiMentions.length, 1))
              }`}>
                <span className={`text-xl font-bold ${
                  getMentionRateColor(geminiMentioned / Math.max(geminiMentions.length, 1))
                }`}>
                  {Math.round((geminiMentioned / Math.max(geminiMentions.length, 1)) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5 text-green-600" />
              ChatGPT Visibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Mentions</p>
                <p className="text-2xl font-bold text-slate-900">
                  {chatgptMentioned} <span className="text-slate-400 text-lg">/ {chatgptMentions.length}</span>
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                getMentionRateBg(chatgptMentioned / Math.max(chatgptMentions.length, 1))
              }`}>
                <span className={`text-xl font-bold ${
                  getMentionRateColor(chatgptMentioned / Math.max(chatgptMentions.length, 1))
                }`}>
                  {Math.round((chatgptMentioned / Math.max(chatgptMentions.length, 1)) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Sentiment Analysis
          </CardTitle>
          <CardDescription>
            Breakdown of sentiment in AI responses where your brand was mentioned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Positive</span>
              </div>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {data.summary.sentiment_breakdown.positive || 0}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2">
                <Minus className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Neutral</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {data.summary.sentiment_breakdown.neutral || 0}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Negative</span>
              </div>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {data.summary.sentiment_breakdown.negative || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Mentions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            Detailed Mentions
          </CardTitle>
          <CardDescription>
            Individual query results from AI platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {data.mentions.map((mention, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {mention.platform === 'gemini' ? (
                            <Sparkles className="w-3 h-3 text-purple-500" />
                          ) : (
                            <Bot className="w-3 h-3 text-green-500" />
                          )}
                          {mention.platform}
                        </Badge>
                        {mention.mentioned ? (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Mentioned
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Not Mentioned
                          </Badge>
                        )}
                        {mention.sentiment && getSentimentBadge(mention.sentiment)}
                      </div>
                      
                      <p className="font-medium text-slate-900 mb-2">{mention.query}</p>
                      
                      {mention.context && (
                        <div className="mt-3 p-3 bg-white rounded border border-slate-200">
                          <p className="text-sm text-slate-600 italic">
                            "{mention.context.substring(0, 200)}..."
                          </p>
                        </div>
                      )}
                      
                      {mention.rank && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-slate-500">Rank:</span>
                          <Badge variant="outline">#{mention.rank}</Badge>
                        </div>
                      )}
                      
                      {mention.competitors_mentioned && mention.competitors_mentioned.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-slate-500">Competitors mentioned:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mention.competitors_mentioned.map((comp, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {comp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
            GEO Recommendations
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
