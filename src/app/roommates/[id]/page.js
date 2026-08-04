import { getSession } from "@/lib/get-session";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { computeCompatibility, matchLabel } from "@/lib/compatibility";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExpressInterestButton from "@/components/ExpressInterestButton";

export default async function RoommateDetailPage({ params }) {
  const session = await getSession();
  const { id } = await params;
  const db = getDb();

  // Find targeted roommate user and profile
  let targetUserId;
  try {
    targetUserId = new ObjectId(id);
  } catch (err) {
    targetUserId = id;
  }

  const roommateUser = await db.collection("users").findOne({ _id: targetUserId });
  const roommateProfile = await db.collection("profiles").findOne({ userId: targetUserId });

  if (!roommateProfile) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-foreground font-bold">
        Roommate profile not found.
      </div>
    );
  }

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

    isOwner = roommateProfile.userId.toString() === viewerId.toString();

    viewerProfile = await db.collection("profiles").findOne({ userId: viewerId });
    if (viewerProfile && viewerProfile.profileComplete && roommateProfile.profileComplete) {
      const { score } = computeCompatibility(viewerProfile, roommateProfile);
      compatibilityScore = score;
    }

    // Check if interest has already been declared (without listing, i.e., listingId is null or missing)
    const existingInterest = await db.collection("interests").findOne({
      fromUserId: viewerId,
      toUserId: roommateProfile.userId,
      listingId: null,
    });
    alreadyExpressed = !!existingInterest;
  }

  // Format move-in date
  const formattedDate = roommateProfile.moveInDate
    ? new Date(roommateProfile.moveInDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Flexible";

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 relative flex-grow">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative z-10">
        
        {/* Roommate Bio & Overview Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card/60 backdrop-blur-md text-card-foreground shadow-lg">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start gap-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                    {roommateUser?.name || "Roommate Seeker"}
                  </h1>
                  <Badge variant="secondary" className="capitalize font-bold bg-primary/10 text-primary border-primary/20 shrink-0">
                    {roommateProfile.gender}
                  </Badge>
                </div>
                <CardDescription className="text-muted-foreground font-semibold text-sm">
                  {roommateProfile.age ? `${roommateProfile.age} years old • ` : ""}Currently in {roommateProfile.currentCity}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* Target City & Budget Row */}
              <div className="grid grid-cols-3 gap-4 border-b border-border pb-6 text-center">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target City</span>
                  <p className="text-lg font-black text-foreground mt-1.5">{roommateProfile.targetCity}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Budget Range</span>
                  <p className="text-lg font-black text-foreground mt-1.5">
                    ₹{roommateProfile.budgetMin || 0} - ₹{roommateProfile.budgetMax || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Timeline</span>
                  <p className="text-xs font-bold text-foreground mt-2">{formattedDate}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">About me</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
                  {roommateProfile.bio || "No description provided."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lifestyle Details Card */}
        <div className="space-y-6">
          <Card className="border-border bg-card/60 backdrop-blur-md text-card-foreground shadow-lg">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Lifestyle Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground font-semibold">Sleep Schedule</span>
                  <p className="font-bold text-foreground capitalize">{roommateProfile.sleepSchedule?.replace("_", " ")}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground font-semibold">Cleanliness</span>
                  <p className="font-bold text-foreground">{roommateProfile.cleanliness} / 5</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground font-semibold">Food Preference</span>
                  <p className="font-bold text-foreground capitalize">{roommateProfile.foodPreference?.replace("_", " ")}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground font-semibold">Smoking</span>
                  <p className="font-bold text-foreground capitalize">{roommateProfile.smoking}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground font-semibold">Drinking</span>
                  <p className="font-bold text-foreground capitalize">{roommateProfile.drinking}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground font-semibold">Socializing</span>
                  <p className="font-bold text-foreground capitalize">{roommateProfile.socializing}</p>
                </div>
                <div className="space-y-0.5 col-span-2">
                  <span className="text-muted-foreground font-semibold">Noise Tolerance</span>
                  <p className="font-bold text-foreground capitalize">{roommateProfile.noiseTolerance?.replace("_", " ")}</p>
                </div>
              </div>

              {/* Compatibility score if present */}
              {compatBadge && (
                <div className="pt-2 border-t border-border flex justify-center">
                  {compatBadge}
                </div>
              )}

              {/* Call to action (Express Interest directly in the person) */}
              {!isOwner && (
                <div className="pt-2">
                  <ExpressInterestButton
                    toUserId={roommateProfile.userId.toString()}
                    listingId={null}
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
