import type { Metadata } from "next";
import Providers from "@/app/auth/Sessionwrapper"; 
import { LayoutWrapper } from "@/app/components/LayoutWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cardinal Treats — Premium Nigerian Cashews",
  description: "Five bold cashew flavours, one obsessive standard of quality. Slow-roasted and crafted in Nigeria.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Cardinal Treats",
    description: "Premium handcrafted cashew snacks made in Nigeria.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}