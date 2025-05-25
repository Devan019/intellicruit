import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Convert buffer to base64 string
    const base64String = Buffer.from(buffer).toString('base64');
    
    // Create data URI
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary using the base64 data
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'resumes',
      resource_type: 'auto',
      
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}