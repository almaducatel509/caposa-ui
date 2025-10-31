// Fonction pour calculer le chiffre de contrôle (check digit)
// Utilise l'algorithme Modulo 11 - standard bancaire
function calculateCheckDigit(base: string): string {
  // Convertir la chaîne en tableau de nombres
  const digits = base.split('').map(Number);
  
  // Poids décroissants de droite à gauche (2, 3, 4, 5, 6, 7, 2, 3, 4, 5...)
  let sum = 0;
  let weight = 2;
  
  // Parcourir de droite à gauche
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += digits[i] * weight;
    weight = weight === 7 ? 2 : weight + 1; // Cycle 2,3,4,5,6,7
  }
  
  // Calculer le modulo 11
  const remainder = sum % 11;
  
  // Règles standard Modulo 11
  if (remainder === 0) return '0';
  if (remainder === 1) return 'X'; // Ou on peut rejeter et regénérer
  
  return (11 - remainder).toString();
}

// Version simplifiée si tu veux éviter les 'X'
function calculateCheckDigitSimple(base: string): string {
  const digits = base.split('').map(Number);
  let sum = 0;
  
  // Simple pondération alternée 2,1,2,1...
  for (let i = 0; i < digits.length; i++) {
    const weight = (i % 2 === 0) ? 2 : 1;
    sum += digits[i] * weight;
  }
  
  // Modulo 10 (plus simple)
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

// Fonction pour valider un numéro de compte complet
function validateAccountNumber(accountNumber: string): boolean {
  // Format: 001-123456X (où X est le check digit)
  const match = accountNumber.match(/^(\d{3})-(\d{5,6})(\d|X)$/);
  if (!match) return false;
  
  const [, branchCode, base, providedCheck] = match;
  const calculatedCheck = calculateCheckDigit(base);
  
  return providedCheck === calculatedCheck;
}

// Version mise à jour de ton générateur avec checksum
export const generateAccountNumberWithCheck = (branchCode: string = "001"): string => {
  const base = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  const checkDigit = calculateCheckDigitSimple(base); // Utilise la version simple
  return `${branchCode}-${base}${checkDigit}`;
};

// Exemples d'utilisation:
// generateAccountNumberWithCheck("001") → "001-234567"
// validateAccountNumber("001-234567") → true/false