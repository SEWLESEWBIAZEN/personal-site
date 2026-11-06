import "server-only";
import { redirect } from "next/navigation";
import { auth } from "./auth";

// For admin pages: redirects instead of throwing.
export async function requireAdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/login");
  return session;
}
