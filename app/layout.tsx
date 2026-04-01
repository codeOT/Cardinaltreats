import type { Metadata } from "next";
import Providers from "@/app/auth/Sessionwrapper"; 
import { LayoutWrapper } from "@/app/components/LayoutWrapper";
import { CookieConsent } from "@/app/components/ui/CookieConsent";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cardinal Treats — Premium Nigerian Cashews",
  description: "Five bold cashew flavours, one obsessive standard of quality. Slow-roasted and crafted in Nigeria.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/images/ct.png",
    shortcut: "/images/ct.png",
    apple: "/images/ct.png",
  },
  openGraph: {
    title: "Cardinal Treats",
    description: "Premium handcrafted cashew snacks made in Nigeria.",
    images: ["/images/ct.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/ct.png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/ct.png" />
      </head>
      <body>
        <Providers>
          <LayoutWrapper>
            {children}
            <CookieConsent />
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}