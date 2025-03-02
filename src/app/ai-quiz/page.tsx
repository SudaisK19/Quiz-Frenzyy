"use client";

import React, { useState, useEffect } from "react";

// Only points are configurable now.
interface QuestionConfig {
  points: number;
}

// Interface for returned quiz/session details
interface QuizData {
  quizId: string;
  sessionId: string;
  join_code: string;
  message: string;
}

export default function AIQuizPage() {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(10); // Quiz duration in minutes
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionConfigs, setQuestionConfigs] = useState<QuestionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  // When numQuestions changes, update questionConfigs accordingly
  useEffect(() => {
    setQuestionConfigs((prev) => {
      const newConfigs = [...prev];
      if (newConfigs.length < numQuestions) {
        // Add default configurations for additional questions
        for (let i = newConfigs.length; i < numQuestions; i++) {
          newConfigs.push({ points: 10 });
        }
      } else if (newConfigs.length > numQuestions) {
        // Truncate the array if there are too many
        newConfigs.length = numQuestions;
      }
      return newConfigs;
    });
  }, [numQuestions]);

  // Handle quiz generation
  async function handleGenerateQuiz() {
    try {
      setLoading(true);
      setMessage("Generating quiz via AI...");

      const response = await fetch("/api/ai-quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies are sent
        body: JSON.stringify({
          topic,
          numQuestions,
          duration,
          questionConfigs,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setMessage("Quiz generated successfully!");
        // Store the returned quiz/session data in state
        setQuizData({
          quizId: data.quizId,
          sessionId: data.sessionId,
          join_code: data.join_code,
          message: data.message,
        });
      } else {
        setMessage(`Error: ${data.error || "Failed to generate quiz"}`);
      }
    } catch (error) {
      console.error("❌ Error generating AI quiz:", error);
      setLoading(false);
      setMessage("Failed to generate quiz");
    }
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Generate AI-Powered MCQ Quiz</h1>

      <p style={{ fontStyle: "italic" }}>
        Note: All questions will be <strong>multiple choice</strong>.
      </p>

      <div style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Topic (e.g. JavaScript, Biology, etc.)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ width: "300px", padding: "8px" }}
        />
      </div>

      <div style={{ margin: "20px 0" }}>
        <label>
          Quiz Duration (minutes):{" "}
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{ width: "80px", padding: "8px", marginLeft: "8px" }}
          />
        </label>
      </div>

      <div style={{ margin: "20px 0" }}>
        <label>
          Number of Questions:{" "}
          <input
            type="number"
            min={1}
            max={50}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            style={{ width: "80px", padding: "8px", marginLeft: "8px" }}
          />
        </label>
      </div>

      {/* Only points are configurable per question */}
      <div
        style={{
          margin: "20px auto",
          textAlign: "left",
          maxWidth: "400px",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "4px",
        }}
      >
        <h3>Configure Each Question (Points):</h3>
        {questionConfigs.map((config, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            <p>
              <strong>Question {index + 1}:</strong>
            </p>
            <label>
              Points:{" "}
              <input
                type="number"
                min={1}
                value={config.points}
                onChange={(e) => {
                  const newPoints = Number(e.target.value);
                  setQuestionConfigs((prev) => {
                    const newConfigs = [...prev];
                    newConfigs[index] = { ...newConfigs[index], points: newPoints };
                    return newConfigs;
                  });
                }}
                style={{ width: "60px", padding: "4px", marginLeft: "4px" }}
              />
            </label>
          </div>
        ))}
      </div>

      <button onClick={handleGenerateQuiz} disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "Generating..." : "Generate AI MCQ Quiz"}
      </button>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}

      {quizData && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "20px", borderRadius: "4px" }}>
          <h2>Quiz Created!</h2>
          <p>
            <strong>Quiz ID:</strong> {quizData.quizId}
          </p>
          <p>
            <strong>Session Join Code (For Players):</strong>{" "}
            {quizData.join_code ? quizData.join_code : "Not Available"}
          </p>
        </div>
      )}
    </div>
  );
}
