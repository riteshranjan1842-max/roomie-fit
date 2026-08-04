import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RoomieFit - Find Compatible Student Roommates",
  description: "Find compatible student roommates and flat listings based on sleep schedules, cleanliness, guest policies, budget, and lifestyle preferences.",
};

import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
