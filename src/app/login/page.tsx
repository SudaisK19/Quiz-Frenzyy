"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState<string>(""); // Explicitly typed
  const [password, setPassword] = useState<string>(""); // Explicitly typed
  const router = useRouter();

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
      <h1 style={styles.heading}>Login</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
      <p style={styles.text}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={styles.link}>
          Signup
        </Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
    padding: "20px",
  } as const,
  heading: {
    fontSize: "2rem",
    marginBottom: "20px",
    color: "#333",
  } as const,
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px",
    width: "100%",
    maxWidth: "400px",
  } as const,
  input: {
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    outline: "none",
    color: "#000",
    backgroundColor: "#fff",
  } as const,
  button: {
    padding: "10px",
    fontSize: "1rem",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  } as const,
  text: {
    marginTop: "10px",
    fontSize: "1rem",
    color: "#555",
  } as const,
  link: {
    color: "#0070f3",
    textDecoration: "underline",
    cursor: "pointer",
  } as const,
};
