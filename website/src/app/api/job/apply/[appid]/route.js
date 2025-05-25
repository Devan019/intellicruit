import {connectToDB} from "@/lib/mongodb"
import {JobPosting} from "@/models/Job";
import {NextResponse} from "next/server";
import {Application} from "@/models/Application";


export async function GET(req, { params }) {
  const {appid} = params;

  try {
    await connectToDB();
    const applications = await Application.findById(appid)
    return new NextResponse({
      applications : applications
    })
  } catch (error) {
    console.error("Error fetching applications:", error);
    return new NextResponse("Internal Server Error", {status: 500});
  }
}

export async function DELETE(req, { params }) {
  const {appid} = params;

  try {
    await connectToDB();
    const application = await Application.findByIdAndDelete(appid);
    if (!application) {
      return new NextResponse("Application not found", {status: 404});
    }
    return new NextResponse("Application deleted successfully", {status: 200});
  } catch (error) {
    console.error("Error deleting application:", error);
    return new NextResponse("Internal Server Error", {status: 500});
  }
}

export async function PUT(req, { params }) {
  const {appid} = params;
  const data = await req.json();

  try {
    await connectToDB();
    const application = await Application.findByIdAndUpdate(IconAppWindowid, data, {new: true});
    if (!application) {
      return new NextResponse("Application not found", {status: 404});
    }
    return new NextResponse(JSON.stringify(application), {status: 200});
  } catch (error) {
    console.error("Error updating application:", error);
    return new NextResponse("Internal Server Error", {status: 500});
  }
}