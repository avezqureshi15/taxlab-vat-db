import { Controller, Post, Body } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from './entity/invoice.entity';

@Controller('invoices')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Post()
    async addInvoice(@Body() invoiceData: CreateInvoiceDto): Promise<Invoice> {
        return this.invoiceService.createInvoice(invoiceData);
    }
}
