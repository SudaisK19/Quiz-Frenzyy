"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function QuizComplete() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const player_quiz_id = searchParams.get("player_quiz_id");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuizResults() {
      if (!player_quiz_id) {
        setMessage("Invalid player session.");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/player-quiz/${player_quiz_id}`);
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setMessage("Quiz completed successfully!");
        setSessionId(data.session_id ? data.session_id.toString() : null);
        setScore(data.score);
        setCompletedAt(new Date(data.completed_at).toLocaleString());
      } else {
        setMessage("Error fetching quiz results.");
      }
    }
    fetchQuizResults();
  }, [player_quiz_id]);

  if (loading) return <p>Fetching your results...</p>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>🎉 Quiz Completed! 🎉</h1>
      <h2>Your Score: {score ?? "N/A"}</h2>
      {completedAt && <p>Completed at: {completedAt}</p>}
      {/* Display message from state */}
      {message && <p>{message}</p>}
      <button onClick={() => router.push("/")} style={{ margin: "10px", padding: "10px 20px" }}>
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
        style={{ margin: "10px", padding: "10px 20px" }}
      >
        View Leaderboard 🏆
      </button>
    </div>
  );
}
