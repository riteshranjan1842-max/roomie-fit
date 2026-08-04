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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "received"; // "sent" or "received"

    let userId;
    try {
      userId = new ObjectId(session.user.id);
    } catch (err) {
      userId = session.user.id;
    }

    const db = getDb();

    // Determine filter match stage and target join field
    const matchStage = {};
    if (type === "sent") {
      matchStage.fromUserId = userId;
    } else {
      matchStage.toUserId = userId;
    }

    const lookupField = type === "sent" ? "toUserId" : "fromUserId";

    const pipeline = [
      { $match: matchStage },
      // Join user account information
      {
        $lookup: {
          from: "users",
          localField: lookupField,
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      // Join roommate profile information
      {
        $lookup: {
          from: "profiles",
          localField: lookupField,
          foreignField: "userId",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      // Join listing details if referenced
      {
        $lookup: {
          from: "listings",
          localField: "listingId",
          foreignField: "_id",
          as: "listing",
        },
      },
      { $unwind: { path: "$listing", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ];

    const results = await db.collection("interests").aggregate(pipeline).toArray();

    return Response.json(results);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const toUserIdStr = body.toUserId;
    const listingIdStr = body.listingId;

    if (!toUserIdStr) {
      return Response.json({ error: "toUserId is required" }, { status: 400 });
    }

    let fromUserId;
    try {
      fromUserId = new ObjectId(session.user.id);
    } catch (err) {
      fromUserId = session.user.id;
    }

    let toUserId;
    try {
      toUserId = new ObjectId(toUserIdStr);
    } catch (err) {
      toUserId = toUserIdStr;
    }

    let listingId = null;
    if (listingIdStr) {
      try {
        listingId = new ObjectId(listingIdStr);
      } catch (err) {
        listingId = listingIdStr;
      }
    }

    const db = getDb();

    // Get profiles to calculate compatibility score
    const senderProfile = await db.collection("profiles").findOne({ userId: fromUserId });
    if (!senderProfile) {
      return Response.json(
        { error: "Please complete your profile first before expressing interest" },
        { status: 400 }
      );
    }

    const receiverProfile = await db.collection("profiles").findOne({ userId: toUserId });
    if (!receiverProfile) {
      return Response.json({ error: "Receiver profile not found" }, { status: 404 });
    }

    // Calculate compatibility score at interest creation
    const { score } = computeCompatibility(senderProfile, receiverProfile);

    const interestData = {
      fromUserId,
      toUserId,
      listingId,
      compatibilityScore: score,
      createdAt: new Date(),
    };

    const result = await db.collection("interests").insertOne(interestData);
    const newInterest = await db.collection("interests").findOne({ _id: result.insertedId });

    return Response.json(newInterest, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
