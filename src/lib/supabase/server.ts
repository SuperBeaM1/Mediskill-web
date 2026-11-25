import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export async function createClient() {
  // Opt into request-time rendering first: pages below read the clock (Date.now) and per-user data.
  await connection();
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component; the proxy refreshes the session instead.
          }
        },
      },
    },
  );
}

/** Returns a client plus the verified user, or redirects to /login. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/** Like requireUser, but only for profiles with role = 'admin'. Others go back to /app. */
export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin") redirect("/app");
  return { supabase, user, name: data.full_name as string };
}

/** Teacher area: role 'teacher' (admins may also open it). Others go back to /app. */
export async function requireTeacher() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
  if (data?.role !== "teacher" && data?.role !== "admin") redirect("/app");
  return { supabase, user, name: data.full_name as string };
}
