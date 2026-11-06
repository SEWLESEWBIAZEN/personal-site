"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

// Rate limiting lives in the credentials provider (src/lib/auth.ts) so that it
// also covers direct POSTs to /api/auth/callback/credentials.
export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "rate_limited") {
      return { success: false, error: "Too many attempts. Try again in 15 minutes." };
    }
    if (error instanceof CredentialsSignin) {
      return { success: false, error: "Invalid email or password" };
    }
    if (error instanceof AuthError) {
      // e.g. CallbackRouteError when the database is unreachable — don't blame the password.
      console.error("[login]", error.type, error.cause ?? "");
      return { success: false, error: "Sign-in is temporarily unavailable. Please try again." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
}
