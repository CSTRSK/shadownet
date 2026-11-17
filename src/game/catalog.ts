import {
  BuildingId,
  CosmeticSkinId,
  EmployeeRarity,
  EmployeeRole,
  EventSentiment,
  GlobalRegionId,
  LeaderboardEntry,
  MarketingCampaignId,
  ProductId,
  ProductPricingStance,
  RegionMode,
  RepeatableTechId,
  ResearchTier,
  TeamDirective,
  WorkloadMode,
} from './types';

export interface BuildingDefinition {
  id: BuildingId;
  name: string;
  subtitle: string;
  description: string;
  maxLevel: number;
  baseCostCredits: number;
  costScale: number;
  basePowerCost: number;
  baseCoolingCost: number;
  unlockRequirement?: string;
}

export const BUILDING_CATALOG: Record<BuildingId, BuildingDefinition> = {
  office: {
    id: 'office',
    name: 'Büro-Komplex',
    subtitle: 'Kapazität & Produktivität',
    description:
      'Erhöht die Mitarbeiterkapazität und steigert die allgemeine Team-Produktivität pro Ausbaustufe.',
    maxLevel: 20,
    baseCostCredits: 450,
    costScale: 1.55,
    basePowerCost: 6,
    baseCoolingCost: 4,
  },
  serverRoom: {
    id: 'serverRoom',
    name: 'Serverraum',
    subtitle: 'Rechenleistung · Strom · Kühlung',
    description:
      'Produziert Rechenleistung für Aufträge und Produkte. Ausbauten verbrauchen Strom & Kühlung, deren Versorgung durch Sysadmins stabilisiert wird.',
    maxLevel: 15,
    baseCostCredits: 600,
    costScale: 1.6,
    basePowerCost: 18,
    baseCoolingCost: 16,
  },
  researchLab: {
    id: 'researchLab',
    name: 'Forschungslabor',
    subtitle: 'Forschungspunkte',
    description:
      'Generiert kontinuierlich Forschungspunkte (FP) für den 4-stufigen Technologiebaum.',
    maxLevel: 15,
    baseCostCredits: 750,
    costScale: 1.62,
    basePowerCost: 12,
    baseCoolingCost: 10,
  },
  marketingDept: {
    id: 'marketingDept',
    name: 'Marketingabteilung',
    subtitle: 'Kunden & Reputation',
    description:
      'Gewinnt neue Kunden für Abonnements, erhöht die Marken-Reputation und schaltet lukrative Aufträge frei.',
    maxLevel: 15,
    baseCostCredits: 850,
    costScale: 1.58,
    basePowerCost: 8,
    baseCoolingCost: 5,
  },
  aiCenter: {
    id: 'aiCenter',
    name: 'KI-Zentrum',
    subtitle: 'Endgame-Automatisierung',
    description:
      'Endgame-Gebäude: Automatisiert Aufträge, steigert Server-Effizienz und erzeugt Einfluss sowie Bonus-Forschung.',
    maxLevel: 10,
    baseCostCredits: 18000,
    costScale: 1.85,
    basePowerCost: 45,
    baseCoolingCost: 40,
    unlockRequirement: 'Forschung: KI-Agenten (Stufe 2)',
  },
};

export interface GlobalRegionDefinition {
  id: GlobalRegionId;
  name: string;
  city: string;
  specialty: string;
  description: string;
  maxLevel: number;
  baseCostCredits: number;
  baseCostInfluence: number;
  costScale: number;
  requiredResearch: string;
  computeBonusPerLevel: number;
  coolingBonusPerLevel: number;
  revenueBonusPctPerLevel: number;
  rpBonusPctPerLevel: number;
  influencePerSecPerLevel: number;
}

