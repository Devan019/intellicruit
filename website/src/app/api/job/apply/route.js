import { connectToDB } from "@/lib/mongodb"
import { JobPosting } from "@/models/Job";
import { Application } from "@/models/Application";
import UserModel from "@/models/User";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";


export async function POST(req) {
  const { clerk_id, jobid, data } = await req.json();

  console.log("Received data:", clerk_id, jobid, data);
  try {
    await connectToDB();
    const job = await JobPosting.findById(jobid);
    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    const user = await getUser(clerk_id);
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }


    const userid = user._id;

    if (userid && data.resume) {
      const user = await UserModel.findByIdAndUpdate(userid, { $set: { resume_url: data.resume || null } }, { new: true });
      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }
    }

    console.log(data)


    const application = new Application({
      ...data,
      jobPosting: jobid,
      applicant: userid
    });

    const savedapp = await application.save();
    return NextResponse.json({
      application: savedapp,
    }, { status: 201 });
  } catch (error) {
    console.error("Error applying for job:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


