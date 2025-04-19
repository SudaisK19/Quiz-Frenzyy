"use client";
import React, { useEffect, useState, useRef, useMemo, memo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import toast from "react-hot-toast";
import introJs from 'intro.js';
import '@/styles/introjs.css';
import '@/styles/introjs-modern.css'; 

// Lottie import + cache
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
const animationCache: { data: object | null } = { data: null };


const AnimatedLottie = memo(function AnimatedLottie() {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const hasFetched = useRef(false);


  useEffect(() => {
    if (!hasFetched.current && !animationCache.data) {
      fetch("/animation/brain.json")
        .then((r) => r.json())
        .then((data) => {
          animationCache.data = data;
          setAnimationData(data);
        })
        .catch(console.error);
      hasFetched.current = true;
    } else {
      setAnimationData(animationCache.data);
    }
  }, []);


  if (!animationData) return <p>Loading animation...</p>;
  return <Lottie animationData={animationData} loop className="w-full h-full" />;
});


interface Badge { name: string; imageUrl: string; description: string; }
interface UserProfile { _id: string; username: string; }
interface JoinData { player_quiz_id: string; session_id: string; }


function showBadgeToast(badge: Badge) {
  toast.custom((t) => (
    <div
      className={`${t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        transform transition-all duration-300 pointer-events-auto flex items-center rounded-md bg-[#242424] text-white p-2 sm:p-3 w-80 sm:w-72 shadow-lg border border-[#ec5f80]`}
    >
      <Image src={badge.imageUrl} alt={badge.name} width={24} height={24} className="mr-3 rounded-full border border-gray-600" />
      <div className="text-left leading-tight">
        <p className="text-xs sm:text-sm text-gray-300">
          You&apos;ve earned <span className="font-bold text-[#ec5f80]">{badge.name}</span>
        </p>
        <p className="text-[10px] sm:text-xs text-gray-400">{badge.description}</p>
      </div>
    </div>
  ), { duration: 8000, position: "top-right" });
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
        const key = `badge_shown_${userId}_${badge.name}`;
        if (!localStorage.getItem(key)) {
          showBadgeToast(badge);
          localStorage.setItem(key, "true");
        }
      });
    }
  } catch {
    toast.error("Badge update failed.");
  }
}


