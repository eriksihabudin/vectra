import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  const reqHeaders = await headers();
  return await auth.api.getSession({
    headers: reqHeaders,
  });
}

export async function requireAuth(allowedRoles: ("admin" | "operator")[] = ["admin", "operator"]) {
  const session = await getSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.banned) {
    redirect("/banned");
  }

  const role = (session.user.role as "admin" | "operator") || "operator";
  if (!allowedRoles.includes(role)) {
    redirect("/unauthorized");
  }

  return session;
}

export async function checkApiAuth(reqHeaders: Headers, allowedRoles: ("admin" | "operator")[] = ["admin", "operator"]) {
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || !session.user) {
    return { error: "Unauthorized", status: 401, session: null };
  }

  if (session.user.banned) {
    return { error: "User is banned", status: 403, session: null };
  }

  const role = (session.user.role as "admin" | "operator") || "operator";
  if (!allowedRoles.includes(role)) {
    return { error: "Forbidden: insufficient permissions", status: 403, session: null };
  }

  return { error: null, status: 200, session };
}