export const GLOBAL_REGIONS_CATALOG: Record<GlobalRegionId, GlobalRegionDefinition> = {
  frankfurt: {
    id: 'frankfurt',
    name: 'EU-Hub',
    city: 'Frankfurt',
    specialty: 'B2B-Compliance & Security',
    description: 'DSGVO-sicheres Hochverfügbarkeits-Cluster für europäische Enterprise-Kunden.',
    maxLevel: 10,
    baseCostCredits: 28000,
    baseCostInfluence: 12,
    costScale: 1.75,
    requiredResearch: 'data_centers',
    computeBonusPerLevel: 65,
    coolingBonusPerLevel: 35,
    revenueBonusPctPerLevel: 8,
    rpBonusPctPerLevel: 3,
    influencePerSecPerLevel: 0.04,
  },
  reykjavik: {
    id: 'reykjavik',
    name: 'Nordic Cryo',
    city: 'Reykjavik',
    specialty: 'Geothermie & Grüne Kühlung',
    description: 'Natürliche Arktis-Kühlung und billiger Strom entlasten alle Server weltweit.',
    maxLevel: 10,
    baseCostCredits: 42000,
    baseCostInfluence: 18,
    costScale: 1.78,
    requiredResearch: 'data_centers',
    computeBonusPerLevel: 85,
    coolingBonusPerLevel: 140,
    revenueBonusPctPerLevel: 4,
    rpBonusPctPerLevel: 5,
    influencePerSecPerLevel: 0.03,
  },
  virginia: {
    id: 'virginia',
    name: 'US-East Cloud',
    city: 'Virginia',
    specialty: 'Produkt-Skalierung & Ads',
    description: 'Massive Glasfaser-Backbones vervielfachen Abo-Nutzer und Produktumsatz.',
    maxLevel: 10,
    baseCostCredits: 95000,
    baseCostInfluence: 30,
    costScale: 1.82,
    requiredResearch: 'global_infra',
    computeBonusPerLevel: 110,
    coolingBonusPerLevel: 50,
    revenueBonusPctPerLevel: 14,
    rpBonusPctPerLevel: 4,
    influencePerSecPerLevel: 0.06,
  },
  tokyo: {
    id: 'tokyo',
    name: 'APAC Quanten-Lab',
    city: 'Tokio',
    specialty: 'Hochfrequenz & Forschung',
    description: 'Asiatischer Innovations-Knoten für schnellere Algorithmen und FP-Durchsatz.',
    maxLevel: 10,
    baseCostCredits: 160000,
    baseCostInfluence: 45,
    costScale: 1.85,
    requiredResearch: 'global_infra',
    computeBonusPerLevel: 130,
    coolingBonusPerLevel: 60,
    revenueBonusPctPerLevel: 7,
    rpBonusPctPerLevel: 15,
    influencePerSecPerLevel: 0.08,
  },
  orbital: {
    id: 'orbital',
    name: 'LEO-Satelliten-Node',
    city: 'Low Earth Orbit',
    specialty: 'Globale Souveränität',
    description: 'Endgame-Laserlink-Netzwerk im Orbit. Immun gegen lokale Netzstörungen.',
    maxLevel: 10,
    baseCostCredits: 650000,
    baseCostInfluence: 120,
    costScale: 1.95,
    requiredResearch: 'super_ai',
    computeBonusPerLevel: 260,
    coolingBonusPerLevel: 180,
    revenueBonusPctPerLevel: 18,
    rpBonusPctPerLevel: 18,
    influencePerSecPerLevel: 0.22,
  },
};

export const REGION_MODES: Record<
  RegionMode,
  { label: string; description: string; revMult: number; computeMult: number; coolMult: number; secBonus: number }
> = {
  balanced: {
    label: 'Ausgeglichen',
    description: 'Standardbetrieb ohne Spezial-Fokus',
    revMult: 1,
    computeMult: 1,
    coolMult: 1,
    secBonus: 0,
  },
  compute: {
    label: 'Rechen-Boost',
    description: '+35% Rechenleistung, -15% Kühlungsreserve',
    revMult: 1.1,
    computeMult: 1.35,
    coolMult: 0.85,
    secBonus: 0,
  },
  eco: {
    label: 'Eco-Kühlung',
    description: '+40% Kühlung & Stromreserve, -10% Umsatz',
    revMult: 0.9,
    computeMult: 0.95,
    coolMult: 1.4,
    secBonus: 2,
  },
  security: {
    label: 'SOC-Schild',
    description: '+6 Cyber-Abwehr pro Node, -5% Umsatz',
    revMult: 0.95,
    computeMult: 1,
    coolMult: 1,
    secBonus: 6,
  },
};

export const TEAM_DIRECTIVES: Record<
  TeamDirective,
  {
    label: string;
    effectText: string;
    workMult: number;
    rpMult: number;
    revMult: number;
    securityBonus: number;
  }
> = {
  balanced: {
    label: 'Ausgeglichen',
    effectText: 'Alle Abteilungen arbeiten im Standard-Takt.',
    workMult: 1,
    rpMult: 1,
    revMult: 1,
    securityBonus: 0,
  },
  contracts: {
    label: 'Auftrags-Sprint',
    effectText: '+35% Auftragsgeschwindigkeit, -10% Forschung',
    workMult: 1.35,
    rpMult: 0.9,
    revMult: 1.05,
    securityBonus: 0,
  },
  research: {
    label: 'Forschung & Entwicklung',
    effectText: '+35% Forschungspunkte, -10% Produktumsatz',
    workMult: 0.95,
    rpMult: 1.35,
    revMult: 0.9,
    securityBonus: 0,
  },
  growth: {
    label: 'Produkt-Skalierung',
    effectText: '+25% Produkt- & Abo-Umsatz, -15% Auftrags-Speed',
    workMult: 0.85,
    rpMult: 0.95,
    revMult: 1.25,
    securityBonus: 0,
  },
  defense: {
    label: 'Cyber-Defense (SOC)',
    effectText: '+22 Sicherheits-Rating & schnellere Firewall-Regeneration',
    workMult: 0.92,
    rpMult: 1.0,
    revMult: 0.95,
    securityBonus: 22,
  },
};

