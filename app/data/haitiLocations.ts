export const HAITI_DEPARTMENTS = [
  { code: "OUEST", name: "Ouest" },
  { code: "SUDEST", name: "Sud-Est" },
  { code: "NORD", name: "Nord" },
  { code: "NORDEST", name: "Nord-Est" },
  { code: "ARTIBONITE", name: "Artibonite" },
  { code: "CENTRE", name: "Centre" },
  { code: "SUD", name: "Sud" },
  { code: "GRAND_ANSE", name: "Grand'Anse" },
  { code: "NORD_OUEST", name: "Nord-Ouest" },
  { code: "NIPPES", name: "Nippes" },
] as const;

export type DepartmentCode = (typeof HAITI_DEPARTMENTS)[number]["code"];
export type DepartmentName = (typeof HAITI_DEPARTMENTS)[number]["name"];

export const CITIES_BY_DEPARTMENT: Record<DepartmentCode, string[]> = {
  OUEST: [
    "Port-au-Prince","Carrefour","Delmas","Pétion-Ville","Kenscoff",
    "Gressier","Léogâne","Petit-Goâve","Grand-Goâve",
    "Croix-des-Bouquets","Thomazeau","Cornillon","Ganthier","Fonds-Parisien",
    "Anse-à-Galets","Pointe-à-Raquette"
  ],
  NORD: [
    "Cap-Haïtien","Limonade","Quartier-Morin","Plaine-du-Nord","Milot",
    "Grande-Rivière-du-Nord","Borgne","Port-Margot","Pilate",
    "Dondon","Saint-Raphaël","Pignon","Ranquitte","Bahon"
  ],
  NORDEST: [
    "Fort-Liberté","Ouanaminthe","Ferrier","Mont-Organisé","Capotille",
    "Carice","Mombin-Crochu","Trou-du-Nord","Sainte-Suzanne","Terrier-Rouge","Vallières","Caracol"
  ],
  ARTIBONITE: [
    "Gonaïves","Saint-Marc","Dessalines","Petite-Rivière-de-l'Artibonite",
    "Grande-Saline","Desdunes","Verrettes","La Chapelle","Liancourt",
    "Marmelade","Saint-Michel-de-l'Attalaye","Ennery","Gros-Morne","Terre-Neuve"
  ],
  CENTRE: [
    "Hinche","Mirebalais","Lascahobas","Belladère","Savanette",
    "Cerca-Carvajal","Cerca-la-Source","Thomassique",
    "Boucan-Carré","Saut-d'Eau","Maïssade","Baptiste"
  ],
  SUD: [
    "Les Cayes","Torbeck","Chantal","Camp-Perrin","Maniche","Arniquet",
    "Île-à-Vache","Port-Salut","Saint-Jean-du-Sud","Aquin","Saint-Louis-du-Sud",
    "Cavaillon","Coteaux","Port-à-Piment","Roche-à-Bateau","Chardonnières","Tiburon","Les Anglais"
  ],
  SUDEST: [
    "Jacmel","Cayes-Jacmel","Marigot","Bainet","Côtes-de-Fer",
    "Anse-à-Pitres","Thiotte","Grand-Gosier","Belle-Anse"
  ],
  GRAND_ANSE: [
    "Jérémie","Roseaux","Marfranc","Bonbon","Beaumont","Pestel","Corail",
    "Anse-d'Hainault","Dame-Marie","Les Irois","Chambellan","Moron","Abricots"
  ],
  NORD_OUEST: [
    "Port-de-Paix","Saint-Louis-du-Nord","Anse-à-Foleur","Bassin-Bleu","Chansolme",
    "Jean-Rabel","Môle-Saint-Nicolas","Bombardopolis","Baie-de-Henne","Île de la Tortue"
  ],
  NIPPES: [
    "Miragoâne","Petite-Rivière-de-Nippes","Fonds-des-Nègres","Baradères","Grand-Boucan",
    "Petit-Trou-de-Nippes","Plaisance-du-Sud","Anse-à-Veau","L'Asile"
  ],
};

export const getCitiesByDepartment = (code: DepartmentCode) => CITIES_BY_DEPARTMENT[code] || [];
export const codeToName = (code: DepartmentCode): DepartmentName =>
  (HAITI_DEPARTMENTS.find(d => d.code === code)?.name)!;
