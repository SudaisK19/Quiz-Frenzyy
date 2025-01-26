"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState<string>(""); // Explicitly typed
  const [username, setUsername] = useState<string>(""); // Explicitly typed
  const [password, setPassword] = useState<string>(""); // Explicitly typed
  const router = useRouter();

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
      <div style={styles.formWrapper}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.heading}>Welcome to QuizFrenzy</h2>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button}>
            Sign Up
          </button>
          <p style={styles.text}>
            Already have an account?{" "}
            <a href="/login" style={styles.link}>
              Sign in here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
    padding: "20px",
  } as const, // Ensuring type safety with `as const`
  formWrapper: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
    padding: "30px",
  } as const,
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px",
  } as const,
  heading: {
    fontSize: "2rem",
    color: "#4EA685",
    marginBottom: "10px",
    textAlign: "center" as const,
  } as const,
  inputGroup: {
    width: "100%",
    marginBottom: "10px",
  } as const,
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    outline: "none",
  } as const,
  button: {
    width: "100%",
    padding: "10px",
    fontSize: "1rem",
    color: "#ffffff",
    backgroundColor: "#4EA685",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  } as const,
  text: {
    textAlign: "center" as const,
    fontSize: "0.9rem",
    color: "#000000",
  } as const,
  link: {
    color: "#57B894",
    textDecoration: "none",
    fontWeight: "bold" as const,
  } as const,
};
