"use client";
import { useEffect, useState } from "react";

interface Quiz {
  _id: string;
  title: string;
  description: string;
}

interface UserCollection {
  hosted_quizzes: Quiz[];
  participated_quizzes: Quiz[];
}

export default function MyCollection() { // ✅ Ensure it is a valid React component
  const [collection, setCollection] = useState<UserCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quizzes/user", { method: "GET", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCollection({ hosted_quizzes: data.hosted_quizzes, participated_quizzes: data.participated_quizzes });
        } else {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch(() => setError("Failed to load quizzes"));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>My Collection</h1>

      <h3>Hosted Quizzes:</h3>
      {collection?.hosted_quizzes.length ? (
        <ul>{collection.hosted_quizzes.map((quiz) => <li key={quiz._id}><h4>{quiz.title}</h4></li>)}</ul>
      ) : (<p>No hosted quizzes.</p>)}

      <h3>Played Quizzes:</h3>
      {collection?.participated_quizzes.length ? (
        <ul>{collection.participated_quizzes.map((quiz) => <li key={quiz._id}><h4>{quiz.title}</h4></li>)}</ul>
      ) : (<p>No played quizzes.</p>)}
    </div>
  );
}
