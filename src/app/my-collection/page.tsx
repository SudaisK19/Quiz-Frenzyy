"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rehostMessage, setRehostMessage] = useState<string>("");
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [currentQuizSessions, setCurrentQuizSessions] = useState<Session[]>([]);
  const [currentQuizTitle, setCurrentQuizTitle] = useState("");
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
          setCollection({
            hosted_quizzes: data.hosted_quizzes,
            participated_quizzes: data.participated_quizzes,
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

  // Rehost Quiz function remains unchanged.
  const handleRehostQuiz = async (quizId: string) => {
    try {
      const res = await fetch("/api/quizzes/rehost", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, duration: 10 }),
      });

      const rawText = await res.text();
      console.log("Rehost raw response:", rawText);
      const data = JSON.parse(rawText);

      if (data.success) {
        setRehostMessage(`New session created for quiz ${quizId}! Join code: ${data.join_code}`);
      } else {
        setRehostMessage("Rehost failed: " + data.error);
      }
    } catch (err) {
      console.error("Rehost error:", err);
      setRehostMessage("Rehost failed: " + err);
    }
  };

  // Updated function to fetch sessions using the new route (/api/quizzes/sessions-list)
  const handleViewSessions = async (quizId: string, quizTitle: string) => {
    try {
      const res = await fetch(`/api/quizzes/sessions-list?quizId=${quizId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        // Expecting an array of sessions from the new route.
        setCurrentQuizSessions(data.sessions);
        setCurrentQuizTitle(quizTitle);
        setShowSessionsModal(true);
      } else {
        alert("Failed to fetch sessions: " + data.error);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      alert("Failed to fetch sessions");
    }
  };

  // When a session is selected, navigate to the leaderboard for that session.
  const handleSelectSession = (sessionId: string) => {
    setShowSessionsModal(false);
    router.push(`/leaderboard?session_id=${sessionId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>My Collection</h1>

      <h3>Hosted Quizzes:</h3>
      {collection?.hosted_quizzes.length ? (
        <ul>
          {collection.hosted_quizzes.map((quiz, index) => (
            <li key={`${quiz._id}-${index}`} style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h4>{quiz.title}</h4>
                  <p>{quiz.description}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleRehostQuiz(quiz._id)}
                    style={{ padding: "6px 12px", marginRight: "10px" }}
                  >
                    Rehost Quiz
                  </button>
                  <button
                    onClick={() => handleViewSessions(quiz._id, quiz.title)}
                    style={{ padding: "6px 12px" }}
                  >
                    View Sessions
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hosted quizzes.</p>
      )}

      {rehostMessage && <p>{rehostMessage}</p>}

      <h3>Played Quizzes:</h3>
      {collection?.participated_quizzes.length ? (
        <ul>
          {collection.participated_quizzes.map((quiz, index) => (
            <li key={`${quiz._id}-${index}`}>
              <h4>{quiz.title}</h4>
            </li>
          ))}
        </ul>
      ) : (
        <p>No played quizzes.</p>
      )}

      {/* Modal for displaying sessions */}
      {showSessionsModal && (
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
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <h3>Sessions for {currentQuizTitle}</h3>
            {currentQuizSessions.length ? (
              <ul>
                {currentQuizSessions.map((session) => (
                  <li key={session._id} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Join Code: {session.join_code}</span>
                      <button
                        onClick={() => handleSelectSession(session._id)}
                        style={{ padding: "4px 8px" }}
                      >
                        View Leaderboard
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No sessions found.</p>
            )}
            <button onClick={() => setShowSessionsModal(false)} style={{ marginTop: "10px", padding: "6px 12px" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
