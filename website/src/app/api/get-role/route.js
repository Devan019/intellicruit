import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

//getb role of current user

export async function GET(req) {
    try {
        console.log("Request to get role received");
        const { userId } = getAuth(req);
        console.log("User ID:", userId);
    
        if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    
        const user = await clerkClient.users.getUser(userId);
        console.log("User data:", user);
        console.log("User public metadata:", user.publicMetadata);
    
        const role = user.publicMetadata?.role || "USER"; // Default to "USER" if no role is set
    
        return NextResponse.json({ role });
    } catch (error) {
        console.error("Error getting role:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    }