import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SparklesIcon, CheckCircle2Icon, SearchIcon, MessageSquareIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground font-sans relative py-12 md:py-20 flex-grow">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center px-4 max-w-3xl space-y-6 z-10 relative mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <SparklesIcon className="size-3.5" />
          Designed for College Students
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent leading-[1.1] pb-2">
          Find Your Perfect Student Roommate
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground font-semibold max-w-xl leading-relaxed">
          Match with other college students using advanced compatibility metrics. Browse flat listings or search for compatible roommate seekers.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center w-full max-w-md">
          <Button asChild size="lg" className="font-bold shadow-md w-full sm:w-auto h-12 text-base active:scale-[0.99]">
            <Link href="/onboarding">
              Create Your Profile
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border text-foreground hover:bg-accent font-bold shadow-sm w-full sm:w-auto h-12 text-base">
            <Link href="/listings">
              Browse Flat Listings
            </Link>
          </Button>
        </div>
      </main>

      {/* "How It Works" Section */}
      <section className="w-full max-w-6xl px-4 md:px-8 space-y-10 z-10 relative">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">How It Works</h2>
          <p className="text-sm font-semibold text-muted-foreground max-w-md mx-auto">
            Say goodbye to awkward living situations. Match in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border bg-card/40 backdrop-blur-md text-card-foreground shadow-md hover:border-primary/20 transition-all duration-200">
            <CardHeader className="pb-3 flex flex-col items-center text-center">
              <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3">
                <CheckCircle2Icon className="size-5" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">1. Share Your Lifestyle</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm font-semibold text-muted-foreground leading-relaxed">
                Set your sleep schedule, cleanliness preferences, food habits, and budget boundaries so other seekers get a clear picture of your lifestyle.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40 backdrop-blur-md text-card-foreground shadow-md hover:border-primary/20 transition-all duration-200">
            <CardHeader className="pb-3 flex flex-col items-center text-center">
              <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3">
                <SearchIcon className="size-5" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">2. Meet Your Match</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm font-semibold text-muted-foreground leading-relaxed">
                Our compatibility scoring algorithm compares lifestyle variables to highlight matching seekers and room listings in your target city.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40 backdrop-blur-md text-card-foreground shadow-md hover:border-primary/20 transition-all duration-200">
            <CardHeader className="pb-3 flex flex-col items-center text-center">
              <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3">
                <MessageSquareIcon className="size-5" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">3. Express Interest</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm font-semibold text-muted-foreground leading-relaxed">
                Found a match? Signal interest with one click. They will see your connection inquiry along with your matching metrics instantly on their dashboard.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
