"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!session_id) return;

      console.log("📡 Fetching leaderboard for session:", session_id);

      try {
        const response = await fetch(`/api/quizzes/leaderboard/${encodeURIComponent(session_id)}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setPlayers(data.leaderboard);
      } catch (error) {
        console.error("❌ Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();

    // Optionally auto-refresh every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [session_id]);

  if (loading) return <p>Loading leaderboard...</p>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>🏆 Leaderboard 🏆</h1>
      <table
        style={{
          margin: "0 auto",
          borderCollapse: "collapse",
          width: "80%",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Rank</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Avatar</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Display Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Original Username</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Attempted</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Correct</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Theory Score</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player._id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{index + 1}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {player.avatar ? (
                  <Image
                    src={player.avatar}
                    alt="Avatar"
                    width={40}
                    height={40}
                    style={{ borderRadius: "50%" }}
                  />
                ) : (
                  "No avatar"
                )}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {player.displayName || "—"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {player.originalUsername || "—"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {player.attempted ?? "-"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {player.correct ?? "-"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {player.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Leaderboard() {
  return (
    <Suspense fallback={<p>Loading leaderboard...</p>}>
      <LeaderboardContent />
    </Suspense>
  );
}
