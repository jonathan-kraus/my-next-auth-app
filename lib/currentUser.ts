// lib/currentUser.ts
import { stackServerApp } from "@/stack/server";

export async function getCurrentUser() {
  const user = await stackServerApp.getUser(); // uses server-side cookies/context
  return user; // null if not logged in
}
