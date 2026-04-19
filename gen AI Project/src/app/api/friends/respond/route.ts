import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Friendship from "@/models/Friendship";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { requestId, action } = await req.json();
    if (!requestId || !["accepted", "declined"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await connectMongo();
    const userId = (session.user as any).id;

    const request = await Friendship.findOne({ _id: requestId, recipientId: userId, status: "pending" });
    if (!request) {
      return NextResponse.json({ error: "Friend request not found or unauthorized to respond" }, { status: 404 });
    }

    request.status = action;
    await request.save();

    return NextResponse.json({ message: `Request ${action}`, request }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to respond to request" }, { status: 500 });
  }
}
