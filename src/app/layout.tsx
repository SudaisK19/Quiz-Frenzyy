"use client"; 

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast"; // Import the Toaster

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ padding: "20px", minHeight: "80vh" }}>
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" /> {/* Global toast notifications */}
      </body>
    </html>
  );
}
