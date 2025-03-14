"use client";


import { useEffect, useState,useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import toast from "react-hot-toast";


// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
const animationCache = { data: null }; // ✅ Store animation globally




const text: string = "QUIZ FRENZY";


interface Badge {
  name: string;
  imageUrl: string;
  description: string;
}


function showBadgeToast(badge: Badge) {
  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          transform transition-all duration-300 pointer-events-auto flex items-center rounded-md bg-[#242424] text-white p-2 sm:p-3 w-80 sm:w-72 shadow-lg border border-[#ec5f80]`}
      >
        <img
          src={badge.imageUrl}
          alt={badge.name}
          width={24}
          height={24}
          className="mr-3 rounded-full border border-gray-600"
        />
        <div className="text-left leading-tight">
          <p className="text-xs sm:text-sm text-gray-300">
            You've earned{" "}
            <span className="font-bold text-[#ec5f80]">{badge.name}</span>
          </p>
          <p className="text-[10px] sm:text-xs text-gray-400">{badge.description}</p>
        </div>
      </div>
    ),
    {
      duration: 8000,
      position: "top-right",
    }
  );
}


async function updateBadges(userId: string) {
  try {
    const res = await fetch("/api/users/badges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      data.badges.forEach((badge: Badge) => {
        if (!localStorage.getItem(`badge_shown_${userId}_${badge.name}`)) {
          showBadgeToast(badge);
          localStorage.setItem(`badge_shown_${userId}_${badge.name}`, "true");
        }
      });
    } else {
      toast.error("Badge update failed.");
    }
  } catch (error) {
    console.error("Error updating badges:", error);
    toast.error("Badge update failed.");
  }
}


interface UserProfile {
  _id: string;
  username: string;
}


interface JoinData {
  player_quiz_id: string;
  session_id: string;
}




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
        if (data.success && data.user?._id) {
          updateBadges(data.user._id);
        }
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
    const hasFetched = useRef(false); // ✅ Prevent duplicate fetches
  
    useEffect(() => {
      if (!hasFetched.current && !animationCache.data) {
        fetch("/animation/brain.json") // Load from public folder
          .then((response) => response.json())
          .then((data) => {
            animationCache.data = data; // ✅ Save animation globally
            setAnimationData(data);
          })
          .catch((error) => console.error("Error loading Lottie animation:", error));
        
        hasFetched.current = true; // ✅ Prevent further fetches
      } else {
        setAnimationData(animationCache.data); // ✅ Use cached animation
      }
    }, []);
  
    if (!animationData) return <p>Loading animation...</p>;
  
    return (
      <div className="flex justify-center items-center w-full max-w-[250px] max-h-[250px] overflow-hidden">
        <Lottie animationData={animationData} loop={true} className="w-full h-full" />
      </div>
    );
  }








  return (
    <>
      <Header />
      <div className="flex justify-center items-center p-6 min-h-screen w-full">
        <div className="bg-[#242424] p-10 rounded-[30px] shadow-lg flex flex-col md:flex-row w-11/12 md:w-9/10 min-h-[80vh] mx-auto my-10">

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
              <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-6 md:mt-0 h-[180px] md:h-[220px] lg:h-[250px] md:pl-14 lg:pl-20">
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
                      className="w-full max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] p-1 sm:p-2 md:p-2 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-white text-xs sm:text-sm md:text-base placeholder-gray-400 border border-[#ff3c83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
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
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
          <div className="bg-[#242424] text-white p-6 rounded-3xl shadow-lg w-11/12 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center text-white">Select Your Avatar & Session Name</h2>
            <p className="text-center text-gray-300 mt-1">Welcome, {userData?.username}!</p>

            {/* Avatar Image */}
            <div className="flex justify-center items-center mt-4">
              <img
                src={`https://api.dicebear.com/6.x/bottts/svg?seed=${encodeURIComponent(avatarSeed.toString())}`}
                alt="Avatar"
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-2 border-[#ec5f80]"
              />
            </div>

            {/* Arrow Buttons for Changing Avatar */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                className="px-3 py-1 bg-[#ec5f80] hover:bg-pink-600 text-white rounded-full text-lg"
                onClick={handleLeftArrow}
              >
                ◀
              </button>
              <span className="text-lg font-semibold">{avatarSeed}</span>
              <button
                className="px-3 py-1 bg-[#ec5f80] hover:bg-pink-600 text-white rounded-full text-lg"
                onClick={handleRightArrow}
              >
                ▶
              </button>
            </div>

            {/* Input for Display Name */}
            <div className="flex flex-col items-center w-full mt-4">
              <input
                type="text"
                placeholder="Enter Display Name"
                value={sessionDisplayName}
                onChange={(e) => setSessionDisplayName(e.target.value)}
                className="w-full max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] p-2 sm:p-2 md:p-2 mb-4 rounded-full bg-[#1e1e1e] text-white placeholder-grey  text-xs sm:text-sm md:text-base placeholder-gray-400 border border-[#ec5f80] focus:outline-none focus:ring-1  focus:ring-[#ec5f80] mx-auto h-[35px]"
              />
            </div>

            <button
              onClick={handleConfirmAvatar}
              className="w-full max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] p-2 sm:p-2 md:p-2 mx-auto block border border-[#ec5f80] text-[#ec5f80] rounded-full transition hover:bg-white hover:text-[#ec5f80]"
            >
              Confirm
            </button>


          </div>
        </div>
      )}


      <Footer />
    </>
  );
}

