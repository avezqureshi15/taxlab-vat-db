import { IsString, IsDate, IsOptional, IsUrl } from 'class-validator';

export class CreateInvoiceDto {
    @IsString()
    businessId: string;

    @IsString()
    invoiceId: string;

    @IsString()
    fileType: string;

    @IsString()
    source: string;

    @IsString()
    IRNstatus: string;

    @IsUrl()
    linodeObjectKey: string;

    @IsString()
    documentType: string;

    @IsDate()
    createdOn: Date;
}
