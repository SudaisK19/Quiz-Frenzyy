"use client";
export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

const sections = [
  {
    title: "Quick Start Guide",
    content: (
      <div className="space-y-4 text-gray-300 text-base sm:text-lg">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Sign up or log in to your account.</li>
          <li>Navigate to &quot;Create Quiz&quot; to generate questions using AI or enter manually.</li>
          <li>Create the quiz — your quiz will be saved automatically.</li>
          <li>Start the quiz from &quot;Hosted Quizzes&quot; from &quot;My Collection&quot; when ready.</li>
        </ol>
        <div className="w-full flex justify-center">
          <Image
            src="/screenshots/home.jpg"
            alt="Homepage Screenshot"
            width={500}
            height={300}
            className="w-full max-w-sm rounded-xl shadow-lg border border-gray-600"
          />
        </div>
      </div>
    ),
  },
  {
    title: "How to Create an AI-Generated Quiz?",
    content: (
      <div className="space-y-4 text-gray-300 text-base sm:text-lg">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Use the AI form under the &quot;Create Quiz&quot; section.</li>
          <li>Enter a topic, difficulty level, number of questions, and click &quot;Generate&quot;.</li>
          <li>Review, edit (optional), and save the quiz.</li>
        </ol>
        <div className="w-full flex justify-center">
          <Image
            src="/screenshots/aiquiz.jpg"
            alt="AI Form Screenshot"
            width={500}
            height={300}
            className="w-full max-w-sm rounded-xl shadow-lg border border-gray-600"
          />
        </div>
      </div>
    ),
  },
  {
    title: "How to Join a Quiz?",
    content: (
      <div className="space-y-4 text-gray-300 text-base sm:text-lg">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Go to &quot;Join Quiz&quot; from the homepage or sidebar.</li>
          <li>Enter the Quiz ID and a temporary username. You can choose your avatar before joining.</li>
          <li>Click &quot;Join&quot; and wait for the host to start.</li>
        </ol>
        <div className="w-full flex justify-center">
          <Image
            src="/screenshots/join.jpg"
            alt="Join Quiz Screenshot"
            width={500}
            height={300}
            className="w-full max-w-sm rounded-xl shadow-lg border border-gray-600"
          />
        </div>
      </div>
    ),
  },
  {
    title: "Where to Find My Created Quizzes?",
    content: (
      <div className="space-y-4 text-gray-300 text-base sm:text-lg">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Click your profile or use the &quot;Collection&quot; page to view hosted/saved quizzes.</li>
          <li>You can start, or rehost them easily using the &quot;Start Quiz/Rehost&quot; button.</li>
          <li>You can view sessions for your quizzes using the &quot;View Sessions&quot; button.</li>
        </ol>
        <div className="w-full flex justify-center">
          <Image
            src="/screenshots/hosted.jpg"
            alt="Hosted Quizzes Screenshot"
            width={500}
            height={300}
            className="w-full max-w-sm rounded-xl shadow-lg border border-gray-600"
          />
        </div>
      </div>
    ),
  },
  {
    title: "Common Issues & Troubleshooting",
    content: (
      <div className="space-y-4 text-gray-300 text-base sm:text-lg">
        <ul className="list-disc pl-6 space-y-4">
          <li><strong>Quiz not starting?</strong>
            <p className="ml-4">Ensure the host clicks &quot;Start Quiz&quot; under Hosted Quizzes.</p>
          </li>
          <li><strong>Quiz ID not working?</strong>
            <p className="ml-4">Verify the ID or check if the quiz has ended.</p>
          </li>
          <li><strong>Questions not loading?</strong>
            <p className="ml-4">Refresh the page or rejoin using the Quiz ID.</p>
          </li>
          <li><strong>Leaderboard not updating?</strong>
            <p className="ml-4">Refresh the page or go to &quot;My Collection&quot; to view Leaderboard in &quot;View Sessions&quot;.</p>
          </li>
          <li><strong>AI not generating?</strong>
            <p className="ml-4">Try a more specific prompt or reduce question count.</p>
          </li>
        </ul>
      </div>
    ),
  },
];

function HelpCenterContent() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#1c1c1e] px-4 sm:px-6 py-12 text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-pink-400 mb-12">
            Help Center
          </h1>

          <div className="space-y-6">
            {sections.map((section, index) => {
              const isOpen = activeIndex === index;

              return (
                <div
                  key={index}
                  className="rounded-2xl bg-[#2a2a2c] shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setActiveIndex(isOpen ? null : index)
                    }
                    className="w-full flex justify-between items-center px-6 py-5 text-left text-pink-400 text-xl font-semibold hover:bg-[#343438] transition"
                  >
                    <span>{section.title}</span>
                    {isOpen ? (
                      <FaAngleUp className="text-pink-400" />
                    ) : (
                      <FaAngleDown className="text-pink-400" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 bg-[#1f1f20] border-t border-[#3b3b3d]">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function HelpCenterPage() {
  return (
    <Suspense fallback={<p className="text-center text-white">Loading Help Center...</p>}>
      <HelpCenterContent />
    </Suspense>
  );
}