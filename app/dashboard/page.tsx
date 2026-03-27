// app/dashboard/page.tsx — Server Component
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ROLE_ROUTES, UserRole } from "@/app/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  /* Rôle depuis le JWT NextAuth — fallback caissier si absent */
  const role  = ((session.user as any).role ?? 'caissier') as UserRole;
  const route = ROLE_ROUTES[role] ?? ROLE_ROUTES['caissier'];

  redirect(route);
}