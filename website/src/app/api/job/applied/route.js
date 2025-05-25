import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb'; // Your MongoDB connection util
import { Application } from '@/models/Application';
import { getUser } from '@/lib/getUser';

export async function POST(req) {
  const body = await req.json();
  try{
    const {clerk_id, job_id} = body;
    if (!clerk_id || !job_id) {
      return NextResponse.json(
        { error: 'clerk_id and job_id are required' },
        { status: 400 }
      );
    }
    await connectToDB(); // Ensure DB is connected


    const user = await getUser(clerk_id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }


    console.log('User:', user._id.toString());
    console.log('Job ID:', job_id);

    const applicatons = await Application.find({});
    console.log('Applications:', applicatons.length);

    const existingApplication = applicatons.find(
      (application) => application.jobPosting == job_id && application.applicant == user._id.toString()
    );
    console.log('Existing Application:', existingApplication);
    if (existingApplication) {
      return NextResponse.json({
        applied: true
      });
    }

    return NextResponse.json({
        applied: false
    });
  }catch (error) {
    console.error('Error in POST /api/job/applied:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }

}