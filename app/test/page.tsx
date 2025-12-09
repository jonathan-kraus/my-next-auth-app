import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function TestPage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1>Server Component Test</h1>
      {session ? (
        <pre>{JSON.stringify(session.user, null, 2)}</pre>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  );
}
