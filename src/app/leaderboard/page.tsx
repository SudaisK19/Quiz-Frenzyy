"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Player {
  _id: string;
  displayName: string;
  avatar: string;
  originalUsername: string;
  score: number;
  completed_at: string;
  attempted?: number;
  correct?: number;
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");

  const [players, setPlayers] = useState<Player[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!session_id ) {
        return;
      }

      console.log("📡 Fetching real leaderboard for session:", session_id);

      try {
        const response = await fetch(`/api/quizzes/leaderboard/${encodeURIComponent(session_id)}`, { cache: "no-store" });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setPlayers(data.leaderboard);
      } catch (error) {
        console.error("❌ Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [session_id]);


  // ✅ Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // ✅ Assign ranks with ties (shared rank, skipped next)
  let rank = 1;
  let prevScore: number | null = null;
  let rankOffset = 0;

  const rankedPlayers = sortedPlayers.map((player,) => {
    if (player.score !== prevScore) {
      rank += rankOffset;
      rankOffset = 1;
    } else {
      rankOffset++;
    }

    prevScore = player.score;
    return { ...player, rank };
  });

  return (
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen p-4 sm:p-6">
        <div className="bg-[#242424] p-4 sm:p-6 md:p-10 rounded-[20px] sm:rounded-[30px] shadow-lg w-full max-w-5xl xs:max-w-full">

          <div className="flex-1 bg-[#333436] rounded-[20px] sm:rounded-[30px] p-4 sm:p-6 md:p-10">

            {/*  Heading */}
            <h1 className="text-white text-3xl sm:text-4xl text-center mb-4 sm:mb-6">Leaderboard</h1>

            <div className="overflow-x-auto">
              <table className="w-full text-white rounded-xl sm:rounded-lg overflow-hidden border-2 border-[#ec5f80]">
                
                {/*  Table Head */}
                <thead>
                  <tr className="text-[#ec5f80] bg-[#242424] text-lg sm:text-base">
                    <th className="py-3 px-2 sm:px-3 text-center">Rank</th>
                    <th className="py-3 px-2 sm:px-3 text-center">Avatar</th>
                    <th className="py-3 px-2 sm:px-3 text-center">Display Name</th>
                    <th className="py-3 px-2 sm:px-3 text-center">Original Username</th>
                    <th className="py-3 px-2 sm:px-3 text-center">Correct</th>
                    <th className="py-3 px-2 sm:px-3 text-center">Score</th>
                  </tr>
                </thead>

                {/* ✅ Table Body */}
                <tbody>
                  {rankedPlayers.map((player) => {
                    let rowClass = "bg-[#242424] transition-all duration-700 ease-in-out opacity-90";

                    if (player.rank === 1) rowClass = "gold-rank shadow-md"; // 🥇 Gold
                    if (player.rank === 2) rowClass = "silver-rank shadow-md"; // 🥈 Silver
                    if (player.rank === 3) rowClass = "bronze-rank shadow-md"; // 🥉 Bronze

                    return (
                      <tr key={player._id} className={`${rowClass} text-white animate-slideUp`}>
                        <td className="py-3 px-2 sm:px-3 text-center text-sm sm:text-lg">{player.rank}</td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {player.avatar ? (
                            <Image src={player.avatar} alt="Avatar" width={40} height={40} className="rounded-full mx-auto" />
                          ) : (
                            <span>No avatar</span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center text-sm sm:text-lg">{player.displayName || "—"}</td>
                        <td className="py-3 px-2 sm:px-3 text-center text-sm sm:text-lg">{player.originalUsername || "—"}</td>
                        <td className="py-3 px-2 sm:px-3 text-center text-sm sm:text-lg">{player.correct ?? "-"}</td>
                        <td className="py-3 px-2 sm:px-3 text-center font-bold text-sm sm:text-lg">{player.score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ✅ Slide Animation */}
            <style jsx>{`
              @keyframes slideUp {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
              }

              .gold-rank {
                background: linear-gradient(120deg, #b8860b, #d4af37, rgb(240, 196, 23), #d4af37, #b8860b);
                overflow: hidden;
              }

              .silver-rank {
                background: linear-gradient(120deg, #808080, #b0b0b0, rgb(201, 201, 201), #b0b0b0, #808080);
                overflow: hidden;
              }

              .bronze-rank {
                background: linear-gradient(120deg, #8b4513, #b87333, #cd7f32, #b87333, #8b4513);
                overflow: hidden;
              }
            `}</style>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default function Leaderboard() {
  return <Suspense fallback={<p className="text-white">Loading leaderboard...</p>}><LeaderboardContent /></Suspense>;
}