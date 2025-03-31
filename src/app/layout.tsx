"use client";

import React from "react";
import "./globals.css";
import PageLoader from "@/components/PageLoader";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Robots from "@/components/Robots"; // Adjust the path as needed

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="relative min-h-screen w-full">
        <PageLoader />

        {/* Render the robots client-side only */}
        <Robots />

        {/* Animate page transitions */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.main>
        </AnimatePresence>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
