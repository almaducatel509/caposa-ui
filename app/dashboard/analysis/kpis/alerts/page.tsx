import AlertsList from "@/app/components/analyse/kpis/AlertsList";
import PageHeader from "@/app/components/header";
import { FileWarning } from "lucide-react";
import { GiReceiveMoney } from "react-icons/gi";

export default function AlertesPage() {
  return (
    <main className="w-full bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Alertes Membres"
          subtitle="Suivi et gestion des membres nécessitant une attention particulière"
          icon={<FileWarning className="w-10 h-10 text-red-600 font-extralight" />}
        />
        </div>
        <div className="bg-white ">
          <AlertsList />;
        </div>
    </main> );
}

{/* <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <FileWarning className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alertes Membres</h1>
            <p className="text-gray-600"></p>
          </div>
        </div> */}