import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const user = await UserModel.findOne({ clerk_id: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user profile data
    const profileData = {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      jobTitle: user.jobTitle || "",
      linkedinUrl: user.linkedinUrl || "",
      portfolioUrl: user.portfolioUrl || "",
      skills: user.skills || [],
      experience: user.experience || [],
      education: user.education || [],
      profileCompleted: user.profileCompleted || false,
      lastProfileUpdate: user.lastProfileUpdate || null,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Request body:", body);
    // Basic validation
    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Calculate profile completion
    const hasBasicInfo = body.firstName && body.lastName && body.phone;
    const hasSkillsOrExperience =
      (body.skills && body.skills.length > 0) ||
      (body.experience && body.experience.length > 0);
    const profileCompleted = Boolean(hasBasicInfo && hasSkillsOrExperience);

    const updatedUser = await UserModel.findOneAndUpdate(
      { clerk_id: userId },
      {
        $set: {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          address: body.address,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          jobTitle: body.jobTitle,
          linkedinUrl: body.linkedinUrl,
          portfolioUrl: body.portfolioUrl,
          skills: body.skills,
          experience: body.experience,
          education: body.education,
          profileCompleted: profileCompleted,
          lastProfileUpdate: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      city: updatedUser.city,
      state: updatedUser.state,
      zipCode: updatedUser.zipCode,
      jobTitle: updatedUser.jobTitle,
      linkedinUrl: updatedUser.linkedinUrl,
      portfolioUrl: updatedUser.portfolioUrl,
      skills: updatedUser.skills,
      experience: updatedUser.experience,
      education: updatedUser.education,
      profileCompleted: updatedUser.profileCompleted,
      lastProfileUpdate: updatedUser.lastProfileUpdate,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
