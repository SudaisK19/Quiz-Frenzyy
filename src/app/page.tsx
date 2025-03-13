"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import toast from "react-hot-toast";

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });


const text: string = "QUIZ FRENZY";


export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [joinData, setJoinData] = useState<any>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(50);
  const [sessionDisplayName, setSessionDisplayName] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetch("/api/users/profile", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.success);
        setUserData(data.user);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  async function handleJoinQuiz() {
    if (!isLoggedIn) {
      alert("Please log in to join a quiz.");
      router.push("/login");
      return;
    }
    if (!quizCode.trim()) {
      setError("Please enter a valid quiz code.");
      return;
    }
    setError("");
    console.log("Joining quiz with code:", quizCode);

    try {
      const userResponse = await fetch("/api/users/profile", {
        method: "GET",
        credentials: "include",
      });
      const userData = await userResponse.json();
      if (!userData.success || !userData.user?._id) {
        setError("User authentication required.");
        return;
      }

      const joinResponse = await fetch(`/api/quizzes/join/${quizCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userData.user._id,
        },
      });
      if (joinResponse.status === 400) {
        const errorData = await joinResponse.json();
        const errMsg = errorData.error?.toLowerCase() || "";
        if (errMsg.includes("expired")) {
          setError("Session expired. Please rehost the quiz.");
        } else if (errMsg.includes("already joined") || errMsg.includes("already played")) {
          setError("You have already played. Unable to join again.");
        } else {
          setError(errorData.error || "Failed to join quiz.");
        }
        return;
      }

      const data = await joinResponse.json();
      if (data.success) {
        setJoinData(data);
        setShowAvatarModal(true);
      } else {
        setError("Invalid quiz code. Please try again.");
      }
    } catch (error: any) {
      console.error("Error joining quiz:", error);
      setError(error.message || "Something went wrong.");
    }
  }

  async function handleConfirmAvatar() {
    const avatarUrl = `https://api.dicebear.com/6.x/bottts/svg?seed=${encodeURIComponent(
      avatarSeed.toString()
    )}`;

    try {
      const res = await fetch("/api/player-quiz-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerQuizId: joinData.player_quiz_id,
          avatar: avatarUrl,
          displayName: sessionDisplayName || userData.username,
        }),
      });
      const updatedData = await res.json();
      if (updatedData.success) {
        setShowAvatarModal(false);
        router.push(
          `/play-quiz?session_id=${joinData.session_id}&player_quiz_id=${joinData.player_quiz_id}`
        );
      } else {
        setError("Failed to update session details: " + updatedData.error);
      }
    } catch (err: any) {
      console.error("Error updating session details:", err);
      setError("Failed to update session details");
    }
  }

  function handleLeftArrow() {
    setAvatarSeed((prev) => (prev <= 0 ? 100 : prev - 1));
  }
  function handleRightArrow() {
    setAvatarSeed((prev) => (prev >= 100 ? 0 : prev + 1));
  }

  const letterVariants = {
    initial: { y: 0 }, // Start position
    animate: (i: number) => ({  // Custom animation for each letter
      y: [-5, 0, -5], // Bounce up and down
      transition: {
        duration: 0.6,
        repeat: Infinity, // Keeps bouncing forever
        ease: "easeInOut",
        delay: i * 0.1, // Delay each letter based on index
      },
    }),
  };


  const AnimatedLottie = () => {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
      fetch("/animation/brain.json") // Load from public folder
        .then((response) => response.json())
        .then((data) => setAnimationData(data))
        .catch((error) => console.error("Error loading Lottie animation:", error));
    }, []);

    if (!animationData) return <p>Loading animation...</p>; // Prevents errors

    return (
      <div className="flex justify-center items-center w-full max-w-[350px] max-h-[350px] overflow-hidden">
        {/* Limiting max width & height */}
        <div className="w-[120px] h-[120px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px] lg:w-[250px] lg:h-[250px]">
          <Lottie animationData={animationData} loop={true} className="w-full h-full" />
        </div>
      </div>
    );
  };





  return (
    <>
      <Header />
      <div className="flex justify-center items-center p-6 min-h-[80vh]">
        <div className="bg-[#242424] p-10 rounded-[30px] shadow-lg flex flex-col w-full max-w-7xl min-h-[80vh] mx-auto my-10 relative">

          {/*  Main Content Wrapper (Lighter Grey Container) */}
          <div className="flex-1 bg-[#333436] rounded-[30px] p-10 flex flex-col justify-between items-center relative">

            {/*  Top-Left Div (Now properly inside the lighter grey container) */}

            <div className="w-full flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#2a2a2a] via-[#4a1063] to-[#ff85b6] p-8 rounded-2xl shadow-lg text-center md:text-left">

              <div className="w-full md:w-1/2 flex flex-col items-start justify-center">
                <p className="text-white text-2xl font-semibold mb-2">Welcome to</p>
                <h3 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-pink-600 flex flex-wrap sm:flex-nowrap justify-center md:justify-start leading-tight tracking-wide whitespace-nowrap">
                  {text.split("").map((letter, index) => (
                    <motion.span
                      key={index}
                      variants={letterVariants}
                      initial="initial"
                      animate="animate"
                      custom={index}
                      className="inline-block mx-1"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </h3>

                <p className="text-gray-300 text-sm mt-2">The ultimate quiz experience!</p>
              </div>
              <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-6 md:mt-0 max-h-[350px] md:pl-6 lg:pl-12">
                <AnimatedLottie />
              </div>

            </div>

            {/*  Bottom Buttons Section (Auto-aligned) */}
            <section className="w-full flex justify-center items-center mt-10">
              <div className="bg-[#1e1e1e] p-6 rounded-xl text-center shadow-lg w-full max-w-6xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full justify-center items-stretch">

                  {/* 🔹 AI Quiz */}
                  <div className="bg-[#242424] p-6 rounded-xl text-center shadow-md w-full h-full flex flex-col items-center justify-between">
                    <Image src="/images/generate.png" alt="AI Quiz" width={80} height={80} />
                    <p className="text-white text-sm flex-1 flex items-center justify-center">Let AI generate a unique quiz for you!</p>
                    <button onClick={() => {
                      if (!isLoggedIn) {
                        alert("Please log in to generate a quiz.");
                        router.push("/login");
                        return;
                      }
                      router.push("/ai-quiz");
                    }} className="w-full max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] relative flex justify-center items-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-3 text-[#ff3c83] font-bold uppercase tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100">
                      <span className="relative z-10 text-xs sm:text-sm md:text-base lg:text-lg leading-none">
                        AI Quiz
                      </span>
                    </button>

                  </div>

                  {/* 🔹 Join Quiz */}
                  <div className="bg-[#242424] p-6 rounded-xl text-center shadow-md w-full h-full flex flex-col items-center justify-between">
                    <Image src="/images/join.png" alt="Join Quiz" width={80} height={80} />
                    
                    <input
                      type="text"
                      placeholder="Enter Quiz Code"
                      value={quizCode} // ✅ FIXED: Now binds correctly to state
                      onChange={(e) => setQuizCode(e.target.value.trim().toUpperCase())}
                      className="w-full max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] p-2 sm:p-3 md:p-4 mb-4 rounded-full bg-[#1e1e1e] text-white placeholder-white text-xs sm:text-sm md:text-base placeholder-gray-400 border border-[#ff3c83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
                    />

                    <button onClick={handleJoinQuiz} className="w-full max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] relative flex justify-center items-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-3 text-[#ff3c83] font-bold uppercase tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100">
                      <span className="relative z-10 text-xs sm:text-sm md:text-base lg:text-lg leading-none">
                        Join
                      </span>
                    </button>
                  </div>

                  {/* 🔹 Create Quiz */}
                  <div className="bg-[#242424] p-6 rounded-xl text-center shadow-md w-full h-full flex flex-col items-center justify-between">
                    <Image src="/images/createquiz.png" alt="Create Quiz" width={80} height={80} />
                    <p className="text-white text-sm flex-1 flex items-center justify-center">Make your own quiz & challenge friends!</p>
                    <button onClick={() => {
                      if (!isLoggedIn) {
                        alert("Please log in to create a quiz.");
                        router.push("/login");
                        return;
                      }
                      router.push("/create-quiz");
                    }} className="w-full max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] relative flex justify-center items-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-3 text-[#ff3c83] font-bold uppercase tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100">
                      <span className="relative z-10 text-xs sm:text-sm md:text-base lg:text-lg leading-none">
                        Create
                      </span>
                    </button>


                  </div>

                </div>
              </div>
            </section>
            
          </div>
        </div>
      </div>




      {showAvatarModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <h2>Select Your Avatar & Session Name</h2>
            <p>Welcome, {userData?.username}!</p>
            <img
              src={`https://api.dicebear.com/6.x/bottts/svg?seed=${encodeURIComponent(
                avatarSeed.toString()
              )}`}
              alt="Avatar"
              style={{ width: "100px", height: "100px", marginBottom: "10px" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <button style={{ padding: "6px 12px" }} onClick={handleLeftArrow}>
                ◀
              </button>
              <span>{avatarSeed}</span>
              <button style={{ padding: "6px 12px" }} onClick={handleRightArrow}>
                ▶
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter Display Name"
              value={sessionDisplayName}
              onChange={(e) => setSessionDisplayName(e.target.value)}
              style={{
                padding: "12px",
                width: "100%",
                marginTop: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <button onClick={handleConfirmAvatar} style={{ padding: "10px 20px", marginTop: "10px" }}>
              Confirm
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}