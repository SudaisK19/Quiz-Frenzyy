"use client";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation"; // Hook to check URL path

const ProfilePage = () => {
  const pathname = usePathname(); // Get current page URL

  return (
    <>
      {/* Show Header only if not on login or signup pages */}
      {!(pathname === "/login" || pathname === "/signup") && <Header />}
      <div className="bg-red-500 p-6 text-white">Test Tailwind</div>

      <button className="bg-blue-500 text-white p-4 rounded">Test Button</button>

      <div className="flex items-center justify-center min-h-screen">
        <div className="w-9/10 max-h-[90vh] bg-[#1f2122] text-white rounded-[23px] p-[30px] overflow-y-auto">
          hiii
          <p className="mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec fermentum
            turpis vitae elit posuere, at dictum justo malesuada. Duis sed odio sit amet
            nisi venenatis auctor non a sapien. Proin consequat lacus nec dui cursus,
            et fermentum magna posuere. Sed nec diam in massa facilisis vehicula.
          </p>


          <button className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white font-bold transition">
            Update Profile
          </button>
        </div>
      </div>

      {/* Show Footer only if not on login or signup pages */}
      {!(pathname === "/login" || pathname === "/signup") && <Footer />}
    </>
  );
};

export default ProfilePage;
