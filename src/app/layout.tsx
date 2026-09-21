import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ELAH",
  description: "Joias para momentos que permanecem.",
  applicationName: "ELAH",

  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/icons/icon-192.png",
  },

  appleWebApp: {
    capable: true,
    title: "ELAH",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f6f2",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${cormorant.variable} antialiased`}>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}