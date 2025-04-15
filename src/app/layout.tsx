import React from "react";
import "./globals.css";
import Image from "next/image";
import PageLoader from "@/components/PageLoader";
import { Toaster } from "react-hot-toast"; // Import the Toaster


const generateRobots = () => {
  const robots = [];
  const sources = [
    "/images/robot1.png",
    "/images/robot4.png",
    "/images/robot3.png",
    "/images/book (1).png",
    "/images/game (2).png",
    "/images/pencil (2).png",
    "/images/qmark (1).png",
    "/images/brain (1).png",
  ];

  // Detect screen width
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1440;

  // Adjust robot count based on screen size
  let totalRobots = 60;
  if (screenWidth <= 425) totalRobots = 8;       // Small mobiles
  else if (screenWidth <= 480 && screenWidth > 425 ) totalRobots = 10;
  else if (screenWidth <= 768 && screenWidth > 480 ) totalRobots = 25;  // Tablets
  else if (screenWidth <= 1024 && screenWidth > 768) totalRobots = 40; // Small laptops
  else totalRobots = 60;                          // Full-size screens

  const screenWidthPercent = 100;
  const spacing = screenWidthPercent / totalRobots;

  for (let i = 0; i < totalRobots; i++) {
    const randomSrc = sources[i % sources.length];
    const fixedLeft = i * spacing;
    const randomDuration = 25 + Math.random() * 8;
    const randomDelay = Math.random() * 30;
    const fixedRotation = Math.random() * 40 - 20;

    robots.push(
      <Image
        key={i}
        src={randomSrc}
        alt="Falling Robot"
        width={30}
        height={30}
        style={{
          position: "absolute",
          left: `calc(${fixedLeft}vw - ${30 / 2}px)`,
          top: "-10%",
          transform: `rotate(${fixedRotation}deg)`,
          animation: `fall ${randomDuration}s linear infinite`,
          animationDelay: `${randomDelay}s`,
          pointerEvents: "none", // Optional: let clicks pass through
        }}
      />
    );
  }

  return robots;
};





export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen w-full">

        <PageLoader /> 
        {/* Background Floating Robots (Not Responsive) */}
        <div >
          {generateRobots()} {/* Floating robots stay the same */}
        </div>

        {/* Main Content */}
        <main>{children}</main>

        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}