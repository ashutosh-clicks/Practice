import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Friendship from "@/models/Friendship";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const userId = (session.user as any).id;

    // Fetch accepted friendships
    const accepted = await Friendship.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: "accepted"
    })
    .populate("requesterId", "name email")
    .populate("recipientId", "name email")
    .lean();

    // Map the actual friend details (excluding the current user)
    const friendsList = accepted.map((f: any) => {
      if (f.requesterId._id.toString() === userId) {
        return f.recipientId;
      }
      return f.requesterId;
    });

    // Fetch pending incoming requests
    const pendingIncoming = await Friendship.find({
      recipientId: userId,
      status: "pending"
    })
    .populate("requesterId", "name email")
    .lean();

    // Fetch pending outgoing requests
    const pendingOutgoing = await Friendship.find({
      requesterId: userId,
      status: "pending"
    })
    .populate("recipientId", "name email")
    .lean();

    return NextResponse.json({ 
      friends: friendsList, 
      incomingRequests: pendingIncoming,
      outgoingRequests: pendingOutgoing 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch friends" }, { status: 500 });
  }
}

// Send Friend Request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { recipientId } = await req.json();
    if (!recipientId) return NextResponse.json({ error: "Recipient ID required" }, { status: 400 });

    await connectMongo();
    const userId = (session.user as any).id;

    if (userId === recipientId) {
      return NextResponse.json({ error: "Cannot send request to yourself" }, { status: 400 });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check for existing friendship relation
    const existing = await Friendship.findOne({
      $or: [
        { requesterId: userId, recipientId: recipientId },
        { requesterId: recipientId, recipientId: userId }
      ]
    });

    if (existing) {
      if (existing.status === "accepted") return NextResponse.json({ error: "Already friends" }, { status: 400 });
      return NextResponse.json({ error: "A request is already pending or declined between these users" }, { status: 400 });
    }

    const newRequest = await Friendship.create({
      requesterId: userId,
      recipientId: recipientId,
      status: "pending"
    });

    return NextResponse.json({ message: "Friend request sent", request: newRequest }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send request" }, { status: 500 });
  }
}
