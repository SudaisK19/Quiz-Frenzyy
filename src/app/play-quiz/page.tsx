"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Question {
  _id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
}

export default function PlayQuiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [quizDuration, setQuizDuration] = useState<number | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");  
  const player_quiz_id = searchParams.get("player_quiz_id"); 

  useEffect(() => {
    async function fetchQuizQuestions() {
      if (!session_id || !player_quiz_id) {
        alert("Session ID or Player Quiz ID not found!");
        router.push("/");
        return;
      }

      console.log("🔍 Fetching questions for session:", session_id);
      try {
        const res = await fetch(`/api/quizzes/session/${session_id}`);

        if (!res.ok) {
          console.error("❌ API error:", res.status, res.statusText);
          alert("Error fetching questions. Please try again.");
          return;
        }

        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions || []);
          setQuizDuration(data.duration);
        } else {
          alert("No questions found for this quiz.");
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        alert("Failed to fetch quiz questions.");
      }

      setLoading(false);
    }

    fetchQuizQuestions();
  }, [session_id, player_quiz_id]);

  // ✅ Store selected answers without submitting immediately
  function handleAnswerChange(questionId: string, answer: string) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }

  // ✅ Submit all answers at once
  async function submitQuiz() {
    if (!session_id || !player_quiz_id) {
      alert("Session ID or Player Quiz ID is missing.");
      return;
    }

    console.log("📡 Submitting all answers...");

    const answersArray = Object.entries(selectedAnswers).map(([question_id, submitted_answer]) => ({
      player_quiz_id,
      question_id,
      submitted_answer,
    }));

    if (answersArray.length === 0) {
      alert("No answers selected. Please answer at least one question before submitting.");
      return;
    }

    const response = await fetch(`/api/quizzes/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_quiz_id, answers: answersArray }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Quiz submitted successfully! Redirecting...");
      router.push(`/quiz-complete?player_quiz_id=${player_quiz_id}`);
    } else {
      alert("Error submitting quiz.");
    }
  }

  if (loading) return <p>Loading quiz...</p>;
  if (!questions.length) return <p>No questions found.</p>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Quiz Time!</h1>
      <h2>Quiz Duration: {quizDuration} minutes</h2>
      <h2>{currentQuestion.question_text}</h2>

      {/* ✅ Handle MCQ & Short Answer questions */}
      {currentQuestion.question_type === "MCQ" ? (
        currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerChange(currentQuestion._id, option)}
            style={{
              display: "block",
              margin: "10px auto",
              padding: "10px",
              backgroundColor: selectedAnswers[currentQuestion._id] === option ? "#007BFF" : "#f8f9fa",
              color: selectedAnswers[currentQuestion._id] === option ? "white" : "black",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {option}
          </button>
        ))
      ) : (
        <input
          type="text"
          value={selectedAnswers[currentQuestion._id] || ""}
          onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
          placeholder="Type your answer..."
          style={{
            display: "block",
            margin: "10px auto",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            width: "80%",
          }}
        />
      )}

      {/* ✅ Navigation Buttons */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: currentQuestionIndex === 0 ? "#ccc" : "#007BFF",
            color: "white",
            border: "none",
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>

        <button
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
          disabled={currentQuestionIndex + 1 === questions.length}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: currentQuestionIndex + 1 === questions.length ? "#ccc" : "#007BFF",
            color: "white",
            border: "none",
            cursor: currentQuestionIndex + 1 === questions.length ? "not-allowed" : "pointer",
          }}
        >
          Next
        </button>

        {/* ✅ Submit Quiz Button (Enabled only at the last question) */}
        {currentQuestionIndex + 1 === questions.length && (
          <button
            onClick={submitQuiz}
            style={{
              padding: "10px 20px",
              backgroundColor: "#DC3545",
              color: "white",
              border: "none",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
