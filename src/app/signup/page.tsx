"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Dynamically add keyframes for animated lines
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `
      @keyframes run {
        0% { top: -50%; }
        100% { top: 110%; }
      }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/users/signup", {
        email,
        username,
        password,
      });

      if (response.status === 201) {
        alert("Signup successful!");
        router.push("/login");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "Signup failed. Please try again.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-screen p-4">
      {/* Signup Box */}
      <form
        onSubmit={handleSubmit}
        className="w-[300px] max-w-md p-8 md:p-10 bg-[#191919] text-center shadow-lg shadow-blue-500/30 rounded-lg relative z-10"
      >
        <h1 className="text-white uppercase font-semibold text-2xl">Sign Up</h1>
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="bg-transparent border-2 border-pink-500 text-white p-3 w-full md:w-3/4 mx-auto block rounded-full text-center outline-none transition-all duration-300 focus:border-pink-400 mt-6"
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-transparent border-2 border-pink-500 text-white p-3 w-full md:w-3/4 mx-auto block rounded-full text-center outline-none transition-all duration-300 focus:border-pink-400 mt-4"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-transparent border-2 border-pink-500 text-white p-3 w-full md:w-3/4 mx-auto block rounded-full text-center outline-none transition-all duration-300 focus:border-pink-400 mt-4"
        />
        
        <button
          type="submit"
          className="bg-pink-500 hover:bg-pink-600 text-white  py-3 px-8 rounded-full shadow-md transition duration-300 block mx-auto mt-6 w-full md:w-3/4"
        >
          Sign Up
        </button>

        <p className="mt-4 text-pink-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-pink-500 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
