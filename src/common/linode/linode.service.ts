import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LinodeService {
    private readonly accessKeyId = 'D650B08TQLQVABPZIJ1P';
    private readonly secretAccessKey = 'oQdXAuUvCS4tqhMbutgFyydCT2H9K6ICgetYpAmC';
    private readonly bucketName = 'einvoice-bucket';
    private readonly endpoint = 'https://in-maa-1.linodeobjects.com/';
    private readonly s3: AWS.S3;

    constructor() {
        // Configure AWS S3 with Linode credentials
        this.s3 = new AWS.S3({
            endpoint: this.endpoint,
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey,
            s3ForcePathStyle: true, // needed for Linode
        });
    }

    async uploadFile(filePath: string): Promise<string> {
        // Log the initial file path
        console.log('Upload File Path:', filePath);

        if (!filePath) {
            console.error("Error: File path is undefined or null.");
            throw new Error("File path is undefined or null.");
        }

        // Get the file name from the path
        const fileName = path.basename(filePath);
        console.log('File Name:', fileName);

        // Check if the file exists before attempting to upload
        if (!fs.existsSync(filePath)) {
            console.error(`Error: File does not exist at path: ${filePath}`);
            throw new Error(`File does not exist: ${filePath}`);
        }

        // Read the file
        const fileData = fs.readFileSync(filePath);
        console.log('File read successfully.');

        // Prepare the upload parameters
        const params = {
            Bucket: this.bucketName,
            Key: fileName, // The name of the file in the bucket
            Body: fileData,
            ContentType: 'text/plain', // Change based on file type as needed
            ACL: 'public-read', // Add this line for public access
        };

        try {
            // Attempt to upload the file
            console.log('Starting file upload...');
            const data = await this.s3.upload(params).promise();
            console.log(`File uploaded successfully. ${data.Location}`);
            return data.Location; // Return the URL of the uploaded file
        } catch (error) {
            console.error('Error uploading the file:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
}
