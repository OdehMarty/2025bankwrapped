import { Award, AlertCircle, PiggyBank } from 'lucide-react';

interface InsightsProps {
    topCategory: string;
    highestSpendingMonth: string;
    netSavings: number;
}

export function Insights({ topCategory, highestSpendingMonth, netSavings }: InsightsProps) {
    return (
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="text-yellow-400" />
                Yearly Highlights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-2">
                    <p className="text-indigo-200 text-sm font-medium">Spending Champion</p>
                    <p className="text-2xl font-bold text-white">{topCategory}</p>
                    <p className="text-xs text-indigo-300">Most frequent expense category</p>
                </div>

                <div className="space-y-2">
                    <p className="text-indigo-200 text-sm font-medium">Most Expensive Month</p>
                    <p className="text-2xl font-bold text-white">{highestSpendingMonth}</p>
                    <p className="text-xs text-indigo-300">When you spent the most</p>
                </div>

                <div className="space-y-2">
                    <p className="text-indigo-200 text-sm font-medium">Saving Status</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-white">
                            {netSavings >= 0 ? 'On Track' : 'Over Budget'}
                        </p>
                        {netSavings >= 0 ? (
                            <PiggyBank className="text-green-400" size={20} />
                        ) : (
                            <AlertCircle className="text-red-400" size={20} />
                        )}
                    </div>
                    <p className="text-xs text-indigo-300">
                        {netSavings >= 0 ? 'Great job saving this year!' : 'Try to cut back next year.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
