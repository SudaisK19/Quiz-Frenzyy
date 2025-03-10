"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

interface Badge {
  name: string;
  imageUrl: string;
  description: string;
}

function showBadgeToast(badge: Badge) {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } transform transition-all duration-300 pointer-events-auto flex items-center rounded-sm bg-blue-800 text-white p-1 w-40 shadow-md`}
        style={{ width: "160px" }}
      >
        <Image
          src={badge.imageUrl}
          alt={badge.name}
          width={16}
          height={16}
          style={{ marginRight: "6px" }}
        />
        <div style={{ lineHeight: "1.1" }}>
          <p style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "2px" }}>
            Congrats!
          </p>
          <p style={{ fontSize: "9px", marginBottom: "2px" }}>
            You&apos;ve earned{" "}
            <span style={{ fontWeight: "600" }}>{badge.name}</span>
          </p>
          <p style={{ fontSize: "8px" }}>{badge.description}</p>
        </div>
      </div>
    ),
    {
      duration: 5000,
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
  // add additional properties if needed
}

interface JoinData {
  player_quiz_id: string;
  session_id: string;
  // add additional properties if needed
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [joinData, setJoinData] = useState<JoinData | null>(null);
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
        } else if (
          errMsg.includes("already joined") ||
          errMsg.includes("already played")
        ) {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error joining quiz:", error);
        setError(error.message || "Something went wrong.");
      } else {
        console.error("Error joining quiz:", error);
        setError("Something went wrong.");
      }
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
          playerQuizId: joinData?.player_quiz_id,
          avatar: avatarUrl,
          displayName: sessionDisplayName || userData?.username,
        }),
      });
      const updatedData = await res.json();
      if (updatedData.success) {
        setShowAvatarModal(false);
        router.push(
          `/play-quiz?session_id=${joinData?.session_id}&player_quiz_id=${joinData?.player_quiz_id}`
        );
      } else {
        setError("Failed to update session details: " + updatedData.error);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating session details:", error);
        setError("Failed to update session details");
      } else {
        console.error("Error updating session details:", error);
        setError("Failed to update session details");
      }
    }
  }

  function handleLeftArrow() {
    setAvatarSeed((prev) => (prev <= 0 ? 100 : prev - 1));
  }
  function handleRightArrow() {
    setAvatarSeed((prev) => (prev >= 100 ? 0 : prev + 1));
  }

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Welcome to Quiz Frenzy 🎉</h1>
      <p>
        Your ultimate quiz platform. Test your knowledge, host quizzes, and
        challenge friends!
      </p>

      <div style={{ marginTop: "20px" }}>
        <h2>Join a Quiz</h2>
        <input
          type="text"
          placeholder="Enter Quiz Code"
          value={quizCode}
          onChange={(e) => setQuizCode(e.target.value.trim().toUpperCase())}
          style={{
            padding: "10px",
            width: "200px",
            marginRight: "10px",
          }}
        />
        <button onClick={handleJoinQuiz} style={{ padding: "10px 20px" }}>
          Join
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Create a Quiz</h2>
        <button
          onClick={() => {
            if (!isLoggedIn) {
              alert("Please log in to create a quiz.");
              router.push("/login");
              return;
            }
            router.push("/create-quiz");
          }}
          style={{ padding: "10px 20px" }}
        >
          Create Now
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Generate a Quiz with AI</h2>
        <button
          onClick={() => {
            if (!isLoggedIn) {
              alert("Please log in to generate a quiz.");
              router.push("/login");
              return;
            }
            router.push("/ai-quiz");
          }}
          style={{ padding: "10px 20px" }}
        >
          Generate
        </button>
      </div>

      {!isLoggedIn && (
        <div style={{ marginTop: "30px" }}>
          <h3>Login or Sign Up to Start Playing!</h3>
          <button
            onClick={() => router.push("/login")}
            style={{ padding: "10px 20px", marginRight: "10px" }}
          >
            Login
          </button>
          <button onClick={() => router.push("/signup")} style={{ padding: "10px 20px" }}>
            Sign Up
          </button>
        </div>
      )}

      {isLoggedIn && (
        <div style={{ marginTop: "30px" }}>
          <button onClick={() => router.push("/profile")} style={{ padding: "10px 20px" }}>
            View Profile
          </button>
        </div>
      )}

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
            <h2>Select Your Avatar &amp; Session Name</h2>
            <p>Welcome, {userData?.username}!</p>
            <Image
              src={`https://api.dicebear.com/6.x/bottts/svg?seed=${encodeURIComponent(
                avatarSeed.toString()
              )}`}
              alt="Avatar"
              width={100}
              height={100}
              style={{ marginBottom: "10px" }}
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
    </div>
  );
}
