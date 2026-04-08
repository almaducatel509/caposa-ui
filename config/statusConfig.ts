const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
};

export const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  decaisse:   { label: 'Complété',   bg: C.greenPale, text: C.greenDark, dot: C.green   },
  en_attente: { label: 'En attente', bg: '#FEF9EC',   text: '#B45309',   dot: '#F59E0B' },
  en_cours:   { label: 'En cours',   bg: '#EBF2F8',   text: C.blue,      dot: C.blue    },
  echoue:     { label: 'Échoué',     bg: '#FEF2F2',   text: '#B91C1C',   dot: '#EF4444' },
  annule:     { label: 'Annulé',     bg: '#F3F4F6',   text: '#6B7280',   dot: '#9CA3AF' },
};

export const STATUS_FALLBACK = STATUS_CFG['en_attente'];