import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SideNav from "@/app/components/dashboard/sidenav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="flex h-screen flex-col md:flex-row bg-white">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      {/* Zéro padding ici — chaque page gère son propre p-6 md:p-8 */}
      <div className="grow md:overflow-y-auto">
        {children}
      </div>
    </div>
  );
}