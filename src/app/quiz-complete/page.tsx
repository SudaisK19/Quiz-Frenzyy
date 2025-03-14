"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function QuizCompleteContent() {
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
      if (!player_quiz_id || player_quiz_id === "test123") {
        // Fake test data for testing
        setMessage("Test Mode: Fake quiz results.");
        setSessionId("test-session-123");
        setScore(95); // Fake Score
        setCompletedAt(new Date().toLocaleString());
        setLoading(false);
        return;
      }

      // Fetch real quiz data
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
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen px-4 py-6">
        <div className="bg-[#242424] p-6 sm:p-10 rounded-[30px] shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl text-center">
          <div className="flex-1 bg-[#333436] rounded-[30px] p-6 sm:p-10">
            <h1 className="text-white text-3xl sm:text-4xl">Quiz Completed!</h1>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ec5f80] mt-4">
              Your Score: {score ?? "N/A"}
            </h2>
            {completedAt && <p className="text-gray-400 mt-2">Completed at: {completedAt}</p>}
            {message && <p className="text-gray-400 mt-2">{message}</p>}

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (sessionId) {
                    router.push(`/leaderboard?session_id=${sessionId}`);
                  } else {
                    alert("No session ID found!");
                  }
                }}
                className="bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-full shadow-md transition duration-300 block mx-auto mt-6 w-[90%] sm:w-4/5 md:w-2/3"
              >
                View Leaderboard
              </button>

              <button
                onClick={() => router.push("/")}
                className="bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-full shadow-md transition duration-300 block mx-auto mt-2 w-[90%] sm:w-4/5 md:w-2/3"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

    </>
    
  );
}

export default function QuizComplete() {
  return (
    <Suspense fallback={<p>Loading quiz results...</p>}>
      <QuizCompleteContent />
    </Suspense>
  );
}
