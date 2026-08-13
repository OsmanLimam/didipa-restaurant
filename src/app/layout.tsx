import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mama's Kitchen - Authentic Ghanaian Cuisine",
  description: "Order delicious Ghanaian food online. Jollof rice, banku, waakye, grilled tilapia and more. Delivery & pickup available in Accra.",
  keywords: ["Ghanaian food", "Accra restaurant", "Jollof rice", "Banku", "Waakye", "Food delivery Accra"],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Mama's Kitchen - Authentic Ghanaian Cuisine",
    description: "Order delicious Ghanaian food online. From our kitchen to your home.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
