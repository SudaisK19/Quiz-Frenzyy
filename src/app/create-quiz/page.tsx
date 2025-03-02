"use client";
import { useState, useEffect } from "react";

// ✅ Define Question Type
interface Question {
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  media_url?: string;
  points: number; // ✅ Points per question (remains)
}

// ✅ Define Quiz Type
interface Quiz {
  _id?: string;
  title: string;
  description: string;
  join_code?: string;
  created_by: string;
  duration: number; // ✅ Only one global quiz duration
  questions: Question[];
}

export default function CreateQuiz() {
  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    description: "",
    created_by: "",
    duration: 10, // ✅ Default quiz duration in minutes
    questions: [],
  });

  const [loading, setLoading] = useState(false);

  // ✅ Fetch Logged-in User ID
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

  // ✅ Add New Question
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
          points: 10, // ✅ Default 10 points per question
        },
      ],
    }));
  }

  // ✅ Handle Input Change for Quiz Details
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Quiz) {
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      [field]: field === "duration" ? Number(event.target.value) : event.target.value, // ✅ Ensure duration is a number
    }));
  }

  // ✅ Handle Input Change for Questions
  function handleQuestionChange(index: number, field: keyof Question, value: string | number | string[]) {
    setQuiz((prevQuiz) => {
      const updatedQuestions = [...prevQuiz.questions];

      if (field === "points") {
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: Number(value) }; // ✅ Ensure points are numbers
      } else if (field === "options" && Array.isArray(value)) {
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: [...value] };
      } else {
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value as string };
      }

      return { ...prevQuiz, questions: updatedQuestions };
    });
  }

  // ✅ Handle Options Change for MCQs
  function handleOptionChange(qIndex: number, optIndex: number, value: string) {
    setQuiz((prevQuiz) => {
      const updatedQuestions = [...prevQuiz.questions];
      updatedQuestions[qIndex] = {
        ...updatedQuestions[qIndex],
        options: updatedQuestions[qIndex].options.map((opt, i) => (i === optIndex ? value : opt)),
      };

      return { ...prevQuiz, questions: updatedQuestions };
    });
  }
  async function handleCreateQuiz() {
    if (!quiz.created_by) {
      alert("User ID not found. Try logging in again.");
      return;
    }

    // ✅ Compute total quiz points before sending to API
    const totalPoints = quiz.questions.reduce((sum: number, q: Question) => sum + (q.points || 0), 0);

    setLoading(true);
    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...quiz, total_points: totalPoints }), // includes quiz.questions
    });
    

    const data = await response.json();
    setLoading(false);

    if (data.success) {
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        _id: data.quiz._id,
        join_code: data.session_join_code, // ✅ Store session join code
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

      {/* ✅ Added Quiz Duration Input */}
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
          </select>

          {/* Show Options for MCQs */}
          {q.question_type === "MCQ" && (
            <div>
              <h4>Options</h4>
              {q.options.map((opt, optIndex) => (
                <input
                  key={optIndex}
                  type="text"
                  placeholder={`Option ${optIndex + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                  style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
                />
              ))}
            </div>
          )}

          <input
            type="text"
            placeholder="Correct Answer"
            value={q.correct_answer}
            onChange={(e) => handleQuestionChange(qIndex, "correct_answer", e.target.value)}
            style={{ width: "100%", padding: "5px", marginTop: "5px" }}
          />

          {/* ✅ Added Points Input (Timer Removed) */}
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
          <p>Session Join Code (For Players): <strong>{quiz.join_code ? quiz.join_code : "Not Available"}</strong></p> 
        </div>
      )}
    </div>
  );
}
