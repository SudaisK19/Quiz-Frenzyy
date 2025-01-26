"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error: any) {
      console.error("Signup failed:", error);
      alert(error.response?.data?.error || "Signup failed. Please try again.");
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
  },
  formWrapper: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
    padding: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column" as "column",
    gap: "15px",
  },
  heading: {
    fontSize: "2rem",
    color: "#4EA685",
    marginBottom: "10px",
    textAlign: "center" as "center",
  },
  inputGroup: {
    width: "100%",
    marginBottom: "10px",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "10px",
    fontSize: "1rem",
    color: "#ffffff",
    backgroundColor: "#4EA685",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  text: {
    textAlign: "center" as "center",
    fontSize: "0.9rem",
    color: "#757575",
  },
  link: {
    color: "#57B894",
    textDecoration: "none",
    fontWeight: "bold" as "bold",
  },
};
