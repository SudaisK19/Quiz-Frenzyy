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

  const [, setLoading] = useState(true);
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
      
            {!sessionId ? (
              <p className="text-center text-red-500 mt-2">No session ID found!</p>
            ) : (
              <button
                onClick={() => router.push(`/leaderboard?session_id=${sessionId}`)}
                className="mx-auto mt-2 w-[90%] sm:w-4/5 md:w-2/3 block relative flex justify-center items-center px-4 py-3 
                          text-[#ff3c83] text-sm sm:text-base md:text-lg tracking-wider border-2 border-[#ff3c83] 
                          rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white 
                          before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 
                          before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 
                          before:transition-all before:duration-150 before:ease-in 
                          hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
              >
                <span className="relative z-10 leading-none">View Leaderboard</span>
              </button>
            )}


            <button
              onClick={() => router.push("/")}
              className="mx-auto mt-2 w-[90%] sm:w-4/5 md:w-2/3 block relative flex justify-center items-center px-4 py-3 text-[#ff3c83] text-sm sm:text-base md:text-lg tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
            >
              <span className="relative z-10 leading-none">
                Return to Home
              </span>
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