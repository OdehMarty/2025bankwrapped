import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

const filePath = 'file2upload/Moniepoint-Document-2025-12-29T07-01.xlsx';
const buffer = readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: true });

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

console.log('Total rows:', data.length);
console.log('\nFirst 3 date values (with raw:true):');
data.slice(0, 3).forEach((row, i) => {
    console.log(`Row ${i}: Date value =`, row['Date'], `(type: ${typeof row['Date']})`);
});

// Now test the parsing logic
const dateKey = 'Date';
const debitKey = 'Debit';
const creditKey = 'Credit';

let validCount = 0;
let invalidCount = 0;
let totalInflow = 0;
let totalExpense = 0;

data.forEach(row => {
    let dateValue = row[dateKey];
    let transactionDate;

    if (typeof dateValue === 'number') {
        const excelEpoch = new Date(1900, 0, 1);
        transactionDate = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
    } else {
        transactionDate = new Date(dateValue);
    }

    if (isNaN(transactionDate.getTime())) {
        invalidCount++;
        return;
    }

    const debitVal = parseFloat(String(row[debitKey] || 0).replace(/,/g, ''));
    const creditVal = parseFloat(String(row[creditKey] || 0).replace(/,/g, ''));

    if (creditVal > 0 || debitVal > 0) {
        validCount++;
        totalInflow += creditVal;
        totalExpense += debitVal;
    }
});

console.log('\n=== WITH RAW:TRUE ===');
console.log('Valid:', validCount);
console.log('Invalid:', invalidCount);
console.log('Total Inflow:', totalInflow.toFixed(2));
console.log('Total Expense:', totalExpense.toFixed(2));
console.log('\n=== EXPECTED ===');
console.log('661 valid transactions');
console.log('Total Credit: 466048.32');
console.log('Total Debit: 466027.71');
