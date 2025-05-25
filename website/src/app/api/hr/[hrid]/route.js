import {JobPosting} from "@/models/Job";
import {connectToDB} from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";

export async function GET(req, { params }) {
  const { hrid } = params;

  try {
    await connectToDB();

    const user = await getUser(hrid);
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const job = await JobPosting.find({
      createdBy : user._id,
    });
    if (!job) {
      return new NextResponse("Jobs not found", { status: 404 });
    }
    return  NextResponse.json({
      jobs  :job,
    })
  } catch (error) {
    console.error("Error fetching job:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
