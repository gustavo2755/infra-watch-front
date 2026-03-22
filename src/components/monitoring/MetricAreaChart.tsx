import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

export type MetricChartPoint = {
  label: string;
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  bandwidth: number | null;
};

type MetricKey = "cpu" | "ram" | "disk" | "bandwidth";

interface MetricAreaChartProps {
  title: string;
  data: MetricChartPoint[];
  dataKey: MetricKey;
  color: string;
  threshold: number | null;
  thresholdEnabled: boolean;
}

function formatTooltipValue(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${Number(v).toFixed(1)}%`;
}

export function MetricAreaChart({
  title,
  data,
  dataKey,
  color,
  threshold,
  thresholdEnabled,
}: MetricAreaChartProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-3">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} domain={["auto", "auto"]} />
            <Tooltip
              formatter={(value) => [
                formatTooltipValue(
                  value == null
                    ? null
                    : typeof value === "number"
                      ? value
                      : Number(value)
                ),
                title,
              ]}
              labelFormatter={(label) => `Time: ${label}`}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            />
            {thresholdEnabled && threshold != null && (
              <ReferenceLine
                y={threshold}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{
                  value: "Threshold",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#dc2626",
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.25}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
