import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoGreen",
  description: "AutoGreen – all-in-one eco impact companion",
  icons: {
    icon: [
      { url: "/autogreen.png", type: "image/png", sizes: "32x32" },
      { url: "/autogreen.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/autogreen.png", type: "image/png", sizes: "180x180" }],
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
