"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/users/profile", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.success);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <header className="bg-[#1f2122] py-4 text-center border-b border-pink-500 shadow-md">
      <h1 className="text-pink-400 text-3xl font-bold cursor-pointer hover:text-white transition" onClick={() => router.push("/")}>
        Quiz Frenzy 🎮
      </h1>
      <nav className="flex justify-center space-x-4 mt-2">
        <button className="main-button" onClick={() => router.push("/")}>Home</button>
        {isLoggedIn ? (
          <>
            <button className="main-button" onClick={() => router.push("/profile")}>Profile</button>
            <button className="main-button" onClick={() => router.push("/logout")}>Logout</button>
          </>
        ) : (
          <>
            <button className="main-button" onClick={() => router.push("/login")}>Login</button>
            <button className="main-button" onClick={() => router.push("/signup")}>Sign Up</button>
          </>
        )}
      </nav>
    </header>
  );
}