export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quizCode, setQuizCode] = useState("");
  const [, setError] = useState<string>("");
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [joinData, setJoinData] = useState<JoinData | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(50);
  const [sessionDisplayName, setSessionDisplayName] = useState("");
  const router = useRouter();
  const waitForElement = (selector: string, timeout = 3000): Promise<Element> => {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let elapsed = 0;
  
      const check = () => {
        const element = document.querySelector(selector);
        if (element) resolve(element);
        else if (elapsed >= timeout) reject(`Timeout: ${selector} not found`);
        else {
          elapsed += interval;
          setTimeout(check, interval);
        }
      };
  
      check();
    });
  };
  
  
  const startIntroTour = () => {
    const intro = introJs();
  
    intro.setOptions({
      steps: [
        {
          element: '.create-quiz-tour',
          intro: 'Choose from MCQs, image-based questions, short answers, and ranking questions to create your own quiz!',
        },
        {
          element: '.ai-quiz-tour',
          intro: 'Let AI create a unique MCQ quiz for you!',
        },
        {
          element: '.join-quiz-tour',
          intro: 'Join a quiz using the Quiz ID.',
        },
        {
          element: '.profile-link-tour',
          intro: 'Visit your profile to view collected badges or manage your info.',
        },
        {
          element: '.collection-link-tour',
          intro: 'Find your saved quizzes and quiz history here.',
        },
      ],
      showProgress: true,
      showStepNumbers: true,
      showBullets: false,
      nextLabel: 'Next',
      prevLabel: 'Back',
      doneLabel: 'Close',
      skipLabel: 'Skip',
      disableInteraction: true,
      hidePrev: false,
      hideNext: false,
      scrollToElement: true,
      scrollTo: 'tooltip',
      tooltipClass: 'custom-tooltip', // optional
      overlayOpacity: 0.6,
    });
  
    intro.oncomplete(() => {
      if (userData?._id) {
        localStorage.setItem(`hasSeenTour_${userData._id}`, 'true');
      }
    });
  
    intro.onexit(() => {
      if (userData?._id) {
        localStorage.setItem(`hasSeenTour_${userData._id}`, 'true');
      }
    });
  
    intro.start();
  };
  
  useEffect(() => {
    async function loadProfileAndMaybeRunTour() {
      try {
        const res = await fetch('/api/users/profile', {
          credentials: 'include',
        });
        const data = await res.json();
  
        if (!data.success || !data.user) {
          setIsLoggedIn(false);
          return;
        }
  
        setIsLoggedIn(true);
        setUserData(data.user);
  
        if (data.user._id) updateBadges(data.user._id);
  
        const userKey = `hasSeenTour_${data.user._id}`;
        const hasSeenTour = data.user.hasSeenTour;
        const seenLocally = localStorage.getItem(userKey);
  
        if (!hasSeenTour && !seenLocally) {
          await fetch('/api/users/profile', {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ hasSeenTour: true }),
          });
  
          localStorage.setItem(userKey, 'true');
  
          // Wait for header links before starting tour
          Promise.all([
            waitForElement('.create-quiz-tour'),
            waitForElement('.ai-quiz-tour'),
            waitForElement('.join-quiz-tour'),
            waitForElement('.profile-link-tour'),
            waitForElement('.collection-link-tour'),
          ])
            .then(() => {
              startIntroTour();
            })
            .catch((err) => {
              console.warn('Tour skipped due to missing elements:', err);
            });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setIsLoggedIn(false);
      }
    }
  
    loadProfileAndMaybeRunTour();
  }, []);
  
  
  

  // Join quiz handler
  async function handleJoinQuiz() {
    if (!isLoggedIn) {
      toast.error("Please log in to join a quiz.");
      return router.push("/login");
    }
    if (!quizCode.trim()) {
      setError("Please enter a valid quiz code.");
      return;
    }
    try {
      const profileRes = await fetch("/api/users/profile", { credentials: "include" });
      const profile = await profileRes.json();
      if (!profile.success) throw new Error();
      const joinRes = await fetch(`/api/quizzes/join/${quizCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": profile.user._id,
        },
      });
      if (!joinRes.ok) {
        const err = await joinRes.json();
        const msg = err.error?.toLowerCase() || "";
        setError(
          msg.includes("expired") ? "Session expired. Please rehost the quiz."
          : msg.includes("already") ? "You have already played. Unable to join again."
          : err.error
        );
        return;
      }
      const data = await joinRes.json();
      setJoinData(data);
      setShowAvatarModal(true);
    } catch {
      setError("Something went wrong.");
    }
  }


  // Memoized avatar URL so text input doesn't re-fetch
  const avatarUrl = useMemo(
    () => `https://api.dicebear.com/6.x/bottts/svg?seed=${encodeURIComponent(avatarSeed.toString())}`,
    [avatarSeed]
  );


  // Confirm avatar
  async function handleConfirmAvatar() {
    if (!joinData) return;
    try {
      const res = await fetch("/api/player-quiz-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerQuizId: joinData.player_quiz_id,
          avatar: avatarUrl,
          displayName: sessionDisplayName || userData?.username,
        }),
      });
      const upd = await res.json();
      if (!upd.success) throw new Error();
      setShowAvatarModal(false);
      router.push(
        `/play-quiz?session_id=${joinData.session_id}&player_quiz_id=${joinData.player_quiz_id}`
      );
    } catch {
      toast.error("Failed to update session details");
    }
  }


  function handleLeftArrow() {
    setAvatarSeed((s) => (s <= 0 ? 100 : s - 1));
  }
  function handleRightArrow() {
    setAvatarSeed((s) => (s >= 100 ? 0 : s + 1));
  }


  const letterVariants = {
    initial: { y: 0 },
    animate: (i: number) => ({
      y: [-5, 0, -5],
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 },
    }),
  };

  

  return (
    <>
      <Header />
      



      {/* Outer responsive wrapper just like Profile page */}
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 flex justify-center items-center min-h-screen ">
        <div className="container mx-auto min-w-screen">
          {/* Main card*/}
          <div className="bg-[#242424] p-10 rounded-[30px] shadow-lg flex flex-col md:flex-row w-full max-w-7xl mx-auto my-10 xs:my-4">


            {/* Hero section */}
            <div className="flex-1 bg-[#333436] rounded-[30px] p-10 flex flex-col justify-between items-center relative">
              <div className="w-full flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#2a2a2a] via-[#4a1063] to-[#ff85b6] p-10 rounded-2xl shadow-lg text-center md:text-left">
                <div className="w-full md:w-1/2 flex flex-col items-start justify-center">
                  <p className="text-white text-2xl font-semibold mb-2">Welcome to</p>
                  <h3 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-pink-600 flex flex-wrap sm:flex-nowrap justify-center md:justify-start tracking-tight">
                    {"QUIZ FRENZY".split("").map((l, i) => (
                      <motion.span key={i} variants={letterVariants} initial="initial" animate="animate" custom={i}>
                        {l}
                      </motion.span>
                    ))}
                  </h3>
                  <p className="text-gray-300 text-sm mt-2">The ultimate quiz experience!</p>
                </div>
                <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-6 md:mt-0 h-[250px]">
                  <AnimatedLottie />
                </div>
              </div>


              {/* Bottom action cards */}
              <section className="w-full flex justify-center items-center mt-10">
                <div className="bg-[#1e1e1e] p-6 rounded-xl text-center shadow-lg w-full max-w-6xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {/* AI Quiz card */}
                    <div className="bg-[#242424] p-6 rounded-xl text-center shadow-md flex flex-col items-center justify-between">
                      <Image src="/images/generate.png" alt="AI Quiz" width={80} height={80} />
                      <p className="text-white text-sm flex-1 flex items-center justify-center">
                        Let AI generate a unique quiz for you!
                      </p>
                      <button
                        onClick={() => {
                          if (!isLoggedIn) {
                            toast.error("Please log in to generate a quiz.");
                            router.push("/login");
                            return;
                          }
                          router.push("/ai-quiz");
                        }}
                        className="ai-quiz-tour w-full max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] relative flex justify-center items-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-3 text-[#ff3c83] font-bold uppercase tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
                      >
                        <span className="relative z-10 text-xs sm:text-sm md:text-base lg:text-lg leading-none">
                          AI Quiz
                        </span>
                      </button>
                    </div>


                    {/* Join Quiz card */}
                    <div className="bg-[#242424] p-6 rounded-xl text-center shadow-md flex flex-col items-center justify-between">
                      <Image src="/images/join.png" alt="Join Quiz" width={80} height={80} />
                      <input
                        type="text"
                        placeholder="Enter Quiz Code"
                        value={quizCode}
                        onChange={(e) => setQuizCode(e.target.value.trim().toUpperCase())}
                        className="w-full text-center max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] p-1 sm:p-2 md:p-2 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 border border-[#ff3c83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
                      />
                      <button
                        onClick={handleJoinQuiz}
                        className="join-quiz-tour w-full max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] relative flex justify-center items-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-3 text-[#ff3c83] font-bold uppercase tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
                      >
                        <span className="relative z-10 text-xs sm:text-sm md:text-base lg:text-lg leading-none">
                          Join
                        </span>
                      </button>
                    </div>


                    {/* Create Quiz card */}
                    <div className="bg-[#242424] p-6 rounded-xl text-center shadow-md flex flex-col items-center justify-between">
                      <Image src="/images/createquiz.png" alt="Create Quiz" width={80} height={80} />
                      <p className="text-white text-sm flex-1 flex items-center justify-center">
                        Make your own quiz & challenge friends!
                      </p>
                      <button
                        onClick={() => {
                          if (!isLoggedIn) {
                            toast.error("Please log in to create a quiz.");
                            router.push("/login");
                            return;
                          }
                          router.push("/create-quiz");
                        }}
                        className="create-quiz-tour w-full max-w-[250px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[250px] relative flex justify-center items-center px-4 sm: px-6 md: px-8 py-2 sm:py-3 md:py-3 text-[#ff3c83] font-bold uppercase tracking-wider  border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r  before:from-[#fd297a] before:to-[#9424f0] before:opacity-0  before:transition-all before:duration-150 before:ease-in  hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
                      >
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
      </div>


      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
          <div className="bg-[#242424] text-white p-6 rounded-3xl shadow-lg w-11/12 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center">Select Your Avatar & Session Name</h2>
            <p className="text-center text-gray-300 mt-1">Welcome, {userData?.username}!</p>
            <div className="flex justify-center items-center mt-4">
              <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-2 border-[#ec5f80]" />
            </div>
            <div className="flex justify-center items-center gap-4 mt-4">
              <button onClick={handleLeftArrow} className="px-3 py-1 bg-[#ec5f80] hover:bg-pink-600 text-white rounded-full text-lg">◀</button>
              <span className="text-lg font-semibold">{avatarSeed}</span>
              <button onClick={handleRightArrow} className="px-3 py-1 bg-[#ec5f80] hover:bg-pink-600 text-white rounded-full text-lg">▶</button>
            </div>
            <div className="flex flex-col items-center w-full mt-4">
              <input
                type="text"
                placeholder="Enter Display Name"
                value={sessionDisplayName}
                onChange={(e) => setSessionDisplayName(e.target.value)}
                className="text-center  w-full max-w-[250px] p-2 mb-4 rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 border  border-[#ec5f80] focus:outline-none focus:ring-1 focus:ring-[#ec5f80] h-[35px]"
              />
            </div>
            <button
              onClick={handleConfirmAvatar}
              className="w-full max-w-[250px] p-2 mx-auto block border border-[#ec5f80] text-[#ec5f80] rounded-full transition hover:bg-white hover:text-[#ec5f80]"
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