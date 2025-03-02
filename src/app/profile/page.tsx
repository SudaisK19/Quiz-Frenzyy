"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  email: string;
  total_points: number;
  badges: string[];
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newData, setNewData] = useState({ username: "", email: "", password: "" });
  const router = useRouter();

  useEffect(() => {
    fetch("/api/users/profile", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setNewData({ username: data.user.username, email: data.user.email, password: "" });
        } else {
          setError(data.error);
          router.push("/login");
        }
        setLoading(false);
      })
      .catch(() => setError("Failed to load profile"));
  }, []);

  // ✅ Update Profile
  const handleUpdate = async () => {
    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });

    const data = await res.json();
    if (data.success) {
      alert("Profile updated successfully!");
      setUser(data.user);
    } else {
      alert("Update failed: " + data.error);
    }
  };

  // ✅ Logout Function
  const handleLogout = async () => {
    const res = await fetch("/api/users/logout", { method: "POST", credentials: "include" });
    const data = await res.json();
    if (data.success) {
      router.push("/login");
    } else {
      alert("Logout failed. Try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Welcome, {user?.username}!</h1>
      <p><strong>Email:</strong> {user?.email}</p>

      <h3>Update Profile</h3>
      <input type="text" value={newData.username} onChange={(e) => setNewData({ ...newData, username: e.target.value })} />
      <input type="email" value={newData.email} onChange={(e) => setNewData({ ...newData, email: e.target.value })} />
      <input type="password" placeholder="New Password" value={newData.password} onChange={(e) => setNewData({ ...newData, password: e.target.value })} />
      <button onClick={handleUpdate}>Update</button>

      <h3>Badges:</h3>
      {user?.badges && user.badges.length > 0 ? (
        <ul>{user.badges.map((badge, index) => <li key={index}>{badge}</li>)}</ul>
      ) : (<p>No badges yet.</p>)}

      {/* ✅ Go to My Collection */}
      <button onClick={() => router.push("/my-collection")}>Go to My Collection</button>

      <button onClick={handleLogout} style={{ backgroundColor: "red", color: "white", padding: "10px", marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
}
