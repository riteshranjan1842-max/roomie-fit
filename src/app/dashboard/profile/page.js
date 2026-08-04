import { getSession } from "@/lib/get-session";
import { getDb } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const db = getDb();
  let userId;
  try {
    userId = new ObjectId(session.user.id);
  } catch (e) {
    userId = session.user.id;
  }

  const rawProfile = await db.collection("profiles").findOne({ userId });

  let initialProfile = null;
  if (rawProfile) {
    initialProfile = {
      ...rawProfile,
      _id: rawProfile._id.toString(),
      userId: rawProfile.userId.toString(),
      moveInDate: rawProfile.moveInDate ? rawProfile.moveInDate.toISOString() : null,
      createdAt: rawProfile.createdAt ? rawProfile.createdAt.toISOString() : null,
      updatedAt: rawProfile.updatedAt ? rawProfile.updatedAt.toISOString() : null,
    };
  }

  return <ProfileClient initialProfile={initialProfile} />;
}
