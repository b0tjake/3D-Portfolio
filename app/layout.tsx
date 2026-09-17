import type { Metadata } from "next";
import {
  Outfit,
  Cinzel,
  Cinzel_Decorative,
  Cormorant_Garamond,
  Geist_Mono,
} from "next/font/google";
import "./globals.css";

const cinzelDecorative = Cinzel_Decorative({
  variable: "--font-decorative",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trafeh Zouhair — Full-Stack & Game Developer",
  description: "Full-Stack and Game developer passionate about video games and immersive tech. Unity, C#, VR, Next.js, and interactive design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzelDecorative.variable} ${cinzel.variable} ${cormorant.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0907] text-[#f3eae0] font-sans antialiased selection:bg-[#d97706]/35 selection:text-[#fef3c7]">
        {children}
      </body>
    </html>
  );
}
