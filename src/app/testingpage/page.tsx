"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("/api/test")
      .then((res) => {
        if (!res.ok) throw new Error("Server error: " + res.status);
        return res.json();
      })
      .then((data) => setData(data.message))
      .catch((err) => setError(err)); // Capture API errors
  }, []);

  if (error) {
    throw error; // Trigger `error.tsx`
  }

  return <div>{data ? <p>{data}</p> : <p>Loading...</p>}</div>;
}
