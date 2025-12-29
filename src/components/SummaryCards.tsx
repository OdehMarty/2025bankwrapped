import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '../utils/cn';

interface SummaryCardsProps {
    totalInflow: number;
    totalExpense: number;
}

export function SummaryCards({ totalInflow, totalExpense }: SummaryCardsProps) {
    const netSavings = totalInflow - totalExpense;
    const savingsRate = totalInflow > 0 ? (netSavings / totalInflow) * 100 : 0;

    const cards = [
        {
            label: 'Total Income',
            value: totalInflow,
            icon: TrendingUp,
            color: 'text-green-500',
            bg: 'bg-green-50',
            subtext: 'Your total earnings'
        },
        {
            label: 'Total Expenses',
            value: totalExpense,
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-50',
            subtext: `${(totalExpense / (totalInflow || 1) * 100).toFixed(1)}% of income`
        },
        {
            label: 'Net Savings',
            value: netSavings,
            icon: Wallet,
            color: netSavings >= 0 ? 'text-blue-500' : 'text-orange-500',
            bg: netSavings >= 0 ? 'bg-blue-50' : 'bg-orange-50',
            subtext: `${savingsRate.toFixed(1)}% savings rate`
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">{card.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            ₦{card.value.toLocaleString()}
                        </h3>
                        <p className={cn("text-xs mt-2 font-medium", card.color)}>
                            {card.subtext}
                        </p>
                    </div>
                    <div className={cn("p-3 rounded-full", card.bg, card.color)}>
                        <card.icon size={24} />
                    </div>
                </div>
            ))}
        </div>
    );
}
