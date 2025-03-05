"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Quiz {
  _id: string;
  title: string;
  description: string;
}

interface UserCollection {
  hosted_quizzes: Quiz[];
  participated_quizzes: Quiz[];
}

export default function MyCollection() {
  const [collection, setCollection] = useState<UserCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // For displaying rehost messages
  const [rehostMessage, setRehostMessage] = useState<string>("");

  useEffect(() => {
    fetch("/api/quizzes/user", {
      method: "GET",
      credentials: "include", // <-- Include credentials if needed for auth
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

  // Rehost Quiz function
  const handleRehostQuiz = async (quizId: string) => {
    try {
      // Use credentials if your route is protected
      const res = await fetch("/api/quizzes/rehost", {
        method: "POST",
        credentials: "include", // <-- Ensure cookies are sent if route requires auth
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, duration: 10 }), // Adjust duration as needed
      });

      // For debugging: read raw text first
      const rawText = await res.text();
      console.log("Rehost raw response:", rawText);

      // Attempt to parse JSON
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>My Collection</h1>

      <h3>Hosted Quizzes:</h3>
      {collection?.hosted_quizzes.length ? (
        <ul>
          {collection.hosted_quizzes.map((quiz, index) => (
            // Use composite key: quiz._id + index to ensure uniqueness
            <li key={`${quiz._id}-${index}`} style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4>{quiz.title}</h4>
                <button
                  onClick={() => handleRehostQuiz(quiz._id)}
                  style={{ padding: "6px 12px", marginLeft: "10px" }}
                >
                  Rehost Quiz
                </button>
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
            // Similarly, use composite key here if needed
            <li key={`${quiz._id}-${index}`}>
              <h4>{quiz.title}</h4>
            </li>
          ))}
        </ul>
      ) : (
        <p>No played quizzes.</p>
      )}
    </div>
  );
}
