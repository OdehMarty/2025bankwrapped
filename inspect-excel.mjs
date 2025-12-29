import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

const filePath = 'file2upload/Moniepoint-Document-2025-12-29T07-01.xlsx';
const buffer = readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

console.log('Sheet Names:', workbook.SheetNames);

const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(firstSheet);

console.log('\nTotal rows:', data.length);
console.log('\nFirst 15 rows:');
data.slice(0, 15).forEach((row, i) => {
    console.log(`\nRow ${i}:`, JSON.stringify(row, null, 2));
});

console.log('\n\nSearching for transaction header row...');
const headerRow = data.findIndex(row => {
    const keys = Object.keys(row).map(k => k.toLowerCase());
    return keys.some(k => k.includes('date') || k.includes('narration') || k.includes('debit') || k.includes('credit'));
});
console.log('Transaction header found at row:', headerRow);
if (headerRow >= 0) {
    console.log('Header row:', JSON.stringify(data[headerRow], null, 2));
    console.log('\nSample transaction rows:');
    console.log(JSON.stringify(data.slice(headerRow, headerRow + 5), null, 2));
}
