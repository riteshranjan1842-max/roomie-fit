"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewListingClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    city: "",
    locality: "",
    roomType: "",
    rent: "",
    deposit: "",
    amenities: "",
    availableFrom: "",
    description: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, roomType: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amenitiesArray = formData.amenities
        ? formData.amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const payload = {
        ...formData,
        rent: Number(formData.rent) || 0,
        deposit: formData.deposit ? Number(formData.deposit) : null,
        amenities: amenitiesArray,
      };

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create listing.");
      }

      const newListing = await response.json();
      toast.success("Listing created successfully!");
      router.push(`/listings/${newListing._id}`);
    } catch (err) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-background px-4 py-12 text-foreground relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-2xl border-border bg-card/60 backdrop-blur-md text-card-foreground shadow-xl z-10">
        <CardHeader className="border-b border-border mb-6">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Post a Room Listing
          </CardTitle>
          <CardDescription className="text-muted-foreground font-semibold">
            Post an active room or apartment listing for students to view and express interest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold text-foreground">Listing Title</Label>
              <Input
                id="title"
                placeholder="e.g. Spacious Bedroom near Campus"
                value={formData.title}
                onChange={handleChange}
                required
                className="font-bold border-input bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="font-bold text-foreground">City</Label>
                <Input
                  id="city"
                  placeholder="e.g. New York"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="font-bold border-input bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locality" className="font-bold text-foreground">Locality (Optional)</Label>
                <Input
                  id="locality"
                  placeholder="e.g. Brooklyn"
                  value={formData.locality}
                  onChange={handleChange}
                  className="font-bold border-input bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label className="font-bold text-foreground mb-2">Room Type</Label>
                <Select value={formData.roomType} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full justify-between font-bold bg-background border-input">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-card-foreground">
                    <SelectItem value="single" className="font-bold">Single Room</SelectItem>
                    <SelectItem value="shared" className="font-bold">Shared Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableFrom" className="font-bold text-foreground">Available From</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  value={formData.availableFrom}
                  onChange={handleChange}
                  required
                  className="font-bold border-input bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent" className="font-bold text-foreground">Monthly Rent (₹)</Label>
                <Input
                  id="rent"
                  type="number"
                  placeholder="e.g. 1000"
                  value={formData.rent}
                  onChange={handleChange}
                  required
                  className="font-bold border-input bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit" className="font-bold text-foreground">Security Deposit (₹ - Optional)</Label>
                <Input
                  id="deposit"
                  type="number"
                  placeholder="e.g. 1000"
                  value={formData.deposit}
                  onChange={handleChange}
                  className="font-bold border-input bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities" className="font-bold text-foreground">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                placeholder="wifi, ac, laundry, parking"
                value={formData.amenities}
                onChange={handleChange}
                className="font-bold border-input bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold text-foreground">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the room, layout, apartment vibes, and preferences..."
                value={formData.description}
                onChange={handleChange}
                required
                className="font-semibold min-h-24 border-input bg-background"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md h-10 active:scale-[0.99]"
            >
              {loading ? "Publishing Listing..." : "Publish Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
