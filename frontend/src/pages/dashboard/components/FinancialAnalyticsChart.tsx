import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  totalBudget: number;
  totalEstimatedHours: number;
}

export const FinancialAnalyticsChart = ({ totalBudget, totalEstimatedHours }: Props) => {
  // Mock an estimated cost based on hours * $50 avg hourly rate
  const estimatedCost = totalEstimatedHours * 50;
  
  const data = [
    { name: "Total Budget", value: totalBudget, fill: "#10b981" },
    { name: "Est. Cost (Hrs × $50)", value: estimatedCost, fill: "#f59e0b" }
  ];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>Budgeted vs Estimated Value</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis 
                type="number"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#64748b", fontSize: 12 }} 
                tickFormatter={(val) => "$" + val}
              />
              <YAxis 
                dataKey="name" 
                type="category"
                axisLine={false} 
                tickLine={false} 
                width={120}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                formatter={(value: any) => ["$" + value.toLocaleString(), "Amount"] as any}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
