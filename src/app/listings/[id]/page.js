import { getSession } from "@/lib/get-session";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { computeCompatibility, matchLabel } from "@/lib/compatibility";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExpressInterestButton from "@/components/ExpressInterestButton";

export default async function ListingDetailPage({ params }) {
  const session = await getSession();
  const { id } = await params;
  const db = getDb();

  let listingId;
  try {
    listingId = new ObjectId(id);
  } catch (err) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-destructive font-bold">
        Invalid Listing ID format.
      </div>
    );
  }

  const listing = await db.collection("listings").findOne({ _id: listingId });
  if (!listing) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-foreground font-bold">
        Listing not found.
      </div>
    );
  }

  // Retrieve Owner details
  const ownerUser = await db.collection("users").findOne({ _id: listing.ownerId });
  const ownerProfile = await db.collection("profiles").findOne({ userId: listing.ownerId });

  // Determine relationship & compatibility
  let viewerProfile = null;
  let compatibilityScore = null;
  let isOwner = false;
  let alreadyExpressed = false;

  if (session) {
    let viewerId;
    try {
      viewerId = new ObjectId(session.user.id);
    } catch (err) {
      viewerId = session.user.id;
    }

    isOwner = listing.ownerId.toString() === viewerId.toString();

    viewerProfile = await db.collection("profiles").findOne({ userId: viewerId });
    if (viewerProfile && ownerProfile && viewerProfile.profileComplete && ownerProfile.profileComplete) {
      const { score } = computeCompatibility(viewerProfile, ownerProfile);
      compatibilityScore = score;
    }

    // Check if interest has already been declared
    const existingInterest = await db.collection("interests").findOne({
      fromUserId: viewerId,
      toUserId: listing.ownerId,
      listingId: listing._id,
    });
    alreadyExpressed = !!existingInterest;
  }

  // Format move-in date
  const formattedDate = listing.availableFrom
    ? new Date(listing.availableFrom).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Immediate";

  // Build compatibility styling if matched
  let compatBadge = null;
  if (compatibilityScore !== null) {
    const labelInfo = matchLabel(compatibilityScore);
    const colorMap = {
      emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
    const badgeColors = colorMap[labelInfo.color] || "bg-muted text-muted-foreground border-border";

    compatBadge = (
      <Badge variant="outline" className={`font-bold border px-3 py-1 rounded-full text-xs ${badgeColors}`}>
        Roomie compatibility: {compatibilityScore}% ({labelInfo.label})
      </Badge>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 relative flex-grow">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative z-10">
        
        {/* Listing Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card/60 backdrop-blur-md text-card-foreground shadow-lg">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start gap-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                    {listing.title}
                  </h1>
                  <Badge variant="secondary" className="capitalize font-bold bg-primary/10 text-primary border-primary/20 shrink-0">
                    {listing.roomType} Room
                  </Badge>
                </div>
                <CardDescription className="text-muted-foreground font-semibold text-sm">
                  {listing.locality ? `${listing.locality}, ` : ""}{listing.city}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* Financials & Timeline Row */}
              <div className="grid grid-cols-3 gap-4 border-b border-border pb-6 text-center">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Rent</span>
                  <p className="text-2xl font-black text-foreground">₹{listing.rent}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Deposit</span>
                  <p className="text-2xl font-black text-foreground">₹{listing.deposit || 0}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Move-in Date</span>
                  <p className="text-sm font-bold text-foreground mt-1.5">{formattedDate}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">About the space</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
                  {listing.description}
                </p>
              </div>

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Amenities Included</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {listing.amenities.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="capitalize font-bold border-border bg-background/50 px-2 py-0.5">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Owner Info & Actions Card */}
        <div className="space-y-6">
          <Card className="border-border bg-card/60 backdrop-blur-md text-card-foreground shadow-lg">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Flat Owner Profile
              </CardTitle>
              <CardDescription className="font-semibold text-muted-foreground">
                Listed by {ownerUser?.name || "Roommate Owner"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              
              {/* Bio snippet */}
              {ownerProfile?.bio && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bio</span>
                  <p className="text-xs italic text-foreground font-semibold leading-normal">
                    &quot;{ownerProfile.bio}&quot;
                  </p>
                </div>
              )}

              {/* Lifestyle Habits List */}
              {ownerProfile ? (
                <div className="space-y-3 pt-1 border-t border-border/80">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Lifestyle Profile</span>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground font-semibold">Sleep Schedule</span>
                      <p className="font-bold text-foreground capitalize">{ownerProfile.sleepSchedule?.replace("_", " ")}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground font-semibold">Cleanliness</span>
                      <p className="font-bold text-foreground">{ownerProfile.cleanliness} / 5</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground font-semibold">Food Preference</span>
                      <p className="font-bold text-foreground capitalize">{ownerProfile.foodPreference?.replace("_", " ")}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground font-semibold">Smoking</span>
                      <p className="font-bold text-foreground capitalize">{ownerProfile.smoking}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground font-semibold">Drinking</span>
                      <p className="font-bold text-foreground capitalize">{ownerProfile.drinking}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground font-semibold">Socializing</span>
                      <p className="font-bold text-foreground capitalize">{ownerProfile.socializing}</p>
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <span className="text-muted-foreground font-semibold">Noise Tolerance</span>
                      <p className="font-bold text-foreground capitalize">{ownerProfile.noiseTolerance?.replace("_", " ")}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs italic text-muted-foreground">
                  Owner has not created a detailed lifestyle profile yet.
                </div>
              )}

              {/* Compatibility score if present */}
              {compatBadge && (
                <div className="pt-2 border-t border-border flex justify-center">
                  {compatBadge}
                </div>
              )}

              {/* Call to action (Express Interest) */}
              {!isOwner && (
                <div className="pt-2">
                  <ExpressInterestButton
                    toUserId={listing.ownerId.toString()}
                    listingId={listing._id.toString()}
                    initialAlreadyExpressed={alreadyExpressed}
                    isOwner={isOwner}
                    isAuthenticated={!!session}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
