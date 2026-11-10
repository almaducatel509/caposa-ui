import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Nouveau Poste",
  description: "Créer un nouveau poste d'employé",
};

export default function PostForm() {
  return (
    <main className="w-full bg-white p-6">
      <div className="text-2xl font-semibold">Créer un Poste</div>
      <div className="bg-white mt-12">
        <div>En cours de développement...</div>
      </div>
    </main>
  );
}