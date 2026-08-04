import { getSession } from "@/lib/get-session";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  let userId;
  try {
    userId = new ObjectId(session.user.id);
  } catch (err) {
    userId = session.user.id;
  }

  const profile = await db.collection("profiles").findOne({ userId });
  return Response.json(profile || null);
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Validate required lifestyle fields
  const hasAge = body.age !== undefined && body.age !== null && body.age !== "";
  const hasGender = !!body.gender;
  const hasCurrentCity = !!body.currentCity;
  const hasTargetCity = !!body.targetCity;
  const hasSleep = !!body.sleepSchedule;
  const hasClean = body.cleanliness !== undefined && body.cleanliness !== null && body.cleanliness !== "";
  const hasFood = !!body.foodPreference;
  const hasSmoking = !!body.smoking;
  const hasDrinking = !!body.drinking;
  const hasSocial = !!body.socializing;
  const hasNoise = !!body.noiseTolerance;
  const hasBudgetMin = body.budgetMin !== undefined && body.budgetMin !== null && body.budgetMin !== "";
  const hasBudgetMax = body.budgetMax !== undefined && body.budgetMax !== null && body.budgetMax !== "";
  const hasMoveIn = !!body.moveInDate;
  const hasBio = typeof body.bio === "string" && body.bio.trim().length > 0;

  const profileComplete = !!(
    hasAge && hasGender && hasCurrentCity && hasTargetCity && hasSleep && 
    hasClean && hasFood && hasSmoking && hasDrinking && hasSocial && 
    hasNoise && hasBudgetMin && hasBudgetMax && hasMoveIn && hasBio
  );

  let userId;
  try {
    userId = new ObjectId(session.user.id);
  } catch (err) {
    userId = session.user.id;
  }

  const profileData = {
    userId,
    age: hasAge ? Number(body.age) : null,
    gender: body.gender || null,
    currentCity: body.currentCity || null,
    targetCity: body.targetCity || null,
    sleepSchedule: body.sleepSchedule || null,
    cleanliness: hasClean ? Number(body.cleanliness) : null,
    foodPreference: body.foodPreference || null,
    smoking: body.smoking || null,
    drinking: body.drinking || null,
    socializing: body.socializing || null,
    noiseTolerance: body.noiseTolerance || null,
    budgetMin: hasBudgetMin ? Number(body.budgetMin) : null,
    budgetMax: hasBudgetMax ? Number(body.budgetMax) : null,
    moveInDate: hasMoveIn ? new Date(body.moveInDate) : null,
    bio: body.bio ? body.bio.substring(0, 300) : "",
    profileComplete,
    updatedAt: new Date(),
  };

  const db = getDb();

  const updateResult = await db.collection("profiles").findOneAndUpdate(
    { userId },
    { 
      $set: profileData,
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true, returnDocument: "after" }
  );

  const updatedProfile = updateResult?.value || updateResult || await db.collection("profiles").findOne({ userId });

  return Response.json(updatedProfile);
}
