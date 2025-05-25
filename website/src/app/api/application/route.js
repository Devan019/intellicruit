import { NextResponse } from 'next/server';
import { Application } from '@/models/Application';
import { connectToDB } from '@/lib/mongodb';

export async function GET(req){

  try {
    await connectToDB();
    const application = await Application.find({}).populate('jobPosting').exec();
    if  (!application) {
      return new NextResponse('Application not found', { status: 404 });
    } 

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req) {
  const data = await req.json();

  try {
    await connectToDB();
    const newApplication = new Application(data);
    await newApplication.save();
    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

