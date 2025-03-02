"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quizCode, setQuizCode] = useState(""); // State for quiz code
  const [error, setError] = useState(""); // State for error message
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by checking the authToken
    fetch("/api/users/profile", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.success);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  async function handleJoinQuiz() {
    if (!quizCode.trim()) {
      setError("Please enter a valid quiz code.");
      return;
    }

    setError(""); // Clear previous errors
    console.log("🔍 Sending request to join quiz with code:", quizCode);

    try {
      // 1. Check user authentication
      const userResponse = await fetch("/api/users/profile", {
        method: "GET",
        credentials: "include",
      });
      const userData = await userResponse.json();

      if (!userData.success || !userData.user?._id) {
        setError("User authentication required.");
        return;
      }

      // 2. Attempt to join quiz session
      const joinResponse = await fetch(`/api/quizzes/join/${quizCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userData.user._id,
        },
      });

      // 3. If the API returns a 400, handle error gracefully
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
        return; // Do not redirect if an error is detected
      }

      // 4. Otherwise, parse the response and check success
      const data = await joinResponse.json();
      if (data.success) {
        console.log("✅ Session ID:", data.session_id);
        router.push(
          `/play-quiz?session_id=${data.session_id}&player_quiz_id=${data.player_quiz_id}`
        );
      } else {
        setError("Invalid quiz code. Please try again.");
      }
    } catch (error: any) {
      console.error("❌ Error joining quiz:", error);
      setError(error.message || "Something went wrong.");
    }
  }

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Welcome to Quiz Frenzy 🎉</h1>
      <p>
        Your ultimate quiz platform. Test your knowledge, host quizzes, and
        challenge friends!
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

      {/* Create Quiz Section */}
      <div style={{ marginTop: "20px" }}>
        <h2>Create a Quiz</h2>
        <button
          onClick={() => router.push("/create-quiz")}
          style={{ padding: "10px 20px" }}
        >
          Create Now
        </button>
      </div>

      {/* AI-Generated Quiz Section */}
      <div style={{ marginTop: "20px" }}>
        <h2>Generate a Quiz with AI</h2>
        <button
          onClick={() => router.push("/ai-quiz")}
          style={{ padding: "10px 20px" }}
        >
          Generate
        </button>
      </div>

      {/* Show Login/Signup if not logged in */}
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

      {/* Show Profile Button if Logged In */}
      {isLoggedIn && (
        <div style={{ marginTop: "30px" }}>
          <button
            onClick={() => router.push("/profile")}
            style={{ padding: "10px 20px" }}
          >
            View Profile
          </button>
        </div>
      )}
    </div>
  );
}
