import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrendDataPoint } from "@/types/dashboard.types";

interface Props {
  data: TrendDataPoint[];
}

export const MonthlyTrendLineChart = ({ data }: Props) => {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Productivity Trend (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                <Line 
                  type="monotone" 
                  dataKey="Tasks" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="Projects" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
