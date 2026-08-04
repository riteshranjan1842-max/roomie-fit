import { getSession } from "@/lib/get-session";
import { getDb } from "@/lib/mongodb";
import { computeCompatibility } from "@/lib/compatibility";
import { ObjectId } from "mongodb";

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    
    let userId;
    try {
      userId = new ObjectId(session.user.id);
    } catch (err) {
      userId = session.user.id;
    }

    // 1. Fetch current signed-in user's profile
    const currentProfile = await db.collection("profiles").findOne({ userId });
    if (!currentProfile || !currentProfile.profileComplete) {
      return Response.json(
        { error: "Please complete your profile before finding matches" },
        { status: 400 }
      );
    }

    // 2. Fetch other completed profiles in the same target city
    const targetCityQuery = currentProfile.targetCity
      ? { $regex: new RegExp("^" + currentProfile.targetCity.trim() + "$", "i") }
      : null;

    const matchStage = {
      userId: { $ne: userId },
      profileComplete: true,
    };

    if (targetCityQuery) {
      matchStage.targetCity = targetCityQuery;
    }

    const pipeline = [
      { $match: matchStage },
      // Join account details (name, email, avatar)
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];

    const otherProfiles = await db.collection("profiles").aggregate(pipeline).toArray();

    // 3. Compute compatibility score for each match
    const scoredMatches = otherProfiles.map((profile) => {
      const { score, breakdown } = computeCompatibility(currentProfile, profile);
      return {
        ...profile,
        compatibilityScore: score,
        compatibilityBreakdown: breakdown,
      };
    });

    // 4. Sort by score descending (highest compatibility match first)
    scoredMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return Response.json(scoredMatches);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
