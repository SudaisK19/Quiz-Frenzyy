"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


interface Question {
  question_text: string;
  question_type: "MCQ" | "Short Answer" | "Image" | "Ranking";
  options: string[];
  correct_answer: string | string[];
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
          media_url: "",
        },
      ],
    }));
  }

  function removeQuestion(index: number) {
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      questions: prevQuiz.questions.filter((_, i) => i !== index),
    }));
  }

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

  function handleQuestionChange(
    index: number,
    field: keyof Question,
    value: string | number | string[]
  ) {
    setQuiz((prevQuiz) => {
      const updatedQuestions = [...prevQuiz.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      };
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

  async function handleCreateQuiz() {
    setLoading(true);

    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...quiz, total_points: totalPoints }),
    });

    const data = await response.json();
    setLoading(false);

    if (data.success) {
      router.push(`/quiz/${data.quiz._id}`);
    } else {
      alert("Error creating quiz: " + data.error);
    }
  }

  return (
    <>
      <Header/>
      <div className="flex justify-center items-center min-h-screen px-4 py-6">
        <div className="bg-[#242424] p-6 sm:p-10 rounded-[30px] shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl text-center">
          <div className="flex-1 bg-[#333436] rounded-[30px] p-6 sm:p-10">
            <h1 className="text-4xl text-white text-center mb-6">
              Create <span className="text-[#ec5f80]">Your Own</span> Quiz
            </h1>
            {/* Quiz Title */}
            <input
              type="text"
              placeholder="Quiz Title"
              value={quiz.title}
              onChange={(e) => handleInputChange(e, "title")}
              className="w-full text-center p-1 sm:p-2 md:p-2 mb-4 rounded-full bg-[#1e1e1e] 
              text-white text-xs sm:text-sm md:text-base 
              placeholder-gray-400 border border-[#ff3c83] truncate 
              focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
            />
            

            {/* Quiz Description */}
            <textarea
              placeholder="Quiz Description"
              value={quiz.description}
              onChange={(e) => handleInputChange(e, "description")}
              className="w-full text-center p-1 sm:p-2 md:p-2 mb-2 rounded-full bg-[#1e1e1e] 
              text-white text-xs sm:text-sm md:text-base 
              placeholder-gray-400 border border-[#ff3c83] truncate 
              focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
            />

            {/* Quiz Duration */}
            <div>
              <label className="block text-gray-400 text-sm sm:text-base">Duration (mins)</label>
              <input
                type="number"
                min={1}
                value={quiz.duration}
                onChange={(e) => handleInputChange(e, "duration")}
                className="w-full text-center p-1 sm:p-2 rounded-full bg-[#1e1e1e] 
                text-white  text-xs sm:text-sm md:text-base 
                placeholder-gray-400 border border-[#ff3c83] 
                focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
              />
            </div>

            {/*Questions */}
            {quiz.questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-[#242424] p-4 rounded-lg mt-4">
                <h3 className="text-[#ec5f80] text-lg">Question {qIndex + 1}</h3>

                {/* Question Text Input */}
                <input
                  type="text"
                  placeholder="Question Text"
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(qIndex, "question_text", e.target.value)}
                  className="w-full p-2 rounded bg-[#1e1e1e] text-white 
                            placeholder-gray-400 border border-[#ec5f80]
                            focus:ring-2 focus:ring-[#ec5f80] focus:outline-none mt-2"
                />

                {/* Question Type Select */}
                <select
                  value={q.question_type}
                  onChange={(e) => handleQuestionChange(qIndex, "question_type", e.target.value)}
                  className="w-full p-2 rounded bg-[#1e1e1e] text-white 
                            border border-[#ec5f80] focus:ring-2 focus:ring-[#ec5f80] 
                            focus:outline-none mt-2"
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="Short Answer">Short Answer</option>
                  <option value="Image">Image</option>
                  <option value="Ranking">Ranking</option>
                </select>

                {/* Image Upload */}
                {q.question_type === "Image" && (
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, qIndex)}
                      className="w-full p-2 rounded bg-[#1e1e1e] text-white border border-[#ec5f80]"
                    />
                    {q.media_url && (
                      <img src={q.media_url} alt="Uploaded" className="mt-2 rounded-lg w-24 h-24" />
                    )}
                  </div>
                )}

                {/* Options for MCQ, Ranking, Image */}
                {(q.question_type === "MCQ" || q.question_type === "Ranking" || q.question_type === "Image") && (
                  <div className="mt-2">
                    <h4 className="text-[#ec5f80] text-md">
                      {q.question_type === "Ranking"
                        ? "Enter Options in Correct Order (Ranking)"
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
                        className="w-full p-2 rounded bg-[#1e1e1e] text-white 
                                  placeholder-gray-400 border border-[#ec5f80]
                                  focus:ring-2 focus:ring-[#ec5f80] focus:outline-none mt-2"
                      />
                    ))}
                  </div>
                )}

                {/* Short Answer Inputs */}
                {q.question_type === "Short Answer" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Hint for players (optional)"
                      value={q.hint || ""}
                      onChange={(e) => handleQuestionChange(qIndex, "hint", e.target.value)}
                      className="w-full p-2 rounded bg-[#1e1e1e] text-white 
                                placeholder-gray-400 border border-[#ec5f80]
                                focus:ring-2 focus:ring-[#ec5f80] focus:outline-none mt-2"
                    />
                    <input
                      type="text"
                      placeholder="Acceptable Answers (comma separated)"
                      value={
                        Array.isArray(q.correct_answer)
                          ? (q.correct_answer as string[]).join(", ")
                          : (q.correct_answer as string)
                      }
                      onChange={(e) => handleQuestionChange(qIndex, "correct_answer", e.target.value)}
                      className="w-full p-2 rounded bg-[#1e1e1e] text-white 
                                placeholder-gray-400 border border-[#ec5f80]
                                focus:ring-2 focus:ring-[#ec5f80] focus:outline-none mt-2"
                    />
                  </div>
                )}

                {/* Correct Answer Input for MCQ & Image */}
                {(q.question_type === "MCQ" || q.question_type === "Image") && (
                  <div className="mt-2">
                    <h4 className="text-[#ec5f80] text-md">Enter Correct Answer</h4>
                    <input
                      type="text"
                      placeholder="Correct Answer"
                      value={q.correct_answer as string}
                      onChange={(e) => handleQuestionChange(qIndex, "correct_answer", e.target.value)}
                      className="w-full p-2 rounded bg-[#1e1e1e] text-white 
                                placeholder-gray-400 border border-[#ec5f80]
                                focus:ring-2 focus:ring-[#ec5f80] focus:outline-none mt-2"
                    />
                  </div>
                )}

                {/* Points Input */}
                <input
                  type="number"
                  placeholder="Points"
                  value={q.points}
                  onChange={(e) => handleQuestionChange(qIndex, "points", e.target.value)}
                  className="w-full p-2 rounded bg-[#1e1e1e] text-white 
                            placeholder-gray-400 border border-[#ec5f80]
                            focus:ring-2 focus:ring-[#ec5f80] focus:outline-none mt-2"
                />

                {/* Remove Question Button */}
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="w-full bg-red-600 text-white p-2 rounded mt-4 
                            hover:bg-red-700 transition-all duration-200"
                >
                  Remove Question
                </button>
              </div>
            ))}


            <button
              onClick={addQuestion}
              className="w-full px-4 py-2 bg-pink-500 hover:bg-pink-400 transition rounded text-white font-semibold mb-4"
            >
              + Add Question
            </button>

            {/* Create Quiz Button */}
            <button
              onClick={handleCreateQuiz}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 transition rounded text-white font-bold"
            >
              {loading ? "Creating..." : "Create Quiz"}
            </button>
            
          </div>
        </div>
      </div>
      <Footer/>    
    </>
    
  );
}
