
import {Application} from "@/models/Application";
import {connectToDB} from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    await connectToDB();

    const applications = await Application.find({jobPosting: id});

    if (applications === null) {
      return new NextResponse("Applications not found", { status: 404 });
    }

    return NextResponse.json({ count: applications.length }, { status: 200 });
  } catch (error) {
    console.error("Error fetching application count:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}