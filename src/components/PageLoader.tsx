"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname(); // Detects route change

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 2500); // Simulate delay
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center z-[100]">
      <div className="relative flex w-[100px] h-6">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute w-4 h-4 bg-[#ec5f80] rounded-full"
            animate={{
              x: [0, 25, 50, 75, 0], // Moves left in a cycle
            }}
            transition={{
              duration: 1.6, // Slower and smoother transition
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3, // Stagger movement for continuous effect
            }}
            style={{ left: "0%" }}
          />
        ))}
      </div>
    </div>
  );
}
