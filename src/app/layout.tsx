import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://merumefragrances.com"),
  title: {
    default: "Merume Fragrances | Luxury Perfumes in Egypt",
    template: "%s | Merume Fragrances",
  },
  description: "Discover premium perfumes, candles, and elegant gift-ready fragrances with fast delivery across Egypt.",
  keywords: ["Merume", "perfume Egypt", "luxury fragrance", "candles", "gift perfumes"],
  openGraph: {
    title: "Merume Fragrances | Luxury Perfumes in Egypt",
    description: "Discover premium perfumes, candles, and elegant gift-ready fragrances with fast delivery across Egypt.",
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Merume Fragrances",
    images: [
      {
        url: "/about2.jpeg",
        width: 1200,
        height: 630,
        alt: "Merume Fragrances",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Merume Fragrances | Luxury Perfumes in Egypt",
    description: "Discover premium perfumes, candles, and elegant gift-ready fragrances with fast delivery across Egypt.",
    images: ["/about2.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${montserrat.variable} bg-cream text-charcoal antialiased`}>{children}</body>
    </html>
  );
}
