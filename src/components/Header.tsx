
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import Image from "next/image";



export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ Mobile Menu State
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
    <header className={`bg-[#242424] text-white py-4 px-6 flex justify-between items-center transition-all duration-300 
      ${menuOpen && "shadow-none"} md:shadow-lg md:shadow-[#6B21A8]/50`}>
      {/* LOGO (Responsive text size) */}
      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-pink-600 cursor-pointer"
        onClick={() => router.push("/")}
      >
        QUIZ FRENZY
      </h1>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm sm:text-base md:text-lg text-gray-400 hover:text-[#ec5f80] transition-all duration-300"
        >
          Home
        </button>

        {isLoggedIn ? (
          <>
            <button
              onClick={() => router.push("/my-collection")}
              className="text-sm sm:text-base md:text-lg text-gray-400 hover:text-[#ec5f80] transition-all duration-300"
            >
              My Collection
            </button>

            {/* Profile Button with Hover Animation */}
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center px-4 py-2 bg-[#1e1e1e] rounded-full text-gray-400 hover:text-[#ec5f80] transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              <Image
                src= "/images/profilepic.png" // Use user's profile if available
                alt="Profile"
                width={32} // Set actual width
                height={32} // Set actual height
                className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 border-gray-600 hover:border-[#ec5f80] transition-all duration-300"
              />
              <span className="ml-2 text-sm sm:text-base md:text-lg">Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-sm sm:text-base md:text-lg text-gray-400 hover:text-[#ec5f80] transition-all duration-300"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/login")}
              className="text-sm sm:text-base md:text-lg text-gray-400 hover:text-[#ec5f80] transition-all duration-300"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="text-sm sm:text-base md:text-lg text-gray-400 hover:text-[#ec5f80] transition-all duration-300"
            >
              Sign Up
            </button>
          </>
        )}
      </nav>

      {/* ✅ Mobile Menu (Hamburger Icon) */}
      <div className="md:hidden flex items-center">
        {menuOpen ? (
          <FiX
            className="text-3xl cursor-pointer text-[#ec5f80]"
            onClick={() => setMenuOpen(false)}
          />
        ) : (
          <FiMenu
            className="text-3xl cursor-pointer text-gray-400"
            onClick={() => setMenuOpen(true)}
          />
        )}
      </div>

      {/* ✅ Mobile Navigation Menu */}
      {/* ✅ Mobile Navigation Menu */}
{menuOpen && (
  <div className="absolute top-16 left-0 w-full z-[100] bg-[#1e1e1e] flex flex-col items-center py-5 space-y-4 md:hidden">
    <button
      onClick={() => {
        router.push("/");
        setMenuOpen(false);
      }}
      className="text-sm sm:text-base md:text-lg text-gray-400 hover:text-[#ec5f80] transition-all duration-300"
    >
      Home
    </button>

    {isLoggedIn ? (
      <>
        <button
          onClick={() => {
            router.push("/my-collection");
            setMenuOpen(false);
          }}
          className="text-sm sm:text-base md:text-lg text-gray-400 hover:text-[#ec5f80] transition-all duration-300"
        >
          My Collection
        </button>

        <button
          onClick={() => router.push("/profile")}
          className="flex items-center px-4 py-2 bg-[#1e1e1e] rounded-full text-gray-400 
                    hover:text-[#ec5f80] transition-all duration-300 shadow-md hover:shadow-lg 
                    hover:scale-105 group" // Ensures hover effect applies to children
        >
          {/* Wrapped Image inside a div that will be affected by hover */}
          <div className="flex items-center border-2 border-gray-600 rounded-full 
                          transition-all duration-300 group-hover:border-[#ec5f80]">
            <Image
              src="/images/profilepic.png"
              alt="Profile"
              width={32}
              height={32}
              className="w-6 sm:w-8 h-6 sm:h-8 rounded-full"
            />
          </div>

          {/* Profile text */}
          <span className="ml-2 text-sm sm:text-base md:text-lg">Profile</span>
        </button>


 


        <button
          onClick={() => {
            handleLogout();
            setMenuOpen(false);
          }}
          className="text-sm sm:text-base md:text-lg text-gray-400 hover:text-[#ec5f80] transition-all duration-300"
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => {
            router.push("/login");
            setMenuOpen(false);
          }}
          className="text-sm sm:text-base md:text-lg text-gray-400 hover:text-[#ec5f80] transition-all duration-300"
        >
          Login
        </button>

        <button
          onClick={() => {
            router.push("/signup");
            setMenuOpen(false);
          }}
          className="text-sm sm:text-base md:text-lg text-gray-400 hover:text-[#ec5f80] transition-all duration-300"
        >
          Sign Up
        </button>
      </>
    )}
  </div>
)}

    </header>
  );
}





