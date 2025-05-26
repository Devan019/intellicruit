import { NextResponse } from 'next/server';
import { Application } from '@/models/Application';
import { connectToDB } from '@/lib/mongodb';
import { getAuth } from "@clerk/nextjs/server";
import { getUser } from '@/lib/getUser';
import { JobPosting } from '@/models/Job';

export async function GET(req) {

  try {
    await connectToDB();
    const { userId } = getAuth(req);

    const user = await getUser(userId);
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const jobposts = await JobPosting.find({ createdBy: user._id });
    // console.log(jobposts.length)
    let cnt = 0;
    const fetchcnt = async () => {
      jobposts.map(async (job, idx) => {
        const app = await Application.find({ jobPosting: job._id });
        console.log("app is found", app);
        if (app && app.length) {
          cnt += app.length;
        } else if (app) {
          cnt += 1
        }
      })
    }

    await fetchcnt();

    console.log("cnt ", cnt);
    return NextResponse.json({
      appcount: cnt
    });
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

