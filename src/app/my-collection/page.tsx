"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Quiz {
  _id: string;
  title: string;
  description: string;
}

interface Session {
  _id: string;
  join_code: string;
  start_time: string;
  end_time: string;
}

interface UserCollection {
  hosted_quizzes: Quiz[];
  participated_quizzes: Quiz[];
}

export default function MyCollection() {
  const [collection, setCollection] = useState<UserCollection | null>(null);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rehostMessage, setRehostMessage] = useState<string>("");
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [currentQuizSessions, setCurrentQuizSessions] = useState<Session[]>([]);
  const [currentQuizTitle, setCurrentQuizTitle] = useState("");
  const [sessionCounts, setSessionCounts] = useState<{ [key: string]: number }>({});
  const router = useRouter();

  useEffect(() => {
    fetch("/api/quizzes/user", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          const uniqueHosted = new Map<string, Quiz>();
          const uniquePlayed = new Map<string, Quiz>();
          data.hosted_quizzes.forEach((quiz: Quiz) => uniqueHosted.set(quiz._id, quiz));
          data.participated_quizzes.forEach((quiz: Quiz) => uniquePlayed.set(quiz._id, quiz));

          setCollection({
            hosted_quizzes: Array.from(uniqueHosted.values()),
            participated_quizzes: Array.from(uniquePlayed.values()),
          });

          // Fetch session counts for hosted quizzes
          Array.from(uniqueHosted.values()).forEach(async (quiz) => {
            const res2 = await fetch(`/api/quizzes/sessions-list?quizId=${quiz._id}`, {
              method: "GET",
              credentials: "include",
            });
            const d2 = await res2.json();
            if (d2.success) {
              setSessionCounts((prev) => ({
                ...prev,
                [quiz._id]: d2.sessions.length,
              }));
            }
          });
        } else {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load quizzes:", err);
        setError("Failed to load quizzes");
        setLoading(false);
      });
  }, []);

  const handleStartQuiz = async (quizId: string) => {
    try {
      const res = await fetch("/api/quizzes/session/start", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, duration: 10 }),
      });
      const data = await res.json();

      if (data.success) {
        setRehostMessage(`Quiz started! Join Code: ${data.join_code}`);
        setSessionCounts((prev) => ({
          ...prev,
          [quizId]: (prev[quizId] || 0) + 1,
        }));
      } else {
        setRehostMessage("Start failed: " + data.error);
      }
    } catch (err) {
      console.error("Start error:", err);
      setRehostMessage("Start failed: " + err);
    }
  };

  const handleRehostQuiz = async (quizId: string) => {
    try {
      const res = await fetch("/api/quizzes/rehost", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, duration: 10 }),
      });

      const data = await res.json();
      if (data.success) {
        setRehostMessage(`New session created! Join Code: ${data.join_code}`);
        setSessionCounts((prev) => ({
          ...prev,
          [quizId]: (prev[quizId] || 0) + 1,
        }));
      } else {
        setRehostMessage("Rehost failed: " + data.error);
      }
    } catch (err) {
      console.error("Rehost error:", err);
      setRehostMessage("Rehost failed: " + err);
    }
  };

  const handleViewSessions = async (quizId: string, quizTitle: string) => {
    try {
      const res = await fetch(`/api/quizzes/sessions-list?quizId=${quizId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCurrentQuizSessions(data.sessions);
        setCurrentQuizTitle(quizTitle);
        setShowSessionsModal(true);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch sessions.");
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to fetch sessions. Please try again.");
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setShowSessionsModal(false);
    router.push(`/leaderboard?session_id=${sessionId}`);
  };

  const handleViewResults = (sessionId: string) => {
    setShowSessionsModal(false);
    router.push(`/results/${sessionId}`);
  };

  return (
    <>
      <Header />
      <div className="flex justify-center items-center p-6 min-h-screen w-full">
        <div className="bg-[#242424] p-10 rounded-[30px] shadow-lg flex flex-col w-11/12 md:w-9/10 max-w-7xl mx-auto my-10">
          {/* 🔹 Hosted Quizzes */}
          <div className="bg-[#333436] rounded-[20px] p-6 mb-6">
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            <h2 className="text-4xl text-white mb-6 ml-2">
              Hosted <span className="text-pink-400">Quizzes</span>
            </h2>

            {collection?.hosted_quizzes.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {collection.hosted_quizzes.map((quiz) => {
                  const sessionCount = sessionCounts[quiz._id] || 0;
                  return (
                    <div
                      key={quiz._id}
                      className="bg-[#1e1e1e] p-5 rounded-xl shadow-lg flex flex-col justify-between"
                    >
                      <h4 className="text-white text-lg mb-2 break-words text-center w-full mb-8">
                        {quiz.title}
                      </h4>

                      <div className="flex flex-col gap-3 w-full">
                        {sessionCount === 0 ? (
                          <button
                            onClick={() => handleStartQuiz(quiz._id)}
                            className="w-full relative flex justify-center items-center px-4 py-2 text-[#ff3c83] tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
                          >
                            <span className="relative z-10 text-sm sm:text-base md:text-lg leading-none">
                              Start Quiz
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRehostQuiz(quiz._id)}
                            className="w-full relative flex justify-center items-center px-4 py-2 text-[#ff3c83] tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
                            >
                            <span className="relative z-10 text-sm sm:text-base md:text-lg leading-none">
                              Rehost
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() => handleViewSessions(quiz._id, quiz.title)}
                          className="w-full relative flex justify-center items-center px-4 py-2 text-[#ff3c83] tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
                          >
                          <span className="relative z-10 text-sm sm:text-base md:text-lg leading-none">
                            View Sessions
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400 mt-4">You have no hosted quizzes.</p>
            )}
          </div>

          {/* 🔹 Played Quizzes */}
          <div className="bg-[#333436] rounded-[20px] p-6">
            <h2 className="text-4xl text-white mb-6 ml-2">
              Played <span className="text-pink-400">Quizzes</span>
            </h2>

            {collection?.participated_quizzes.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {collection.participated_quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="bg-[#1e1e1e] p-5 rounded-xl shadow-lg flex flex-col justify-between"
                  >
                    <h4 className="text-white text-lg mb-2 break-words text-center w-full mb-8">
                      {quiz.title}
                    </h4>
                    <div className="flex flex-col gap-3 w-full">
                      <button
                        onClick={() => handleViewSessions(quiz._id, quiz.title)}
                        className="w-full relative flex justify-center items-center px-4 py-2 text-[#ff3c83] tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
                        >
                        <span className="relative z-10 text-sm sm:text-base md:text-lg leading-none">
                          View Sessions
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400">No played quizzes.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/65 z-50 overflow-y-auto">
          <div className="bg-[#242424] p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-[#ec5f80] text-xl mb-4">Sessions for {currentQuizTitle}</h3>
            {currentQuizSessions.length ? (
              <ul className="space-y-2">
                {currentQuizSessions.map((session) => (
                  <li
                    key={session._id}
                    className="bg-[#1e1e1e] p-3 rounded-md flex justify-between items-center"
                  >
                    <span className="text-gray-400">Join Code: {session.join_code}</span>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleSelectSession(session._id)}
                        className="px-3 py-1 border border-[#ec5f80] text-[#ec5f80] rounded-full transition hover:bg-white hover:text-[#ec5f80]"
                      >
                        View Leaderboard
                      </button>
                      <button
                        onClick={() => handleViewResults(session._id)}
                        className="px-3 py-1 border border-[#ec5f80] text-[#ec5f80] rounded-full transition hover:bg-white hover:text-[#ec5f80]"
                      >
                        View Results
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No sessions found.</p>
            )}
            <button
              onClick={() => setShowSessionsModal(false)}
              className="mt-5 px-6 py-2 w-auto mx-auto block border border-[#ec5f80] text-[#ec5f80] rounded-full transition hover:bg-white hover:text-[#ec5f80]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Rehost Message Modal */}
      {rehostMessage && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/65 z-50">
          <div className="bg-[#242424] p-6 rounded-lg w-80 text-center shadow-lg">
            <h3 className="text-green-400 text-lg font-semibold mb-4">Quiz Session Created Successfully!</h3>
            <p className="text-gray-300">{rehostMessage}</p>
            <button
              onClick={() => setRehostMessage("")}
              className="w-full mt-4 px-4 py-2 border border-[#ec5f80] text-[#ec5f80] rounded-full transition hover:bg-white hover:text-[#ec5f80]"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}