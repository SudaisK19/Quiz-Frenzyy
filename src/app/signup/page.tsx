"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
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
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post("/api/users/signup", {
        email,
        username,
        password,
      });

      if (response.status === 201) {
        setSuccessMessage("Signup successful!");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.error || "Signup failed. Please try again.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 flex justify-center items-center min-h-screen">
      <div className="w-full max-w-3xs sm:max-w-xs md:max-w-xs lg:max-w-xs xl:max-w-xs p-5 sm:p-6 md:p-8 bg-[#191919] text-center shadow-lg shadow-blue-500/30 rounded-lg relative z-10">

        <h1 className="text-white uppercase mt-2 text-2xl sm:text-3xl md:text-4xl">Sign Up</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-transparent border-2 border-pink-500 text-white p-3 w-full rounded-full text-center outline-none transition-all duration-300 focus:border-pink-400"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-transparent border-2 border-pink-500 text-white p-3 w-full rounded-full text-center outline-none transition-all duration-300 focus:border-pink-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-transparent border-2 border-pink-500 text-white p-3 w-full rounded-full text-center outline-none transition-all duration-300 focus:border-pink-400"
          />

          {successMessage && (
            <p className="text-green-500 text-center text-sm">{successMessage}</p>
          )}

          {errorMessage && (
            <p className="text-red-500 text-center text-sm">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full relative flex justify-center items-center px-4 py-3 text-[#ff3c83] tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
          >
            <span className="relative z-10 text-sm sm:text-base md:text-lg leading-none">
              Sign Up
            </span>
          </button>
        </form>

        <p className="mt-4 text-pink-500 text-sm">
          Already have an account?
        </p>
        <p>
          <Link href="/login" className="text-pink-500 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}