import type { Metadata } from "next";
import LuxeFunctionalStorefront from "@/components/luxe-functional-storefront";

export const metadata: Metadata = {
  title: "Home",
  description: "Shop Merume perfumes, scented candles, and premium fragrance gifts with WhatsApp checkout.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Merume Fragrances",
        url: "https://merumefragrances.com",
        logo: "https://merumefragrances.com/about2.jpeg",
      },
      {
        "@type": "Store",
        name: "Merume Fragrances",
        image: ["https://merumefragrances.com/about2.jpeg"],
        telephone: "+201098208357",
        address: {
          "@type": "PostalAddress",
          addressCountry: "EG",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LuxeFunctionalStorefront />
    </>
  );
}
