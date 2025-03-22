"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
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
    <div className="flex justify-center items-center min-h-screen w-screen p-4">
      <div className="w-[300px] max-w-md p-3 md:p-3 bg-[#191919] text-center shadow-lg shadow-blue-500/30 rounded-lg relative z-10">
        
        {/* ✅ Success Message */}
        {successMessage && (
          <p className="text-green-500  p-3  text-center mb-4">
            {successMessage}
          </p>
        )}

        {/* ✅ Error Message */}
        {errorMessage && (
          <p className="text-red-500  p-3 text-center mb-4">
            {errorMessage}
          </p>
        )}

        <h1 className="text-white uppercase mt-3 text-3xl">Sign Up</h1>
        
        <form onSubmit={handleSubmit}>
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
            className="w-full md:w-3/4 mx-auto block relative flex justify-center items-center mt-10 px-4 py-3 text-[#ff3c83] tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
          >
            <span className="relative z-10 text-sm sm:text-base md:text-lg leading-none">
                Sign Up
              </span>
          </button>
        </form>

        <p className="mt-4 text-pink-500 text-sm">
          Already have an account?{" "}
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
