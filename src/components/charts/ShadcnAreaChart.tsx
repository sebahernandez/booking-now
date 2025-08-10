"use client";

import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

interface ShadcnAreaChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title: string;
  description?: string;
  color?: string;
  height?: number;
}

export default function ShadcnAreaChart({
  data,
  title,
  description,
  color = "hsl(var(--chart-1))",
  height = 300,
}: ShadcnAreaChartProps) {
  const chartConfig = {
    value: {
      label: "Valor",
      color: color,
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            height={height}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey="value"
              type="natural"
              fill="var(--color-value)"
              fillOpacity={0.4}
              stroke="var(--color-value)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}