import { getSession } from "@/lib/get-session";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDb();

    let listingId;
    try {
      listingId = new ObjectId(id);
    } catch (err) {
      return Response.json({ error: "Invalid Listing ID" }, { status: 400 });
    }

    const listing = await db.collection("listings").findOne({ _id: listingId });
    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    // Retrieve the listing owner's profile info
    const ownerProfile = await db.collection("profiles").findOne({ userId: listing.ownerId });

    return Response.json({ listing, ownerProfile: ownerProfile || null });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDb();

    let listingId;
    try {
      listingId = new ObjectId(id);
    } catch (err) {
      return Response.json({ error: "Invalid Listing ID" }, { status: 400 });
    }

    const listing = await db.collection("listings").findOne({ _id: listingId });
    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    // Verify ownership
    let currentUserId;
    try {
      currentUserId = new ObjectId(session.user.id);
    } catch (err) {
      currentUserId = session.user.id;
    }

    if (listing.ownerId.toString() !== currentUserId.toString()) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = [
      "title",
      "city",
      "locality",
      "roomType",
      "rent",
      "deposit",
      "amenities",
      "photos",
      "description",
      "availableFrom",
      "status"
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "rent" || field === "deposit") {
          updateData[field] = Number(body[field]);
        } else if (field === "availableFrom") {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    updateData.updatedAt = new Date();

    const updateResult = await db.collection("listings").findOneAndUpdate(
      { _id: listingId },
      { $set: updateData },
      { returnDocument: "after" }
    );

    const updatedListing = updateResult?.value || updateResult || await db.collection("listings").findOne({ _id: listingId });

    return Response.json(updatedListing);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDb();

    let listingId;
    try {
      listingId = new ObjectId(id);
    } catch (err) {
      return Response.json({ error: "Invalid Listing ID" }, { status: 400 });
    }

    const listing = await db.collection("listings").findOne({ _id: listingId });
    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    // Verify ownership
    let currentUserId;
    try {
      currentUserId = new ObjectId(session.user.id);
    } catch (err) {
      currentUserId = session.user.id;
    }

    if (listing.ownerId.toString() !== currentUserId.toString()) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("listings").deleteOne({ _id: listingId });

    return Response.json({ message: "Listing deleted successfully" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
