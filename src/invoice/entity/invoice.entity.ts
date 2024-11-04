import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Invoice extends Document {
    @Prop({ required: true })
    businessId: string;

    @Prop({ required: true })
    invoiceId: string;

    @Prop({ required: true })
    fileType: string;

    @Prop({ required: true })
    source: string;

    @Prop({ required: true })
    IRNstatus: string;

    @Prop({ required: true })
    linodeObjectKey: string;

    @Prop({ required: true })
    documentType: string;

    @Prop({ type: Date, required: true })
    createdOn: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
