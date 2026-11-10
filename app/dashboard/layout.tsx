import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/app/components/dashboard/DashboardShell";
import { cookies } from "next/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cookieStore = await cookies();
  const tokenName = process.env.TOKEN_NAME || process.env.NEXT_PUBLIC_TOKEN_NAME || "auth_token";
  const backendToken = cookieStore.get(tokenName)?.value;

  // Si la session NextAuth OU le jeton backend est absent, redirection immédiate vers /login
  if (!session?.user || !backendToken) {
    redirect("/login?callbackUrl=/dashboard&expired=1");
  }

  const username = (session.user as any).username || session.user.name || undefined;
  const roles = (session.user as any).roles || [];

  return (
    <DashboardShell username={username} roles={roles}>
      {children}
    </DashboardShell>
  );
}
