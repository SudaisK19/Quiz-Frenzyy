"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";


interface Answer {
  question_text: string;
  options?: string[];
  correct_answer?: string | string[];
  submitted_answer: string | string[];
  is_correct: boolean;
  points: number;
  question_type: string;
  image_url?: string | null;
}

interface Result {
  quiz_id: string;
  displayName: string;
  score: number;
  completed_at: string | null;
  end_time: string | null;
  answers: Answer[];
}

export default function QuizResults() {
  const { sessionId } = useParams();
  const [results, setResults] = useState<Result | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canAccessResults, setCanAccessResults] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/quizzes/results/${sessionId}`);
        const data = await res.json();
        console.log("API Response:", data);

        if (data.success && data.result) {
          setResults(data.result);
          // ✅ Compare `end_time` with the current time
          const endTime = new Date(data.result.end_time).getTime();
          const now = new Date().getTime();

          if (now >= endTime) {
            setCanAccessResults(true); // ✅ Allow access if session has ended
          }
        } else {
          setResults(null);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [sessionId]);

  if (!results || !results.answers || results.answers.length === 0) {
    return (
      <>
        <Header/>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-[#242424] p-6 sm:p-10 rounded-[30px] shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl text-center">
            <div className="flex-1 bg-[#333436] rounded-[30px] p-6 ">
              <h2 className="text-2xl sm:text-4xl text-white ">
                You did not play in this session.
              </h2>
            </div> 
          </div>
          
        </div>
        <Footer/>
      </>  
    );
  }
  // ✅ Restrict access if the session hasn't ended yet
  if (!canAccessResults) {
    return (
      <>
        <Header/>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-[#242424] p-6 sm:p-10 rounded-[30px] shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl text-center">
            <div className="flex-1 bg-[#333436] rounded-[30px] p-6 ">
              <h2 className="text-2xl sm:text-4xl text-white ">
                Results will be available after the session ends.
              </h2>
            </div>
            
          </div>
          
        </div>
        <Footer/>
      </>  
    );
  }

  const { displayName, score, completed_at, answers } = results; // ✅ Ensure correct field name
  const question = answers[currentQuestion];

  // Calculate progress percentage
  const progressPercent = answers.length > 0 ? ((currentQuestion + 1) / answers.length) * 100 : 0;

  function handleNext() {
    if (currentQuestion < answers.length - 1) setCurrentQuestion(currentQuestion + 1);
  }

  function handlePrev() {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  }
  const formattedDate = completed_at ? new Date(completed_at).toLocaleString() : "N/A";

  return (
    <>
    <Header/>
    <div className="flex justify-center items-center min-h-screen px-4 py-6">
      <div className="bg-[#242424] p-6 sm:p-10 rounded-[30px] shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl text-center">
        <div className="flex-1 bg-[#333436] rounded-[30px] p-6 sm:p-10">
          
          <h2 className="text-4xl sm:text-4xl text-white mb-6 ml-2">
            Quiz <span className="text-pink-400">Result</span>
          </h2>
          <p className="text-gray-400 mt-2">Results for {displayName}</p>
          <p className="text-gray-400 mt-2">Score: {score}</p>
          <p className="text-gray-400 mt-2">Completed At: {formattedDate}</p> 

          {/* Progress Bar */}
          <div className="mb-2 mt-2 flex justify-between items-center text-white text-sm sm:text-base font-semibold">
            <div>
              {currentQuestion + 1} / {answers.length}
            </div>
          </div>
          <div className="w-full bg-[#1e1e1e] rounded-full h-2 mb-6">
            <div
              className="bg-[#ff3c83] h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>


          <h2 className="text-2xl sm:text-3xl text-white font-semibold mt-2 mb-4">{question.question_text}</h2>
          

          {/* Question Type Handling */}
          {question.question_type.toLowerCase() === "mcq" && (
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className={`w-full py-2 px-4 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                    option === question.submitted_answer
                      ? question.is_correct
                        ? "bg-green-500 text-white border border-green-500"
                        : "bg-red-500 text-white border border-red-500"
                      : option === question.correct_answer
                      ? "bg-green-500 text-white border border-green-500"
                      : "bg-[#333436] text-[#ec5f80] border border-[#ff3c83]"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          )}


          {question.question_type.toLowerCase() === "image" && (
            <div className="space-y-2">
              {question.image_url && (
                <Image 
                  src={question.image_url} 
                  alt="Question" 
                  width={500} // Adjust width as needed
                  height={300} // Adjust height as needed
                  className="w-full rounded-lg mb-3" 
                />
              )}
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className={`w-full py-2 px-4 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                    option === question.submitted_answer
                      ? question.is_correct
                        ? "bg-green-500 text-white border border-green-500"
                        : "bg-red-500 text-white border border-red-500"
                      : option === question.correct_answer
                      ? "bg-green-500 text-white border border-green-500"
                      : "bg-[#333436] text-[#ec5f80] border border-[#ff3c83]"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          )}


          {question.question_type.toLowerCase() === "short answer" && (
            <div>
              <div
                className={`p-3 rounded-full text-white text-sm sm:text-base font-medium ${
                  question.is_correct ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {question.submitted_answer}
              </div>
              {!question.is_correct && (
                <div className="p-3 rounded-full bg-green-500 text-white text-sm sm:text-base font-medium mt-2">
                  {Array.isArray(question.correct_answer) ? question.correct_answer.join(", ") : question.correct_answer}
                </div>
              )}
            </div>
          )}


          {question.question_type.toLowerCase() === "ranking" && (
            <div>
              <div className="p-3 rounded-full  flex flex-col space-y-2">
                {(Array.isArray(question.submitted_answer) ? question.submitted_answer : [question.submitted_answer]).map(
                  (item, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm sm:text-base font-medium ${
                        item === (Array.isArray(question.correct_answer) ? question.correct_answer[index] : [question.correct_answer][index])
                          ? "bg-green-500 text-white border border-green-500"
                          : "bg-red-500 text-white border border-red-500"
                      }`}
                    >
                      {item}
                    </span>
                  )
                )}
              </div>

              {!question.is_correct && question.correct_answer && (
                <>
                  <div className="p-3 rounded-full flex flex-col space-y-2">
                    {(Array.isArray(question.correct_answer) ? question.correct_answer : [question.correct_answer]).map(
                      (item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm sm:text-base font-medium bg-green-500 text-white border border-green-500"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          )}



          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-center items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className={`w-10 h-10 rounded-full flex justify-center items-center text-xl font-bold ${
                currentQuestion === 0
                  ? "bg-gray-500 text-white cursor-not-allowed"
                  : "bg-[#ec5f80] hover:bg-pink-600 text-white"
              }`}
            >
              ◀
            </button>
           
            <button
              onClick={handleNext}
              disabled={currentQuestion === answers.length - 1}
              className={`w-10 h-10 rounded-full flex justify-center items-center text-xl font-bold ${
                currentQuestion === answers.length - 1
                  ? "bg-gray-500 text-white cursor-not-allowed"
                  : "bg-[#ec5f80] hover:bg-pink-600 text-white"
              }`}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
    
  );
}