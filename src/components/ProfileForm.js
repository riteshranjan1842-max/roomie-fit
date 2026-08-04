"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfileForm({ initialProfile, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    currentCity: "",
    targetCity: "",
    sleepSchedule: "",
    cleanliness: 3,
    foodPreference: "",
    smoking: "",
    drinking: "",
    socializing: "",
    noiseTolerance: "",
    budgetMin: "",
    budgetMax: "",
    moveInDate: "",
    bio: "",
  });

  // Pre-fill fields if editing existing profile
  useEffect(() => {
    if (initialProfile) {
      let formattedDate = "";
      if (initialProfile.moveInDate) {
        formattedDate = new Date(initialProfile.moveInDate).toISOString().split("T")[0];
      }

      setTimeout(() => {
        setFormData({
          age: initialProfile.age ?? "",
          gender: initialProfile.gender ?? "",
          currentCity: initialProfile.currentCity ?? "",
          targetCity: initialProfile.targetCity ?? "",
          sleepSchedule: initialProfile.sleepSchedule ?? "",
          cleanliness: initialProfile.cleanliness ?? 3,
          foodPreference: initialProfile.foodPreference ?? "",
          smoking: initialProfile.smoking ?? "",
          drinking: initialProfile.drinking ?? "",
          socializing: initialProfile.socializing ?? "",
          noiseTolerance: initialProfile.noiseTolerance ?? "",
          budgetMin: initialProfile.budgetMin ?? "",
          budgetMax: initialProfile.budgetMax ?? "",
          moveInDate: formattedDate,
          bio: initialProfile.bio ?? "",
        });
      }, 0);
    }
  }, [initialProfile]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile.");
      }

      const savedProfile = await response.json();
      toast.success("Profile saved successfully!");

      if (onSaved) {
        onSaved(savedProfile);
      }
    } catch (err) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const bioLength = formData.bio ? formData.bio.length : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground border-b border-border pb-1">
            Basic Details
          </h3>

          <div className="space-y-2">
            <Label htmlFor="age" className="font-bold text-foreground">Age</Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="100"
              placeholder="e.g. 21"
              value={formData.age}
              onChange={handleChange}
              required
              className="font-bold border-input bg-background"
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="font-bold text-foreground mb-2">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(val) => handleSelectChange("gender", val)}
            >
              <SelectTrigger className="w-full justify-between font-bold bg-background border-input">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-card-foreground">
                <SelectItem value="male" className="font-bold">Male</SelectItem>
                <SelectItem value="female" className="font-bold">Female</SelectItem>
                <SelectItem value="other" className="font-bold">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentCity" className="font-bold text-foreground">Current City</Label>
            <Input
              id="currentCity"
              type="text"
              placeholder="e.g. Boston"
              value={formData.currentCity}
              onChange={handleChange}
              required
              className="font-bold border-input bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetCity" className="font-bold text-foreground">Target City</Label>
            <Input
              id="targetCity"
              type="text"
              placeholder="e.g. New York"
              value={formData.targetCity}
              onChange={handleChange}
              required
              className="font-bold border-input bg-background"
            />
          </div>
        </div>

        {/* Financials & Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground border-b border-border pb-1">
            Budget & Timeline
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin" className="font-bold text-foreground">Min Rent (₹)</Label>
              <Input
                id="budgetMin"
                type="number"
                placeholder="Min"
                value={formData.budgetMin}
                onChange={handleChange}
                required
                className="font-bold border-input bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMax" className="font-bold text-foreground">Max Rent (₹)</Label>
              <Input
                id="budgetMax"
                type="number"
                placeholder="Max"
                value={formData.budgetMax}
                onChange={handleChange}
                required
                className="font-bold border-input bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="moveInDate" className="font-bold text-foreground">Move-in Date</Label>
            <Input
              id="moveInDate"
              type="date"
              value={formData.moveInDate}
              onChange={handleChange}
              required
              className="font-bold border-input bg-background"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lifestyle Choices */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground border-b border-border pb-1">
            Lifestyle Habits
          </h3>

          <div className="space-y-2 flex flex-col">
            <Label className="font-bold text-foreground mb-2">Sleep Schedule</Label>
            <Select
              value={formData.sleepSchedule}
              onValueChange={(val) => handleSelectChange("sleepSchedule", val)}
            >
              <SelectTrigger className="w-full justify-between font-bold bg-background border-input">
                <SelectValue placeholder="Select sleep schedule" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-card-foreground">
                <SelectItem value="early_bird" className="font-bold">Early Bird</SelectItem>
                <SelectItem value="night_owl" className="font-bold">Night Owl</SelectItem>
                <SelectItem value="flexible" className="font-bold">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="font-bold text-foreground">Cleanliness Level</Label>
              <span className="text-xs bg-primary/20 text-primary-foreground font-bold px-2 py-0.5 rounded-full border border-primary/30">
                Score: {formData.cleanliness} / 5
              </span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[formData.cleanliness]}
              onValueChange={(val) => handleSelectChange("cleanliness", val[0])}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold px-1">
              <span>Very Messy (1)</span>
              <span>Average (3)</span>
              <span>Spick & Span (5)</span>
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="font-bold text-foreground mb-2">Food Preference</Label>
            <Select
              value={formData.foodPreference}
              onValueChange={(val) => handleSelectChange("foodPreference", val)}
            >
              <SelectTrigger className="w-full justify-between font-bold bg-background border-input">
                <SelectValue placeholder="Select food preference" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-card-foreground">
                <SelectItem value="veg" className="font-bold">Vegetarian</SelectItem>
                <SelectItem value="non_veg" className="font-bold">Non-Vegetarian</SelectItem>
                <SelectItem value="vegan" className="font-bold">Vegan</SelectItem>
                <SelectItem value="no_preference" className="font-bold">No Preference</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Social Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground border-b border-border pb-1">
            Social & Habits
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label className="font-bold text-foreground mb-2">Smoking</Label>
              <Select
                value={formData.smoking}
                onValueChange={(val) => handleSelectChange("smoking", val)}
              >
                <SelectTrigger className="w-full justify-between font-bold bg-background border-input">
                  <SelectValue placeholder="Smoking" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-card-foreground">
                  <SelectItem value="yes" className="font-bold">Yes</SelectItem>
                  <SelectItem value="no" className="font-bold">No</SelectItem>
                  <SelectItem value="occasionally" className="font-bold">Occasionally</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col">
              <Label className="font-bold text-foreground mb-2">Drinking</Label>
              <Select
                value={formData.drinking}
                onValueChange={(val) => handleSelectChange("drinking", val)}
              >
                <SelectTrigger className="w-full justify-between font-bold bg-background border-input">
                  <SelectValue placeholder="Drinking" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-card-foreground">
                  <SelectItem value="yes" className="font-bold">Yes</SelectItem>
                  <SelectItem value="no" className="font-bold">No</SelectItem>
                  <SelectItem value="occasionally" className="font-bold">Occasionally</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="font-bold text-foreground mb-2">Socializing / Guests</Label>
            <Select
              value={formData.socializing}
              onValueChange={(val) => handleSelectChange("socializing", val)}
            >
              <SelectTrigger className="w-full justify-between font-bold bg-background border-input">
                <SelectValue placeholder="Select socializing frequency" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-card-foreground">
                <SelectItem value="rarely" className="font-bold">Rarely (Private)</SelectItem>
                <SelectItem value="sometimes" className="font-bold">Sometimes (Moderate)</SelectItem>
                <SelectItem value="often" className="font-bold">Often (Social House)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="font-bold text-foreground mb-2">Noise Tolerance</Label>
            <Select
              value={formData.noiseTolerance}
              onValueChange={(val) => handleSelectChange("noiseTolerance", val)}
            >
              <SelectTrigger className="w-full justify-between font-bold bg-background border-input">
                <SelectValue placeholder="Select noise tolerance" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-card-foreground">
                <SelectItem value="quiet" className="font-bold">Quiet (Needs silence)</SelectItem>
                <SelectItem value="moderate" className="font-bold">Moderate (Normal noise)</SelectItem>
                <SelectItem value="dont_mind" className="font-bold">Don&apos;t Mind (Heavy noise ok)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* About Me / Bio */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="bio" className="font-bold text-foreground">Bio / Introduce Yourself</Label>
          <span className={`text-xs font-bold ${bioLength > 280 ? "text-destructive" : "text-muted-foreground"}`}>
            {bioLength} / 300
          </span>
        </div>
        <Textarea
          id="bio"
          maxLength={300}
          placeholder="Tell prospective roommates about your habits, hobbies, and ideal roommate situation..."
          value={formData.bio}
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
        {loading ? "Saving Profile..." : "Save Lifestyle Profile"}
      </Button>
    </form>
  );
}
