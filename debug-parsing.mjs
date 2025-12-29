import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

const filePath = 'file2upload/Moniepoint-Document-2025-12-29T07-01.xlsx';
const buffer = readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });

let headerRowIndex = rawData.findIndex(row => {
    const rowStr = row.join('|').toLowerCase();
    return rowStr.includes('date') && (rowStr.includes('narration') || rowStr.includes('description')) &&
        (rowStr.includes('debit') || rowStr.includes('credit') || rowStr.includes('amount'));
});

const headers = rawData[headerRowIndex].map(h => String(h || '').trim());
const dataRows = rawData.slice(headerRowIndex + 1);

const data = dataRows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
        if (header) {
            obj[header] = row[index];
        }
    });
    return obj;
}).filter(row => Object.keys(row).length > 0);

console.log('Total rows before filtering:', data.length);

// Simulate the normalizeTransaction logic
const dateKey = 'Date';
const descKey = 'Narration';
const debitKey = 'Debit';
const creditKey = 'Credit';

let validTransactions = 0;
let invalidTransactions = 0;
let totalInflow = 0;
let totalExpense = 0;

const invalidReasons = {};

data.forEach((row, index) => {
    // Check date
    let dateValue = row[dateKey];
    let transactionDate;

    if (typeof dateValue === 'number') {
        const excelEpoch = new Date(1900, 0, 1);
        transactionDate = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
    } else {
        transactionDate = new Date(dateValue);
    }

    if (!dateValue || !row[descKey]) {
        invalidTransactions++;
        const reason = !dateValue ? 'missing_date' : 'missing_description';
        invalidReasons[reason] = (invalidReasons[reason] || 0) + 1;
        return;
    }

    if (isNaN(transactionDate.getTime())) {
        invalidTransactions++;
        invalidReasons['invalid_date'] = (invalidReasons['invalid_date'] || 0) + 1;
        return;
    }

    const debitVal = parseFloat(String(row[debitKey] || 0).replace(/,/g, ''));
    const creditVal = parseFloat(String(row[creditKey] || 0).replace(/,/g, ''));

    if ((!isNaN(creditVal) && creditVal > 0) || (!isNaN(debitVal) && debitVal > 0)) {
        validTransactions++;
        if (creditVal > 0) {
            totalInflow += creditVal;
        }
        if (debitVal > 0) {
            totalExpense += debitVal;
        }
    } else {
        invalidTransactions++;
        invalidReasons['no_amount'] = (invalidReasons['no_amount'] || 0) + 1;
    }
});

console.log('\n=== PARSING RESULTS ===');
console.log('Valid transactions:', validTransactions);
console.log('Invalid transactions:', invalidTransactions);
console.log('Invalid reasons:', invalidReasons);
console.log('\n=== CALCULATED TOTALS ===');
console.log('Total Inflow:', totalInflow.toFixed(2));
console.log('Total Expense:', totalExpense.toFixed(2));
console.log('\n=== EXPECTED ===');
console.log('Total Credit: 466048.32');
console.log('Total Debit: 466027.71');
console.log('\n=== USER REPORTED SEEING ===');
console.log('Total Income: 240,510.03');
console.log('Total Expenses: 214,034.41');
