"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

// This is your function to generate the robot images
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
  const totalRobots = 60;
  const screenWidth = 100; // Percentage width of screen
  const spacing = screenWidth / totalRobots;

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
        }}
      />
    );
  }
  return robots;
};

const Robots: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set the flag to true after mount so that robots are only rendered on the client.
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return <div>{generateRobots()}</div>;
};

export default Robots;
