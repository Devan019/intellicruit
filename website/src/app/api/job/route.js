import { NextResponse } from 'next/server';
import {connectToDB} from '@/lib/mongodb'; // Your MongoDB connection util
import {JobPosting} from '@/models/Job';

export async function POST(req) {
  try {
    await connectToDB(); // Ensure DB is connected

    const body = await req.json();
    
    const jobPosting = new JobPosting({
      title : body.jobDescription.title,
      department: body.jobDescription.department, 
      location: body.jobDescription.location,
      jobType: body.jobDescription.jobType || 'full-time',
      experienceLevel: body.jobDescription.experienceLevel || 'entry',
      description: body.jobDescription.description,
      responsibilities: body.jobDescription.responsibilities || [],
      requirements: body.jobDescription.requirements || [],
      skills: body.jobDescription.skills || [],
      benefits: body.jobDescription.benefits || [],
      salaryRange: {
        min: body.jobDescription.salaryRange?.min || '',
        max: body.jobDescription.salaryRange?.max || ''
      },
      applicationDeadline: body.jobDescription.applicationDeadline ? new Date(body.jobDescription.applicationDeadline) : null,
      aptitudeTest: body.aptitudeTest || null,
      settings: {
        allowApplications: body.settings?.allowApplications || true,
        allowResumeUpload: body.settings?.allowResumeUpload || true,
        allowCoverLetter: body.settings?.allowCoverLetter || true,
        allowPortfolio: body.settings?.allowPortfolio || false,
        allowReferences: body.settings?.allowReferences || false,
        allowAptitudeTest: body.settings?.allowAptitudeTest || false
      },
      company: body.company || 'Default Company',
      status: body.status || 'draft',
      createdBy: body.createdBy || null, // Assuming you have user ID from session or context
      createdAt: new Date(),
      updatedAt: new Date()


    });
    await jobPosting.save();

    return NextResponse.json(
      {
        message: 'Job posting created successfully',
        jobPosting,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating job posting:', error);
    return NextResponse.json(
      { error: 'Failed to create job posting' },
      { status: 500 }
    );
  }
}


export async function GET(req) {
  try {
    await connectToDB(); // Ensure DB is connected

    const jobPosting = await JobPosting.find({});

    if (!jobPosting) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(jobPosting, { status: 200 });
  } catch (error) {
    console.error('Error fetching job posting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job posting' },
      { status: 500 }
    );
  }
}