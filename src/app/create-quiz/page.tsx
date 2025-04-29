"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import toast from "react-hot-toast";

interface Question {
  question_text: string;
  question_type: "Choose type" | "MCQ" | "Short Answer" | "Image" | "Ranking";
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
  const [generalMessage, setGeneralMessage] = useState<string | null>(null);
  const [questionErrors, setQuestionErrors] = useState<{ [idx: number]: string }>({});

  useEffect(() => {
    fetch("/api/users/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuiz((q) => ({ ...q, created_by: data.user._id }));
        }
      });
  }, []);

  function addQuestion() {
    setQuiz((q) => ({
      ...q,
      questions: [
        ...q.questions,
        {
          question_text: "",
          question_type: "Choose type",
          options: ["", "", "", ""],
          correct_answer: "",
          points: 10,
          media_url: "",
        },
      ],
    }));
  }

  function removeQuestion(idx: number) {
    setQuiz((q) => ({
      ...q,
      questions: q.questions.filter((_, i) => i !== idx),
    }));
    setQuestionErrors((errs) => {
      const { [idx]: _, ...rest } = errs;
      const updated: typeof rest = {};
      Object.entries(rest).forEach(([k, v]) => {
        const key = Number(k);
        updated[key > idx ? key - 1 : key] = v;
      });
      return updated;
    });
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Quiz
  ) {
    setQuiz((q) => ({
      ...q,
      [field]: field === "duration" ? Number(e.target.value) : e.target.value,
    }));
    setGeneralMessage(null);
  }

  function handleQuestionChange(
    i: number,
    field: keyof Question,
    val: string | string[] | number
  ) {
    setQuiz((q) => {
      const qs = [...q.questions];
      qs[i] = {
        ...qs[i],
        [field]: field === "points" ? Number(val) : val,
      } as Question;
      return { ...q, questions: qs };
    });
    setQuestionErrors((errs) => {
      const { [i]: _, ...rest } = errs;
      return rest;
    });
  }

  function handleOptionChange(qi: number, oi: number, val: string) {
    setQuiz((q) => {
      const qs = [...q.questions];
      qs[qi].options[oi] = val;
      return { ...q, questions: qs };
    });
    setQuestionErrors((errs) => {
      const { [qi]: _, ...rest } = errs;
      return rest;
    });
  }

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    qi: number
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        handleQuestionChange(qi, "media_url", data.imageUrl);
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload error");
    }
  }

  async function handleCreateQuiz() {
    setGeneralMessage(null);
    setQuestionErrors({});

    if (!quiz.created_by) {
      setGeneralMessage("Please log in again.");
      return;
    }

    quiz.questions.forEach((q) => {
      if (q.question_type === "Ranking") {
        q.correct_answer = [...q.options];
      }
    });

    const errs: typeof questionErrors = {};
    quiz.questions.forEach((q, i) => {
      if (!q.question_text.trim()) {
        errs[i] = "Question text is required.";
        return;
      }
      if (q.question_type === "Choose type") {
        errs[i] = "Please select a question type.";
        return;
      }
      if (q.question_type === "MCQ" || q.question_type === "Image") {
        const filled = q.options.filter((o) => o.trim()).length;
        if (filled < 4) {
          errs[i] = "All 4 options must be filled.";
          return;
        }
      }
      if (["MCQ", "Image"].includes(q.question_type)) {
        const opts = q.options.map((o) => o.trim().toLowerCase());
        const ca = (q.correct_answer as string).trim().toLowerCase();
        if (!opts.includes(ca)) {
          errs[i] = "Correct answer must match one option.";
          return;
        }
      }
      if (q.question_type === "Short Answer") {
        const answers = (typeof q.correct_answer === "string"
          ? q.correct_answer.split(",")
          : q.correct_answer
        )
          .map((a) => a.trim())
          .filter(Boolean);
        if (answers.length === 0) {
          errs[i] = "At least one acceptable answer is required.";
          return;
        }
      }
    });

    if (Object.keys(errs).length) {
      setQuestionErrors(errs);
      return;
    }

    const total = quiz.questions.reduce((s, q) => s + (q.points || 0), 0);
    setLoading(true);
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...quiz, total_points: total }),
    });
    const d = await res.json();
    setLoading(false);

    if (!d.success) {
      setGeneralMessage(d.error || "Create failed");
    } else {
      toast.success("Quiz created!");
      setQuiz((q) => ({ ...q, _id: d.quiz._id }));
    }
  }

  return (
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 py-6">
        <div className="bg-[#242424] p-6 sm:p-10 rounded-[30px] shadow-lg w-full max-w-2xl text-center">
          <div className="flex-1 bg-[#333436] rounded-[30px] p-6 sm:p-10">
            <h1 className="text-4xl text-center text-white mb-6">
              Create <span className="text-[#ec5f80]">Your Own</span> Quiz
            </h1>

            {/* Title */}
            <input
              type="text"
              placeholder="Quiz Title"
              value={quiz.title}
              onChange={(e) => handleInputChange(e, "title")}
              className="w-full text-center p-2 mb-4 rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 border border-[#ff3c83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
            />

            {/* Description */}
            <textarea
              placeholder="Quiz Description"
              value={quiz.description}
              onChange={(e) => handleInputChange(e, "description")}
              className="w-full text-center p-2 mb-4 rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 border border-[#ff3c83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
            />

            {/* Duration */}
            <div className="mb-4 text-left">
              <label className="text-gray-400 block mb-1">Duration (mins)</label>
              <input
                type="number"
                min={1}
                value={quiz.duration}
                onChange={(e) => handleInputChange(e, "duration")}
                className="w-full text-center p-2 rounded-full bg-[#1e1e1e] text-center text-white border border-[#ff3c83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
              />
            </div>

            {/* Questions */}
            {quiz.questions.map((q, i) => (
              <div key={i} className="bg-[#242424] p-4 rounded-lg mt-4 ">
                <h3 className="text-[#ec5f80] text-lg mb-2 text-center">
                  Question {i + 1}
                </h3>
                <input
                  type="text"
                  placeholder="Question Text"
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(i, "question_text", e.target.value)}
                  className="w-full p-2 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 border border-[#ec5f83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
                />
                <select
                  value={q.question_type}
                  onChange={(e) => handleQuestionChange(i, "question_type", e.target.value)}
                  className="w-full p-2 mb-2 rounded-full bg-[#1e1e1e] text-white border border-[#ec5f83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
                >
                  <option>Choose type</option>
                  <option>MCQ</option>
                  <option>Short Answer</option>
                  <option>Image</option>
                  <option>Ranking</option>
                </select>
                {q.question_type === "Image" && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, i)}
                      className="file:cursor-pointer file:hover:text-[#ec5f80] file:text-[#ec5f80] file:font-medium file:px-4 file:py-2 file:rounded-full file:hover:bg-white transition-all file:border file:border-[#ec5f80] text-gray-300 w-auto px-3 py-2 mb-2"
                    />
                    {q.media_url && (
                      <Image
                        src={q.media_url}
                        alt="Uploaded"
                        width={100}
                        height={100}
                        className="rounded-lg mb-2 border-[#ec5f80] shadow-lg"
                      />
                    )}
                  </>
                )}
                {/* Options for MCQ, Ranking, Image */}
                {(q.question_type === "MCQ" || q.question_type === "Ranking" || q.question_type === "Image") && (
                  <div className="mt-2">
                    <h4 className="text-[#ec5f80] text-center text-md">
                      {q.question_type === "Ranking"
                        ? "Enter Options in Correct Order (Ranking)"
                        : "Options"}
                    </h4>
                    {q.options.map((opt, oi) => (
                      <input
                        key={oi}
                        type="text"
                        placeholder={
                          q.question_type === "Ranking"
                            ? `Rank ${oi + 1} option`
                            : `Option ${oi + 1}`
                        }
                        value={opt}
                        onChange={(e) => handleOptionChange(i, oi, e.target.value)}
                        className="w-full p-2 mt-2 rounded-full bg-[#1e1e1e] text-white 
                                  placeholder-gray-400 border border-[#ec5f80]
                                  focus:ring-2 focus:ring-[#ec5f80] focus:outline-none"
                      />
                    ))}
                  </div>
                )}

                {/* Correct Answer Input for MCQ & Image */}
                {(q.question_type === "MCQ" || q.question_type === "Image") && (
                  <div className="mt-2">
                    <h4 className="text-[#ec5f80] text-center text-md">Enter Correct Answer</h4>
                    <input
                      type="text"
                      placeholder="Correct Answer"
                      value={q.correct_answer as string}
                      onChange={(e) => handleQuestionChange(i, "correct_answer", e.target.value)}
                      className="w-full p-2 mt-2 rounded-full bg-[#1e1e1e] text-white 
                                placeholder-gray-400 border border-[#ec5f80]
                                focus:ring-2 focus:ring-[#ec5f80] focus:outline-none"
                    />
                  </div>
                )}

                {q.question_type === "Short Answer" && (
                  <>
                    <input
                      type="text"
                      placeholder="Hint (optional)"
                      value={q.hint || ""}
                      onChange={(e) => handleQuestionChange(i, "hint", e.target.value)}
                      className="w-full p-2 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 border border-[#ec5f83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
                    />
                    <input
                      type="text"
                      placeholder="Acceptable Answers (comma separated)"
                      value={
                        Array.isArray(q.correct_answer)
                          ? (q.correct_answer as string[]).join(", ")
                          : (q.correct_answer as string)
                      }
                      onChange={(e) => handleQuestionChange(i, "correct_answer", e.target.value)}
                      className="w-full p-2 mb-2 rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 border border-[#ec5f83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80]"
                    />
                  </>
                )}
                {/* Points Input */}
                <h4 className="text-[#ec5f80] text-center text-md mt-2 ">Points</h4>
                <input
                  type="number"
                  placeholder="Points"
                  value={q.points}
                  onChange={(e) => handleQuestionChange(i, "points", e.target.value)}
                  className="mx-auto text-center w-auto min-w-[150px] max-w-[250px] p-2 mt-2 rounded-full 
                            bg-[#1e1e1e] text-white text-center placeholder-gray-400 border border-[#ec5f80]
                            focus:ring-2 focus:ring-[#ec5f80] focus:outline-none"
                />

                {questionErrors[i] && (
                  <p className="text-red-500 text-sm mb-2">{questionErrors[i]}</p>
                )}
                <button
                  onClick={() => removeQuestion(i)}
                  className="block mx-auto bg-red-600 text-white px-5 py-2 rounded-full mt-4 hover:bg-red-700 transition-all duration-200 w-auto min-w-[150px] max-w-[250px] text-center"
                >
                  Remove Question
                </button>
              </div>
            ))}

            {/* ✅ ADD & CREATE with original styling */}
            <div className="flex flex-col items-center gap-4 mt-6">
              <button
                onClick={addQuestion}
                className="mx-auto w-[80%] sm:w-3/4 md:w-2/3 block relative flex justify-center items-center px-4 py-3 
                text-[#ff3c83] text-md sm:text-base md:text-lg tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden 
                transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 
                before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all 
                before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
              >
                <span className="relative z-10">Add Question</span>
              </button>

              <button
                onClick={handleCreateQuiz}
                disabled={
                  loading ||
                  quiz.questions.length === 0 ||
                  Object.keys(questionErrors).length > 0
                }
                className="mx-auto w-[80%] sm:w-3/4 md:w-2/3 block relative flex justify-center items-center px-4 py-3 
                text-[#ff3c83] text-md sm:text-base md:text-lg tracking-wider border-2 border-[#ff3c83] rounded-full overflow-hidden 
                transition-all duration-150 ease-in hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 
                before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 
                before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100 
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {loading ? "Creating..." : "Create Quiz"}
                </span>
              </button>
            </div>

            {generalMessage && (
              <p className="text-red-500 mt-4">{generalMessage}</p>
            )}

            {quiz._id && (
              <div className="bg-[#1e1e1e] p-6 rounded-lg mt-6 text-center">
                <h2 className="text-xl text-[#ec5f80]">Quiz Created Successfully!</h2>
                <p className="text-gray-400">
                  Quiz Title: <span className="text-white">{quiz.title}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  You can start the quiz later from the{" "}
                  <span className="text-[#ec5f80] font-medium">
                  &quot;Hosted Quizzes&quot;
                  </span>{" "}
                  section in your collection.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}