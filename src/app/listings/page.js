"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ListingCard from "@/components/ListingCard";
import { computeCompatibility } from "@/lib/compatibility";

export default function ListingsBrowsePage() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState(null);

  const [city, setCity] = useState("");
  const [roomType, setRoomType] = useState("all");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch logged in user's profile to calculate compatibility scores on client-side
  useEffect(() => {
    if (session) {
      fetch("/api/profiles")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.profileComplete) {
            setUserProfile(data);
          }
        })
        .catch((err) => console.error("Error fetching user profile:", err));
    }
  }, [session]);

  useEffect(() => {
    const fetchListings = async () => {
      setTimeout(() => setLoading(true), 0);
      try {
        const params = new URLSearchParams();
        if (city.trim()) params.append("city", city.trim());
        if (roomType && roomType !== "all") params.append("roomType", roomType);
        if (minBudget) params.append("minBudget", minBudget);
        if (maxBudget) params.append("maxBudget", maxBudget);

        const res = await fetch(`/api/listings?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setListings(data);
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [city, roomType, minBudget, maxBudget]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative flex-grow">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6 z-10 relative">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Browse Flat Listings
          </h1>
          <p className="text-muted-foreground font-semibold mt-1">
            Find active room listings and compare matching scores
          </p>
        </div>
        <Button asChild className="font-bold shadow-md">
          <Link href="/listings/new">Post a Room Listing</Link>
        </Button>
      </div>

      {/* Search Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-border bg-card/40 backdrop-blur-md z-10 relative">
        <div className="space-y-1.5">
          <Label className="font-bold text-foreground text-xs">Target City</Label>
          <Input
            placeholder="e.g. New York"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-8 font-bold border-input bg-background/50 text-foreground"
          />
        </div>

        <div className="space-y-1.5 flex flex-col justify-end">
          <Label className="font-bold text-foreground text-xs mb-1.5">Room Type</Label>
          <Select value={roomType} onValueChange={setRoomType}>
            <SelectTrigger className="w-full justify-between h-8 font-bold bg-background/50 border-input text-foreground">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-card-foreground">
              <SelectItem value="all" className="font-bold">All Types</SelectItem>
              <SelectItem value="single" className="font-bold">Single Room</SelectItem>
              <SelectItem value="shared" className="font-bold">Shared Room</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="font-bold text-foreground text-xs">Min Rent (₹)</Label>
          <Input
            type="number"
            placeholder="Min"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            className="h-8 font-bold border-input bg-background/50 text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="font-bold text-foreground text-xs">Max Rent (₹)</Label>
          <Input
            type="number"
            placeholder="Max"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            className="h-8 font-bold border-input bg-background/50 text-foreground"
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="z-10 relative">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-border bg-card/20 rounded-xl p-5 space-y-4">
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
                <Skeleton className="h-20 w-full bg-muted" />
                <Skeleton className="h-8 w-full bg-muted" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              let score = null;
              if (userProfile && listing.ownerProfile) {
                const res = computeCompatibility(userProfile, listing.ownerProfile);
                score = res.score;
              }
              return (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  compatibilityScore={score}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-border border-dashed rounded-2xl bg-card/20 max-w-md mx-auto">
            <p className="text-foreground font-bold text-lg mb-1">No Listings Found</p>
            <p className="text-muted-foreground font-semibold text-sm">
              Try adjusting your search filters or target city.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
