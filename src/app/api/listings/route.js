import { getSession } from "@/lib/get-session";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const roomType = searchParams.get("roomType");
    const minBudget = searchParams.get("minBudget");
    const maxBudget = searchParams.get("maxBudget");

    const query = { status: "active" };

    if (city) {
      query.city = { $regex: new RegExp(city.trim(), "i") };
    }
    if (roomType) {
      query.roomType = roomType;
    }
    
    if (minBudget || maxBudget) {
      query.rent = {};
      if (minBudget) query.rent.$gte = Number(minBudget);
      if (maxBudget) query.rent.$lte = Number(maxBudget);
    }

    const db = getDb();
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "profiles",
          localField: "ownerId",
          foreignField: "userId",
          as: "ownerProfile",
        },
      },
      { $unwind: { path: "$ownerProfile", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ];

    const listings = await db.collection("listings").aggregate(pipeline).toArray();

    return Response.json(listings);
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

    let ownerId;
    try {
      ownerId = new ObjectId(session.user.id);
    } catch (err) {
      ownerId = session.user.id;
    }

    const listingData = {
      ownerId,
      title: body.title || "Untitled Room",
      city: body.city || "",
      locality: body.locality || "",
      roomType: body.roomType || "single",
      rent: Number(body.rent) || 0,
      deposit: Number(body.deposit) || 0,
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      photos: Array.isArray(body.photos) ? body.photos : [],
      description: body.description || "",
      availableFrom: body.availableFrom ? new Date(body.availableFrom) : new Date(),
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = getDb();
    const result = await db.collection("listings").insertOne(listingData);
    const newListing = await db.collection("listings").findOne({ _id: result.insertedId });

    return Response.json(newListing, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
