"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await signUp.email({
        name,
        email,
        password,
        callbackURL: "/onboarding",
      });

      if (signUpError) {
        setError(signUpError.message || "An error occurred during sign up.");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signUp.social({
        provider: "google",
        callbackURL: "/onboarding",
      });
    } catch (err) {
      setError("Failed to initialize Google sign in.");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md text-card-foreground">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Create an Account
          </CardTitle>
          <CardDescription className="text-muted-foreground font-semibold">
            Sign up to find roommates and flat listings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-bold">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-input bg-background/50 text-foreground placeholder-muted-foreground focus-visible:ring-primary focus-visible:border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-input bg-background/50 text-foreground placeholder-muted-foreground focus-visible:ring-primary focus-visible:border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-bold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-input bg-background/50 text-foreground placeholder-muted-foreground focus-visible:ring-primary focus-visible:border-primary font-bold"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
            >
              {loading ? "Creating Account..." : "Sign Up with Email"}
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-3 text-xs uppercase text-muted-foreground font-bold">
              Or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground font-bold shadow-sm"
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center border-t border-border py-4">
          <p className="text-sm text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