export const WORKLOAD_MODES: Record<
  WorkloadMode,
  {
    label: string;
    effectText: string;
    speedMult: number;
    rpMult: number;
    motDeltaPerSec: number;
    loyDeltaPerSec: number;
    bugDriftPerSec: number;
  }
> = {
  worklife: {
    label: 'Work-Life-Balance',
    effectText: '-12% Tempo, regeneriert Motivation & Loyalität, schont Produktqualität',
    speedMult: 0.88,
    rpMult: 0.95,
    motDeltaPerSec: 0.55,
    loyDeltaPerSec: 0.25,
    bugDriftPerSec: -0.05,
  },
  standard: {
    label: 'Regelbetrieb (40h)',
    effectText: 'Normales Arbeitstempo, geringe Tech-Schulden',
    speedMult: 1.0,
    rpMult: 1.0,
    motDeltaPerSec: 0.0,
    loyDeltaPerSec: 0.02,
    bugDriftPerSec: 0.14,
  },
  crunch: {
    label: 'Crunch-Mode',
    effectText: '+40% Tempo & +20% FP, aber starker Motivationsverlust & Kündigungsrisiko!',
    speedMult: 1.4,
    rpMult: 1.2,
    motDeltaPerSec: -0.95,
    loyDeltaPerSec: -0.45,
    bugDriftPerSec: 0.55,
  },
};

export interface MarketingCampaignDef {
  id: MarketingCampaignId;
  name: string;
  description: string;
  baseCostCredits: number;
  durationSeconds: number;
  revBoostMult: number;
  influenceGain: number;
}

export const MARKETING_CAMPAIGNS: MarketingCampaignDef[] = [
  {
    id: 'influencer',
    name: 'Tech-Creator Launch',
    description: 'Steigert Produkt-Umsatz & Nutzerzustrom 40s lang deutlich.',
    baseCostCredits: 1800,
    durationSeconds: 40,
    revBoostMult: 1.35,
    influenceGain: 2,
  },
  {
    id: 'conference_blitz',
    name: 'Keynote & Hackathon',
    description: 'Zieht Top-Talente und zahlungskräftige Kunden an (45s Boost).',
    baseCostCredits: 6500,
    durationSeconds: 45,
    revBoostMult: 1.5,
    influenceGain: 6,
  },
  {
    id: 'enterprise_push',
    name: 'Global Enterprise Roadshow',
    description: 'Massive B2B-Skalierung für reife Produkte und Börsenkurs (50s Boost).',
    baseCostCredits: 28000,
    durationSeconds: 50,
    revBoostMult: 1.75,
    influenceGain: 14,
  },
];

export interface DilemmaTemplate {
  id: string;
  title: string;
  description: string;
  choices: Array<{
    id: string;
    label: string;
    effectHint: string;
    creditsScale: number; // multiplied by max(400, creditsPerSec * 12)
    rpDelta: number;
    influenceDelta: number;
    loyaltyDelta: number;
    motivationDelta: number;
    firewallDelta: number;
  }>;
}

