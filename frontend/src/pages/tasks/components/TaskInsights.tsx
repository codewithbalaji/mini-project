import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Info, Lightbulb, RefreshCw } from "lucide-react";
import api from "@/services/api";
import type { Task, TaskUpdate, TaskInsightRecommendation } from "@/types/task.types";

interface TaskInsightsProps {
  task: Task;
  updates: TaskUpdate[];
}

const TaskInsights = ({ task, updates }: TaskInsightsProps) => {
  const [insights, setInsights] = useState<TaskInsightRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await api.post("/ai/task-insights", { task, updates });
      setInsights(response.data.recommendations || []);
      setLastGenerated(new Date());
      setHasGenerated(true);
    } catch (err) {
      console.error("Failed to fetch task insights:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if task has existing insights
    const checkExistingInsights = async () => {
      try {
        const response = await api.get(`/ai/task-insights/${task._id}`);
        if (response.data.insights) {
          setInsights(response.data.insights.recommendations || []);
          setLastGenerated(new Date(response.data.insights.createdAt));
          setHasGenerated(true);
        }
      } catch (err) {
        // No existing insights or error, that's fine
        if (err.response?.status !== 404) {
          console.error("Error checking existing insights:", err);
        }
        setHasGenerated(false);
      }
    };

    checkExistingInsights();
  }, [task._id]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <Info className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-200 bg-red-50/50 dark:bg-red-950/20";
      case "warning":
        return "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20";
      default:
        return "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <Card className="border-violet-200 bg-violet-50/50 dark:bg-violet-950/20">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              AI Insights
            </span>
            <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-700">
              Analyzing...
            </Badge>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-violet-200 bg-violet-50/50 dark:bg-violet-950/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                AI Insights
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchInsights}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Unable to generate insights. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!hasGenerated) {
    return (
      <Card className="border-violet-200 bg-violet-50/50 dark:bg-violet-950/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                AI Insights
              </span>
            </div>
            <Button
              size="sm"
              onClick={fetchInsights}
              className="text-xs bg-violet-600 hover:bg-violet-700"
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Generate Insights
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click to generate AI-powered recommendations for this task.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-violet-200 bg-violet-50/50 dark:bg-violet-950/20">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              AI Insights
            </span>
            {lastGenerated && (
              <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-700">
                {formatTimeAgo(lastGenerated)}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchInsights}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-2">
          {insights.map((rec, idx) => (
            <Card key={idx} className={`${getSeverityColor(rec.severity)}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-2">
                  {getSeverityIcon(rec.severity)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rec.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskInsights;