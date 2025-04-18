"use client";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-[#242424] text-white py-2">
      <div className="max-w-screen-xl mx-auto px-4 md:px-20">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between">
          
          {/* Left half */}
          <div className="w-full sm:w-1/2 flex flex-col items-center sm:items-start">
            <p className="text-sm">© 2024 Quiz Frenzy. All rights reserved.</p>
            <div className="flex items-center mt-1 pl-10 sm:pl-8">
              <button
                onClick={() => router.push("/helpcenter")}
                className="text-sm text-gray-300 hover:text-[#ec5f80] transition"
              >
                Help Center
              </button>
              <span className="mx-2 text-sm text-gray-300">|</span>
              <button
                onClick={() => {}}
                className="text-sm text-gray-300 hover:text-[#ec5f80] transition"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Right half */}
          <div className="w-full sm:w-1/2 flex justify-center sm:justify-end mt-4 sm:mt-0">
            <p className="text-sm text-gray-300 px-8">
              Powered by <span className="text-[#ec5f80]">NOVA</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}