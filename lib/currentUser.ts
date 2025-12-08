// lib/currentUser.ts
import { stackServerApp } from "@/stack/server"

export async function getCurrentUser() {
  const user = await stackServerApp.getUser(); // Neon Auth call [web:174]
  return user; // null if not logged in
}