export const MANAGEMENT_DILEMMAS: DilemmaTemplate[] = [
  {
    id: 'whistleblower_gap',
    title: 'Sicherheitslücke im Alt-Code entdeckt',
    description:
      'Ein Entwickler meldet eine undokumentierte Schwachstelle kurz vor einem großen Kunden-Rollout.',
    choices: [
      {
        id: 'transparent_fix',
        label: 'Sofort offenlegen & patchen',
        effectHint: 'Kostet Credits, aber +12 Loyalität, +15 Firewall & +8 Einfluss',
        creditsScale: -1.1,
        rpDelta: 35,
        influenceDelta: 8,
        loyaltyDelta: 12,
        motivationDelta: 4,
        firewallDelta: 15,
      },
      {
        id: 'rush_ship',
        label: 'Still ausliefern (Risiko)',
        effectHint: 'Sofort-Gewinn Credits, aber -14 Loyalität & -18 Firewall',
        creditsScale: 1.5,
        rpDelta: 0,
        influenceDelta: -4,
        loyaltyDelta: -14,
        motivationDelta: -8,
        firewallDelta: -18,
      },
    ],
  },
  {
    id: 'overtime_union',
    title: 'Team fordert Gewinnbeteiligung',
    description:
      'Aufgrund der hohen Auslastung verlangt das Entwicklerteam eine Quartalsprämie oder kürzere Sprints.',
    choices: [
      {
        id: 'pay_bonus',
        label: 'Prämie auszahlen',
        effectHint: 'Kostet Credits, +18 Motivation & +14 Loyalität für alle',
        creditsScale: -1.4,
        rpDelta: 0,
        influenceDelta: 4,
        loyaltyDelta: 14,
        motivationDelta: 18,
        firewallDelta: 0,
      },
      {
        id: 'decline_bonus',
        label: 'Ablehnen & KPIs anziehen',
        effectHint: '+80 FP, aber -16 Motivation & -12 Loyalität (Kündigungsgefahr!)',
        creditsScale: 0,
        rpDelta: 80,
        influenceDelta: -2,
        loyaltyDelta: -12,
        motivationDelta: -16,
        firewallDelta: 0,
      },
    ],
  },
  {
    id: 'darknet_bounty',
    title: 'Grauzonen-Auftrag aus dem Darknet',
    description:
      'Ein anonymer Broker bietet eine hohe Summe für proprietäre KI-Routing-Module ohne Compliance-Prüfung.',
    choices: [
      {
        id: 'reject_broker',
        label: 'Ablehnen & Behörden melden',
        effectHint: '+12 Einfluss & +12 Security-Firewall',
        creditsScale: 0,
        rpDelta: 25,
        influenceDelta: 12,
        loyaltyDelta: 6,
        motivationDelta: 2,
        firewallDelta: 12,
      },
      {
        id: 'accept_broker',
        label: 'Diskret annehmen',
        effectHint: 'Hoher Credit-Gewinn, aber -10 Einfluss & -15 Loyalität',
        creditsScale: 2.2,
        rpDelta: 40,
        influenceDelta: -10,
        loyaltyDelta: -15,
        motivationDelta: -5,
        firewallDelta: -10,
      },
    ],
  },
  {
    id: 'vc_exclusivity',
    title: 'Venture-Fonds bietet Strategiedeal',
    description:
      'Ein Tech-Investor will Forschungsdaten lizenzieren und schlägt einen gemeinsamen Patent-Pool vor.',
    choices: [
      {
        id: 'license_tech',
        label: 'Lizenzen verkaufen',
        effectHint: 'Starke Credit-Spritze + 150 FP',
        creditsScale: 1.6,
        rpDelta: 150,
        influenceDelta: 5,
        loyaltyDelta: 0,
        motivationDelta: 5,
        firewallDelta: 0,
      },
      {
        id: 'stay_independent',
        label: 'Unabhängig bleiben',
        effectHint: '+14 Einfluss & +10 Loyalität',
        creditsScale: 0,
        rpDelta: 60,
        influenceDelta: 14,
        loyaltyDelta: 10,
        motivationDelta: 6,
        firewallDelta: 0,
      },
    ],
  },
];

export interface HardwareTier {
  level: number;
  name: string;
  description: string;
  costCredits: number;
  clickPower: number;
  passiveWorkBonus: number;
  powerSupply: number;
  coolingSupply: number;
}

export const HARDWARE_TIERS: HardwareTier[] = [
  {
    level: 1,
    name: 'Alter Garagen-PC',
    description: 'Gebrauchter Dual-Core mit klapperndem Lüfter. Genug für erste Skripte.',
    costCredits: 0,
    clickPower: 12,
    passiveWorkBonus: 2,
    powerSupply: 30,
    coolingSupply: 28,
  },
  {
    level: 2,
    name: 'Modifizierte Workstation',
    description: 'Mehr RAM, sauberer Airflow und erste NVMe-Cache-Platte.',
    costCredits: 180,
    clickPower: 24,
    passiveWorkBonus: 6,
    powerSupply: 55,
    coolingSupply: 52,
  },
  {
    level: 3,
    name: 'Dual-GPU Dev-Rig',
    description: 'Flüssiggekühlte Entwickler-Maschine für schnelle Builds.',
    costCredits: 520,
    clickPower: 45,
    passiveWorkBonus: 14,
    powerSupply: 90,
    coolingSupply: 86,
  },
  {
    level: 4,
    name: 'Garagen-Rack Cluster',
    description: 'Erstes 19-Zoll-Rack mit dedizierter USV und Klimasplitgerät.',
    costCredits: 1400,
    clickPower: 80,
    passiveWorkBonus: 28,
    powerSupply: 150,
    coolingSupply: 145,
  },
  {
    level: 5,
    name: 'Blade-Cluster Alpha',
    description: 'Hochdichte Server-Blades mit Glasfaser-Uplink.',
    costCredits: 4200,
    clickPower: 145,
    passiveWorkBonus: 55,
    powerSupply: 260,
    coolingSupply: 250,
  },
  {
    level: 6,
    name: 'Immersions-Kühlpod',
    description: 'Flüssigkeitsimmersion für dauerhafte Volllast ohne Throttling.',
    costCredits: 12000,
    clickPower: 260,
    passiveWorkBonus: 110,
    powerSupply: 440,
    coolingSupply: 440,
  },
  {
    level: 7,
    name: 'Kryo-Rechenmodul',
    description: 'Tiefgekühlte Hochleistungs-Knoten für globale Netze.',
    costCredits: 36000,
    clickPower: 480,
    passiveWorkBonus: 220,
    powerSupply: 760,
    coolingSupply: 760,
  },
  {
    level: 8,
    name: 'Quanten-Backbone Core',
    description: 'Supraleitende Infrastruktur auf Konzern-Niveau.',
    costCredits: 110000,
    clickPower: 920,
    passiveWorkBonus: 460,
    powerSupply: 1400,
    coolingSupply: 1400,
  },
];

