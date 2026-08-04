"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { matchLabel } from "@/lib/compatibility";
import { AlertTriangleIcon, HomeIcon, UserIcon, UsersIcon, Trash2Icon, CheckCircle2Icon } from "lucide-react";

export default function DashboardClient({ userName, initialProfileComplete, initialListings }) {
  const [profileComplete, setProfileComplete] = useState(initialProfileComplete);
  const [userListings, setUserListings] = useState(initialListings);
  
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [sentInterests, setSentInterests] = useState([]);
  const [interestsLoading, setInterestsLoading] = useState(true);

  // Deletion Modal state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const [resRec, resSent] = await Promise.all([
          fetch("/api/interests?type=received"),
          fetch("/api/interests?type=sent"),
        ]);
        if (resRec.ok) setReceivedInterests(await resRec.json());
        if (resSent.ok) setSentInterests(await resSent.json());
      } catch (err) {
        console.error("Error fetching interests:", err);
      } finally {
        setInterestsLoading(false);
      }
    };

    fetchInterests();
  }, []);

  const handleMarkFilled = async (listingId) => {
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "filled" }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updatedListing = await res.json();
      setUserListings((prev) => prev.map((item) => (item._id === listingId ? updatedListing : item)));
      toast.success("Listing marked as filled.");
    } catch (err) {
      toast.error(err.message || "Failed to update listing status.");
    }
  };

  const openDeleteConfirmation = (listing) => {
    setListingToDelete(listing);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingToDelete._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete listing");
      setUserListings((prev) => prev.filter((item) => item._id !== listingToDelete._id));
      toast.success("Listing deleted successfully.");
      setIsDeleteDialogOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete listing.");
    } finally {
      setDeleteLoading(false);
      setListingToDelete(null);
    }
  };

  const renderCompatibilityBadge = (score) => {
    const labelInfo = matchLabel(score);
    const colorMap = {
      emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
    const badgeColors = colorMap[labelInfo.color] || "bg-muted text-muted-foreground border-border";
    return (
      <Badge variant="outline" className={`font-bold border text-[10px] px-2 py-0.5 rounded-full shrink-0 ${badgeColors}`}>
        {score}% Match
      </Badge>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative flex-grow">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Welcome header */}
      <div className="border-b border-border pb-6 z-10 relative">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground font-semibold mt-1">
          Manage your flat listings, check matched roommates, and review expressed interests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start z-10 relative">
        
        {/* Left column: Profile incomplete alert + Shortcut tools + Listings management */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Onboarding Profile setup notice */}
          {!profileComplete && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive shadow-sm">
              <AlertTriangleIcon className="size-4 text-destructive shrink-0" />
              <AlertTitle className="font-extrabold text-foreground ml-2">Profile Setup Required</AlertTitle>
              <AlertDescription className="font-semibold text-xs ml-2">
                You haven&apos;t finished setting up your lifestyle profile yet. Complete it now so other students can match with you!{" "}
                <Link href="/dashboard/profile" className="font-extrabold underline hover:text-destructive/90 ml-1">
                  Setup Profile
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Action Navigation Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/dashboard/profile" className="group">
              <Card className="border-border bg-card/40 hover:bg-card/70 transition-all duration-200 cursor-pointer text-card-foreground p-5 flex flex-col items-center text-center gap-2 shadow-sm">
                <UserIcon className="size-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-sm text-foreground">Edit Profile</span>
                <span className="text-[10px] text-muted-foreground font-semibold">Change lifestyle habits</span>
              </Card>
            </Link>

            <Link href="/listings/new" className="group">
              <Card className="border-border bg-card/40 hover:bg-card/70 transition-all duration-200 cursor-pointer text-card-foreground p-5 flex flex-col items-center text-center gap-2 shadow-sm">
                <HomeIcon className="size-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-sm text-foreground">Post a Room</span>
                <span className="text-[10px] text-muted-foreground font-semibold">List a vacant room</span>
              </Card>
            </Link>

            <Link href="/roommates" className="group">
              <Card className="border-border bg-card/40 hover:bg-card/70 transition-all duration-200 cursor-pointer text-card-foreground p-5 flex flex-col items-center text-center gap-2 shadow-sm">
                <UsersIcon className="size-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-sm text-foreground">Find Roommates</span>
                <span className="text-[10px] text-muted-foreground font-semibold">Browse matching profiles</span>
              </Card>
            </Link>
          </div>

          {/* User's listings management */}
          <Card className="border-border bg-card/60 backdrop-blur-md text-card-foreground shadow-md">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-xl font-bold text-foreground">Your Room Listings</CardTitle>
              <CardDescription className="text-muted-foreground font-semibold">
                Manage your active flat postings or add new ones.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {userListings.length > 0 ? (
                <div className="divide-y divide-border space-y-4">
                  {userListings.map((listing, idx) => (
                    <div key={listing._id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${idx > 0 ? "pt-4" : ""}`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/listings/${listing._id}`} className="font-bold text-foreground hover:underline text-base">
                            {listing.title}
                          </Link>
                          <Badge variant={listing.status === "active" ? "default" : "secondary"} className="text-[10px] font-bold capitalize">
                            {listing.status}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground">
                          {listing.city} • ₹{listing.rent}/month
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {listing.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkFilled(listing._id)}
                            className="font-bold border-border h-8 text-xs flex items-center gap-1 hover:bg-accent"
                          >
                            <CheckCircle2Icon className="size-3 text-emerald-500" />
                            Mark Filled
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteConfirmation(listing)}
                          className="font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 text-xs flex items-center gap-1"
                        >
                          <Trash2Icon className="size-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground font-semibold text-sm mb-3">You haven&apos;t posted any room listings yet.</p>
                  <Button asChild size="sm" className="font-bold">
                    <Link href="/listings/new">Post a Room Listing</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Interests Sent/Received Tabs */}
        <div>
          <Card className="border-border bg-card/60 backdrop-blur-md text-card-foreground shadow-md">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-xl font-bold text-foreground">Interests Log</CardTitle>
              <CardDescription className="text-muted-foreground font-semibold">
                Track connections with prospective roommates.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="received" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-background border border-border rounded-lg p-1">
                  <TabsTrigger value="received" className="font-bold text-xs py-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Received ({receivedInterests.length})
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="font-bold text-xs py-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sent ({sentInterests.length})
                  </TabsTrigger>
                </TabsList>

                {/* Received Interests Tab */}
                <TabsContent value="received" className="pt-4 space-y-4 focus-visible:outline-none">
                  {interestsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full bg-muted" />
                      <Skeleton className="h-10 w-full bg-muted" />
                    </div>
                  ) : receivedInterests.length > 0 ? (
                    <div className="space-y-4 divide-y divide-border">
                      {receivedInterests.map((interest, idx) => (
                        <div key={interest._id} className={`flex items-start justify-between gap-3 ${idx > 0 ? "pt-4" : ""}`}>
                          <div className="space-y-1">
                            <Link href={`/roommates/${interest.fromUserId}`} className="font-bold text-foreground hover:underline text-sm block">
                              {interest.user?.name || "Roommate Seeker"}
                            </Link>
                            <span className="text-[10px] font-semibold text-muted-foreground block leading-normal">
                              {interest.listing
                                ? `Listing: ${interest.listing.title}`
                                : "Direct Roommate Inquiry"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium block">
                              {new Date(interest.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {renderCompatibilityBadge(interest.compatibilityScore)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
                      No interest requests received yet.
                    </div>
                  )}
                </TabsContent>

                {/* Sent Interests Tab */}
                <TabsContent value="sent" className="pt-4 space-y-4 focus-visible:outline-none">
                  {interestsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full bg-muted" />
                      <Skeleton className="h-10 w-full bg-muted" />
                    </div>
                  ) : sentInterests.length > 0 ? (
                    <div className="space-y-4 divide-y divide-border">
                      {sentInterests.map((interest, idx) => (
                        <div key={interest._id} className={`flex items-start justify-between gap-3 ${idx > 0 ? "pt-4" : ""}`}>
                          <div className="space-y-1">
                            <Link href={`/roommates/${interest.toUserId}`} className="font-bold text-foreground hover:underline text-sm block">
                              {interest.user?.name || "Roommate Owner"}
                            </Link>
                            <span className="text-[10px] font-semibold text-muted-foreground block leading-normal">
                              {interest.listing
                                ? `Listing: ${interest.listing.title}`
                                : "Direct Roommate Inquiry"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium block">
                              {new Date(interest.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {renderCompatibilityBadge(interest.compatibilityScore)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
                      You haven&apos;t declared interest in any users yet.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border-border bg-card text-card-foreground p-6 rounded-lg max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              Are you sure you want to delete listing <strong>&quot;{listingToDelete?.title}&quot;</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="font-bold border-border" disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteListing} className="font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
