"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      callbackURL: "/",
    });
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            RoomieFit
          </span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          ) : session ? (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border bg-card text-foreground hover:bg-accent p-0 flex items-center justify-center font-bold">
                    {session.user?.name ? session.user.name[0].toUpperCase() : "U"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-border bg-card text-card-foreground">
                  <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-foreground">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground cursor-pointer px-2 py-1.5 text-foreground font-bold">
                    <Link href="/dashboard" className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground cursor-pointer px-2 py-1.5 text-foreground font-bold">
                    <Link href="/dashboard/profile" className="w-full">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuItem onClick={handleSignOut} className="focus:bg-destructive/20 focus:text-destructive text-destructive cursor-pointer px-2 py-1.5 font-bold">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover:bg-accent font-bold">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
