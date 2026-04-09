import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import Script from 'next/script';
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
  metadataBase: new URL("https://merume-perfume.com"),
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${montserrat.variable} bg-cream text-charcoal antialiased`}>

        {/* 1. كود الـ Script بتاع صاحبك حطيتهولك هنا */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '935104589111023');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* 2. كود الـ noscript اللي كان في صورة الواتساب حطيته هنا */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=935104589111023&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}




// import type { Metadata } from "next";
// import { Cormorant_Garamond, Montserrat } from "next/font/google";
// import Script from 'next/script';
//  import "./globals.css"; // تأكد إنك هترجع دي لو التنسيقات اختفت

// const cormorant = Cormorant_Garamond({
//   subsets: ["latin"],
//   weight: ["500", "600", "700"],
//   variable: "--font-cormorant",
// });

// const montserrat = Montserrat({
//   subsets: ["latin"],
//   weight: ["500", "600", "700"],
//   variable: "--font-montserrat",
// });

// export const metadata: Metadata = {
//   metadataBase: new URL("https://merumefragrances.com"),
//   title: {
//     default: "Merume Fragrances | Luxury Perfumes in Egypt",
//     template: "%s | Merume Fragrances",
//   },
//   description: "Discover premium perfumes, candles, and elegant gift-ready fragrances with fast delivery across Egypt.",
//   keywords: ["Merume", "perfume Egypt", "luxury fragrance", "candles", "gift perfumes"],
//   openGraph: {
//     title: "Merume Fragrances | Luxury Perfumes in Egypt",
//     description: "Discover premium perfumes, candles, and elegant gift-ready fragrances with fast delivery across Egypt.",
//     type: "website",
//     locale: "en_US",
//     url: "/",
//     siteName: "Merume Fragrances",
//     images: [
//       {
//         url: "/about2.jpeg",
//         width: 1200,
//         height: 630,
//         alt: "Merume Fragrances",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Merume Fragrances | Luxury Perfumes in Egypt",
//     description: "Discover premium perfumes, candles, and elegant gift-ready fragrances with fast delivery across Egypt.",
//     images: ["/about2.jpeg"],
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <head>
//         {/* Meta Pixel Code - بيتحط هنا عشان يشتغل أول ما الموقع يفتح */}
//         <Script id="fb-pixel" strategy="afterInteractive">
//           {`
//             !function(f,b,e,v,n,t,s)
//             {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
//             n.callMethod.apply(n,arguments):n.queue.push(arguments)};
//             if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
//             n.queue=[];t=b.createElement(e);t.async=!0;
//             t.src=v;s=b.getElementsByTagName(e)[0];
//             s.parentNode.insertBefore(t,s)}(window, document,'script',
//             'https://connect.facebook.net/en_US/fbevents.js');
//             fbq('init', '935104589111023');
//             fbq('track', 'PageView');
//           `}
//         </Script>
//       </head>
//       <body className={`${cormorant.variable} ${montserrat.variable} bg-cream text-charcoal antialiased`}>
//         {/* الجزء ده احتياطي لو اليوزر قفل الجافا سكريبت */}
//         <noscript>
//           <img
//             height="1"
//             width="1"
//             style={{ display: 'none' }}
//             src="https://www.facebook.com/tr?id=935104589111023&ev=PageView&noscript=1"
//             alt=""
//           />
//         </noscript>
//         {children}
//       </body>
//     </html>
//   );
// }



// import type { Metadata } from "next";
// import { Cormorant_Garamond, Montserrat } from "next/font/google";
// //import "../../globals.css";
// import Script from 'next/script'

// const cormorant = Cormorant_Garamond({
//   subsets: ["latin"],
//   weight: ["500", "600", "700"],
//   variable: "--font-cormorant",
// });

// const montserrat = Montserrat({
//   subsets: ["latin"],
//   weight: ["500", "600", "700"],
//   variable: "--font-montserrat",
// });

// export const metadata: Metadata = {
//   metadataBase: new URL("https://merumefragrances.com"),
//   title: {
//     default: "Merume Fragrances | Luxury Perfumes in Egypt",
//     template: "%s | Merume Fragrances",
//   },
//   description: "Discover premium perfumes, candles, and elegant gift-ready fragrances with fast delivery across Egypt.",
//   keywords: ["Merume", "perfume Egypt", "luxury fragrance", "candles", "gift perfumes"],
//   openGraph: {
//     title: "Merume Fragrances | Luxury Perfumes in Egypt",
//     description: "Discover premium perfumes, candles, and elegant gift-ready fragrances with fast delivery across Egypt.",
//     type: "website",
//     locale: "en_US",
//     url: "/",
//     siteName: "Merume Fragrances",
//     images: [
//       {
//         url: "/about2.jpeg",
//         width: 1200,
//         height: 630,
//         alt: "Merume Fragrances",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Merume Fragrances | Luxury Perfumes in Egypt",
//     description: "Discover premium perfumes, candles, and elegant gift-ready fragrances with fast delivery across Egypt.",
//     images: ["/about2.jpeg"],
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${cormorant.variable} ${montserrat.variable} bg-cream text-charcoal antialiased`}>{children}</body>
//     </html>
//   );
// }
