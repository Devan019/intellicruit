import {JobPosting} from "@/models/Job";
import {connectToDB} from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    await connectToDB();
    const job = await JobPosting.findById(id);
    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }
    return new NextResponse(JSON.stringify(job), { status: 200 });
  } catch (error) {
    console.error("Error fetching job:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await connectToDB();
    const job = await JobPosting.findByIdAndDelete(id);
    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }
    return new NextResponse("Job deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting job:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();

  try {
    await connectToDB();
    const job = await JobPosting.findByIdAndUpdate(id, data, { new: true });  
    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }
    return new NextResponse(JSON.stringify(job), { status: 200 });
  } catch (error) {
    console.error("Error updating job:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
