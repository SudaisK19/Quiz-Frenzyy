"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function QuizComplete() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const player_quiz_id = searchParams.get("player_quiz_id");

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuizResults() {
      if (!player_quiz_id) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/player-quiz/${player_quiz_id}`);
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setSessionId(data.session_id ? data.session_id.toString() : null);
        setScore(data.score);
        setCompletedAt(new Date(data.completed_at).toLocaleString());
      }
    }

    fetchQuizResults();
  }, [player_quiz_id]);

  if (loading) return <p style={styles.loading}>Fetching your results...</p>;

  return (
    <div style={styles.container}>
      {/* Styled Card for Results */}
      <div style={styles.card}>
        <h1 style={styles.heading}>🎉 Quiz Completed! 🎉</h1>
        <h2 style={styles.score}>Your Score: {score ?? "N/A"}</h2>
        {completedAt && <p style={styles.date}>Completed at: {completedAt}</p>}

        <div style={styles.buttonContainer}>
          <button onClick={() => router.push("/")} style={styles.button}>
            Home
          </button>

          <button
            onClick={() => {
              if (sessionId) {
                router.push(`/leaderboard?session_id=${sessionId}`);
              } else {
                alert("No session ID found!");
              }
            }}
            style={styles.button}
          >
            View Leaderboard 🏆
          </button>
        </div>
      </div>
    </div>
  );
}

// **💡 Styles (Matching Cyborg Gaming)**
const styles = {
  container: {
    margin: 0,
    padding: 0,
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(135deg, #121212, #2C003E, #FF4F9E)", 
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Full height of viewport
    width: "100vw", // Full width
    position: "relative" as const,
    overflow: "hidden",
  },

  box: {
    width: "90%",  // Makes it responsive
    maxWidth: "400px", 
    padding: "40px",
    background: "#191919",
    textAlign: "center" as const,
    boxShadow: "0 0 20px rgba(255, 79, 158, 0.7)", 
    borderRadius: "10px",
    position: "relative" as const,
    zIndex: 2,
  },

  card: {
    background: "rgba(25, 25, 25, 0.95)", // Dark semi-transparent card
    padding: "40px",
    textAlign: "center" as const,
    borderRadius: "10px",
    boxShadow:
      "0px 0px 15px rgba(255, 79, 158, 0.7), 0px 0px 10px rgba(255, 79, 158, 0.5)",
    width: "350px",
  } as const,

  heading: {
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "bold",
    textTransform: "uppercase",
  } as const,

  text: {
    fontSize: "1rem",
    color: "#FF4F9E",
    marginTop: "10px",
  } as const,

  score: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#FF4F9E",
    margin: "10px 0",
  } as const,

  date: {
    color: "#CCCCCC",
    fontSize: "1rem",
    marginBottom: "20px",
  } as const,

  buttonContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px",
  } as const,

  button: {
    width: "100%",
    border: "0",
    background: "#FF4F9E",
    padding: "14px",
    outline: "none",
    color: "white",
    borderRadius: "24px",
    cursor: "pointer",
    transition: "0.25s",
    fontSize: "1.2rem",
    fontWeight: "bold",
  } as const,


  loading: {
    color: "white",
    textAlign: "center" as const,
    fontSize: "1.2rem",
    marginTop: "50px",
  } as const,
};

