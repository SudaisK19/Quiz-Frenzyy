"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import toast from "react-hot-toast"; 

interface User {
  username: string;
  email: string;
  total_points: number;
  isVerified: boolean;
  badges: Badge[];
  hosted_quizzes: string[];
  createdAt: string;
}

interface Badge {
  name: string;
  imageUrl: string;
  description: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
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

  // Update Profile Function
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
      setEditMode(false);
    } else {
      toast.error("Update failed: " + data.error);
    }
  };

  return (
    <>
      <Header />
      {/* Outer Container: uses responsive padding and centers content */}
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 flex justify-center items-center min-h-screen">
        <div className="container mx-auto p-6 xs:p-2">
          {/* Main Card Container: 
              - Removed min-h-[80vh] so height is dictated by content.
              - Responsive padding and margins are in place.
          */}
          <div className="bg-[#242424] p-10 xs:p-4 rounded-[30px] shadow-lg flex flex-col md:flex-row w-full max-w-7xl mx-auto my-10 xs:my-4">
            {/* Left/Main Section */}
            <div className="flex-1 bg-[#333436] rounded-[30px] p-10 xs:p-4">
              {error && <p className="text-center text-red-500 mt-4 xs:mt-2">{error}</p>}

              {/* User Info */}
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-white xs:text-lg text-xl sm:text-2xl md:text-3xl break-words">
                  {user?.username}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs xs:text-[10px] sm:text-sm md:text-md bg-[#ec5f80] text-white">
                  {user?.isVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
              <p className="text-gray-400 mt-1 text-sm xs:text-xs md:text-base break-words">
                Email: {user?.email}
              </p>

              {/* Update Profile Button */}
              <button
                onClick={() => setEditMode(!editMode)}
                className="mt-10 xs:mt-4 px-2 py-3 text-[#ff3c83] tracking-wider border-2 border-[#ff3c83] rounded-full transition-all duration-150 ease-in hover:text-white hover:border-white relative overflow-hidden w-full xs:w-full sm:w-1/2 md:w-auto"
              >
                <span className="relative z-10 text-sm xs:text-xs sm:text-base md:text-md leading-none">
                  {editMode ? "Cancel" : "Update Profile"}
                </span>
              </button>

              {/* Update Profile Form */}
              {editMode && (
                <div className="mt-4 bg-[#242424] flex flex-col p-6 xs:p-4 rounded-lg shadow-md">
                  <input
                    type="text"
                    placeholder="New Username"
                    value={newData.username}
                    onChange={(e) =>
                      setNewData({ ...newData, username: e.target.value })
                    }
                    className="w-full p-2 xs:p-1 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 border border-[#ff3f80] focus:outline-none focus:ring-2 focus:ring-[#ec5f80] text-xs xs:text-[10px] sm:text-sm md:text-base"
                  />
                  <input
                    type="email"
                    placeholder="New Email"
                    value={newData.email}
                    onChange={(e) =>
                      setNewData({ ...newData, email: e.target.value })
                    }
                    className="w-full p-2 xs:p-1 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 border border-[#ff3f80] focus:outline-none focus:ring-2 focus:ring-[#ec5f80] text-xs xs:text-[10px] sm:text-sm md:text-base"
                  />
                  <input
                    type="password"
                    placeholder="New Password (Optional)"
                    value={newData.password}
                    onChange={(e) =>
                      setNewData({ ...newData, password: e.target.value })
                    }
                    className="w-full p-2 xs:p-1 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 border border-[#ff3f80] focus:outline-none focus:ring-2 focus:ring-[#ec5f80] text-xs xs:text-[10px] sm:text-sm md:text-base"
                  />

                  <button
                    onClick={handleUpdate}
                    className="mt-4 px-4 py-2 border border-[#ec5f80] text-[#ec5f80] rounded-full transition hover:bg-white hover:text-[#ec5f80] w-full max-w-[250px] xs:max-w-full"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Stats Section */}
              <div className="mt-6 xs:mt-4 p-6 xs:p-4 bg-[#242424] rounded-[20px]">
                <div className="text-white space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-500 pb-2">
                    <p className="text-sm xs:text-xs md:text-md">Total Points</p>
                    <p className="text-lg xs:text-base font-bold text-[#ec5f80]">{user?.total_points}</p>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-500 pb-2">
                    <p className="text-sm xs:text-xs md:text-md">Badges Earned</p>
                    <p className="text-lg xs:text-base font-bold text-[#ec5f80]">{user?.badges.length}</p>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-500 pb-2">
                    <p className="text-sm xs:text-xs md:text-md">Hosted Quizzes</p>
                    <p className="text-lg xs:text-base font-bold text-[#ec5f80]">{user?.hosted_quizzes.length}</p>
                  </div>
                </div>
              </div>

              {/* Badges Section */}
              <section className="mt-10 xs:mt-8 w-full">
                <h2 className="text-2xl xs:text-xl sm:text-3xl font-bold text-white mb-5 xs:mb-4 text-center">
                  Your <span className="text-pink-400">Badges</span>
                </h2>

                {user?.badges && user.badges.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {user.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="bg-[#1e1e1e] p-5 xs:p-3 rounded-xl text-center shadow-lg flex flex-col items-center"
                      >
                        <Image
                          src={badge.imageUrl}
                          alt={badge.name}
                          width={80}
                          height={80}
                          className="max-w-full h-auto"
                        />
                        <h3 className="text-md xs:text-sm md:text-lg text-white mt-3 break-words">
                          {badge.name}
                        </h3>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center">No badges yet.</p>
                )}
              </section>

              {/* Logout Button */}
              <button
                onClick={() => {
                  fetch("/api/users/logout", { method: "POST", credentials: "include" }).then(() =>
                    router.push("/login")
                  );
                }}
                className="mt-5 xs:mt-4 px-6 py-2 border border-[#ec5f80] text-[#ec5f80] rounded-full transition hover:bg-white hover:text-[#ec5f80] block mx-auto"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}