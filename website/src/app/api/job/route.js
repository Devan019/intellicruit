import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb'; // Your MongoDB connection util
import { JobPosting } from '@/models/Job';
import UserModel from '@/models/User';
export async function POST(req) {
  try {
    await connectToDB(); // Ensure DB is connected


    let body = await req.json();


    let clerk_id = body.clerk_id || null; // Assuming you have clerk_id from session or context
    if (!clerk_id) {
      const createdBy = body.createdBy || null; // Assuming you have user ID from session or context

      if (!createdBy) {
        return NextResponse.json(
          { error: 'CreatedBy field is required' },
          { status: 400 }
        );
      } else {

        const user = await UserModel.findById(createdBy);
        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        body.createdBy = user._id;
      }
    } else {
      const user = await UserModel.findOne({ clerk_id: clerk_id });
      body.createdBy = user._id;
    }




    const jobPosting = new JobPosting({
      title: body.jobDescription.title,
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
        enableAptitudeTest : body.settings.enableAptitudeTest || false,
        enableResumeScreening: body.settings.enableResumeScreening || false,
        autoScreening: body.settings.autoScreening || false,
        maxApplications: body.settings.maxApplications || 100,
        emailNotifications: body.settings.emailNotifications || true,
        publishImmediately: body.settings.publishImmediately || true
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