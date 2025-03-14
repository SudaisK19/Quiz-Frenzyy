"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  question_text: string;
  question_type: "MCQ" | "Short Answer" | "Image" | "Ranking";
  options: string[];
  // For MCQ and Short Answer, this is a string (or comma‐separated acceptable answers).
  // For Ranking, the correct order will be the order in which options are entered.
  correct_answer: string | string[];
  // For Image questions, store a single image URL
  media_url?: string;
  hint?: string;
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
          media_url: "", // For image questions
        },
      ],
    }));
  }

  // Remove a question.
  function removeQuestion(index: number) {
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      questions: prevQuiz.questions.filter((_, i) => i !== index),
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
      updatedQuestions[qIndex].options[optIndex] = value;
      return { ...prevQuiz, questions: updatedQuestions };
    });
  }

  // Handle file upload for Image questions (one image per question)
  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    qIndex: number
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        // Set the media_url for the question (a single image URL)
        handleQuestionChange(qIndex, "media_url", data.imageUrl);
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Image upload failed.");
    }
  }

  // Create the quiz by sending data to the API.
  async function handleCreateQuiz() {
    if (!quiz.created_by) {
      alert("User ID not found. Try logging in again.");
      return;
    }
    // For Ranking questions, the correct answer is simply the order of options.
    quiz.questions.forEach((q) => {
      if (q.question_type === "Ranking") {
        q.correct_answer = [...q.options];
      }
    });

    // For Short Answer questions, convert the comma-separated string into an array if needed.
    quiz.questions.forEach((q) => {
      if (q.question_type === "Short Answer" && typeof q.correct_answer === "string") {
        q.correct_answer = q.correct_answer
          .split(",")
          .map((ans) => ans.trim())
          .filter((ans) => ans);
      }
    });

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
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        _id: data.quiz._id,
        join_code: data.session.join_code,
        session_id: data.session.sessionId,
      }));
      alert("Quiz Created Successfully!");
    } else {
      alert("Error creating quiz: " + data.error);
    }
  }

  return (
    <div style={{ textAlign: "center", padding: "20px", maxWidth: "600px", margin: "auto" }}>
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
        <div key={qIndex} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Question Text"
            value={q.question_text}
            onChange={(e) => handleQuestionChange(qIndex, "question_text", e.target.value)}
            style={{ width: "100%", padding: "5px" }}
          />
          <select
            value={q.question_type}
            onChange={(e) => handleQuestionChange(qIndex, "question_type", e.target.value)}
            style={{ width: "100%", marginTop: "5px" }}
          >
            <option value="MCQ">Multiple Choice</option>
            <option value="Short Answer">Short Answer</option>
            <option value="Image">Image</option>
            <option value="Ranking">Ranking</option>
          </select>

          {/* For Image type: show a file upload input */}
          {q.question_type === "Image" && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, qIndex)}
                style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
              />
              {q.media_url && (
                <img src={q.media_url} alt="Uploaded" style={{ width: "100px", height: "100px" }} />
              )}
            </div>
          )}

          {/* For MCQ, Ranking, and Image types, display options.
              For Ranking, the placeholder indicates the rank */}
          {(q.question_type === "MCQ" ||
            q.question_type === "Ranking" ||
            q.question_type === "Image") && (
            <div>
              <h4>
                {q.question_type === "Ranking"
                  ? "Enter Options in Correct Order (This order is the correct ranking)"
                  : "Options"}
              </h4>
              {q.options.map((opt, optIndex) => (
                <input
                  key={optIndex}
                  type="text"
                  placeholder={
                    q.question_type === "Ranking"
                      ? `Rank ${optIndex + 1} option`
                      : `Option ${optIndex + 1}`
                  }
                  value={opt}
                  onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                  style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
                />
              ))}
            </div>
          )}

          {/* For Short Answer questions */}
          {q.question_type === "Short Answer" && (
            <div>
              <input
                type="text"
                placeholder="Hint for players (optional)"
                value={q.hint || ""}
                onChange={(e) => handleQuestionChange(qIndex, "hint", e.target.value)}
                style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
              />
              <input
                type="text"
                placeholder="Acceptable Answers (comma separated)"
                value={
                  Array.isArray(q.correct_answer)
                    ? (q.correct_answer as string[]).join(", ")
                    : (q.correct_answer as string)
                }
                onChange={(e) => {
                  // Store the raw string; conversion happens in handleCreateQuiz
                  handleQuestionChange(qIndex, "correct_answer", e.target.value);
                }}
                style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
              />
            </div>
          )}

          {/* For MCQ and Image types (non-Short Answer and non-Ranking), use a text input to enter the correct answer */}
          {(q.question_type === "MCQ" || q.question_type === "Image") && (
            <div>
              <h4>Enter Correct Answer</h4>
              <input
                type="text"
                placeholder="Correct Answer"
                value={q.correct_answer as string}
                onChange={(e) => handleQuestionChange(qIndex, "correct_answer", e.target.value)}
                style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
              />
            </div>
          )}

          <input
            type="number"
            placeholder="Points"
            value={q.points}
            onChange={(e) => handleQuestionChange(qIndex, "points", e.target.value)}
            style={{ width: "100%", padding: "5px", marginTop: "5px" }}
          />
          <button
            onClick={() => removeQuestion(qIndex)}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "5px 10px",
              marginTop: "10px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Remove Question
          </button>
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