import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendData {
    month: string;
    expense: number;
    inflow: number;
}

interface TrendLineChartProps {
    data: TrendData[];
}

export function TrendLineChart({ data }: TrendLineChartProps) {
    return (
        <div className="w-full h-[300px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Income vs Expenses Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        formatter={(value: number) => `₦${value.toLocaleString()}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="inflow"
                        name="Income"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="expense"
                        name="Expenses"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
