import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <OnboardingClient userName={session.user?.name} />;
}
