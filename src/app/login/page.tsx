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
        router.push("/profile");
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
      {/* Animated Background Lines */}
      <div style={styles.linesContainer}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
             // ...styles.line,
              marginLeft: `${(i - 10) * 5}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          ></div>
        ))}
      </div>

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
    margin: 0,
    padding: 0,
    fontFamily: "sans-serif",
    background: "linear-gradient(135deg, #121212, #2C003E, #FF4F9E)", // 🎨 CYBORG Theme Gradient
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    position: "relative" as const,
    overflow: "hidden",
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

  // line: {
  //   position: "absolute" as const,
  //   width: "2px", // **Make Lines Thicker**
  //   height: "100%",
  //   top: 0,
  //   background: "rgba(255, 79, 158, 0.8)", // **Darker Pink for Visibility**
  //   animation: "run 7s infinite cubic-bezier(0.4, 0.26, 0, 0.97)",
  // },
};

