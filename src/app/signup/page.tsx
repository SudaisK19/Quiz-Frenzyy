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
    <div style={styles.container}>
      

      {/* Signup Box */}
      <form onSubmit={handleSubmit} style={styles.box}>
        <h1 style={styles.heading}>Sign Up</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
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
          Sign Up
        </button>
        <p style={styles.text}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>
            Login here
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

  // **🔹 Animated Lines**
  linesContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    width: "100vw",
    zIndex: 1,
    overflow: "hidden",
  },
};
