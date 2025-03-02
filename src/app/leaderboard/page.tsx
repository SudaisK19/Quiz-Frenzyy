"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Player {
  _id: string;
  player_name: string;
  score: number;
  completed_at: string;
  attempted?: number;
  correct?: number;
}

export default function Leaderboard() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!session_id) return;

      console.log("📡 Fetching leaderboard for session:", session_id);

      try {
        const response = await fetch(
          `/api/quizzes/leaderboard/${encodeURIComponent(session_id)}`
        );

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
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              User Name
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Attempted
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Correct</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Theory Score
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player._id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {index + 1}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {player.player_name}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {player.attempted !== undefined ? player.attempted : "-"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {player.correct !== undefined ? player.correct : "-"}
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
