import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email query is required" }, { status: 400 });

    await connectMongo();

    // Exact email match for privacy (don't allow regex partial searches of all users)
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if searching for self
    if (normalizedEmail === session.user.email?.toLowerCase()) {
      return NextResponse.json({ error: "Cannot search for your own email" }, { status: 400 });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("name email _id").lean();

    if (!user) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    return NextResponse.json({ results: [user] }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 });
  }
}
