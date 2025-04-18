
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400); // Small delay after loading
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center z-[100]">
      <div className="relative flex w-[200px] h-6">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute w-4 h-4 bg-[#ec5f80] rounded-full"
            animate={{
              x: [0, 50, 100, 150, 0], // Increased movement range
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
            style={{ left: "0%" }}
          />
        ))}
      </div>
    </div>
  );
}