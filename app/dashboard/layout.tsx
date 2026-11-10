import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SideNav from "@/app/components/dashboard/sidenav";
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
    <div className="flex h-screen flex-col md:flex-row bg-white">
      <div className="w-full flex-none md:w-64">
        <SideNav username={username} roles={roles} />
      </div>
      {/* Zéro padding ici — chaque page gère son propre p-6 md:p-8 */}
      <div className="grow md:overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
