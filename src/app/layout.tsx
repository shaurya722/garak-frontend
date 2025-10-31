import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import { dmSans } from "@/style/fonts/fonts";

export const metadata: Metadata = {
  title: "Aynigma",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${dmSans.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
