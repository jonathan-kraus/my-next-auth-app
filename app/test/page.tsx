"use client";
import { useSession } from "next-auth/react";

export default function TestPage() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Client Component Test</h1>
      {session ? (
        <pre className="bg-gray-800 text-white p-4 rounded">
          {JSON.stringify(session.user, null, 2)}
        </pre>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  );
}
