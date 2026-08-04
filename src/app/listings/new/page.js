import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import NewListingClient from "./new-listing-client";

export default async function NewListingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <NewListingClient />;
}
