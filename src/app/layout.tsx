import React from "react";
import "./globals.css";
import Image from "next/image";

const generateRobots = () => {
  const robots = [];
  const sources = ["/images/robot1.png", "/images/robot4.png", "/images/robot3.png","/images/book (1).png","/images/game (2).png","/images/pencil (2).png","/images/qmark (1).png","/images/brain (1).png"];
  const totalRobots = 60;
  const screenWidth = 100; // Percentage width of screen
  const spacing = screenWidth / totalRobots; // Correct spacing across full width

  for (let i = 0; i < totalRobots; i++) {
    const randomSrc = sources[i % sources.length]; // Cycle through images
    const fixedLeft = i * spacing; // Evenly distribute across full width
    const randomDuration = 25 + Math.random() * 8; // Fall duration (12s - 20s)
    const randomDelay = Math.random() * 30; // Random delay (0s - 5s)
    const fixedRotation = Math.random() * 40 - 20; // Random tilt (-20° to 20°)

    robots.push(
      <Image
        key={i}
        src={randomSrc}
        alt="Falling Robot"
        width={30}
        height={30}
        style={{
          position: "absolute",
          left: `calc(${fixedLeft}vw - ${30 / 2}px)`, // Adjust for centering
          top: "-10%",
          transform: `rotate(${fixedRotation}deg)`, // Tilt at spawn, no rotation while falling
          animation: `fall ${randomDuration}s linear infinite`,
          animationDelay: `${randomDelay}s`,
        }}
      />
    );
  }
  return robots;
};




export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Background Falling Robots */}
        {generateRobots()}
        {/* Page Content */}
        <main >
        {children}
        </main>
      </body>
    </html>
  );
}
