import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './entity/invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { LinodeModule } from 'src/common/linode/linode.module';
import { ExcelModule } from 'src/common/excel/excel.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema, collection: 'org-A' }]),
    LinodeModule,
    ExcelModule
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule { }
