import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyData {
    month: string;
    expense: number;
}

interface MonthlyBarChartProps {
    data: MonthlyData[];
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
    return (
        <div className="w-full h-[300px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Spending</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
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
                        cursor={{ fill: '#f3f4f6' }}
                        formatter={(value: number) => `₦${value.toLocaleString()}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar
                        dataKey="expense"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
