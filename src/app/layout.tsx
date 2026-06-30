import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { IntegrationService } from "@/services/integration.service";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stash and Haul — Curated Living & Everyday Luxury",
  description: "Curated lifestyle products for modern living. Apple-precision layout, modern editorial design, and everyday accessibility. Explore fashion, beauty, home, and premium electronics.",
  metadataBase: new URL("https://stashandhaul.vercel.app"),
  openGraph: {
    title: "Stash and Haul — Curated Living & Everyday Luxury",
    description: "Experience modern luxury at everyday prices. Our curated selection of fashion, home decor, beauty, and tech delivers premium aesthetics without the retail markup.",
    url: "https://stashandhaul.vercel.app",
    siteName: "Stash and Haul",
    locale: "en_US",
    type: "website",
  },
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appearance = await IntegrationService.getSettings("appearance");
  
  const customStyles = {
    "--color-charcoal": appearance.primary_color || "#1A1A1A",
    "--color-gold": appearance.accent_color || "#C8B38B",
    "--border-radius": appearance.border_radius || "0px",
  } as React.CSSProperties;

  // Structured Data JSON-LD for the organization/ecommerce store
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "Stash and Haul",
    "description": "Curated lifestyle products for modern living.",
    "url": "https://stashandhaul.vercel.app",
    "logo": "https://stashandhaul.vercel.app/images/logo.png",
    "priceRange": "$$",
    "sameAs": [
      "https://instagram.com/stashandhaul",
      "https://pinterest.com/stashandhaul"
    ]
  };

  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} h-full antialiased`} style={customStyles}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
