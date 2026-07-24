import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApolloClientProvider } from "@/components/ApolloProvider";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lightfield CRM Core Sandbox",
  description: "Autonomous Agentic CRM Sandbox Portfolio Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background text-foreground h-screen overflow-hidden">
        <ApolloClientProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col h-full min-w-0 bg-background overflow-hidden">
            {children}
          </main>
        </ApolloClientProvider>
      </body>
    </html>
  );
}
