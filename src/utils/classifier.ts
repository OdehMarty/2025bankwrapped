import type { Transaction } from './parser';

export type Category =
    | 'Mobile Data'
    | 'Shopping'
    | 'Helping Others'
    | 'Gambling'
    | 'Bill Payment'
    | 'Airtime'
    | 'Salary' // Inflow
    | 'Transfer'
    | 'Food'
    | 'Transport'
    | 'Entertainment'
    | 'Miscellaneous';

const CATEGORY_RULES: Record<Category, string[]> = {
    'Mobile Data': ['data', 'mtn', 'glo', 'airtel', '9mobile', 'internet', 'wifi', 'bundle'],
    'Airtime': ['airtime', 'recharge', 'topup', 'top up', 'vtu'],
    'Shopping': ['supermarket', 'store', 'mall', 'shop', 'amazon', 'jumia', 'konga', 'market', 'buy'],
    'Helping Others': ['gift', 'charity', 'donation', 'help', 'support', 'family', 'friend'],
    'Gambling': ['bet', 'bwin', '1xbet', 'sporty', 'lottery', 'casino', 'stake'],
    'Bill Payment': ['bill', 'nep', 'phcn', 'electric', 'waste', 'lawma', 'water', 'subscription', 'cable', 'dstv', 'gotv', 'netflix'],
    'Food': ['food', 'restaurant', 'eatery', 'burger', 'pizza', 'chicken', 'cafe', 'coffee', 'drink', 'bar'],
    'Transport': ['uber', 'bolt', 'taxify', 'ride', 'trip', 'fuel', 'gas', 'station', 'transport', 'bus', 'train', 'flight'],
    'Entertainment': ['movie', 'cinema', 'show', 'concert', 'game', 'playstation', 'steam', 'spotify', 'apple m'],
    'Salary': ['salary', 'wage', 'payroll', 'income', 'earning'],
    'Transfer': ['transfer', 'trf', 'sent to', 'received from'],
    'Miscellaneous': []
};

export const categorizeTransaction = (transaction: Transaction): Category => {
    if (transaction.type === 'inflow') {
        // Simple check for salary
        const lowerDesc = transaction.description.toLowerCase();
        if (CATEGORY_RULES['Salary'].some(keyword => lowerDesc.includes(keyword))) {
            return 'Salary';
        }
        return 'Miscellaneous'; // Or 'General Inflow'
    }

    const lowerDesc = transaction.description.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
        if (category === 'Miscellaneous' || category === 'Salary') continue;

        if (keywords.some(keyword => lowerDesc.includes(keyword))) {
            return category as Category;
        }
    }

    return 'Miscellaneous';
};

export const processTransactions = (transactions: Transaction[]) => {
    return transactions.map(t => ({
        ...t,
        category: categorizeTransaction(t)
    }));
};