export interface ResearchDefinition {
  id: string;
  tier: ResearchTier;
  name: string;
  description: string;
  effectLabel: string;
  costRP: number;
  costCredits: number;
  prerequisites: string[];
}

export const RESEARCH_CATALOG: ResearchDefinition[] = [
  // Stufe 1
  {
    id: 'ssds',
    tier: 1,
    name: 'SSDs',
    description: 'Hochgeschwindigkeits-Flashspeicher beschleunigt alle Code-Kompilierungen und Datenbankzugriffe.',
    effectLabel: '+25% Projektgeschwindigkeit',
    costRP: 35,
    costCredits: 250,
    prerequisites: [],
  },
  {
    id: 'cloud_services',
    tier: 1,
    name: 'Cloud-Services',
    description: 'Elastische Container-Orchestrierung für wiederkehrende B2B- und Abo-Umsätze.',
    effectLabel: '+20% Einnahmen & Cloudspeicher-Basis',
    costRP: 60,
    costCredits: 500,
    prerequisites: ['ssds'],
  },
  {
    id: 'automation',
    tier: 1,
    name: 'Automatisierung',
    description: 'CI/CD-Pipelines übernehmen Routineaufgaben und entlasten das Team.',
    effectLabel: '+25% Auto-Auftragsfortschritt',
    costRP: 95,
    costCredits: 900,
    prerequisites: ['ssds'],
  },
  // Stufe 2
  {
    id: 'ai_agents',
    tier: 2,
    name: 'KI-Agenten',
    description: 'Autonome Code- und Security-Agenten schalten das KI-Zentrum und erste KI-Produkte frei.',
    effectLabel: 'Schaltet KI-Zentrum frei · +30% FP-Rate',
    costRP: 220,
    costCredits: 3200,
    prerequisites: ['cloud_services', 'automation'],
  },
  {
    id: 'data_centers',
    tier: 2,
    name: 'Rechenzentren',
    description: 'Modulare Rechenzentren schalten erste globale Regionen frei und verdoppeln Effizienz.',
    effectLabel: 'Globale Regionen (EU/Nordic) · +45% Rechenleistung',
    costRP: 320,
    costCredits: 5500,
    prerequisites: ['cloud_services'],
  },
  // Stufe 3
  {
    id: 'quantum_computing',
    tier: 3,
    name: 'Quantencomputer',
    description: 'Kryptographische Durchbrüche und Simulationen in Echtzeit.',
    effectLabel: '+60% Forschung & +40% Auftragswert',
    costRP: 750,
    costCredits: 18000,
    prerequisites: ['ai_agents', 'data_centers'],
  },
  {
    id: 'global_infra',
    tier: 3,
    name: 'Globale Infrastruktur',
    description: 'Unterseekabel und Edge-POPs (US/APAC) senken Latenz gegen null.',
    effectLabel: 'US/APAC Regionen · +50% Abonnenten',
    costRP: 1050,
    costCredits: 28000,
    prerequisites: ['data_centers'],
  },
  // Stufe 4
  {
    id: 'super_ai',
    tier: 4,
    name: 'Super-KI',
    description: 'Strategische Intelligenz optimiert Architektur, Märkte und Orbital-Infrastruktur.',
    effectLabel: 'LEO-Orbit Region · +80% Gesamtumsatz',
    costRP: 2400,
    costCredits: 75000,
    prerequisites: ['quantum_computing', 'global_infra'],
  },
  {
    id: 'full_automation',
    tier: 4,
    name: 'Vollautomatisierung',
    description: 'Selbstheilende Rechenzentren und autonome Produktpipelines machen den Börsengang bereit.',
    effectLabel: 'Auto-SOC Option · Bereit für Börsengang',
    costRP: 3600,
    costCredits: 120000,
    prerequisites: ['super_ai'],
  },
];

export interface RepeatableTechDefinition {
  id: RepeatableTechId;
  name: string;
  description: string;
  effectLabel: string;
  baseCostRP: number;
  baseCostCredits: number;
  costScale: number;
}

