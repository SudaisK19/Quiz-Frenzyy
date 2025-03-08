"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  media_url?: string;
  points: number;
}

interface Quiz {
  _id?: string;
  title: string;
  description: string;
  join_code?: string;
  session_id?: string;
  created_by: string;
  duration: number;
  questions: Question[];
}

export default function CreateQuiz() {
  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    description: "",
    created_by: "",
    duration: 10,
    questions: [],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch logged-in user and set created_by field.
  useEffect(() => {
    fetch("/api/users/profile", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuiz((prev) => ({ ...prev, created_by: data.user._id }));
        }
      })
      .catch(() => console.error("Failed to fetch user profile"));
  }, []);

  // Add a new empty question.
  function addQuestion() {
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      questions: [
        ...prevQuiz.questions,
        {
          question_text: "",
          question_type: "MCQ",
          options: ["", "", "", ""],
          correct_answer: "",
          points: 10,
        },
      ],
    }));
  }

  // Handle change in quiz details.
  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Quiz
  ) {
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      [field]:
        field === "duration" ? Number(event.target.value) : event.target.value,
    }));
  }

  // Handle changes in question fields.
  function handleQuestionChange(
    index: number,
    field: keyof Question,
    value: string | number | string[]
  ) {
    setQuiz((prevQuiz) => {
      const updatedQuestions = [...prevQuiz.questions];
      if (field === "points") {
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [field]: Number(value),
        };
      } else if (field === "options" && Array.isArray(value)) {
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [field]: [...value],
        };
      } else {
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [field]: value as string,
        };
      }
      return { ...prevQuiz, questions: updatedQuestions };
    });
  }

  // Handle option change for a specific question.
  function handleOptionChange(qIndex: number, optIndex: number, value: string) {
    setQuiz((prevQuiz) => {
      const updatedQuestions = [...prevQuiz.questions];
      updatedQuestions[qIndex] = {
        ...updatedQuestions[qIndex],
        options: updatedQuestions[qIndex].options.map((opt, i) =>
          i === optIndex ? value : opt
        ),
      };
      return { ...prevQuiz, questions: updatedQuestions };
    });
  }

  // Create the quiz by sending data to the API.
  async function handleCreateQuiz() {
    if (!quiz.created_by) {
      alert("User ID not found. Try logging in again.");
      return;
    }

    // Compute total points for the quiz.
    const totalPoints = quiz.questions.reduce(
      (sum: number, q: Question) => sum + (q.points || 0),
      0
    );

    setLoading(true);
    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...quiz, total_points: totalPoints }),
    });
    const data = await response.json();
    setLoading(false);

    if (data.success) {
      // Assume API returns quiz._id, session_join_code, and session_id.
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        _id: data.quiz._id,
        join_code: data.session_join_code,
        session_id: data.session_id,
      }));
      alert("Quiz Created Successfully!");
      // Removed badge update logic
    } else {
      alert("Error creating quiz: " + data.error);
    }
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        maxWidth: "600px",
        margin: "auto",
      }}
    >
      <h1>Create a New Quiz</h1>
      <input
        type="text"
        placeholder="Quiz Title"
        value={quiz.title}
        onChange={(e) => handleInputChange(e, "title")}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <textarea
        placeholder="Quiz Description"
        value={quiz.description}
        onChange={(e) => handleInputChange(e, "description")}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <input
        type="number"
        placeholder="Quiz Duration (minutes)"
        value={quiz.duration}
        onChange={(e) => handleInputChange(e, "duration")}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <h2>Questions</h2>
      {quiz.questions.map((q, qIndex) => (
        <div
          key={qIndex}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Question Text"
            value={q.question_text}
            onChange={(e) =>
              handleQuestionChange(qIndex, "question_text", e.target.value)
            }
            style={{ width: "100%", padding: "5px" }}
          />
          <select
            value={q.question_type}
            onChange={(e) =>
              handleQuestionChange(qIndex, "question_type", e.target.value)
            }
            style={{ width: "100%", marginTop: "5px" }}
          >
            <option value="MCQ">Multiple Choice</option>
            <option value="Short Answer">Short Answer</option>
          </select>
          {q.question_type === "MCQ" && (
            <div>
              <h4>Options</h4>
              {q.options.map((opt, optIndex) => (
                <input
                  key={optIndex}
                  type="text"
                  placeholder={`Option ${optIndex + 1}`}
                  value={opt}
                  onChange={(e) =>
                    handleOptionChange(qIndex, optIndex, e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "5px",
                    marginBottom: "5px",
                  }}
                />
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="Correct Answer"
            value={q.correct_answer}
            onChange={(e) =>
              handleQuestionChange(qIndex, "correct_answer", e.target.value)
            }
            style={{ width: "100%", padding: "5px", marginTop: "5px" }}
          />
          <input
            type="number"
            placeholder="Points"
            value={q.points}
            onChange={(e) => handleQuestionChange(qIndex, "points", e.target.value)}
            style={{ width: "100%", padding: "5px", marginTop: "5px" }}
          />
        </div>
      ))}
      <button onClick={addQuestion} style={{ padding: "10px 20px", margin: "10px 0" }}>
        Add Question
      </button>
      <button onClick={handleCreateQuiz} disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "Creating..." : "Create Quiz"}
      </button>

      {quiz._id && (
        <div>
          <h2>Quiz Created!</h2>
          <p>Title: {quiz.title}</p>
          <p>
            Session Join Code (For Players):{" "}
            <strong>{quiz.join_code ? quiz.join_code : "Not Available"}</strong>
          </p>
          {/* View Leaderboard button for the host */}
          <button
            onClick={() => {
              if (quiz.session_id) {
                router.push(`/leaderboard?session_id=${quiz.session_id}`);
              } else {
                alert("No session ID found!");
              }
            }}
            style={{ padding: "10px 20px", margin: "10px 0" }}
          >
            View Leaderboard 🏆
          </button>
        </div>
      )}
    </div>
  );
}
