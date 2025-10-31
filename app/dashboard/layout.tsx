// app/dashboard/layout.tsx  (or whatever your dashboard layout path is)
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SideNav from "@/app/components/dashboard/sidenav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow px-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
