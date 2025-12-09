import { stackServerApp } from "@/stack/server";

export default async function TestPage() {
  // This runs on the server at render time
  const user = await stackServerApp.getUser();

  return (
    <div>
      <h1>Server Component Test</h1>
      {user ? (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  );
}
