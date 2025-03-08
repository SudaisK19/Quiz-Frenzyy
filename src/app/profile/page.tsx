"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Badge {
  name: string;
  imageUrl: string;
  description: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  total_points: number;
  badges: Badge[];
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

  const handleUpdate = async () => {
    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Profile updated successfully!");
      setUser(data.user);
    } else {
      toast.error("Update failed: " + data.error);
    }
  };

  const handleLogout = async () => {
    const res = await fetch("/api/users/logout", { method: "POST", credentials: "include" });
    const data = await res.json();
    if (data.success) {
      router.push("/login");
    } else {
      toast.error("Logout failed. Try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Welcome, {user?.username}!</h1>
      <p><strong>Email:</strong> {user?.email}</p>

      <h3>Update Profile</h3>
      <input
        type="text"
        value={newData.username}
        onChange={(e) => setNewData({ ...newData, username: e.target.value })}
      />
      <input
        type="email"
        value={newData.email}
        onChange={(e) => setNewData({ ...newData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newData.password}
        onChange={(e) => setNewData({ ...newData, password: e.target.value })}
      />
      <button onClick={handleUpdate}>Update</button>

      <h3>Badges:</h3>
      {user?.badges && user.badges.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {user.badges.map((badge, index) => (
            <div key={index} style={{ textAlign: "center" }}>
              <img src={badge.imageUrl} alt={badge.name} style={{ width: "50px", height: "50px" }} />
              <p style={{ fontSize: "0.8em" }}>{badge.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No badges yet.</p>
      )}

      <button onClick={() => router.push("/my-collection")}>Go to My Collection</button>
      <button
        onClick={handleLogout}
        style={{ backgroundColor: "red", color: "white", padding: "10px", marginTop: "20px" }}
      >
        Logout
      </button>
    </div>
  );
}
