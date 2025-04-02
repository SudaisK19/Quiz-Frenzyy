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
  const [editMode, setEditMode] = useState(false); // ✅ Controls expandable form
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

  //  Update Profile Function

const handleUpdate = async () => {
  const res = await fetch("/api/users/profile", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newData),
  });

  const data = await res.json();
  if (data.success) {
    toast.success("Profile updated successfully!"); // ✅ Toast message
    setUser(data.user);
    setEditMode(false);
  } else {
    toast.error("Update failed: " + data.error); // ✅ Toast message
  }
};



  return (
    <>
      <Header />
      <div className="flex justify-center items-center p-6 min-h-screen w-full">
        <div className="bg-[#242424] p-10 rounded-[30px] shadow-lg flex flex-col  md:flex-row w-11/12 md:w-9/10 min-h-[80vh] mx-auto my-10">
          {/* User Info */}
          <div className="flex-1  bg-[#333436] rounded-[30px] p-10">
            {error && <p className="text-center text-red-500 mt-4">{error}</p>}

            <div className="flex items-center gap-2">
              <h2 className="text-white text-xl sm:text-2xl md:text-3xl  break-words">
                {user?.username}
              </h2>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm md:text-md bg-[#ec5f80] text-white">
                {user?.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
            <p className="text-gray-400 mt-1 text-sm md:text-base break-words">
              Email: {user?.email}
            </p>

            {/* Update Profile Section */}
            <button
              onClick={() => setEditMode(!editMode)}
              className="w-1/5 md:w-1/5  relative flex justify-center items-center mt-10 px-2 py-3 text-[#ff3c83] tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
            >
              <span className="relative z-10 text-sm sm:text-base md:text-md leading-none">
                {editMode ? "Cancel" : "Update Profile"}
              </span>
            </button>


            {editMode && (
              <div className="mt-4 bg-[#242424] flex flex-col p-6 rounded-lg shadow-md ">
                <input
                  type="text"
                  placeholder="New Username"
                  value={newData.username}
                  onChange={(e) => setNewData({ ...newData, username: e.target.value })}
                  className=" w-full p-1 sm:p-2 md:p-2 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-white text-xs sm:text-sm md:text-base placeholder-gray-400 border border-[#ff3c83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"                />
                <input
                  type="email"
                  placeholder="New Email"
                  value={newData.email}
                  onChange={(e) => setNewData({ ...newData, email: e.target.value })}
                  className=" w-full p-1 sm:p-2 md:p-2 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-white text-xs sm:text-sm md:text-base placeholder-gray-400 border border-[#ff3c83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"                />
                <input
                  type="password"
                  placeholder="New Password (Optional)"
                  value={newData.password}
                  onChange={(e) => setNewData({ ...newData, password: e.target.value })}
                  className=" w-full   p-1 sm:p-2 md:p-2 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-white text-xs sm:text-sm md:text-base placeholder-gray-400 border border-[#ff3c83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"                />

                <button
                  onClick={handleUpdate}
                  className="mt-4 px-4 py-2 border border-[#ec5f80] text-[#ec5f80] rounded-full transition hover:bg-white hover:text-[#ec5f80] w-full md:w-auto  max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px]">
                  Change
                </button>
              </div>
            )}

            {/* Stats Section */}
            <div className="mt-6 p-6 bg-[#242424] rounded-[20px]">
              <div className="text-white space-y-3">
                <div className="flex justify-between items-center border-b border-gray-500 pb-2">
                  <p className="text-sm md:text-md">Total Points</p>
                  <p className="text-lg  font-bold text-[#ec5f80]">{user?.total_points}</p>
                </div>

                <div className="flex justify-between items-center border-b border-gray-500 pb-2">
                  <p className="text-sm md:text-md">Badges Earned</p>
                  <p className="text-lg  font-bold text-[#ec5f80]">{user?.badges.length}</p>
                </div>

                <div className="flex justify-between items-center border-b border-gray-500 pb-2">
                  <p className="text-sm md:text-md">Hosted Quizzes</p>
                  <p className="text-lg  font-bold text-[#ec5f80]">{user?.hosted_quizzes.length}</p>
                </div>
              </div>
            </div>

            {/* Dynamic Badges Section */}
            <section className="mt-10 w-full">
              <h2 className="text-2xl sm:text-3xl  font-bold text-white mb-5 text-center">
                Your <span className="text-pink-400">Badges</span>
              </h2>

              {user?.badges && user.badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {user.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="bg-[#1e1e1e] p-5 rounded-xl text-center shadow-lg max-w-full flex flex-col items-center"
                    >
                      <Image
                        src={badge.imageUrl}
                        alt={badge.name}
                        width={80}
                        height={80}
                        className="max-w-full h-auto"
                      />
                      <h3 className="text-md md:text-lg  text-white mt-3 break-words">
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
                fetch("/api/users/logout", { method: "POST", credentials: "include" }).then(() => router.push("/login"));
              }}
              className="mt-5 px-6 py-2 w-auto mx-auto block border border-[#ec5f80] text-[#ec5f80] rounded-full transition hover:bg-white hover:text-[#ec5f80]"
            >
              Logout
            </button>

          </div>
        </div>
      </div>


      <Footer />
    </>
  );
}