export const REPEATABLE_RESEARCH_CATALOG: RepeatableTechDefinition[] = [
  {
    id: 'quantum_overclock',
    name: 'Quanten-Übertaktung',
    description: 'Endgame-Optimierung: Kalibriert Qubit-Cluster für höheren Server- und Produktdurchsatz.',
    effectLabel: '+15% Gesamtumsatz & +12% Rechenleistung pro Stufe',
    baseCostRP: 5000,
    baseCostCredits: 250000,
    costScale: 1.65,
  },
  {
    id: 'neural_compression',
    name: 'Neuronale Kompression',
    description: 'Endgame-Optimierung: Komprimiert Trainingsmodelle für schnellere Forschungszyklen.',
    effectLabel: '+18% Forschungspunkte & +10% Auftrags-Speed pro Stufe',
    baseCostRP: 6500,
    baseCostCredits: 320000,
    costScale: 1.68,
  },
  {
    id: 'zero_day_immunity',
    name: 'Zero-Day-Immunität',
    description: 'Endgame-Optimierung: Prädiktive KI-Signaturhärtung für Konzern-Sicherheit und Reputation.',
    effectLabel: '+8 Security-Rating & +0.15 Einfluss/s pro Stufe',
    baseCostRP: 8000,
    baseCostCredits: 400000,
    costScale: 1.7,
  },
];

export interface ProductDefinition {
  id: ProductId;
  name: string;
  modelLabel: string;
  description: string;
  unlockCredits: number;
  unlockRP: number;
  requiredResearch?: string;
  baseRevenuePerSec: number;
  baseSubscribers: number;
  upgradeBaseCost: number;
}

export const PRODUCT_CATALOG: Record<ProductId, ProductDefinition> = {
  antivirus: {
    id: 'antivirus',
    name: 'Antivirus',
    modelLabel: 'Monatliche Einnahmen',
    description: 'Leichtgewichtiger Endpoint-Schutz mit automatischen Signatur-Updates.',
    unlockCredits: 1200,
    unlockRP: 20,
    baseRevenuePerSec: 14,
    baseSubscribers: 420,
    upgradeBaseCost: 900,
  },
  cloudStorage: {
    id: 'cloudStorage',
    name: 'Cloudspeicher',
    modelLabel: 'Abomodell',
    description: 'Ende-zu-Ende-verschlüsselter Objektspeicher für Teams und Privatnutzer.',
    unlockCredits: 4500,
    unlockRP: 70,
    requiredResearch: 'cloud_services',
    baseRevenuePerSec: 42,
    baseSubscribers: 1150,
    upgradeBaseCost: 2600,
  },
  messenger: {
    id: 'messenger',
    name: 'Messenger',
    modelLabel: 'Benutzerwachstum',
    description: 'Zero-Knowledge-Kommunikationsplattform mit viralem Netzwerkeffekt.',
    unlockCredits: 11000,
    unlockRP: 140,
    requiredResearch: 'automation',
    baseRevenuePerSec: 88,
    baseSubscribers: 4800,
    upgradeBaseCost: 6200,
  },
  streaming: {
    id: 'streaming',
    name: 'Streamingplattform',
    modelLabel: 'Werbeeinnahmen',
    description: 'Low-Latency Video- und Developer-Livestream-Netzwerk mit Edge-CDN.',
    unlockCredits: 28000,
    unlockRP: 360,
    requiredResearch: 'data_centers',
    baseRevenuePerSec: 210,
    baseSubscribers: 12500,
    upgradeBaseCost: 15000,
  },
  aiAssistant: {
    id: 'aiAssistant',
    name: 'KI-Assistent',
    modelLabel: 'Premiumprodukt',
    description: 'Autonomer Enterprise-Copilot für Code, Security-Audits und Analysen.',
    unlockCredits: 65000,
    unlockRP: 800,
    requiredResearch: 'ai_agents',
    baseRevenuePerSec: 520,
    baseSubscribers: 3600,
    upgradeBaseCost: 34000,
  },
};

export const PRODUCT_STANCES: Record<
  ProductPricingStance,
  { label: string; revMult: number; subMult: number; hint: string }
> = {
  freemium: {
    label: 'Freemium',
    revMult: 0.8,
    subMult: 1.55,
    hint: '+55% Nutzer & Marktanteil, -20% Umsatz',
  },
  balanced: {
    label: 'Ausgewogen',
    revMult: 1.0,
    subMult: 1.0,
    hint: 'Balanciertes Wachstum & Marge',
  },
  enterprise: {
    label: 'Enterprise',
    revMult: 1.45,
    subMult: 0.72,
    hint: '+45% Umsatz pro Produkt, weniger Nutzer',
  },
};

export interface CyberIncidentTemplate {
  title: string;
  targetLabel: string;
  description: string;
  severity: number;
  revenuePenaltyMult: number;
}

