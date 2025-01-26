"use client";

interface ProfileParams {
  id: string;
}

export default function ProfilePage({ params }: { params: ProfileParams }) {
  return (
    <div>
      <h1>Profile</h1>
      <hr />
      <p className="text-4xl">Profile page for user ID: {params.id}</p>
    </div>
  );
}
