import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#d97706",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Mama's Kitchen - Fresh Ghanaian Food, Made to Order | Food Delivery",
    template: "%s | Mama's Kitchen",
  },
  description:
    "Order delicious Ghanaian food online from Mama's Kitchen at KNUST Campus, Kumasi. Jollof rice, banku & okro, waakye, grilled tilapia, kelewele and more. Fast delivery & pickup available. Pay with MTN MoMo, Vodafone Cash, or cash.",
  keywords: [
    "Ghanaian food",
    "Kumasi restaurant",
    "KNUST food",
    "Jollof rice",
    "Banku",
    "Waakye",
    "Fufu",
    "Kelewele",
    "Food delivery Kumasi",
    "Food delivery KNUST",
    "Mama's Kitchen",
    "Ghana food delivery",
    "MTN MoMo food",
    "Ghanaian restaurant",
    "Local Ghanaian dishes",
  ],
  authors: [{ name: "Mama's Kitchen" }],
  creator: "Mama's Kitchen",
  publisher: "Mama's Kitchen",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://mamaskitchen.com",
    siteName: "Mama's Kitchen",
    title: "Mama's Kitchen - Fresh Ghanaian Food, Made to Order | Food Delivery",
    description:
      "Order delicious Ghanaian food from Mama's Kitchen at KNUST Campus. Jollof rice, banku, waakye & more. Fast delivery, MTN MoMo accepted.",
    images: [
      {
        url: "/images/hero-food.png",
        width: 1344,
        height: 768,
        alt: "Mama's Kitchen - Authentic Ghanaian Cuisine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mama's Kitchen - Fresh Ghanaian Food, Made to Order",
    description: "Order delicious Ghanaian food from Mama's Kitchen at KNUST Campus, Kumasi.",
    images: ["/images/hero-food.png"],
  },
  alternates: {
    canonical: "https://mamaskitchen.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://z-cdn.chatglm.cn" />
        <link rel="dns-prefetch" href="https://z-cdn.chatglm.cn" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
