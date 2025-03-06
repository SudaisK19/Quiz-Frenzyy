"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [joinData, setJoinData] = useState<any>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  // We'll treat the avatar seed as an integer between 0 and 100
  const [avatarSeed, setAvatarSeed] = useState(50);
  // New state for session-specific display name
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

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Welcome to Quiz Frenzy 🎉</h1>
      <p>
        Your ultimate quiz platform. Test your knowledge, host quizzes, and challenge friends!
      </p>

      {/* Join Quiz Section */}
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

      {/* Additional Sections */}
      <div style={{ marginTop: "20px" }}>
        <h2>Create a Quiz</h2>
        <button onClick={() => router.push("/create-quiz")} style={{ padding: "10px 20px" }}>
          Create Now
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Generate a Quiz with AI</h2>
        <button onClick={() => router.push("/ai-quiz")} style={{ padding: "10px 20px" }}>
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

      {/* Avatar & Session Name Selection Popup */}
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
              <button style={{ padding: "6px 12px" }} onClick={() => handleLeftArrow()}>
                ◀
              </button>
              <span>{avatarSeed}</span>
              <button style={{ padding: "6px 12px" }} onClick={() => handleRightArrow()}>
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

  function handleLeftArrow() {
    setAvatarSeed((prev) => (prev <= 0 ? 100 : prev - 1));
  }
  function handleRightArrow() {
    setAvatarSeed((prev) => (prev >= 100 ? 0 : prev + 1));
  }
}
