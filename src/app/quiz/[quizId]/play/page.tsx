"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


interface Quiz {
  _id: string;
  title: string;
  description: string;
  created_by: string;
}

export default function PlayQuiz() {
  const { quizId } = useParams(); // ✅ Get quiz ID from URL
  const [quiz, setQuiz] = useState<Quiz | null>(null); // ✅ Initialize with proper type
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        const data = await response.json();
        if (data.success) {
          setQuiz(data.quiz);
        } else {
          console.error("Quiz not found");
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
      setLoading(false);
    }

    fetchQuiz();
  }, [quizId]);

  if (loading) return <p>Loading...</p>;
  if (!quiz) return <p>Quiz not found.</p>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>
      <button onClick={() => alert("Start Quiz!")}>Start Quiz</button>
    </div>
  );
}