export const CYBER_INCIDENT_TEMPLATES: CyberIncidentTemplate[] = [
  {
    title: 'DDoS-Flut auf Edge-Cluster',
    targetLabel: 'Serverraum & CDN',
    description: 'Verteiltes Botnetz überlastet API-Gateways und senkt Produkt-Performance.',
    severity: 1,
    revenuePenaltyMult: 0.82,
  },
  {
    title: 'Zero-Day API-Schwachstelle',
    targetLabel: 'Cloudspeicher & Auth',
    description: 'Verdächtige Token-Zugriffe erkannt. Sofortiges Patching oder Gegenanalyse nötig.',
    severity: 2,
    revenuePenaltyMult: 0.74,
  },
  {
    title: 'Ransomware-Spearphishing',
    targetLabel: 'Unternehmensnetz',
    description: 'Angreifer versuchen laterale Bewegung im Entwickler-Subnetz.',
    severity: 2,
    revenuePenaltyMult: 0.76,
  },
  {
    title: 'Supply-Chain Paket-Manipulation',
    targetLabel: 'CI/CD Pipeline',
    description: 'Kompromittierte Abhängigkeit im Build-Cluster blockiert Deployments.',
    severity: 3,
    revenuePenaltyMult: 0.68,
  },
];

export interface EventTemplate {
  id: string;
  title: string;
  description: string;
  sentiment: EventSentiment;
  durationSeconds: number;
  revenueMultiplier: number;
  researchMultiplier: number;
  powerPenalty: number;
  productivityMultiplier: number;
  instantCredits?: number;
  instantInfluence?: number;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'big_client',
    title: 'Großer Kunde',
    description: 'Ein DAX-Konzern unterzeichnet einen Sondervertrag für Sicherheitsinfrastruktur.',
    sentiment: 'positive',
    durationSeconds: 35,
    revenueMultiplier: 1.45,
    researchMultiplier: 1.0,
    powerPenalty: 0,
    productivityMultiplier: 1.15,
    instantCredits: 650,
  },
  {
    id: 'investor',
    title: 'Investor',
    description: 'Ein Venture-Fonds investiert Kapital und öffnet strategische Netzwerke.',
    sentiment: 'positive',
    durationSeconds: 30,
    revenueMultiplier: 1.2,
    researchMultiplier: 1.2,
    powerPenalty: 0,
    productivityMultiplier: 1.0,
    instantCredits: 1400,
    instantInfluence: 8,
  },
  {
    id: 'trend_tech',
    title: 'Trendtechnologie',
    description: 'Deine Architektur geht in der Tech-Szene viral – Forschung und Abos boomen.',
    sentiment: 'positive',
    durationSeconds: 40,
    revenueMultiplier: 1.25,
    researchMultiplier: 1.5,
    powerPenalty: 0,
    productivityMultiplier: 1.2,
    instantInfluence: 5,
  },
  {
    id: 'conference',
    title: 'Konferenz',
    description: 'Deine Engineers halten einen Keynote-Talk auf einer Security-Konferenz.',
    sentiment: 'neutral',
    durationSeconds: 25,
    revenueMultiplier: 1.0,
    researchMultiplier: 1.25,
    powerPenalty: 0,
    productivityMultiplier: 0.95,
    instantInfluence: 6,
  },
  {
    id: 'expo',
    title: 'Messe',
    description: 'Branchenmesse in Berlin: Höhere Sichtbarkeit, aber ein Teil des Teams reist.',
    sentiment: 'neutral',
    durationSeconds: 25,
    revenueMultiplier: 1.15,
    researchMultiplier: 1.0,
    powerPenalty: 0,
    productivityMultiplier: 0.9,
    instantInfluence: 4,
  },
  {
    id: 'power_outage',
    title: 'Stromausfall',
    description: 'Netzschwankung im Sektor! Notstromaggregate senken vorübergehend die Kapazität.',
    sentiment: 'negative',
    durationSeconds: 22,
    revenueMultiplier: 0.85,
    researchMultiplier: 0.9,
    powerPenalty: 25,
    productivityMultiplier: 0.8,
  },
  {
    id: 'staff_outage',
    title: 'Mitarbeiterausfall',
    description: 'Grippewelle im Entwickler-Trakt drückt kurzfristig auf die Projektgeschwindigkeit.',
    sentiment: 'negative',
    durationSeconds: 22,
    revenueMultiplier: 0.95,
    researchMultiplier: 0.85,
    powerPenalty: 0,
    productivityMultiplier: 0.72,
  },
  {
    id: 'competitor_launch',
    title: 'Konkurrenz startet Produkt',
    description: 'Ein Rivale veröffentlicht ein Konkurrenzprodukt und setzt Margen unter Druck.',
    sentiment: 'negative',
    durationSeconds: 28,
    revenueMultiplier: 0.78,
    researchMultiplier: 1.1,
    powerPenalty: 0,
    productivityMultiplier: 1.0,
  },
];

export const RARITY_CONFIG: Record<
  EmployeeRarity,
  { multiplier: number; hireMultiplier: number; colorClass: string; borderClass: string }
> = {
  Gewöhnlich: {
    multiplier: 1.0,
    hireMultiplier: 1.0,
    colorClass: 'text-slate-300',
    borderClass: 'border-slate-600/60',
  },
  Selten: {
    multiplier: 1.35,
    hireMultiplier: 1.7,
    colorClass: 'text-cyan-300',
    borderClass: 'border-cyan-400/50',
  },
  Episch: {
    multiplier: 1.8,
    hireMultiplier: 2.8,
    colorClass: 'text-fuchsia-300',
    borderClass: 'border-fuchsia-400/50',
  },
  Legendär: {
    multiplier: 2.5,
    hireMultiplier: 4.5,
    colorClass: 'text-amber-300',
    borderClass: 'border-amber-400/60',
  },
};

