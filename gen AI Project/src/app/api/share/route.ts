import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import FlashcardDeck from "@/models/FlashcardDeck";
import Quiz from "@/models/Quiz";
import RevisionNotes from "@/models/RevisionNotes";
import Friendship from "@/models/Friendship";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resourceId, resourceType, friendId } = await req.json();
    
    if (!resourceId || !resourceType || !friendId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    await connectMongo();
    const userId = (session.user as any).id;
    const friendObjectId = new mongoose.Types.ObjectId(friendId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Verify friendship exists and is accepted
    const friendship = await Friendship.findOne({
      $or: [
        { requesterId: userObjectId, recipientId: friendObjectId },
        { requesterId: friendObjectId, recipientId: userObjectId }
      ],
      status: "accepted"
    });

    if (!friendship) {
      return NextResponse.json({ error: "Can only share resources with your accepted friends." }, { status: 403 });
    }

    // Identify the target collection
    let ModelToUpdate;
    switch (resourceType) {
      case "material": ModelToUpdate = Material; break;
      case "flashcard": ModelToUpdate = FlashcardDeck; break;
      case "quiz": ModelToUpdate = Quiz; break;
      case "notes": ModelToUpdate = RevisionNotes; break;
      default: return NextResponse.json({ error: "Invalid resource type" }, { status: 400 });
    }

    // Verify ownership and update the sharedWith array
    const updatedResource = await (ModelToUpdate as any).findOneAndUpdate(
      { _id: resourceId, userId: userObjectId }, // MUST be the owner to share it
      { $addToSet: { sharedWith: friendObjectId } }, // $addToSet prevents duplicate array entries
      { new: true }
    );

    if (!updatedResource) {
      return NextResponse.json({ error: "Resource not found or you are not the owner" }, { status: 404 });
    }

    return NextResponse.json({ message: "Successfully shared resource" }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to share resource" }, { status: 500 });
  }
}
