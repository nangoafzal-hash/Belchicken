// ============================================================
//  BELCHIKEN — Zones de livraison Ouagadougou
//  Système à 4 anneaux : Centre → Périphérie
//  Tarifs indicatifs en FCFA (ajustables)
// ============================================================

export interface DeliveryZone {
  id:          string
  name:        string
  sector?:     string   // Secteur administratif si connu
  ring:        1 | 2 | 3 | 4
  fee:         number   // Frais de livraison en FCFA
  minDelay:    number   // Délai min en minutes
  maxDelay:    number   // Délai max en minutes
  description: string
}

// ── Anneau 1 — Centre-ville (0 – 3 km) ──────────────────────
// Frais : 500 FCFA | Délai : 15–25 min
const RING_1: DeliveryZone[] = [
  {
    id: 'koulouba',
    name: 'Koulouba',
    sector: 'Secteur 1',
    ring: 1, fee: 500, minDelay: 15, maxDelay: 25,
    description: 'Quartier central, Présidence',
  },
  {
    id: 'patte-doie',
    name: 'Patte d\'Oie',
    sector: 'Secteur 2',
    ring: 1, fee: 500, minDelay: 15, maxDelay: 25,
    description: 'Quartier résidentiel central',
  },
  {
    id: 'zogona',
    name: 'Zogona',
    sector: 'Secteur 4',
    ring: 1, fee: 500, minDelay: 15, maxDelay: 25,
    description: 'Quartier nord-centre',
  },
  {
    id: 'bilbalogho',
    name: 'Bilbalogho',
    sector: 'Secteur 5',
    ring: 1, fee: 500, minDelay: 15, maxDelay: 25,
    description: 'Zone résidentielle centrale',
  },
  {
    id: 'dassasgho',
    name: 'Dassasgho',
    sector: 'Secteur 6',
    ring: 1, fee: 500, minDelay: 15, maxDelay: 25,
    description: 'Quartier est du centre',
  },
  {
    id: 'hamdalaye',
    name: 'Hamdalaye',
    sector: 'Secteur 7',
    ring: 1, fee: 500, minDelay: 15, maxDelay: 25,
    description: 'Quartier central nord-est',
  },
  {
    id: 'gounghin',
    name: 'Gounghin',
    sector: 'Secteur 10',
    ring: 1, fee: 500, minDelay: 15, maxDelay: 25,
    description: 'Quartier central populaire',
  },
  {
    id: 'kamsaoghin',
    name: 'Kamsaoghin',
    sector: 'Secteur 11',
    ring: 1, fee: 500, minDelay: 15, maxDelay: 25,
    description: 'Zone centre-est',
  },
]

// ── Anneau 2 — Première couronne (3 – 7 km) ─────────────────
// Frais : 1 000 FCFA | Délai : 20–35 min
const RING_2: DeliveryZone[] = [
  {
    id: 'ouaga2000',
    name: 'Ouaga 2000',
    sector: 'Secteur 53',
    ring: 2, fee: 1000, minDelay: 20, maxDelay: 35,
    description: 'Quartier diplomatique et résidentiel haut standing',
  },
  {
    id: 'pissy',
    name: 'Pissy',
    sector: 'Secteur 17',
    ring: 2, fee: 1000, minDelay: 20, maxDelay: 35,
    description: 'Grand quartier ouest',
  },
  {
    id: 'wemtenga',
    name: 'Wemtenga',
    sector: 'Secteur 22',
    ring: 2, fee: 1000, minDelay: 20, maxDelay: 35,
    description: 'Quartier est résidentiel',
  },
  {
    id: 'karpala',
    name: 'Karpala',
    sector: 'Secteur 23',
    ring: 2, fee: 1000, minDelay: 20, maxDelay: 35,
    description: 'Zone est de la ville',
  },
  {
    id: 'tanghin',
    name: 'Tanghin',
    sector: 'Secteur 24',
    ring: 2, fee: 1000, minDelay: 20, maxDelay: 35,
    description: 'Quartier nord résidentiel',
  },
  {
    id: 'nongr-massom',
    name: 'Nongr-Massom',
    sector: 'Secteur 25',
    ring: 2, fee: 1000, minDelay: 20, maxDelay: 35,
    description: 'Quartier nord-est',
  },
  {
    id: 'sig-noghin',
    name: 'Sig-Noghin',
    sector: 'Secteur 27',
    ring: 2, fee: 1000, minDelay: 20, maxDelay: 35,
    description: 'Zone nord de Ouaga',
  },
  {
    id: 'tampouy',
    name: 'Tampouy',
    sector: 'Secteur 28',
    ring: 2, fee: 1000, minDelay: 20, maxDelay: 35,
    description: 'Quartier nord populaire',
  },
  {
    id: 'wayalghin',
    name: 'Wayalghin',
    sector: 'Secteur 32',
    ring: 2, fee: 1000, minDelay: 20, maxDelay: 35,
    description: 'Zone est résidentielle',
  },
  {
    id: 'nonghin',
    name: 'Nonghin',
    sector: 'Secteur 29',
    ring: 2, fee: 1000, minDelay: 20, maxDelay: 35,
    description: 'Quartier est populaire',
  },
  {
    id: 'saaba',
    name: 'Saaba',
    ring: 2, fee: 1000, minDelay: 25, maxDelay: 40,
    description: 'Commune périurbaine est',
  },
  {
    id: 'kamboinse',
    name: 'Kamboinsé',
    ring: 2, fee: 1000, minDelay: 25, maxDelay: 40,
    description: 'Commune nord de Ouaga',
  },
]

