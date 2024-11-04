const xlsx = require('xlsx');
const axios = require('axios');
const fs = require('fs');

// URL of the Excel file
const url = 'https://in-maa-1.linodeobjects.com/einvoice-bucket/Invoice_Data_20241104034742.xlsx';

// Function to download and process the Excel file
async function convertExcelToJson() {
    try {
        // Download the Excel file
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const data = response.data;

        // Read the Excel file
        const workbook = xlsx.read(data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert the sheet to JSON
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // Create a new object to hold the structured data
        const structuredData = {};

        jsonData.forEach(row => {
            const key = row.Col1;

            // Try to parse the JSON in Col2, handle non-JSON values
            let value;
            try {
                value = JSON.parse(row.Col2);
            } catch (e) {
                // Handle specific cases for non-JSON values
                if (row.Col2 === "TRUE") {
                    value = true;
                } else if (row.Col2 === "FALSE") {
                    value = false;
                } else {
                    console.warn(`Skipping invalid JSON value for key "${key}": ${row.Col2}`);
                    return; // Skip this entry
                }
            }

            structuredData[key] = value;
        });

        // Write the structured data to a JSON file
        fs.writeFileSync('output.json', JSON.stringify(structuredData, null, 4));

        console.log('Data has been written to output.json');
    } catch (error) {
        console.error('Error processing the Excel file:', error);
    }
}

// Execute the function
convertExcelToJson();
