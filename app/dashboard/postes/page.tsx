import PostGrid from "@/app/components/postes/PostGrid";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Postes | CAPOSA",
  description: "Tout les postes qui utilises le system",
};
export default function  PostDashboard() {

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 print:bg-white print:p-0 print:m-0">
      
      <PostGrid   />
    </div>
  );
};

