import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'suggestion';
  message: string;
}

interface AIInsightsPanelProps {
  insights: Insight[];
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-3 rounded-lg border ${getBgColor(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              {getIcon(insight.type)}
              <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