// ── Anneau 3 — Deuxième couronne (7 – 12 km) ────────────────
// Frais : 1 500 FCFA | Délai : 30–50 min
const RING_3: DeliveryZone[] = [
  {
    id: 'koubri',
    name: 'Koubri',
    ring: 3, fee: 1500, minDelay: 30, maxDelay: 50,
    description: 'Commune sud de Ouaga',
  },
  {
    id: 'pabtenga',
    name: 'Pabtenga',
    ring: 3, fee: 1500, minDelay: 30, maxDelay: 50,
    description: 'Zone nord éloignée',
  },
  {
    id: 'loumbila',
    name: 'Loumbila',
    ring: 3, fee: 1500, minDelay: 30, maxDelay: 50,
    description: 'Commune nord-est, bord du lac',
  },
  {
    id: 'komki-ipala',
    name: 'Komki-Ipala',
    ring: 3, fee: 1500, minDelay: 30, maxDelay: 50,
    description: 'Commune ouest éloignée',
  },
  {
    id: 'nioko2',
    name: 'Nioko 2',
    ring: 3, fee: 1500, minDelay: 30, maxDelay: 50,
    description: 'Zone périphérique nord',
  },
  {
    id: 'yagma',
    name: 'Yagma',
    ring: 3, fee: 1500, minDelay: 30, maxDelay: 50,
    description: 'Zone nord-ouest périphérique',
  },
]

// ── Anneau 4 — Grande périphérie (> 12 km) ──────────────────
// Frais : 2 000 FCFA | Délai : 45–70 min
const RING_4: DeliveryZone[] = [
  {
    id: 'ziniaré',
    name: 'Ziniaré',
    ring: 4, fee: 2000, minDelay: 45, maxDelay: 70,
    description: 'Chef-lieu du Plateau Central',
  },
  {
    id: 'manga',
    name: 'Manga',
    ring: 4, fee: 2000, minDelay: 45, maxDelay: 70,
    description: 'Chef-lieu du Zoundwéogo',
  },
  {
    id: 'kombissiri',
    name: 'Kombissiri',
    ring: 4, fee: 2000, minDelay: 45, maxDelay: 70,
    description: 'Commune sud de la province du Bazèga',
  },
]

// ── Export principal ─────────────────────────────────────────
export const DELIVERY_ZONES: DeliveryZone[] = [
  ...RING_1,
  ...RING_2,
  ...RING_3,
  ...RING_4,
]

// Zones triées alphabétiquement (pour le sélecteur)
export const DELIVERY_ZONES_SORTED = [...DELIVERY_ZONES].sort((a, b) =>
  a.name.localeCompare(b.name, 'fr')
)

// Libellé de l'anneau
export const RING_LABELS: Record<number, string> = {
  1: 'Centre-ville',
  2: 'Première couronne',
  3: 'Deuxième couronne',
  4: 'Grande périphérie',
}

// Couleur badge par anneau
export const RING_COLORS: Record<number, string> = {
  1: '#27ae60',
  2: '#f39c12',
  3: '#e67e22',
  4: '#e74c3c',
}

// Helper : trouver une zone par ID
export function getZoneById(id: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find(z => z.id === id)
}

// Helper : formater le délai
export function formatDelay(min: number, max: number): string {
  return `${min}–${max} min`
}
