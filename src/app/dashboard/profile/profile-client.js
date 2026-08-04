"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";

export default function ProfileClient({ initialProfile }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 text-foreground relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-3xl border-border bg-card/60 backdrop-blur-md text-card-foreground shadow-xl z-10">
        <CardHeader className="space-y-2 border-b border-border mb-6">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Edit Lifestyle Profile
          </CardTitle>
          <CardDescription className="text-muted-foreground font-semibold text-sm">
            Modify your roommate preferences and habits. Any changes will instantly update your roommate compatibility scores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initialProfile={initialProfile} />
        </CardContent>
      </Card>
    </div>
  );
}
