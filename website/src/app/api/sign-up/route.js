import { connectToDB } from "@/lib/mongodb";
import UserModel from "@/models/User";

export async function POST(request) {
    await connectToDB();
    
    try {
        const { clerk_id,email, name, resume_url } = await request.json();

        if (!clerk_id) {
            return new Response(JSON.stringify({ error: "Missing Clerk_id!" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const existingUser = await UserModel.findOne({ clerk_id });
        if (existingUser) {
            return new Response(JSON.stringify({ error: "User already exists!" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const newUser = new UserModel({
            clerk_id,
            email,
            name,
            resume_url: resume_url || null,
        });

        await newUser.save();

        return new Response(JSON.stringify({ message: "User created successfully!" }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.log("Error in sign-up route:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function PUT(request) {
    await connectToDB();
    try {
        const { clerk_id, resume_url } = await request.json();

        if (!clerk_id) {
            return new Response(JSON.stringify({ error: "Missing Clerk_id!" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const User = await UserModel.findOne({ clerk_id });

        if (!User) {
            return new Response(JSON.stringify({ error: "User not found!" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        User.resume_url = resume_url || null;

        await User.save();

        return new Response(JSON.stringify({ message: "User updated successfully!" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error in sign-up route:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function GET(request) {
    await connectToDB();
    try {
        const url = new URL(request.url);
        const clerk_id = url.searchParams.get("clerk_id");

        if (!clerk_id) {
            return new Response(JSON.stringify({ error: "Missing Clerk_id!" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const user = await UserModel.findOne({ clerk_id });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found!" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error in sign-up route:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}