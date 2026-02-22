import PostGrid from "@/app/components/postes/PostGrid";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Postes | CAPOSA",
  description: "Tout les postes qui utilises le system",
};
export default function  PostDashboard() {

  return (
    <main className="w-full min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
      <div className="px-6 py-6">
      <PostGrid   />
    </div>
    </main>
  );
};

