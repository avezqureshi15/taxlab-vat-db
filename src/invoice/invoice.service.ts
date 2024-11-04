import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from './entity/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { LinodeService } from '../common/linode/linode.service'; // Import the Linode service
import ExcelService from 'src/common/excel/excel.service';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
        private excelService: ExcelService,
        private linodeService: LinodeService,
    ) { }

    async createInvoice(invoiceData: CreateInvoiceDto): Promise<Invoice> {
        if (invoiceData.createdOn) {
            invoiceData.createdOn = new Date(invoiceData.createdOn);
        }

        // Generate Excel file with specified data
        const excelFilePath = await this.excelService.generateExcel()
        console.log(excelFilePath);
        // Upload the file to Linode and get the URL
        const uploadedFileUrl = await this.linodeService.uploadFile(excelFilePath);
        await this.excelService.convertExcelToJson(uploadedFileUrl);
        // Create a new invoice document
        const newInvoice = new this.invoiceModel({ ...invoiceData, linodeObjectKey: uploadedFileUrl });
        return newInvoice.save();
    }
}
