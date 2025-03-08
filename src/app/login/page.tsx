"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
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
      const response = await axios.post("/api/users/login", {
        email,
        password,
      });

      if (response.status === 200) {
        alert("Login successful!");
        router.push("/");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          "Login failed. " +
            (error.response?.data?.error || "Please try again later.")
        );
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Login Box */}
      <form style={styles.box} onSubmit={handleSubmit}>
        <h1 style={styles.heading}>Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
        <p style={styles.text}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={styles.link}>
            Signup here
          </Link>
        </p>
      </form>
    </div>
  );
}

// **💡 Styles**
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Ensures full-screen height
    width: "100vw",  // Ensures full-screen width
  } as const,

  box: {
    width: "300px",
    padding: "40px",
    background: "#191919",
    textAlign: "center" as const,
    boxShadow:
      "-1px 92px 99px -62px rgba(3, 107, 255, 0.27), 0 1px 6px 0 rgba(10, 48, 255, 0.48)",
    borderRadius: "5px",
    position: "relative" as const,
    zIndex: 2,
  },

  heading: {
    color: "white",
    textTransform: "uppercase",
    fontWeight: "500",
  } as const,

  input: {
    background: "none",
    display: "block",
    margin: "20px auto",
    textAlign: "center" as const,
    border: "2px solid #FF4F9E", // 💡 Matches Pink from CYBORG theme
    padding: "14px 10px",
    width: "200px",
    outline: "none",
    color: "white",
    borderRadius: "24px",
    transition: "0.25s",
  } as const,

  button: {
    border: "0",
    background: "#FF4F9E",
    display: "block",
    margin: "20px auto",
    textAlign: "center" as const,
    padding: "14px 40px",
    outline: "none",
    color: "white",
    borderRadius: "24px",
    cursor: "pointer",
    transition: "0.25s",
  } as const,

  text: {
    marginTop: "10px",
    fontSize: "1rem",
    color: "#FF4F9E",
  } as const,

  link: {
    color: "#FF4F9E",
    textDecoration: "none",
    fontWeight: "bold",
  } as const,

  

  
};