"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Question {
  _id: string;
  question_text: string;
  question_type: "MCQ" | "Short Answer" | "Image" | "Ranking";
  options: string[];
  points: number;
  media_url?: string; // for image questions
}

export default function PlayQuiz() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const player_quiz_id = searchParams.get("player_quiz_id");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // For MCQ, Short Answer, Image: store a single answer per question.
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: string }>({});

  // For Ranking: store an array of strings per question (the user’s reordered options)
  const [rankingAnswers, setRankingAnswers] = useState<{ [qId: string]: string[] }>({});

  useEffect(() => {
    async function fetchQuizQuestions() {
      if (!session_id || !player_quiz_id) {
        alert("Session or Player Quiz ID not found!");
        router.push("/");
        return;
      }
      try {
        const res = await fetch(`/api/quizzes/session/${session_id}`);
        if (!res.ok) {
          alert("Error fetching questions.");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions || []);
        } else {
          alert("No questions found for this quiz.");
        }
      } catch (error) {
        alert("Failed to fetch quiz questions.");
      }
      setLoading(false);
    }
    fetchQuizQuestions();
  }, [session_id, player_quiz_id, router]);

  // ========== DRAG & DROP FOR RANKING ==========
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const questionId = questions[currentQuestionIndex]._id;
    setRankingAnswers((prev) => {
      const newOrder = [...(prev[questionId] || questions[currentQuestionIndex].options)];
      const [movedItem] = newOrder.splice(result.source.index, 1);
      newOrder.splice(result.destination.index, 0, movedItem);
      return { ...prev, [questionId]: newOrder };
    });
  };

  // ========== SUBMIT ALL ANSWERS ==========
  async function submitQuiz() {
    if (!session_id || !player_quiz_id) {
      alert("Session or Player Quiz ID missing!");
      return;
    }
    const answersArray: Array<{
      question_id: string;
      player_quiz_id: string | null;
      submitted_answer: string | string[];
    }> = [];

    for (const q of questions) {
      if (q.question_type === "Ranking") {
        const finalOrder = rankingAnswers[q._id] || q.options;
        answersArray.push({
          question_id: q._id,
          player_quiz_id,
          submitted_answer: finalOrder,
        });
      } else {
        answersArray.push({
          question_id: q._id,
          player_quiz_id,
          submitted_answer: selectedAnswers[q._id] || "",
        });
      }
    }

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
        alert("Error submitting quiz.");
      }
    } catch (error) {
      alert("Failed to submit answers.");
    }
  }

  if (loading) return <p>Loading quiz...</p>;
  if (!questions.length) return <p>No questions found.</p>;

  const currentQuestion = questions[currentQuestionIndex];

  // Helper for selecting answer for MCQ, Short Answer, Image
  function handleAnswerChange(questionId: string, answer: string) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  // Render current question based on its type
  function renderQuestion(question: Question) {
    switch (question.question_type) {
      case "Ranking":
        return (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="rankingOptions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ width: "300px", margin: "auto" }}>
                  {(rankingAnswers[question._id] || question.options).map((option, index) => (
                    <Draggable key={String(index)} draggableId={String(index)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            transition: "all 0.2s ease",
                            padding: "12px",
                            marginBottom: "12px",
                            backgroundColor: snapshot.isDragging ? "#007BFF" : "#f8f9fa",
                            color: snapshot.isDragging ? "white" : "black",
                            borderRadius: "5px",
                            cursor: "grab",
                            ...provided.draggableProps.style,
                          }}
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
        return (
          <div>
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswerChange(question._id, opt)}
                style={{
                  display: "block",
                  margin: "10px auto",
                  padding: "10px",
                  backgroundColor: selectedAnswers[question._id] === opt ? "#007BFF" : "#f8f9fa",
                  color: selectedAnswers[question._id] === opt ? "white" : "black",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "200px",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "Short Answer":
        return (
          <div>
            <input
              type="text"
              value={selectedAnswers[question._id] || ""}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
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
          </div>
        );

      case "Image":
        return (
          <div>
            {question.media_url && (
              <img
                src={question.media_url}
                alt="Question"
                style={{ maxWidth: "300px", marginBottom: "10px" }}
              />
            )}
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswerChange(question._id, opt)}
                style={{
                  display: "block",
                  margin: "10px auto",
                  padding: "10px",
                  backgroundColor: selectedAnswers[question._id] === opt ? "#007BFF" : "#f8f9fa",
                  color: selectedAnswers[question._id] === opt ? "white" : "black",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "200px",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      default:
        return <p>Question type not supported</p>;
    }
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Quiz Time!</h1>
      <h2>{currentQuestion.question_text}</h2>
      {renderQuestion(currentQuestion)}
      <div style={{ marginTop: "20px" }}>
        {currentQuestionIndex > 0 && (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            style={{ padding: "10px 20px", marginRight: "10px" }}
          >
            Previous
          </button>
        )}
        {currentQuestionIndex < questions.length - 1 && (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            style={{ padding: "10px 20px" }}
          >
            Next
          </button>
        )}
        {currentQuestionIndex === questions.length - 1 && (
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
