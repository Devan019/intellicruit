import {JobPosting} from "@/models/Job";
import {connectToDB} from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";

export async function GET(req, { params }) {
  const { id } = params;
  // console.log("Fetching jobs for user ID:", id);
  const user = await getUser(id);

  if(!user){
    return new NextResponse("User not found", { status: 404 });
  }

  console.log("User ID:", user._id);
  try {
    await connectToDB();
    const jobs = await JobPosting.find({createdBy: user._id});
    if (!jobs || jobs.length === 0) {
      return new NextResponse("Job not found", { status: 404 });
    }
    return  NextResponse.json({
      jobs:jobs
    })
  } catch (error) {
    console.error("Error fetching job:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
