"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RoommateCard from "@/components/RoommateCard";

export default function FindRoommatesPage() {
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // 1. Retrieve the viewer's profile details and check completion status
  useEffect(() => {
    if (session) {
      setTimeout(() => setProfileLoading(true), 0);
      fetch("/api/profiles")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setProfile(data);
          setProfileLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching profile:", err);
          setTimeout(() => setProfileLoading(false), 0);
        });
    } else if (!isPending) {
      setTimeout(() => setProfileLoading(false), 0);
    }
  }, [session, isPending]);

  // 2. Fetch matches once the viewer profile is confirmed complete
  useEffect(() => {
    if (profile && profile.profileComplete) {
      setTimeout(() => setMatchesLoading(true), 0);
      fetch("/api/match")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setMatches(data);
          setMatchesLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching matches:", err);
          setMatchesLoading(false);
        });
    }
  }, [profile]);

  if (isPending || profileLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/3 bg-muted" />
          <Skeleton className="h-4 w-1/2 bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border bg-card/20 rounded-xl p-5 space-y-4">
              <Skeleton className="h-6 w-3/4 bg-muted" />
              <Skeleton className="h-4 w-1/2 bg-muted" />
              <Skeleton className="h-16 w-full bg-muted" />
              <Skeleton className="h-8 w-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. User is not authenticated
  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md text-card-foreground text-center shadow-lg z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-foreground">Find Roommates</CardTitle>
            <CardDescription className="font-semibold text-muted-foreground text-sm">
              Sign in to RoomieFit to browse matching student profiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild className="w-full font-bold shadow-md h-10">
              <Link href="/sign-in">Sign In Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. User profile setup is incomplete
  if (!profile || !profile.profileComplete) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md text-card-foreground text-center shadow-lg z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-foreground">Complete Your Profile</CardTitle>
            <CardDescription className="font-semibold text-muted-foreground text-sm">
              To match you with compatible roommates, we need you to finish setting up your lifestyle profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground font-semibold leading-normal">
              Fill out details such as budget limits, sleep patterns, cleanliness levels, and social habits to enable compatibility match recommendations.
            </p>
            <Button asChild className="w-full font-bold shadow-md h-10">
              <Link href="/dashboard/profile">Setup Lifestyle Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 5. Render list of matching roommate candidates
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative flex-grow">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="border-b border-border pb-6 z-10 relative">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Find Roommates
        </h1>
        <p className="text-muted-foreground font-semibold mt-1">
          Seekers in {profile.targetCity} sorted by lifestyle compatibility
        </p>
      </div>

      <div className="z-10 relative">
        {matchesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-border bg-card/20 rounded-xl p-5 space-y-4">
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
                <Skeleton className="h-16 w-full bg-muted" />
                <Skeleton className="h-8 w-full bg-muted" />
              </div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((item) => (
              <RoommateCard key={item.userId} profile={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-border border-dashed rounded-2xl bg-card/20 max-w-md mx-auto">
            <p className="text-foreground font-bold text-lg mb-1">No Matches Found</p>
            <p className="text-muted-foreground font-semibold text-sm">
              We couldn&apos;t find any other completed seeker profiles in {profile.targetCity} yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
