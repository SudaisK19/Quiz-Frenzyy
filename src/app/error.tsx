"use client";

import Link from "next/link";
import React from "react";

const Error = () => {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#242424] text-white px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-[#ec5f80]">Oops!</p>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
                Something went wrong
            </h1>
            <p className="mt-4 text-lg text-gray-300">
                We encountered an unexpected error. Please try again later.
            </p>
    
            <div className="mt-8 flex justify-center gap-6">
              <Link
                href="/"
                className="mx-auto mt-2 w-[90%] sm:w-4/5 md:w-2/3 block relative flex justify-center items-center px-4 py-3 
                              text-[#ff3c83] text-sm sm:text-base md:text-lg tracking-wider border-2 border-[#ff3c83] 
                              rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white 
                              before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 
                              before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 
                              before:transition-all before:duration-150 before:ease-in 
                              hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
              >
                <span className="relative z-10 leading-none">
                    Return to Home
                </span>
              </Link>
              
            </div>
          </div>
        </main>
      );
    };

export default Error;