export const ROLE_INFO: Record<
  EmployeeRole,
  { focus: string; baseCost: number; baseSalaryPerMin: number }
> = {
  Entwickler: {
    focus: 'Projektgeschwindigkeit',
    baseCost: 350,
    baseSalaryPerMin: 28,
  },
  Sysadmin: {
    focus: 'Servereffizienz & Cyber-Defense',
    baseCost: 380,
    baseSalaryPerMin: 30,
  },
  Forscher: {
    focus: 'Forschungspunkte',
    baseCost: 420,
    baseSalaryPerMin: 34,
  },
  Manager: {
    focus: 'Teamleistung & Motivation',
    baseCost: 480,
    baseSalaryPerMin: 38,
  },
};

export interface RivalDefinition extends Omit<LeaderboardEntry, 'isPlayer'> {
  acquisitionCost: number;
  perkLabel: string;
  revBonusPct: number;
  rpBonusPct: number;
  securityBonus: number;
}

export const RIVAL_COMPANIES: RivalDefinition[] = [
  {
    id: 'rival_1',
    companyName: 'Aegis Cyberworks',
    revenuePerMin: 42000,
    valuation: 4200000,
    researchScore: 1450,
    tierLabel: 'Globaler Konzern',
    acquisitionCost: 120000000,
    perkLabel: '+25% Gesamtumsatz & +15 Security-Rating',
    revBonusPct: 25,
    rpBonusPct: 10,
    securityBonus: 15,
  },
  {
    id: 'rival_2',
    companyName: 'Vortex Cloud AG',
    revenuePerMin: 18500,
    valuation: 1650000,
    researchScore: 860,
    tierLabel: 'Skaliertes Tech-Haus',
    acquisitionCost: 35000000,
    perkLabel: '+18% Gesamtumsatz & +10% Forschung',
    revBonusPct: 18,
    rpBonusPct: 10,
    securityBonus: 5,
  },
  {
    id: 'rival_3',
    companyName: 'Kurogane Systems',
    revenuePerMin: 7400,
    valuation: 580000,
    researchScore: 410,
    tierLabel: 'Midgame Studio',
    acquisitionCost: 6500000,
    perkLabel: '+15% Forschung & +10% Umsatz',
    revBonusPct: 10,
    rpBonusPct: 15,
    securityBonus: 4,
  },
  {
    id: 'rival_4',
    companyName: 'NordBit Security',
    revenuePerMin: 2100,
    valuation: 120000,
    researchScore: 135,
    tierLabel: 'Wachsendes Startup',
    acquisitionCost: 950000,
    perkLabel: '+12 Security-Rating & +8% Umsatz',
    revBonusPct: 8,
    rpBonusPct: 5,
    securityBonus: 12,
  },
  {
    id: 'rival_5',
    companyName: 'HexaGarage GmbH',
    revenuePerMin: 480,
    valuation: 18500,
    researchScore: 25,
    tierLabel: 'Garagen-Team',
    acquisitionCost: 120000,
    perkLabel: '+8% Umsatz & +5% Forschung',
    revBonusPct: 8,
    rpBonusPct: 5,
    securityBonus: 2,
  },
];

export interface CosmeticSkin {
  id: CosmeticSkinId;
  name: string;
  description: string;
  costInfluence: number;
  primaryHex: string;
  accentHex: string;
  frameTitle: string;
}

export const COSMETIC_SKINS: CosmeticSkin[] = [
  {
    id: 'tron_cyan',
    name: 'Tron Grid Cyan',
    description: 'Klassisches Tiefblau mit scharfen Neon-Cyan-Vektorkanten. Keine Gameplay-Vorteile.',
    costInfluence: 0,
    primaryHex: '#00E5FF',
    accentHex: '#FF2E93',
    frameTitle: 'Grid-Architekt',
  },
  {
    id: 'neon_magenta',
    name: 'Night-City Magenta',
    description: 'Kontrastreiches Magenta-Raster mit elektrischen Violett-Konturen. Rein kosmetisch.',
    costInfluence: 15,
    primaryHex: '#FF2E93',
    accentHex: '#00E5FF',
    frameTitle: 'Cyber-Syndikat',
  },
  {
    id: 'quantum_gold',
    name: 'Saison-Apex Gold',
    description: 'Exklusives Saison-Design mit goldenem Lichtkern und Cyan-Sektorlinien. Rein kosmetisch.',
    costInfluence: 35,
    primaryHex: '#FBBF24',
    accentHex: '#38BDF8',
    frameTitle: 'Apex-Imperium',
  },
];
