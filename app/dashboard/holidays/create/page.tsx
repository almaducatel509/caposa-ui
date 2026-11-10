import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nouveau Jour Férié",
  description: "Créer et planifier un nouveau jour férié",
};

export default function HolidaysForm() {
  return (
    <main className="w-full bg-white p-6">
      <div className="text-2xl font-semibold">Créer un Jour Férié</div>
      <div className="bg-white mt-12">
        <div>En cours de développement...</div>
      </div>
    </main>
  );
}