import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    // console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await req.json();
    // console.log("Role to assign:", role);

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const metadata = { role };

    await clerkClient.users.updateUser(userId, {
      publicMetadata: metadata,
    });


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
