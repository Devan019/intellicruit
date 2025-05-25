import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import { Application } from '@/models/Application';

export async function GET(req, {params}) {
  try {
    await connectToDB(); 

    const jobid = params.jobid; 

    if (!jobid) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const jobPosting = await Application.find({jobPosting: jobid})

    if (!jobPosting) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(jobPosting, { status: 200 });
  } catch (error) {
    console.error('Error fetching job posting:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}