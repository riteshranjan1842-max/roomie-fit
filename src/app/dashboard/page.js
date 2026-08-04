import { getSession } from "@/lib/get-session";
import { getDb } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const db = getDb();
  let userId;
  try {
    userId = new ObjectId(session.user.id);
  } catch (err) {
    userId = session.user.id;
  }

  // 1. Fetch user profile to check completion status
  const profile = await db.collection("profiles").findOne({ userId });
  const profileComplete = !!(profile && profile.profileComplete);

  // 2. Fetch user's listings
  const rawListings = await db
    .collection("listings")
    .find({ ownerId: userId })
    .sort({ createdAt: -1 })
    .toArray();

  // Serialize MongoDB Object IDs and Dates
  const listings = rawListings.map((listing) => ({
    ...listing,
    _id: listing._id.toString(),
    ownerId: listing.ownerId.toString(),
    availableFrom: listing.availableFrom ? listing.availableFrom.toISOString() : null,
    createdAt: listing.createdAt ? listing.createdAt.toISOString() : null,
    updatedAt: listing.updatedAt ? listing.updatedAt.toISOString() : null,
  }));

  return (
    <DashboardClient
      userName={session.user?.name || "Roommate Seeker"}
      initialProfileComplete={profileComplete}
      initialListings={listings}
    />
  );
}
