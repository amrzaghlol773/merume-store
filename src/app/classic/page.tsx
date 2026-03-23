import type { Metadata } from "next";
import StorefrontClassic from "@/components/storefront-classic";

export const metadata: Metadata = {
  title: "Classic Home",
  description: "Original storefront experience with full shopping functionality.",
  alternates: {
    canonical: "/classic",
  },
};

export default function ClassicHomePage() {
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
      <StorefrontClassic />
    </>
  );
}
