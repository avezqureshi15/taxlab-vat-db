import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import * as axios from 'axios';
interface ExcelRow {
    Col1: string; // The first column
    Col2: string; // The second column (JSON string or "TRUE"/"FALSE")
}
class ExcelService {
    // Helper function to get a random integer within a range
    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Helper function to adjust amount within ±500 range
    private adjustAmount(amount: number): number {
        return amount + this.getRandomInt(-500, 500);
    }

    // Generate a random AdditionalDocumentReference
    private generateRandomReference(): string {
        return `INV-REF-${this.getRandomInt(100, 999)}`;
    }

    // Data to be added to Excel file with dynamic adjustments
    private data = [
        {
            Col1: 'Invoice Details',
            Col2: JSON.stringify({
                UUID: "123e4567-e89b-12d3-a456-426614174000",
                ProfileID: "UAE-VAT12345",
                ID: "INV-001",
                IssueTime: "2024-10-01 10:00:00",
                InvoiceTypeCode: "Tax Invoice",
                DocumentCurrencyCode: "AED",
                TaxCurrencyCode: "AED",
                AdditionalDocumentReference: this.generateRandomReference(),
                TaxCategoryID: null,
                TaxCategoryPercent: null,
                TaxCategoryTaxScheme: "VAT"
            })
        },
        {
            Col1: 'VAT on Sales and all other Outputs',
            Col2: JSON.stringify({
                "1a_Standard_rated_supplies_in_Abu_Dhabi": { "Amount_AED": this.adjustAmount(50000), "VAT_Amount_AED": this.adjustAmount(2500), "Adjustment_Amount_AED": 0 },
                "1b_Standard_rated_supplies_in_Dubai": { "Amount_AED": this.adjustAmount(75000), "VAT_Amount_AED": this.adjustAmount(3750), "Adjustment_Amount_AED": 0 },
                "1c_Standard_rated_supplies_in_Sharjah": { "Amount_AED": this.adjustAmount(25000), "VAT_Amount_AED": this.adjustAmount(1250), "Adjustment_Amount_AED": 0 },
                "1d_Standard_rated_supplies_in_Ajman": { "Amount_AED": this.adjustAmount(10000), "VAT_Amount_AED": this.adjustAmount(500), "Adjustment_Amount_AED": 0 },
                "1e_Standard_rated_supplies_in_Umm_Al_Quwain": { "Amount_AED": this.adjustAmount(8000), "VAT_Amount_AED": this.adjustAmount(400), "Adjustment_Amount_AED": 0 },
                "1f_Standard_rated_supplies_in_Ras_Al_Khaimah": { "Amount_AED": this.adjustAmount(15000), "VAT_Amount_AED": this.adjustAmount(750), "Adjustment_Amount_AED": 0 },
                "1g_Standard_rated_supplies_in_Fujairah": { "Amount_AED": this.adjustAmount(5000), "VAT_Amount_AED": this.adjustAmount(250), "Adjustment_Amount_AED": 0 },
                "2_Tax_refunds_provided_to_tourists": { "Amount_AED": 0, "VAT_Amount_AED": 0 },
                "3_Supplies_subject_to_reverse_charge_provisions": { "Amount_AED": this.adjustAmount(20000), "VAT_Amount_AED": 0 },
                "4_Zero_rated_supplies": { "Amount_AED": this.adjustAmount(12000) },
                "5_Exempt_supplies": { "Amount_AED": this.adjustAmount(6000) },
                "6_Goods_imported_into_the_UAE": { "Amount_AED": this.adjustAmount(30000), "VAT_Amount_AED": this.adjustAmount(1500) },
                "7_Adjustments_to_goods_imported_into_the_UAE": { "Amount_AED": 0, "VAT_Amount_AED": 0 },
                "8_Totals": { "Amount_AED": this.adjustAmount(246000), "VAT_Amount_AED": this.adjustAmount(10900), "Adjustment_Amount_AED": 0 }
            })
        },
        {
            Col1: 'VAT on Expenses and all other Inputs',
            Col2: JSON.stringify({
                "9_Standard_rated_expenses": { "Amount_AED": this.adjustAmount(40000), "Recoverable_VAT_amount_AED": this.adjustAmount(2000), "Adjustment_Amount_AED": 0 },
                "10_Supplies_subject_to_reverse_charge_provisions": { "Amount_AED": this.adjustAmount(15000), "Recoverable_VAT_amount_AED": this.adjustAmount(750), "Adjustment_Amount_AED": 0 },
                "11_Totals": { "Amount_AED": this.adjustAmount(55000), "Recoverable_VAT_amount_AED": this.adjustAmount(2750), "Adjustment_Amount_AED": 0 }
            })
        },
        {
            Col1: 'Net VAT Due',
            Col2: JSON.stringify({
                "12_Total_value_of_due_tax_for_the_period": { "Amount_AED": this.adjustAmount(10900) },
                "13_Total_Value_of_recoverable_tax_for_the_period": { "Amount_AED": this.adjustAmount(2750) },
                "14_Payable_tax_for_the_period": { "Amount_AED": this.adjustAmount(8150) }
            })
        },
        {
            Col1: 'Profit Scheme',
            Col2: 'TRUE'
        }
    ];

    // Method to generate the Excel file
    public generateExcel(): string {
        // Create a new workbook and worksheet
        const workbook = xlsx.utils.book_new();
        const worksheetData = this.data.map(item => [item.Col1, item.Col2]);
        const worksheet = xlsx.utils.aoa_to_sheet([['Col1', 'Col2'], ...worksheetData]);

        // Get the current timestamp and format it for the file name
        const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
        const sheetName = `Invoice_Data_${timestamp}`;

        // Append worksheet to workbook with timestamped sheet name
        xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Define the file path and save the Excel file
        const filePath = path.join(__dirname, `${sheetName}.xlsx`);
        xlsx.writeFile(workbook, filePath);

        console.log(`Excel file created at ${filePath} with sheet name: ${sheetName}`);
        return filePath;
    }
    async convertExcelToJson(url: string): Promise<void> {
        try {
            // Download the Excel file
            const response = await axios.default.get(url, { responseType: 'arraybuffer' });
            const data = response.data;

            // Read the Excel file
            const workbook = xlsx.read(data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert the sheet to JSON and cast it to an array of ExcelRow
            const jsonData: ExcelRow[] = xlsx.utils.sheet_to_json(worksheet);

            // Create a new object to hold the structured data
            const structuredData: Record<string, any> = {};

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
}

export default ExcelService;
