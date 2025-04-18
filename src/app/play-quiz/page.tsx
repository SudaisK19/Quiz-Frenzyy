"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";


interface Question {
  _id: string;
  question_text: string;
  question_type: "MCQ" | "Short Answer" | "Image" | "Ranking";
  options: string[];
  points: number;
  media_url?: string;
  hint?: string;
}

interface QuizInfo {
  title: string;
  description: string;
  duration?: number; // duration in minutes
  start_time: string; // ISO format timestamp
}

function PlayQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const player_quiz_id = searchParams.get("player_quiz_id");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Since we use global loading via Suspense, we assume that once data is ready, we can show the quiz.
  // Set introStage to "quiz" once data is ready.
  const [introStage, setIntroStage] = useState<"quiz">("quiz");

  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: string }>({});
  const [rankingAnswers, setRankingAnswers] = useState<{ [qId: string]: string[] }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // ----------------- FETCH QUIZ -----------------
  useEffect(() => {
    async function fetchQuizData() {
      if (!session_id || !player_quiz_id) {
        // Redirect if IDs are missing
        router.push("/");
        return;
      }

      try {
        const res = await fetch(`/api/quizzes/session/${session_id}`);
        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions || []);

          // Shuffle ranking answers for Ranking type questions
          const initialRankingAnswers: { [qId: string]: string[] } = {};
          (data.questions || []).forEach((q: Question) => {
            if (q.question_type === "Ranking") {
              const shuffled = [...q.options].sort(() => Math.random() - 0.5);
              initialRankingAnswers[q._id] = shuffled;
            }
          });
          setRankingAnswers(initialRankingAnswers);

          setQuizInfo({
            title: data.quiz?.title || "Untitled Quiz",
            description: data.quiz?.description || "",
            duration: data.duration || 5, // fallback to 5 min
            start_time: data.start_time || new Date().toISOString(),
          });

          // Calculate remaining time based on start_time and duration
          const quizDurationSeconds = (data.duration || 5) * 60;
          const startTime = new Date(data.start_time || new Date().toISOString());
          const now = new Date();
          const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          const remainingSeconds = quizDurationSeconds - elapsedSeconds;
          setTimeLeft(remainingSeconds > 0 ? remainingSeconds : 0);
          // We don’t need to delay quiz start if using global loader.
          setIntroStage("quiz");
        } else {
          // If no questions found, you can redirect or handle as needed.
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        router.push("/");
      }
    }

    fetchQuizData();
  }, [session_id, player_quiz_id, router]);

  // ----------------- TIMER LOGIC -----------------
  useEffect(() => {
    if (introStage !== "quiz" || timeLeft === null) return;

    if (timeLeft === 0) {
      submitQuiz();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [introStage, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const questionId = questions[currentQuestionIndex]._id;
    setRankingAnswers((prev) => {
      const newOrder = [...(prev[questionId] || questions[currentQuestionIndex].options)];
      const [movedItem] = newOrder.splice(result.source.index, 1);
      newOrder.splice(result.destination!.index, 0, movedItem);
      return { ...prev, [questionId]: newOrder };
    });
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    const answersArray = questions.map((q) => ({
      question_id: q._id,
      player_quiz_id,
      submitted_answer:
        q.question_type === "Ranking"
          ? rankingAnswers[q._id] || q.options
          : selectedAnswers[q._id] || "",
    }));

    try {
      const res = await fetch("/api/quizzes/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_quiz_id, answers: answersArray }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/quiz-complete?player_quiz_id=${player_quiz_id}`);
      } else {
        alert("Submission failed.");
      }
    } catch {
      alert("Error submitting quiz.");
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.question_type) {
      case "Ranking":
        return (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="rankingOptions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="w-full max-w-md mx-auto">
                  {(rankingAnswers[question._id] || question.options).map((option, index) => (
                    <Draggable key={String(index)} draggableId={String(index)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 mb-3 rounded-full text-sm sm:text-base ${
                            snapshot.isDragging ? "bg-white text-[#ec5f80]" : "bg-[#333436] text-white"
                          } border border-[#ff3c83] hover:bg-white hover:text-[#ec5f80]`}
                          style={provided.draggableProps.style}
                        >
                          {option}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        );

      case "MCQ":
      case "Image":
        return (
          <div className="space-y-4 mt-6 w-full">
            {question.media_url && (
              <div className="w-full flex justify-center">
                <Image
                  src={question.media_url}
                  alt="Question"
                  width={500} // Adjust as needed
                  height={400} // Adjust as needed
                  className="rounded-lg max-w-full h-auto max-h-[300px] sm:max-h-[350px] md:max-h-[400px] object-contain"
                />
              </div>
            )}
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswerChange(question._id, opt)}
                className={`w-full py-2 px-4 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                  selectedAnswers[question._id] === opt
                    ? "bg-white text-[#ec5f80] border-white"
                    : "bg-[#333436] text-[#ec5f80] border border-[#ff3c83] hover:bg-white hover:text-[#ec5f80]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "Short Answer":
        return (
          <div className="mt-6 space-y-3">
            {question.hint && (
              <p className="text-gray-400 text-sm sm:text-base">
                Hint: <span className="italic">{question.hint}</span>
              </p>
            )}
            <input
              type="text"
              value={selectedAnswers[question._id] || ""}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              placeholder="Type your answer..."
              className="w-full text-center p-2 rounded-full bg-[#1e1e1e] text-white text-sm border border-[#ff3c83] focus:outline-none focus:ring-2 focus:ring-[#ec5f80] max-w-[400px] mx-auto"
            />
          </div>
        );

      default:
        return <p className="text-white">Unsupported question type.</p>;
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Do not render anything until questions and quizInfo are loaded.
  if (!quizInfo || questions.length === 0 || timeLeft === null) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen px-4 py-6">
        <div className="bg-[#242424] p-6 sm:p-10 rounded-[30px] shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl text-center">
          <div className="flex-1 bg-[#333436] rounded-[30px] p-6 sm:p-10">

            {/* Timer & Progress Bar */}
            {introStage === "quiz" && (
              <>
                <div className="mb-4 flex justify-between items-center text-white text-sm sm:text-base font-semibold">
                  <div>
                    Time Left:{" "}
                    <span className={timeLeft <= 15 ? "text-red-400" : "text-[#ec5f80]"}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div>
                    {currentQuestionIndex + 1} / {questions.length}
                  </div>
                </div>
                <div className="w-full bg-[#1e1e1e] rounded-full h-2 mb-6">
                  <div
                    className="bg-[#ff3c83] h-2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            )}

            {/* Quiz Content */}
            {introStage === "quiz" && (
              <>
              <p className="text-sm text-white mb-4">{currentQuestion.question_type}</p>
                <h2 className="text-2xl sm:text-3xl text-white font-semibold mb-4">
                  {currentQuestion.question_text}
                </h2>
                

                {renderQuestion(currentQuestion)}

                {/* Navigation Buttons */}
                <div className="mt-6 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className={`w-10 h-10 rounded-full flex justify-center items-center text-xl font-bold ${
                      currentQuestionIndex === 0
                        ? "bg-gray-500 text-white cursor-not-allowed"
                        : "bg-[#ec5f80] hover:bg-pink-600 text-white"
                    }`}
                  >
                    ◀
                  </button>

                  <button
                    onClick={() => {
                      if (currentQuestionIndex === questions.length - 1) submitQuiz();
                    }}
                    disabled={currentQuestionIndex !== questions.length - 1}
                    className={`relative flex justify-center items-center px-6 py-2 font-bold uppercase tracking-wider rounded-full overflow-hidden transition-all duration-150 ease-in w-[150px] ${
                      currentQuestionIndex === questions.length - 1
                        ? "text-[#ff3c83] border-2 border-[#ff3c83] hover:text-white hover:border-white before:absolute before:top-0 before:left-1/2 before:right-1/2 before:bottom-0 before:bg-gradient-to-r before:from-[#fd297a] before:to-[#9424f0] before:opacity-0 before:transition-all before:duration-150 before:ease-in hover:before:left-0 hover:before:right-0 hover:before:opacity-100"
                        : "text-gray-400 border-2 border-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span className="relative z-10 text-sm sm:text-base">Submit</span>
                  </button>

                  <button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className={`w-10 h-10 rounded-full flex justify-center items-center text-xl font-bold ${
                      currentQuestionIndex === questions.length - 1
                        ? "bg-gray-500 text-white cursor-not-allowed"
                        : "bg-[#ec5f80] hover:bg-pink-600 text-white"
                    }`}
                  >
                    ▶
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function PlayQuiz() {
  return (
    <Suspense fallback={<p className="text-center text-white mt-8">Loading quiz...</p>}>
      <PlayQuizContent />
    </Suspense>
  );
}