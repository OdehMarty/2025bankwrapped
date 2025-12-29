import { useMemo } from 'react';
import type { Transaction } from './parser';
import type { Category } from './classifier';

export type ProcessedTransaction = Transaction & {
    category: Category;
};

export const useAnalytics = (transactions: ProcessedTransaction[]) => {
    return useMemo(() => {
        const totalInflow = transactions
            .filter(t => t.type === 'inflow')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Expenses by Category
        const expensesByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        // Monthly Trends
        const monthlySpending = new Array(12).fill(0);
        const monthlyInflow = new Array(12).fill(0);

        transactions.forEach(t => {
            const month = new Date(t.date).getMonth();
            if (t.type === 'expense') {
                monthlySpending[month] += t.amount;
            } else {
                monthlyInflow[month] += t.amount;
            }
        });

        // Insights
        const sortedCategories = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a);
        const topCategory = sortedCategories[0]?.[0] || 'None';

        const highestSpendingMonthIndex = monthlySpending.indexOf(Math.max(...monthlySpending));
        const highestSpendingMonth = new Date(0, highestSpendingMonthIndex).toLocaleString('default', { month: 'long' });

        const netSavings = totalInflow - totalExpense;
        const savingsRate = totalInflow > 0 ? (netSavings / totalInflow) * 100 : 0;

        return {
            totalInflow,
            totalExpense,
            expensesByCategory: sortedCategories.map(([name, value]) => ({ name, value })),
            monthlyData: monthlySpending.map((spend, i) => ({
                month: new Date(0, i).toLocaleString('default', { month: 'short' }),
                expense: spend,
                inflow: monthlyInflow[i]
            })),
            insights: {
                topCategory,
                highestSpendingMonth,
                netSavings,
                savingsRate
            }
        };
    }, [transactions]);
};
