import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint } from "@/types/dashboard.types";

interface Props {
  data: ChartDataPoint[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const ProjectStatusPieChart = ({ data }: Props) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Project Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [value, "Projects"] as any}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
