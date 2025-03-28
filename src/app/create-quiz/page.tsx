"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";


interface Question {
  question_text: string;
  question_type: "Choose type"|"MCQ" | "Short Answer" | "Image" | "Ranking";
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
          question_type: "Choose type",
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

    let isValid = true;


    // For Short Answer questions, convert the comma-separated string into an array if needed.
    quiz.questions.forEach((q, qIndex) => {
      if (q.question_type === "Short Answer" && typeof q.correct_answer === "string") {
        q.correct_answer = q.correct_answer
          .split(",")
          .map((ans) => ans.trim())
          .filter((ans) => ans);
      }
    
      if (q.question_type === "MCQ" || q.question_type === "Image") {
        // Extract all options (assuming q.options is an array of strings)
        const options = q.options.map((opt) => opt.trim().toLowerCase());
        const correctAnswer = typeof q.correct_answer === "string" ? q.correct_answer.trim().toLowerCase() : "";
    
        // Check if the correct answer is in the options list
        if (!options.includes(correctAnswer)) {
          alert(`Error: Question ${qIndex + 1} has an invalid correct answer!`);
          isValid = false;
        }
      }
    });
    


  

    if (!isValid) return;


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
                  className="w-full p-2 rounded-full bg-[#1e1e1e] text-white 
                            placeholder-gray-400 border border-[#ec5f80]
                            focus:ring-2 focus:ring-[#ec5f80] focus:outline-none mt-2"
                />

                {/* Question Type Select */}
                <select
                  value={q.question_type}
                  onChange={(e) => handleQuestionChange(qIndex, "question_type", e.target.value)}
                  className="w-full p-2 rounded-full bg-[#1e1e1e] text-white 
                            border border-[#ec5f80] focus:ring-2 focus:ring-[#ec5f80] 
                            focus:outline-none mt-2"
                >
                  <option value="Choose type">Choose type</option>
                  <option value="MCQ">Multiple Choice</option>
                  <option value="Short Answer">Short Answer</option>
                  <option value="Image">Image</option>
                  <option value="Ranking">Ranking</option>
                </select>

                {/* Image Upload */}
                {q.question_type === "Image" && (
                  <div className="mt-2 flex flex-col items-center gap-3">
                    {/* Styled File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, qIndex)}
                      className="file:cursor-pointer file:hover:text-[#ec5f80] file:text-[#ec5f80] file:font-medium file:px-4 file:py-2 
                                file:rounded-full  file:hover:bg-white  transition-all file:border file:border-[#ec5f80]
                                text-gray-300 w-auto  px-3 py-2 "
                    />

                    {/* Image Preview */}
                    {q.media_url && (
                      <Image 
                        src={q.media_url} 
                        alt="Uploaded Image" 
                        width={100} 
                        height={100} 
                        className="rounded-lg border-2 border-[#ec5f80] shadow-lg"
                      />
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
                        className="w-full p-2 rounded-full bg-[#1e1e1e] text-white 
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
                      className="w-full p-2 rounded-full bg-[#1e1e1e] text-white 
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
                      className="w-full p-2 rounded-full bg-[#1e1e1e] text-white 
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
                      className="w-full p-2 rounded-full bg-[#1e1e1e] text-white 
                                placeholder-gray-400 border border-[#ec5f80]
                                focus:ring-2 focus:ring-[#ec5f80] focus:outline-none mt-2"
                    />
                  </div>
                )}

                {/* Points Input */}
                <h4 className="text-[#ec5f80] text-md mt-2">Points</h4>
                <input
                  type="number"
                  placeholder="Points"
                  value={q.points}
                  onChange={(e) => handleQuestionChange(qIndex, "points", e.target.value)}
                  className="mx-auto w-auto min-w-[150px] max-w-[250px] p-2 rounded-full 
                             bg-[#1e1e1e] text-white text-center placeholder-gray-400 border border-[#ec5f80]
                             focus:ring-2 focus:ring-[#ec5f80] focus:outline-none mt-2"
                />

                {/* Remove Question Button */}
                
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="bg-red-600 text-white px-5 py-2 rounded-full mt-4 
                            hover:bg-red-700 transition-all duration-200 
                            mx-auto w-auto min-w-[150px] max-w-[250px] 
                            text-center "
                >
                  Remove Question
                </button>
              </div>
            ))}


            {/* ✅ Add & Create Quiz Buttons */}
            <div className="flex flex-col items-center gap-4 mt-6">
              <button
                onClick={addQuestion}
                className="mx-auto w-[80%] sm:w-3/4 md:w-2/3 block relative flex justify-center items-center px-4 py-3 
                text-[#ff3c83] text-md sm:text-base md:text-lg tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden 
                transition-all duration-150 ease-in hover:text-white hover:border-white 
                before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 
                before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 
                before:transition-all before:duration-150 before:ease-in 
                hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
              >
                <span className="relative z-10">Add Question</span>
              </button>

              <button
                onClick={handleCreateQuiz}
                disabled={loading}
                className="mx-auto w-[80%] sm:w-3/4 md:w-2/3 block relative flex justify-center items-center px-4 py-3 
                text-[#ff3c83] text-md sm:text-base md:text-lg tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden 
                transition-all duration-150 ease-in hover:text-white hover:border-white 
                before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 
                before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 
                before:transition-all before:duration-150 before:ease-in 
                hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
              >
                <span className="relative z-10">{loading ? "Creating..." : " Create Quiz"}</span>
              </button>
            </div>

            {/* ✅ Quiz Created Message */}
            {quiz._id && (
              <div className="bg-[#1e1e1e] p-6 rounded-lg mt-6 text-center">
                <h2 className="text-xl text-[#ec5f80]"> Quiz Created Successfully!</h2>
                <p className="text-gray-400">Title: <span className="text-white">{quiz.title}</span></p>
                <p className="text-gray-400">
                  Session Join Code (For Players): <span className="text-white">{quiz.join_code || "Not Available"}</span>
                </p>

                {/* ✅ View Leaderboard Button */}
                <button
                  onClick={() => {
                    if (quiz.session_id) {
                      router.push(`/leaderboard?session_id=${quiz.session_id}`);
                    } else {
                      alert("No session ID found!");
                    }
                  }}
                  className="mx-auto mt-4 w-[80%] sm:w-3/4 md:w-2/3 block relative flex justify-center items-center px-4 py-3 
                  text-[#ff3c83] text-sm sm:text-base md:text-lg tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden 
                  transition-all duration-150 ease-in hover:text-white hover:border-white 
                  before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 
                  before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 
                  before:transition-all before:duration-150 before:ease-in 
                  hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
                >
                  <span className="relative z-10">View Leaderboard</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer/>    
    </>
    
  );
}