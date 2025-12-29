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

console.log('Total rows:', data.length);
console.log('Headers:', headers);

// Calculate totals
let totalDebit = 0;
let totalCredit = 0;
let debitCount = 0;
let creditCount = 0;

const debitKey = headers.find(h => h && h.toLowerCase().includes('debit'));
const creditKey = headers.find(h => h && h.toLowerCase().includes('credit'));

console.log('\nFound columns:', { debitKey, creditKey });

data.forEach(row => {
    if (debitKey && row[debitKey]) {
        const val = parseFloat(String(row[debitKey]).replace(/,/g, '') || 0);
        if (val > 0) {
            totalDebit += val;
            debitCount++;
        }
    }

    if (creditKey && row[creditKey]) {
        const val = parseFloat(String(row[creditKey]).replace(/,/g, '') || 0);
        if (val > 0) {
            totalCredit += val;
            creditCount++;
        }
    }
});

console.log('\n=== CALCULATED TOTALS ===');
console.log('Total Debit:', totalDebit.toFixed(2));
console.log('Total Credit:', totalCredit.toFixed(2));
console.log('Debit transactions:', debitCount);
console.log('Credit transactions:', creditCount);
console.log('\n=== EXPECTED FROM EXCEL ===');
console.log('Total Debit: 466027.71');
console.log('Total Credit: 466048.32');
console.log('\n=== DIFFERENCE ===');
console.log('Debit difference:', (466027.71 - totalDebit).toFixed(2));
console.log('Credit difference:', (466048.32 - totalCredit).toFixed(2));
