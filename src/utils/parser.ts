import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface Transaction {
    id: string;
    date: Date;
    description: string;
    amount: number;
    type: 'inflow' | 'expense';
    originalRow?: any;
}

export const parseFile = async (file: File): Promise<Transaction[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
        return parseCSV(file);
    } else if (['xlsx', 'xls'].includes(extension || '')) {
        return parseExcel(file);
    } else if (extension === 'json') {
        return parseJSON(file);
    }
    throw new Error('Unsupported file format');
};

const normalizeTransaction = (row: any): Transaction | null => {
    // Try to find columns regardless of exact casing
    const keys = Object.keys(row);
    const findKey = (candidates: string[]) => keys.find(k => candidates.includes(k.toLowerCase()));

    const dateKey = findKey(['date', 'transaction date', 'posting date', 'timestamp', 'value date']);
    const descKey = findKey(['description', 'desc', 'details', 'memo', 'narration', 'transaction description', 'remarks']);
    const amountKey = findKey(['amount', 'value', 'transaction amount', 'transaction amount (ngn)']);
    const debitKey = findKey(['debit', 'dr', 'settlement debit', 'settlement debit (ngn)']);
    const creditKey = findKey(['credit', 'cr', 'settlement credit', 'settlement credit (ngn)']);

    if (!dateKey || !descKey) return null;

    // Handle Excel date serial numbers and formatted strings
    let dateValue = row[dateKey];
    let transactionDate: Date;

    if (typeof dateValue === 'number') {
        // Excel serial date: days since 1900-01-01
        const excelEpoch = new Date(1900, 0, 1);
        transactionDate = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
    } else if (typeof dateValue === 'string') {
        // Handle various date string formats
        // Common formats: "04/01/2025 7:50:49", "2025-01-04", "04/01/2025"

        // Try parsing DD/MM/YYYY format (common in many regions)
        const ddmmyyyyMatch = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (ddmmyyyyMatch) {
            const [, day, month, year] = ddmmyyyyMatch;
            // Parse as DD/MM/YYYY
            transactionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
            // Fallback to standard Date constructor
            transactionDate = new Date(dateValue);
        }
    } else {
        transactionDate = new Date(dateValue);
    }

    if (isNaN(transactionDate.getTime())) return null;

    let amount = 0;
    let type: 'inflow' | 'expense' = 'expense';

    // Check for separate debit/credit columns (Moniepoint format)
    if (debitKey && creditKey) {
        const debitVal = parseFloat(String(row[debitKey] || 0).replace(/,/g, ''));
        const creditVal = parseFloat(String(row[creditKey] || 0).replace(/,/g, ''));

        if (!isNaN(creditVal) && creditVal > 0) {
            amount = creditVal;
            type = 'inflow';
        } else if (!isNaN(debitVal) && debitVal > 0) {
            amount = debitVal;
            type = 'expense';
        } else {
            return null; // Skip if both are 0
        }
    } else if (amountKey) {
        // Single amount column
        amount = parseFloat(typeof row[amountKey] === 'string'
            ? row[amountKey].replace(/,/g, '').replace(/[^\d.-]/g, '')
            : row[amountKey]);

        if (isNaN(amount)) return null;

        if (amount < 0) {
            type = 'expense';
            amount = Math.abs(amount);
        } else {
            type = 'inflow';
        }
    } else {
        return null; // No amount information
    }

    return {
        id: Math.random().toString(36).substr(2, 9),
        date: transactionDate,
        description: String(row[descKey] || '').trim() || 'Unknown',
        amount,
        type,
        originalRow: row
    };
};

const parseCSV = (file: File): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const transactions = results.data
                    .map(normalizeTransaction)
                    .filter((t): t is Transaction => t !== null);
                resolve(transactions);
            },
            error: (err) => reject(err)
        });
    });
};

const parseExcel = async (file: File): Promise<Transaction[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    // Read with header:1 to get raw array data first (raw: true to preserve numeric dates)
    const rawData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: true });

    // Find the header row (contains 'Date', 'Narration', 'Debit', 'Credit', etc.)
    let headerRowIndex = rawData.findIndex(row => {
        const rowStr = row.join('|').toLowerCase();
        return rowStr.includes('date') && (rowStr.includes('narration') || rowStr.includes('description')) &&
            (rowStr.includes('debit') || rowStr.includes('credit') || rowStr.includes('amount'));
    });

    if (headerRowIndex === -1) {
        // Fallback: try normal parsing
        const data = XLSX.utils.sheet_to_json(firstSheet);
        return data
            .map(normalizeTransaction)
            .filter((t): t is Transaction => t !== null);
    }

    // Extract headers and convert to object array
    const headers = rawData[headerRowIndex].map((h: any) => String(h || '').trim());
    const dataRows = rawData.slice(headerRowIndex + 1);

    const data = dataRows.map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header, index) => {
            if (header) {
                obj[header] = row[index];
            }
        });
        return obj;
    }).filter(row => Object.keys(row).length > 0);

    return data
        .map(normalizeTransaction)
        .filter((t): t is Transaction => t !== null);
};

const parseJSON = async (file: File): Promise<Transaction[]> => {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error('JSON must be an array of transactions');

    return data
        .map(normalizeTransaction)
        .filter((t): t is Transaction => t !== null);
};
