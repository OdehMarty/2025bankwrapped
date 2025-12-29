import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

const filePath = 'file2upload/Moniepoint-Document-2025-12-29T07-19.xlsx';
const buffer = readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

// Read with header:1 to get raw array data first
const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });

// Find the header row
let headerRowIndex = rawData.findIndex(row => {
    const rowStr = row.join('|').toLowerCase();
    return rowStr.includes('date') && (rowStr.includes('narration') || rowStr.includes('description')) &&
        (rowStr.includes('debit') || rowStr.includes('credit') || rowStr.includes('amount'));
});

console.log('Header row index:', headerRowIndex);

// Extract headers and convert to object array
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

console.log('\nHeaders:', headers);
console.log('\nTotal transactions:', data.length);
console.log('\nFirst 3 transactions:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

// Count debits vs credits
const debits = data.filter(row => parseFloat(row['Debit'] || 0) > 0).length;
const credits = data.filter(row => parseFloat(row['Credit'] || 0) > 0).length;
console.log('\nDebits:', debits, 'Credits:', credits);
