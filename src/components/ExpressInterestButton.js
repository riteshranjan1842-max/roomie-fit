"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ExpressInterestButton({ toUserId, listingId, initialAlreadyExpressed, isOwner, isAuthenticated }) {
  const [loading, setLoading] = useState(false);
  const [expressed, setExpressed] = useState(initialAlreadyExpressed);
  const router = useRouter();

  if (isOwner) {
    return null; // Hide button entirely if viewer is listing owner
  }

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to express interest.");
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId, listingId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to express interest.");
      }

      toast.success("Interest expressed successfully!");
      setExpressed(true);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={expressed || loading}
      className="w-full font-bold shadow-md h-10"
    >
      {loading ? "Sending..." : expressed ? "Interest Expressed" : "Express Interest"}
    </Button>
  );
}
