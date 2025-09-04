import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionWrapper } from '@/components/providers/SessionWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI疑似恋人アプリ",
  description: "AIによる疑似恋人との会話アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <SessionWrapper>
            {children}
          </SessionWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}