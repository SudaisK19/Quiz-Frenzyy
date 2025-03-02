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

  const handleLogout = async () => {
    await fetch("/api/users/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  return (
    <header style={{ backgroundColor: "#007bff", padding: "15px", color: "white", textAlign: "center" }}>
      <h1 style={{ margin: 0, cursor: "pointer" }} onClick={() => router.push("/")}>Quiz Frenzy 🎉</h1>
      <nav style={{ marginTop: "10px" }}>
        <button onClick={() => router.push("/")} style={navButtonStyle}>Home</button>
        {isLoggedIn ? (
          <>
            <button onClick={() => router.push("/my-collection")} style={navButtonStyle}>My Collection</button> {/* ✅ NEW */}
            <button onClick={() => router.push("/profile")} style={navButtonStyle}>Profile</button>
            <button onClick={handleLogout} style={{ ...navButtonStyle, backgroundColor: "red" }}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => router.push("/login")} style={navButtonStyle}>Login</button>
            <button onClick={() => router.push("/signup")} style={navButtonStyle}>Sign Up</button>
          </>
        )}
      </nav>
    </header>
  );
}

const navButtonStyle = {
  backgroundColor: "white",
  color: "#007bff",
  padding: "10px",
  margin: "5px",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};
