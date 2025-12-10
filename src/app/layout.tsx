import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Pharmacies de Garde - Trouvez une pharmacie ouverte près de chez vous",
    template: "%s | Pharmacies de Garde",
  },
  description: "Trouvez facilement les pharmacies de garde près de chez vous. Service gratuit disponible 24h/24 et 7j/7 pour localiser les pharmacies ouvertes.",
  keywords: ["pharmacie de garde", "pharmacie ouverte", "pharmacie 24h", "urgence pharmacie", "médicaments"],
  authors: [{ name: "Pharmacies de Garde" }],
  creator: "Pharmacies de Garde",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Pharmacies de Garde",
    title: "Pharmacies de Garde - Trouvez une pharmacie ouverte près de chez vous",
    description: "Trouvez facilement les pharmacies de garde près de chez vous. Service gratuit disponible 24h/24 et 7j/7.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pharmacies de Garde",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pharmacies de Garde",
    description: "Trouvez facilement les pharmacies de garde près de chez vous.",
    images: ["/og-image.jpg"],
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
