"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { matchLabel } from "@/lib/compatibility";

export default function RoommateCard({ profile }) {
  const { userId, age, gender, targetCity, budgetMin, budgetMax, bio, user, compatibilityScore } = profile;

  const displayName = user?.name || "Roommate Seeker";
  const descSnippet = bio && bio.length > 100
    ? bio.substring(0, 100) + "..."
    : bio || "No biography provided.";

  let badgeEl = null;
  if (compatibilityScore !== undefined && compatibilityScore !== null) {
    const labelInfo = matchLabel(compatibilityScore);
    const colorMap = {
      emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
    const badgeColors = colorMap[labelInfo.color] || "bg-muted text-muted-foreground border-border";

    badgeEl = (
      <Badge variant="outline" className={`font-bold border px-2 py-0.5 rounded-full ${badgeColors}`}>
        {compatibilityScore}% Match ({labelInfo.label})
      </Badge>
    );
  }

  return (
    <Card className="flex flex-col border-border bg-card/60 backdrop-blur-md text-card-foreground shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl font-bold text-foreground line-clamp-1 leading-snug">
            {displayName}
          </CardTitle>
          {badgeEl}
        </div>
        <CardDescription className="text-sm font-semibold text-muted-foreground line-clamp-1 capitalize">
          {age ? `${age} y/o • ` : ""}{gender ? `${gender} • ` : ""}Target: {targetCity || "Anywhere"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {descSnippet}
        </p>
        
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Budget Range:</span>
          <span className="text-lg font-black text-foreground">₹{budgetMin || 0} - ₹{budgetMax || 0}</span>
          <span className="text-[10px] font-bold text-muted-foreground">/ month</span>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border flex flex-col items-stretch bg-background/20 rounded-b-lg">
        <Button asChild className="w-full font-bold shadow-sm" size="sm">
          <Link href={`/roommates/${userId}`}>
            View Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
