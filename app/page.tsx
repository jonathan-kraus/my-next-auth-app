"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Signed in as {session.user?.email}</h1>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Sign out
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Not signed in</h1>
      <button
        onClick={() => signIn("github")}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Sign in with GitHub
      </button>
    </main>
  );
}
