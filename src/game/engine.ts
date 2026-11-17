import {
  BUILDING_CATALOG,
  COSMETIC_SKINS,
  CYBER_INCIDENT_TEMPLATES,
  EVENT_TEMPLATES,
  GLOBAL_REGIONS_CATALOG,
  HARDWARE_TIERS,
  MANAGEMENT_DILEMMAS,
  MARKETING_CAMPAIGNS,
  PRODUCT_CATALOG,
  PRODUCT_STANCES,
  RARITY_CONFIG,
  REGION_MODES,
  REPEATABLE_RESEARCH_CATALOG,
  RESEARCH_CATALOG,
  RIVAL_COMPANIES,
  ROLE_INFO,
  TEAM_DIRECTIVES,
  WORKLOAD_MODES,
} from './catalog';
import {
  ActiveEvent,
  BuildingId,
  Contract,
  CosmeticSkinId,
  CyberIncident,
  CyberIncidentResolution,
  EconomyMetrics,
  Employee,
  EmployeeRarity,
  EmployeeRole,
  GameState,
  GlobalRegionId,
  GlobalRegionState,
  LeaderboardEntry,
  ManagementDilemma,
  MarketingCampaignId,
  OfflineReport,
  ProductId,
  ProductPricingStance,
  RegionMode,
  RepeatableTechId,
  SecurityState,
  StaffQuitAlert,
  TeamDirective,
  WorkloadMode,
} from './types';

const FIRST_NAMES = [
  'Lukas',
  'Maja',
  'Kira',
  'Tarek',
  'Elena',
  'Sven',
  'Nadia',
  'Jonas',
  'Aria',
  'Moritz',
  'Yuna',
  'Fabian',
];

const LAST_NAMES = [
  'Voss',
  'Keller',
  'Lindner',
  'Sato',
  'Weber',
  'Richter',
  'Albrecht',
  'Niemann',
  'Brandt',
  'Takahashi',
];

const CONTRACT_POOL: Array<{
  title: string;
  client: string;
  category: Contract['category'];
  requiredWork: number;
  rewardCredits: number;
  rewardRP: number;
  rewardInfluence: number;
  minOfficeLevel: number;
  minCompute: number;
}> = [
  {
    title: 'Landingpage & SSL-Hardening',
    client: 'Bäckerei Krones',
    category: 'Security',
    requiredWork: 60,
    rewardCredits: 220,
    rewardRP: 8,
    rewardInfluence: 0,
    minOfficeLevel: 1,
    minCompute: 0,
  },
  {
    title: 'Kassen-API & Backup-Skript',
    client: 'Kiosk 24/7',
    category: 'App',
    requiredWork: 95,
    rewardCredits: 360,
    rewardRP: 12,
    rewardInfluence: 0,
    minOfficeLevel: 1,
    minCompute: 0,
  },
  {
    title: 'Firewall-Audit für Praxisnetz',
    client: 'MedCenter West',
    category: 'Security',
    requiredWork: 160,
    rewardCredits: 640,
    rewardRP: 24,
    rewardInfluence: 1,
    minOfficeLevel: 1,
    minCompute: 10,
  },
  {
    title: 'Container-Migration in die Cloud',
    client: 'LogiTrack GmbH',
    category: 'Cloud',
    requiredWork: 280,
    rewardCredits: 1250,
    rewardRP: 45,
    rewardInfluence: 2,
    minOfficeLevel: 2,
    minCompute: 24,
  },
  {
    title: 'Zero-Trust IAM-Architektur',
    client: 'FinanzWerk AG',
    category: 'Security',
    requiredWork: 460,
    rewardCredits: 2400,
    rewardRP: 85,
    rewardInfluence: 3,
    minOfficeLevel: 3,
    minCompute: 45,
  },
  {
    title: 'Echtzeit-Telemetrie-Pipeline',
    client: 'AeroDynamics',
    category: 'Cloud',
    requiredWork: 720,
    rewardCredits: 4600,
    rewardRP: 140,
    rewardInfluence: 5,
    minOfficeLevel: 5,
    minCompute: 85,
  },
  {
    title: 'Autonomes SOC & KI-Triage',
    client: 'EuroGrid Energy',
    category: 'KI',
    requiredWork: 1300,
    rewardCredits: 9800,
    rewardRP: 290,
    rewardInfluence: 9,
    minOfficeLevel: 7,
    minCompute: 160,
  },
  {
    title: 'Globale Quanten-Verschlüsselung',
    client: 'Helios Bankhaus',
    category: 'KI',
    requiredWork: 2400,
    rewardCredits: 24000,
    rewardRP: 620,
    rewardInfluence: 16,
    minOfficeLevel: 10,
    minCompute: 300,
  },
];

let uidCounter = 1;
function nextId(prefix: string): string {
  uidCounter += 1;
  return `${prefix}_${uidCounter}`;
}

function deterministicPick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

export function createDefaultGlobalRegions(): Record<GlobalRegionId, GlobalRegionState> {
  return {
    frankfurt: { id: 'frankfurt', level: 0, mode: 'balanced' },
    reykjavik: { id: 'reykjavik', level: 0, mode: 'balanced' },
    virginia: { id: 'virginia', level: 0, mode: 'balanced' },
    tokyo: { id: 'tokyo', level: 0, mode: 'balanced' },
    orbital: { id: 'orbital', level: 0, mode: 'balanced' },
  };
}

export function createDefaultSecurityState(): SecurityState {
  return {
    firewallIntegrity: 100,
    autoSocEnabled: false,
    activeIncident: null,
    nextIncidentInSeconds: 50,
    incidentsBlockedCount: 0,
    lastAuditAtSeconds: 0,
  };
}

export function createDefaultRepeatableResearch(): Record<RepeatableTechId, number> {
  return {
    quantum_overclock: 0,
    neural_compression: 0,
    zero_day_immunity: 0,
  };
}

export function generateCandidate(seed: number, officeLevel: number): Employee {
  const roles: EmployeeRole[] = ['Entwickler', 'Sysadmin', 'Forscher', 'Manager'];
  const role = deterministicPick(roles, seed);

  const roll = Math.abs((seed * 9301 + 49297) % 100);
  let rarity: EmployeeRarity = 'Gewöhnlich';
  if (roll >= 95 && officeLevel >= 4) rarity = 'Legendär';
  else if (roll >= 82 && officeLevel >= 2) rarity = 'Episch';
  else if (roll >= 58) rarity = 'Selten';

  const bonus =
    rarity === 'Legendär'
      ? 34
      : rarity === 'Episch'
        ? 22
        : rarity === 'Selten'
          ? 12
          : 0;

  const statBase = 38 + (seed % 24) + Math.min(20, officeLevel * 2) + bonus;
  const clampStat = (v: number) => Math.max(20, Math.min(100, Math.round(v)));

  const first = deterministicPick(FIRST_NAMES, seed);
  const last = deterministicPick(LAST_NAMES, seed * 3 + 5);

  const roleInfo = ROLE_INFO[role];
  const rarityCfg = RARITY_CONFIG[rarity];

  return {
    id: nextId('emp'),
    name: `${first} ${last}`,
    role,
    rarity,
    intelligence: clampStat(statBase + (role === 'Forscher' ? 14 : 0)),
    motivation: clampStat(72 + (seed % 20)),
    loyalty: clampStat(65 + (seed % 25) + (rarity === 'Legendär' ? 10 : 0)),
    experience: clampStat(30 + (seed % 25) + bonus * 0.7),
    salaryPerMin: Math.round(roleInfo.baseSalaryPerMin * rarityCfg.multiplier),
    hiredAtTick: 0,
    trainingCount: 0,
  };
}

export function getCandidateHireCost(employee: Employee): number {
  const base = ROLE_INFO[employee.role].baseCost;
  const rarityMult = RARITY_CONFIG[employee.rarity].hireMultiplier;
  return Math.round(base * rarityMult);
}

function getEligibleContractTemplates(officeLevel: number, computePower: number) {
  const unlocked = CONTRACT_POOL.filter(
    (tpl) => tpl.minOfficeLevel <= officeLevel + 2 && tpl.minCompute <= computePower + 35
  );
  const tiered = unlocked.filter((tpl) =>
    officeLevel >= 6 ? tpl.minOfficeLevel >= 3 : officeLevel >= 3 ? tpl.minOfficeLevel >= 2 : true
  );
  if (tiered.length >= 3) return tiered;
  if (unlocked.length >= 3) return unlocked;
  return CONTRACT_POOL.slice(0, 3);
}

function makeContractFromTemplate(tpl: (typeof CONTRACT_POOL)[number]): Contract {
  return {
    id: nextId('ctr'),
    title: tpl.title,
    client: tpl.client,
    category: tpl.category,
    requiredWork: tpl.requiredWork,
    progress: 0,
    rewardCredits: tpl.rewardCredits,
    rewardRP: tpl.rewardRP,
    rewardInfluence: tpl.rewardInfluence,
    minOfficeLevel: tpl.minOfficeLevel,
    minCompute: tpl.minCompute,
  };
}

export function generateContractPool(
  officeLevel: number,
  computePower: number,
  seed: number
): Contract[] {
  const pool = getEligibleContractTemplates(officeLevel, computePower);
  const chosen: Contract[] = [];
  for (let i = 0; i < 4; i += 1) {
    const idx = (seed + i) % pool.length;
    chosen.push(makeContractFromTemplate(pool[idx]));
  }
  return chosen;
}

function topUpContractPool(
  existing: Contract[],
  officeLevel: number,
  computePower: number,
  seed: number
): Contract[] {
  const pool = getEligibleContractTemplates(officeLevel, computePower);
  const next = existing.slice(0, 4);
  let step = 0;
  while (next.length < 4) {
    const idx = (seed + step) % pool.length;
    next.push(makeContractFromTemplate(pool[idx]));
    step += 1;
  }
  return next;
}

export function createInitialGameState(nowMs = Date.now()): GameState {
  const candidates: Employee[] = [
    generateCandidate(11, 1),
    generateCandidate(24, 1),
    generateCandidate(37, 1),
    generateCandidate(52, 1),
  ];

  const availableContracts = generateContractPool(1, 0, 0);

  return {
    version: 1,
    companyName: 'ShadowNet Labs',
    credits: 320,
    totalCreditsEarned: 320,
    researchPoints: 15,
    influence: 5,
    hardwareLevel: 1,
    buildings: {
      office: 1,
      serverRoom: 0,
      researchLab: 0,
      marketingDept: 0,
      aiCenter: 0,
    },
    employees: [],
    candidates,
    unlockedResearch: [],
    activeContracts: [],
    availableContracts,
    completedContractsCount: 0,
    products: {
      antivirus: {
        id: 'antivirus',
        unlocked: false,
        level: 1,
        subscribers: 0,
        revenuePerSec: 0,
        stance: 'balanced',
        releaseVersion: 1,
        stability: 100,
      },
      cloudStorage: {
        id: 'cloudStorage',
        unlocked: false,
        level: 1,
        subscribers: 0,
        revenuePerSec: 0,
        stance: 'balanced',
        releaseVersion: 1,
        stability: 100,
      },
      messenger: {
        id: 'messenger',
        unlocked: false,
        level: 1,
        subscribers: 0,
        revenuePerSec: 0,
        stance: 'balanced',
        releaseVersion: 1,
        stability: 100,
      },
      streaming: {
        id: 'streaming',
        unlocked: false,
        level: 1,
        subscribers: 0,
        revenuePerSec: 0,
        stance: 'balanced',
        releaseVersion: 1,
        stability: 100,
      },
      aiAssistant: {
        id: 'aiAssistant',
        unlocked: false,
        level: 1,
        subscribers: 0,
        revenuePerSec: 0,
        stance: 'balanced',
        releaseVersion: 1,
        stability: 100,
      },
    },
    activeEvents: [],
    eventLog: [
      {
        id: 'evt_init',
        title: 'Gründung in der Garage',
        sentiment: 'neutral',
        timestamp: nowMs,
        summary: 'Du startest mit einem alten Garagen-PC. Nimm erste Aufträge an und rüste auf.',
      },
    ],
    nextEventInSeconds: 45,
    alliance: {
      joined: false,
      name: 'CyberVanguard DE',
      tag: 'VGD',
      memberCount: 18,
      maxMembers: 30,
      sharedBonusPercent: 12,
      coopProgress: 420,
      coopGoal: 1000,
      members: [
        { id: 'm1', name: 'Kira_Root', role: 'Anführer', valuation: 2450000 },
        { id: 'm2', name: 'ZeroLatency', role: 'Offizier', valuation: 1120000 },
        { id: 'm3', name: 'ByteSchmiede', role: 'Mitglied', valuation: 540000 },
        { id: 'm4', name: 'NeonKernel', role: 'Mitglied', valuation: 310000 },
      ],
      messages: [
        {
          id: 'msg1',
          author: 'Kira_Root',
          text: 'Willkommen im Verband! Gemeinsames Saison-Event läuft – jeder Auftrag zählt.',
          timeLabel: '21:14',
        },
        {
          id: 'msg2',
          author: 'ZeroLatency',
          text: 'Server-Effizienz-Bonus (+12%) ist für alle Mitglieder aktiv.',
          timeLabel: '22:02',
        },
      ],
    },
    seasonDay: 14,
    seasonXp: 240,
    activeSkin: 'tron_cyan',
    unlockedSkins: ['tron_cyan'],
    ipoCompleted: false,
    playTimeSeconds: 0,
    lastSavedAt: nowMs,
    audio: {
      muted: false,
      musicEnabled: false,
      sfxEnabled: true,
    },
    globalRegions: createDefaultGlobalRegions(),
    teamDirective: 'balanced',
    security: createDefaultSecurityState(),
    repeatableResearch: createDefaultRepeatableResearch(),
    acquiredRivals: [],
    shareBuybacks: 0,
    workloadMode: 'standard',
    staffAlert: null,
    activeDilemma: null,
    nextDilemmaInSeconds: 38,
    loanBalance: 0,
    marketingBoostSeconds: 0,
    marketingBoostMult: 1,
    quitCount: 0,
  };
}

export function getBuildingUpgradeCost(id: BuildingId, currentLevel: number): number {
  const def = BUILDING_CATALOG[id];
  return Math.round(def.baseCostCredits * Math.pow(def.costScale, currentLevel));
}

export function canBuildOrUpgradeBuilding(
  state: GameState,
  id: BuildingId
): { ok: boolean; reason?: string; cost: number } {
  const current = state.buildings[id];
  const def = BUILDING_CATALOG[id];
  const cost = getBuildingUpgradeCost(id, current);
  if (current >= def.maxLevel) {
    return { ok: false, reason: 'Maximale Ausbaustufe erreicht', cost };
  }
  if (id === 'aiCenter' && !state.unlockedResearch.includes('ai_agents')) {
    return { ok: false, reason: 'Erfordert Forschung: KI-Agenten (Stufe 2)', cost };
  }
  if (state.credits < cost) {
    return { ok: false, reason: 'Nicht genug Credits', cost };
  }
  return { ok: true, cost };
}

export function getGlobalRegionUpgradeCost(
  id: GlobalRegionId,
  currentLevel: number
): { credits: number; influence: number } {
  const def = GLOBAL_REGIONS_CATALOG[id];
  return {
    credits: Math.round(def.baseCostCredits * Math.pow(def.costScale, currentLevel)),
    influence: Math.round(def.baseCostInfluence * Math.pow(1.42, currentLevel)),
  };
}

export function canUpgradeGlobalRegion(
  state: GameState,
  id: GlobalRegionId
): { ok: boolean; reason?: string; credits: number; influence: number } {
  const regions = state.globalRegions ?? createDefaultGlobalRegions();
  const current = regions[id]?.level ?? 0;
  const def = GLOBAL_REGIONS_CATALOG[id];
  const cost = getGlobalRegionUpgradeCost(id, current);

  if (current >= def.maxLevel) {
    return { ok: false, reason: 'Maximale Node-Stufe erreicht', ...cost };
  }
  if (!state.unlockedResearch.includes(def.requiredResearch)) {
    const reqName =
      RESEARCH_CATALOG.find((r) => r.id === def.requiredResearch)?.name ?? def.requiredResearch;
    return { ok: false, reason: `Erfordert Forschung: ${reqName}`, ...cost };
  }
  if (state.credits < cost.credits || state.influence < cost.influence) {
    return { ok: false, reason: 'Nicht genug Credits oder Einfluss', ...cost };
  }
  return { ok: true, ...cost };
}

export function getEmployeeTrainingCost(employee: Employee): { credits: number; rp: number } {
  const count = employee.trainingCount ?? 0;
  return {
    credits: Math.round(450 * Math.pow(1.45, count)),
    rp: Math.round(25 * Math.pow(1.35, count)),
  };
}

export function getEmployeePromotionCost(
  employee: Employee
): { nextRarity: EmployeeRarity; credits: number; influence: number } | null {
  if (employee.rarity === 'Gewöhnlich') {
    return { nextRarity: 'Selten', credits: 1500, influence: 2 };
  }
  if (employee.rarity === 'Selten') {
    return { nextRarity: 'Episch', credits: 8500, influence: 6 };
  }
  if (employee.rarity === 'Episch') {
    return { nextRarity: 'Legendär', credits: 42000, influence: 16 };
  }
  return null;
}

export function getRepeatableTechCost(
  id: RepeatableTechId,
  currentLevel: number
): { rp: number; credits: number } {
  const def = REPEATABLE_RESEARCH_CATALOG.find((r) => r.id === id) ?? REPEATABLE_RESEARCH_CATALOG[0];
  return {
    rp: Math.round(def.baseCostRP * Math.pow(def.costScale, currentLevel)),
    credits: Math.round(def.baseCostCredits * Math.pow(def.costScale, currentLevel)),
  };
}

export function getProductReleaseCost(
  productId: ProductId,
  currentVersion: number
): { credits: number; rp: number } {
  const def = PRODUCT_CATALOG[productId];
  return {
    credits: Math.round(def.unlockCredits * 2.2 * Math.pow(2.05, currentVersion - 1)),
    rp: Math.round(Math.max(40, def.unlockRP * 1.4) * Math.pow(1.8, currentVersion - 1)),
  };
}

export function getShareBuybackCost(state: GameState): number {
  const count = state.shareBuybacks ?? 0;
  return Math.round(80000 * Math.pow(1.55, count));
}

export function getSecurityAuditCost(state: GameState): number {
  return Math.round(350 * Math.pow(1.24, Math.min(18, Math.max(0, state.buildings.office - 1))));
}

export function getEmployeeQuitRisk(
  employee: Employee,
  workload: WorkloadMode = 'standard',
  hasManager = false
): number {
  const loyRisk = Math.max(0, (68 - employee.loyalty) * 1.15);
  const motRisk = Math.max(0, (62 - employee.motivation) * 0.95);
  const modeRisk = workload === 'crunch' ? 18 : workload === 'worklife' ? -10 : 0;
  const managerMitigation = hasManager ? -10 : 0;
  return Math.max(0, Math.min(95, Math.round(loyRisk + motRisk + modeRisk + managerMitigation)));
}

export function getEmployeeFireSeverance(employee: Employee): number {
  return Math.max(50, Math.round(employee.salaryPerMin * 2));
}

export function getEmployeeRaiseCost(employee: Employee): number {
  return Math.max(120, Math.round(employee.salaryPerMin * 12));
}

export function getProductHotfixCost(state: GameState, productId: ProductId): number {
  const def = PRODUCT_CATALOG[productId];
  const level = state.products[productId]?.level ?? 1;
  return Math.max(180, Math.round(def.upgradeBaseCost * Math.pow(1.28, level - 1) * 0.35));
}

export function getMarketingCampaignCost(
  state: GameState,
  campaignId: MarketingCampaignId
): number {
  const def =
    MARKETING_CAMPAIGNS.find((c) => c.id === campaignId) ?? MARKETING_CAMPAIGNS[0];
  return Math.round(def.baseCostCredits * (1 + Math.max(0, state.buildings.office - 1) * 0.25));
}

export function getContractRerollCost(state: GameState): number {
  return Math.max(60, state.buildings.office * 80);
}

export function getMaxLoanLimit(state: GameState, metrics?: EconomyMetrics): number {
  const val = metrics ? metrics.valuation : computeEconomyMetrics(state).valuation;
  return Math.max(5000, Math.round(val * 0.35));
}

export function computeEconomyMetrics(state: GameState): EconomyMetrics {
  const officeLevel = state.buildings.office;
  const serverLevel = state.buildings.serverRoom;
  const labLevel = state.buildings.researchLab;
  const marketingLevel = state.buildings.marketingDept;
  const aiLevel = state.buildings.aiCenter;

  const hwTier = HARDWARE_TIERS[Math.min(HARDWARE_TIERS.length - 1, state.hardwareLevel - 1)];

  // Research flags
  const hasSSDs = state.unlockedResearch.includes('ssds');
  const hasCloud = state.unlockedResearch.includes('cloud_services');
  const hasAutomation = state.unlockedResearch.includes('automation');
  const hasAIAgents = state.unlockedResearch.includes('ai_agents');
  const hasDataCenters = state.unlockedResearch.includes('data_centers');
  const hasQuantum = state.unlockedResearch.includes('quantum_computing');
  const hasGlobal = state.unlockedResearch.includes('global_infra');
  const hasSuperAI = state.unlockedResearch.includes('super_ai');
  const hasFullAuto = state.unlockedResearch.includes('full_automation');

  // Repeatable Tier-5 research levels
  const repTech = state.repeatableResearch ?? createDefaultRepeatableResearch();
  const overclockLv = repTech.quantum_overclock ?? 0;
  const neuralLv = repTech.neural_compression ?? 0;
  const zeroDayLv = repTech.zero_day_immunity ?? 0;

  // Global Datacenter Regions
  const regions = state.globalRegions ?? createDefaultGlobalRegions();
  let globalRegionsCount = 0;
  let regionComputeBonus = 0;
  let regionCoolingBonus = 0;
  let regionRevPct = 0;
  let regionRpPct = 0;
  let regionInfluencePerSec = 0;
  let regionSecurityBonus = 0;

  (Object.keys(GLOBAL_REGIONS_CATALOG) as GlobalRegionId[]).forEach((rid) => {
    const rState = regions[rid];
    if (rState && rState.level > 0) {
      globalRegionsCount += 1;
      const def = GLOBAL_REGIONS_CATALOG[rid];
      const modeCfg = REGION_MODES[rState.mode ?? 'balanced'];
      regionComputeBonus += def.computeBonusPerLevel * rState.level * modeCfg.computeMult;
      regionCoolingBonus += def.coolingBonusPerLevel * rState.level * modeCfg.coolMult;
      regionRevPct += def.revenueBonusPctPerLevel * rState.level * modeCfg.revMult;
      regionRpPct += def.rpBonusPctPerLevel * rState.level;
      regionInfluencePerSec += def.influencePerSecPerLevel * rState.level;
      regionSecurityBonus += rState.level * 2 + modeCfg.secBonus;
    }
  });

  // Acquired rival company perks
  const acquiredSet = new Set(state.acquiredRivals ?? []);
  let rivalRevPct = 0;
  let rivalRpPct = 0;
  let rivalSecurityBonus = 0;
  let unacquiredRivalVal = 0;
  for (const rival of RIVAL_COMPANIES) {
    if (acquiredSet.has(rival.id)) {
      rivalRevPct += rival.revBonusPct;
      rivalRpPct += rival.rpBonusPct;
      rivalSecurityBonus += rival.securityBonus;
    } else {
      unacquiredRivalVal += rival.valuation;
    }
  }

  // Team Directive & Workload Mode
  const directive = TEAM_DIRECTIVES[state.teamDirective ?? 'balanced'];
  const workloadMode = state.workloadMode ?? 'standard';
  const workloadCfg = WORKLOAD_MODES[workloadMode];

  // Employee capacity scales with Office level (2 in Garage lv1, +2 per level)
  const employeeCapacity = 2 + (officeLevel - 1) * 2;

  // Event multipliers
  let evtRevMult = 1;
  let evtRpMult = 1;
  let evtPowerPenalty = 0;
  let evtProdMult = 1;
  for (const evt of state.activeEvents) {
    evtRevMult *= evt.revenueMultiplier;
    evtRpMult *= evt.researchMultiplier;
    evtPowerPenalty += evt.powerPenalty;
    evtProdMult *= evt.productivityMultiplier;
  }

  // Employee role contributions
  let devPower = 0;
  let sysadminPower = 0;
  let sysadminCount = 0;
  let researcherPower = 0;
  let managerBonus = 0;
  let salaryPerMin = 0;
  const hasManager = state.employees.some((e) => e.role === 'Manager');
  let quitRiskSum = 0;

  for (const emp of state.employees) {
    const rarityMult = RARITY_CONFIG[emp.rarity].multiplier;
    const motFactor = 0.55 + (emp.motivation / 100) * 0.65;
    const expFactor = 0.75 + (emp.experience / 100) * 0.55;
    const trainFactor = 1 + (emp.trainingCount ?? 0) * 0.08;
    const effective = rarityMult * motFactor * expFactor * trainFactor;

    salaryPerMin += emp.salaryPerMin;
    quitRiskSum += getEmployeeQuitRisk(emp, workloadMode, hasManager);
    if (emp.role === 'Entwickler') {
      devPower += 18 * effective;
    } else if (emp.role === 'Sysadmin') {
      sysadminPower += 16 * effective;
      sysadminCount += 1;
    } else if (emp.role === 'Forscher') {
      researcherPower += (0.8 + (emp.intelligence / 100) * 1.4) * effective;
    } else if (emp.role === 'Manager') {
      managerBonus += 0.08 * effective;
    }
  }
  const avgQuitRiskPercent =
    state.employees.length > 0 ? Math.round(quitRiskSum / state.employees.length) : 0;

  // Power & Cooling balance
  const dcMult = hasDataCenters ? 1.35 : 1.0;
  const sysadminSupply = sysadminPower * 1.5;
  const powerProduced = Math.max(
    10,
    Math.round(
      (hwTier.powerSupply + serverLevel * 12 + sysadminSupply + regionCoolingBonus * 0.35) *
        dcMult -
        evtPowerPenalty
    )
  );
  const coolingProduced = Math.max(
    10,
    Math.round(
      (hwTier.coolingSupply + serverLevel * 10 + sysadminSupply + regionCoolingBonus) * dcMult
    )
  );

  const powerUsed =
    officeLevel * BUILDING_CATALOG.office.basePowerCost +
    serverLevel * BUILDING_CATALOG.serverRoom.basePowerCost +
    labLevel * BUILDING_CATALOG.researchLab.basePowerCost +
    marketingLevel * BUILDING_CATALOG.marketingDept.basePowerCost +
    aiLevel * BUILDING_CATALOG.aiCenter.basePowerCost;

  const coolingUsed =
    officeLevel * BUILDING_CATALOG.office.baseCoolingCost +
    serverLevel * BUILDING_CATALOG.serverRoom.baseCoolingCost +
    labLevel * BUILDING_CATALOG.researchLab.baseCoolingCost +
    marketingLevel * BUILDING_CATALOG.marketingDept.baseCoolingCost +
    aiLevel * BUILDING_CATALOG.aiCenter.baseCoolingCost;

  const powerRatio = powerUsed > 0 ? Math.min(1, powerProduced / powerUsed) : 1;
  const coolingRatio = coolingUsed > 0 ? Math.min(1, coolingProduced / coolingUsed) : 1;
  const powerEfficiency = Math.max(0.35, Math.min(powerRatio, coolingRatio));

  // Compute power
  const rawCompute =
    ((hwTier.level - 1) * 10 +
      serverLevel * 28 * (1 + sysadminPower * 0.015) * (hasDataCenters ? 1.45 : 1) +
      regionComputeBonus) *
    (1 + overclockLv * 0.12);
  const computePower = Math.round(rawCompute * powerEfficiency);

  // Productivity multiplier
  const allianceBonus = state.alliance.joined ? 1 + state.alliance.sharedBonusPercent / 100 : 1;
  const productivityMultiplier =
    (1 + (officeLevel - 1) * 0.08 + managerBonus) *
    powerEfficiency *
    evtProdMult *
    allianceBonus;

  // Work speed (for contracts)
  const ssdBonus = hasSSDs ? 1.25 : 1.0;
  const autoBonus = hasAutomation ? 1.25 : 1.0;
  const aiWorkBonus = 1 + aiLevel * 0.18;
  const workSpeedPerSec =
    (hwTier.passiveWorkBonus + devPower) *
    productivityMultiplier *
    ssdBonus *
    autoBonus *
    aiWorkBonus *
    directive.workMult *
    workloadCfg.speedMult *
    (1 + neuralLv * 0.1);

  // Security Rating & Firewall state
  const secState = state.security ?? createDefaultSecurityState();
  const firewallBonus = (secState.firewallIntegrity - 50) * 0.25;
  const securityRating = Math.round(
    Math.max(
      5,
      Math.min(
        100,
        20 +
          sysadminCount * 6 +
          aiLevel * 4 +
          (hasDataCenters ? 8 : 0) +
          (hasFullAuto ? 10 : 0) +
          regionSecurityBonus +
          directive.securityBonus +
          rivalSecurityBonus +
          zeroDayLv * 8 +
          firewallBonus
      )
    )
  );
  const incidentPenaltyMult = secState.activeIncident
    ? secState.activeIncident.revenuePenaltyMult
    : 1.0;

  // Reputation
  const reputation = Math.round(
    10 +
      marketingLevel * 24 +
      state.completedContractsCount * 4 +
      state.influence * 2 +
      acquiredSet.size * 65
  );

  // Research points/sec
  const rpResearchMult =
    (hasAIAgents ? 1.3 : 1.0) *
    (hasQuantum ? 1.6 : 1.0) *
    (hasSuperAI ? 1.5 : 1.0) *
    (1 + regionRpPct / 100) *
    (1 + rivalRpPct / 100) *
    (1 + neuralLv * 0.18) *
    directive.rpMult *
    workloadCfg.rpMult;
  const rpPerSec =
    (0.25 + labLevel * 1.4 + researcherPower + aiLevel * 2.4) *
    rpResearchMult *
    evtRpMult *
    powerEfficiency;

  // Marketing campaign boost
  const campaignRevMult =
    (state.marketingBoostSeconds ?? 0) > 0 ? (state.marketingBoostMult ?? 1) : 1;

  // Products revenue & combined empire multipliers
  const revResearchMult =
    (hasCloud ? 1.2 : 1.0) *
    (hasSuperAI ? 1.8 : 1.0) *
    (hasQuantum ? 1.15 : 1.0) *
    (1 + regionRevPct / 100) *
    (1 + rivalRevPct / 100) *
    (1 + overclockLv * 0.15) *
    directive.revMult;
  const marketingRevMult = (1 + marketingLevel * 0.09) * campaignRevMult;
  let productRevenuePerSec = 0;
  (Object.keys(state.products) as ProductId[]).forEach((pid) => {
    const p = state.products[pid];
    if (p.unlocked) {
      const def = PRODUCT_CATALOG[pid];
      const subMult = hasGlobal ? 1.5 : 1.0;
      const stanceMult = PRODUCT_STANCES[p.stance ?? 'balanced'].revMult;
      const releaseMult = 1 + ((p.releaseVersion ?? 1) - 1) * 0.35;
      const stab = p.stability ?? 100;
      const stabFactor = stab >= 70 ? 1.0 : Math.max(0.35, 0.35 + (stab / 70) * 0.65);
      productRevenuePerSec +=
        def.baseRevenuePerSec *
        Math.pow(1.42, p.level - 1) *
        subMult *
        stanceMult *
        releaseMult *
        stabFactor *
        marketingRevMult *
        revResearchMult *
        powerEfficiency;
    }
  });

  // Base passive income from Hardware/Office/AI so player never stalls
  const baseServiceCreditsPerSec =
    (4 + (hwTier.level - 1) * 7 + officeLevel * 4 + marketingLevel * 9 + aiLevel * 95) *
    revResearchMult *
    (1 + (campaignRevMult - 1) * 0.5) *
    evtRevMult;

  const creditsPerSec =
    (baseServiceCreditsPerSec + productRevenuePerSec * evtRevMult) * incidentPenaltyMult;
  const salaryPerSec = salaryPerMin / 60;
  const loanBalance = state.loanBalance ?? 0;
  const loanInterestPerSec = loanBalance > 0 ? Math.max(1, Math.round(loanBalance * 0.012)) : 0;
  const netCreditsPerSec = creditsPerSec - salaryPerSec - loanInterestPerSec;

  const influencePerSec =
    (aiLevel * 0.08 + (hasGlobal ? 0.05 : 0) + regionInfluencePerSec + zeroDayLv * 0.15) *
    (state.alliance.joined ? 1.1 : 1.0);

  const automationLevel = Math.min(
    1,
    (hasAutomation ? 0.25 : 0) +
      (hasAIAgents ? 0.2 : 0) +
      Math.min(0.35, aiLevel * 0.05) +
      (hasFullAuto ? 0.2 : 0)
  );

  // Company Valuation
  const buybackCount = state.shareBuybacks ?? 0;
  const valuation = Math.round(
    (state.totalCreditsEarned * 1.8 +
      officeLevel * 1500 +
      serverLevel * 2400 +
      labLevel * 2200 +
      marketingLevel * 2600 +
      aiLevel * 45000 +
      state.unlockedResearch.length * 8500 +
      globalRegionsCount * 85000 +
      acquiredSet.size * 350000 +
      creditsPerSec * 120) *
      (1 + buybackCount * 0.08)
  );

  const rawShare =
    unacquiredRivalVal > 0
      ? (valuation / (valuation + unacquiredRivalVal)) * 75
      : 75;
  const marketSharePercent =
    Math.round(
      Math.min(
        99.9,
        Math.max(0.2, rawShare + buybackCount * 2.2 + globalRegionsCount * 1.6 + acquiredSet.size * 5)
      ) * 10
    ) / 10;

  const sharePrice =
    Math.round(
      Math.max(
        1,
        (valuation / 12000) *
          (1 + buybackCount * 0.14) *
          (state.ipoCompleted ? 1.35 : 0.65)
      ) * 100
    ) / 100;

  // Determine Phase (Frühspiel / Midgame / Endgame)
  let phase: EconomyMetrics['phase'] = 'Frühspiel';
  if (aiLevel >= 1 || state.unlockedResearch.includes('quantum_computing') || valuation >= 500000) {
    phase = 'Endgame';
  } else if (officeLevel >= 3 || serverLevel >= 1 || labLevel >= 1) {
    phase = 'Midgame';
  }

  return {
    phase,
    employeeCapacity,
    employeeCount: state.employees.length,
    powerProduced,
    powerUsed,
    coolingProduced,
    coolingUsed,
    powerEfficiency,
    computePower,
    reputation,
    productivityMultiplier,
    creditsPerSec,
    salaryPerSec,
    netCreditsPerSec,
    rpPerSec,
    influencePerSec,
    workSpeedPerSec,
    valuation,
    automationLevel,
    securityRating,
    marketSharePercent,
    sharePrice,
    globalRegionsCount,
    loanInterestPerSec,
    avgQuitRiskPercent,
  };
}

export function tickSimulation(
  state: GameState,
  rawDtSeconds: number,
  nowMs = Date.now()
): {
  state: GameState;
  completedContracts: Contract[];
  triggeredEvent: ActiveEvent | null;
  quitEmployeeName: string | null;
} {
  const dt = Math.max(0, Math.min(rawDtSeconds, 2));
  if (dt <= 0) {
    return { state, completedContracts: [], triggeredEvent: null, quitEmployeeName: null };
  }

  const metrics = computeEconomyMetrics(state);
  const creditsDelta = Math.max(-state.credits, metrics.netCreditsPerSec * dt);
  const grossEarned = Math.max(0, metrics.creditsPerSec * dt);
  const rpDelta = metrics.rpPerSec * dt;
  const infDelta = metrics.influencePerSec * dt;

  const workloadMode = state.workloadMode ?? 'standard';
  const workloadCfg = WORKLOAD_MODES[workloadMode];

  // Update active contracts
  const completedContracts: Contract[] = [];
  const nextActiveContracts: Contract[] = [];
  const activeCount = Math.max(1, state.activeContracts.length);
  const workPerContract = (metrics.workSpeedPerSec * dt) / activeCount;

  let contractCredits = 0;
  let contractRP = 0;
  let contractInf = 0;

  for (const c of state.activeContracts) {
    const nextProgress = c.progress + workPerContract;
    if (nextProgress >= c.requiredWork) {
      completedContracts.push({ ...c, progress: c.requiredWork });
      const researchBonus = state.unlockedResearch.includes('quantum_computing') ? 1.4 : 1.0;
      contractCredits += Math.round(c.rewardCredits * researchBonus);
      contractRP += c.rewardRP;
      contractInf += c.rewardInfluence;
    } else {
      nextActiveContracts.push({ ...c, progress: nextProgress });
    }
  }

  // Keep contract board at 4 steady slots and auto-fill up to 2 active contracts when automated
  const seedBase = Math.floor(state.playTimeSeconds) + state.completedContractsCount + 7;
  let nextAvailable = topUpContractPool(
    state.availableContracts,
    state.buildings.office,
    metrics.computePower,
    seedBase
  );

  if (metrics.automationLevel >= 0.25) {
    let fillStep = 0;
    while (nextActiveContracts.length < 2 && nextAvailable.length > 0) {
      const [first, ...rest] = nextAvailable;
      nextActiveContracts.push(first);
      nextAvailable = topUpContractPool(
        rest,
        state.buildings.office,
        metrics.computePower,
        seedBase + fillStep + 1
      );
      fillStep += 1;
    }
  }

  // Update Products stability, subscribers & revenue display
  const nextProducts = { ...state.products };
  const hasGlobal = state.unlockedResearch.includes('global_infra');
  const devCount = state.employees.filter((e) => e.role === 'Entwickler').length;
  const sysadmins = state.employees.filter((e) => e.role === 'Sysadmin').length;
  const stabilityMitigation = sysadmins * 0.06 + devCount * 0.03;
  const netBugDrift = Math.max(-0.25, workloadCfg.bugDriftPerSec - stabilityMitigation);
  const campaignMult =
    (state.marketingBoostSeconds ?? 0) > 0 ? (state.marketingBoostMult ?? 1) : 1;

  (Object.keys(nextProducts) as ProductId[]).forEach((pid) => {
    const p = nextProducts[pid];
    if (p.unlocked) {
      const def = PRODUCT_CATALOG[pid];
      const stanceCfg = PRODUCT_STANCES[p.stance ?? 'balanced'];
      const releaseMult = 1 + ((p.releaseVersion ?? 1) - 1) * 0.35;
      const nextStab = Math.max(
        15,
        Math.min(100, Math.round(((p.stability ?? 100) - netBugDrift * dt) * 100) / 100)
      );
      const subStabMult = nextStab >= 70 ? 1.0 : Math.max(0.45, nextStab / 70);
      const revStabMult = nextStab >= 70 ? 1.0 : Math.max(0.35, 0.35 + (nextStab / 70) * 0.65);

      const targetSubs = Math.round(
        def.baseSubscribers *
          Math.pow(1.45, p.level - 1) *
          (1 + state.buildings.marketingDept * 0.12) *
          (hasGlobal ? 1.5 : 1.0) *
          stanceCfg.subMult *
          (1 + ((p.releaseVersion ?? 1) - 1) * 0.2) *
          campaignMult *
          subStabMult
      );
      const rev =
        def.baseRevenuePerSec *
        Math.pow(1.42, p.level - 1) *
        (1 + state.buildings.marketingDept * 0.09) *
        stanceCfg.revMult *
        releaseMult *
        campaignMult *
        revStabMult *
        metrics.powerEfficiency;
      nextProducts[pid] = {
        ...p,
        stability: nextStab,
        subscribers: targetSubs,
        revenuePerSec: Math.round(rev),
      };
    }
  });

  // Update active events & countdown
  const nextEvents = state.activeEvents
    .map((e) => ({ ...e, remainingSeconds: e.remainingSeconds - dt }))
    .filter((e) => e.remainingSeconds > 0);

  let nextEventIn = state.nextEventInSeconds - dt;
  let triggeredEvent: ActiveEvent | null = null;
  let extraEventCredits = 0;
  let extraEventInf = 0;
  let nextEventLog = state.eventLog;

  if (nextEventIn <= 0) {
    const idx = Math.floor(state.playTimeSeconds + state.completedContractsCount * 3) % EVENT_TEMPLATES.length;
    const tpl = EVENT_TEMPLATES[idx];
    triggeredEvent = { ...tpl, remainingSeconds: tpl.durationSeconds };
    nextEvents.push(triggeredEvent);
    extraEventCredits = tpl.instantCredits ?? 0;
    extraEventInf = tpl.instantInfluence ?? 0;
    nextEventLog = [
      {
        id: nextId('evlog'),
        title: tpl.title,
        sentiment: tpl.sentiment,
        timestamp: nowMs,
        summary: tpl.description,
      },
      ...nextEventLog,
    ].slice(0, 14);
    nextEventIn = 55;
  }

  // Cybersecurity Firewall & Incident simulation
  const prevSec = state.security ?? createDefaultSecurityState();
  let nextSec: SecurityState = { ...prevSec };
  const defenseActive = (state.teamDirective ?? 'balanced') === 'defense';
  let cyberBlockedBonusInf = 0;

  if (nextSec.activeIncident) {
    const rem = nextSec.activeIncident.remainingSeconds - dt;
    nextSec.firewallIntegrity = Math.max(
      15,
      nextSec.firewallIntegrity - nextSec.activeIncident.severity * 0.45 * dt
    );
    if (rem <= 0) {
      nextSec.firewallIntegrity = Math.max(15, nextSec.firewallIntegrity - 8);
      nextSec.activeIncident = null;
    } else {
      nextSec.activeIncident = { ...nextSec.activeIncident, remainingSeconds: rem };
    }
  } else {
    const regenRate = 0.25 + sysadmins * 0.12 + (defenseActive ? 0.3 : 0);
    nextSec.firewallIntegrity = Math.min(100, nextSec.firewallIntegrity + regenRate * dt);

    if (state.buildings.office >= 3 || metrics.valuation >= 15000) {
      nextSec.nextIncidentInSeconds -= dt;
      if (nextSec.nextIncidentInSeconds <= 0) {
        if (nextSec.autoSocEnabled) {
          nextSec.incidentsBlockedCount += 1;
          cyberBlockedBonusInf = 1.5;
          nextSec.nextIncidentInSeconds = 52 + Math.round(metrics.securityRating * 0.35);
        } else {
          const tplIdx =
            (Math.floor(state.playTimeSeconds) + nextSec.incidentsBlockedCount) %
            CYBER_INCIDENT_TEMPLATES.length;
          const tpl = CYBER_INCIDENT_TEMPLATES[tplIdx];
          const incident: CyberIncident = {
            id: nextId('sec'),
            title: tpl.title,
            targetLabel: tpl.targetLabel,
            description: tpl.description,
            severity: tpl.severity,
            remainingSeconds: 26 + tpl.severity * 4,
            revenuePenaltyMult: tpl.revenuePenaltyMult,
            patchCostCredits: Math.max(300, Math.round(metrics.creditsPerSec * 12)),
            counterMinCompute: Math.max(20, Math.round(metrics.computePower * 0.72)),
          };
          nextSec.activeIncident = incident;
          nextSec.nextIncidentInSeconds = 55 + Math.round(metrics.securityRating * 0.35);
        }
      }
    }
  }

  // Employee motivation, loyalty & resignation alert mechanics
  const hasManager = state.employees.some((e) => e.role === 'Manager');
  const motDrift = (workloadCfg.motDeltaPerSec + (hasManager ? 0.35 : -0.05)) * dt;
  const loyDrift = (workloadCfg.loyDeltaPerSec + (hasManager ? 0.08 : -0.02)) * dt;
  let nextEmployees = state.employees.map((e) => ({
    ...e,
    motivation: Math.max(5, Math.min(100, e.motivation + motDrift)),
    loyalty: Math.max(5, Math.min(100, e.loyalty + loyDrift)),
    experience: Math.min(100, e.experience + 0.04 * dt),
  }));

  let nextStaffAlert: StaffQuitAlert | null = state.staffAlert ?? null;
  let nextQuitCount = state.quitCount ?? 0;
  let quitEmployeeName: string | null = null;

  if (nextStaffAlert) {
    const targetExists = nextEmployees.some((e) => e.id === nextStaffAlert!.employeeId);
    if (!targetExists) {
      nextStaffAlert = null;
    } else {
      const remAlert = nextStaffAlert.remainingSeconds - dt;
      if (remAlert <= 0) {
        quitEmployeeName = nextStaffAlert.employeeName;
        nextEmployees = nextEmployees.filter((e) => e.id !== nextStaffAlert!.employeeId);
        nextQuitCount += 1;
        nextEventLog = [
          {
            id: nextId('evlog'),
            title: `Kündigung: ${quitEmployeeName}`,
            sentiment: 'negative' as const,
            timestamp: nowMs,
            summary: `${quitEmployeeName} (${nextStaffAlert.role}) hat das Unternehmen verlassen.`,
          },
          ...nextEventLog,
        ].slice(0, 14);
        nextStaffAlert = null;
      } else {
        nextStaffAlert = { ...nextStaffAlert, remainingSeconds: remAlert };
      }
    }
  } else if (nextEmployees.length > 0) {
    const atRisk = [...nextEmployees]
      .sort(
        (a, b) =>
          getEmployeeQuitRisk(b, workloadMode, hasManager) -
          getEmployeeQuitRisk(a, workloadMode, hasManager)
      )
      .find((e) => getEmployeeQuitRisk(e, workloadMode, hasManager) >= 42);

    if (atRisk) {
      const reason =
        workloadMode === 'crunch'
          ? 'Überlastung durch Crunch-Mode & besseres Headhunter-Angebot'
          : atRisk.loyalty < 45
            ? 'Geringe Loyalität – verlangt Gehaltsanpassung'
            : 'Niedrige Motivation – droht mit Wechsel zur Konkurrenz';
      nextStaffAlert = {
        id: nextId('quit'),
        employeeId: atRisk.id,
        employeeName: atRisk.name,
        role: atRisk.role,
        reason,
        remainingSeconds: 22,
        raiseCostCredits: getEmployeeRaiseCost(atRisk),
        salaryIncreasePerMin: Math.max(4, Math.round(atRisk.salaryPerMin * 0.15)),
      };
    }
  }

  // Management Dilemma simulation
  let nextDilemma: ManagementDilemma | null = state.activeDilemma ?? null;
  let nextDilemmaIn = state.nextDilemmaInSeconds ?? 38;
  if (nextDilemma) {
    const remDil = nextDilemma.remainingSeconds - dt;
    if (remDil <= 0) {
      nextDilemma = null;
      nextDilemmaIn = 46;
    } else {
      nextDilemma = { ...nextDilemma, remainingSeconds: remDil };
    }
  } else if (state.buildings.office >= 2 || nextEmployees.length >= 1) {
    nextDilemmaIn -= dt;
    if (nextDilemmaIn <= 0) {
      const tplIdx =
        (Math.floor(state.playTimeSeconds) + state.completedContractsCount) %
        MANAGEMENT_DILEMMAS.length;
      const tpl = MANAGEMENT_DILEMMAS[tplIdx];
      const baseScale = Math.max(450, metrics.creditsPerSec * 12);
      nextDilemma = {
        id: nextId('dil'),
        title: tpl.title,
        description: tpl.description,
        remainingSeconds: 32,
        choices: tpl.choices.map((ch) => ({
          id: ch.id,
          label: ch.label,
          effectHint: ch.effectHint,
          creditsDelta: Math.round(ch.creditsScale * baseScale),
          rpDelta: ch.rpDelta,
          influenceDelta: ch.influenceDelta,
          loyaltyDelta: ch.loyaltyDelta,
          motivationDelta: ch.motivationDelta,
          firewallDelta: ch.firewallDelta,
        })),
      };
      nextDilemmaIn = 52;
    }
  }

  // Marketing Campaign countdown
  const nextMarketingSeconds = Math.max(0, (state.marketingBoostSeconds ?? 0) - dt);
  const nextMarketingMult = nextMarketingSeconds > 0 ? (state.marketingBoostMult ?? 1) : 1;

  const nextState: GameState = {
    ...state,
    credits: Math.max(0, state.credits + creditsDelta + contractCredits + extraEventCredits),
    totalCreditsEarned:
      state.totalCreditsEarned + grossEarned + contractCredits + extraEventCredits,
    researchPoints: state.researchPoints + rpDelta + contractRP,
    influence: state.influence + infDelta + contractInf + extraEventInf + cyberBlockedBonusInf,
    employees: nextEmployees,
    activeContracts: nextActiveContracts,
    availableContracts: nextAvailable,
    completedContractsCount: state.completedContractsCount + completedContracts.length,
    products: nextProducts,
    activeEvents: nextEvents,
    eventLog: nextEventLog,
    nextEventInSeconds: nextEventIn,
    security: nextSec,
    staffAlert: nextStaffAlert,
    quitCount: nextQuitCount,
    activeDilemma: nextDilemma,
    nextDilemmaInSeconds: nextDilemmaIn,
    marketingBoostSeconds: nextMarketingSeconds,
    marketingBoostMult: nextMarketingMult,
    seasonXp: state.seasonXp + completedContracts.length * 40 + dt * 0.5,
    playTimeSeconds: state.playTimeSeconds + dt,
  };

  return { state: nextState, completedContracts, triggeredEvent, quitEmployeeName };
}

export function performManualWorkBoost(state: GameState): GameState {
  const hwTier = HARDWARE_TIERS[Math.min(HARDWARE_TIERS.length - 1, state.hardwareLevel - 1)];
  const boost = hwTier.clickPower;

  if (state.activeContracts.length > 0) {
    const [first, ...rest] = state.activeContracts;
    const nextProgress = first.progress + boost;
    if (nextProgress >= first.requiredWork) {
      const researchBonus = state.unlockedResearch.includes('quantum_computing') ? 1.4 : 1.0;
      const earnedCredits = Math.round(first.rewardCredits * researchBonus);
      const metrics = computeEconomyMetrics(state);
      const freshPool = topUpContractPool(
        state.availableContracts,
        state.buildings.office,
        metrics.computePower,
        state.completedContractsCount + 3
      );
      return {
        ...state,
        credits: state.credits + earnedCredits,
        totalCreditsEarned: state.totalCreditsEarned + earnedCredits,
        researchPoints: state.researchPoints + first.rewardRP,
        influence: state.influence + first.rewardInfluence,
        activeContracts: rest,
        availableContracts: freshPool,
        completedContractsCount: state.completedContractsCount + 1,
        seasonXp: state.seasonXp + 40,
      };
    }
    return {
      ...state,
      activeContracts: [{ ...first, progress: nextProgress }, ...rest],
      credits: state.credits + Math.round(boost * 0.4),
      totalCreditsEarned: state.totalCreditsEarned + Math.round(boost * 0.4),
    };
  }

  // No active contract: freelance micro-script income
  const microCredits = Math.round(boost * 0.85);
  return {
    ...state,
    credits: state.credits + microCredits,
    totalCreditsEarned: state.totalCreditsEarned + microCredits,
    researchPoints: state.researchPoints + 0.5,
  };
}

export function upgradeHardware(state: GameState): { state: GameState; error?: string } {
  if (state.hardwareLevel >= HARDWARE_TIERS.length) {
    return { state, error: 'Maximale Hardware-Stufe erreicht.' };
  }
  const nextTier = HARDWARE_TIERS[state.hardwareLevel];
  if (state.credits < nextTier.costCredits) {
    return { state, error: `Benötigt ${nextTier.costCredits} Credits.` };
  }
  return {
    state: {
      ...state,
      credits: state.credits - nextTier.costCredits,
      hardwareLevel: state.hardwareLevel + 1,
    },
  };
}

export function upgradeBuilding(
  state: GameState,
  id: BuildingId
): { state: GameState; error?: string } {
  const check = canBuildOrUpgradeBuilding(state, id);
  if (!check.ok) {
    return { state, error: check.reason };
  }
  return {
    state: {
      ...state,
      credits: state.credits - check.cost,
      buildings: {
        ...state.buildings,
        [id]: state.buildings[id] + 1,
      },
    },
  };
}

export function upgradeGlobalRegion(
  state: GameState,
  id: GlobalRegionId
): { state: GameState; error?: string } {
  const check = canUpgradeGlobalRegion(state, id);
  if (!check.ok) {
    return { state, error: check.reason };
  }
  const currentRegions = state.globalRegions ?? createDefaultGlobalRegions();
  const prevRegion = currentRegions[id] ?? { id, level: 0, mode: 'balanced' };
  return {
    state: {
      ...state,
      credits: state.credits - check.credits,
      influence: state.influence - check.influence,
      globalRegions: {
        ...currentRegions,
        [id]: {
          ...prevRegion,
          level: prevRegion.level + 1,
        },
      },
      seasonXp: state.seasonXp + 90,
    },
  };
}

export function setRegionMode(
  state: GameState,
  id: GlobalRegionId,
  mode: RegionMode
): { state: GameState; error?: string } {
  const currentRegions = state.globalRegions ?? createDefaultGlobalRegions();
  const target = currentRegions[id];
  if (!target || target.level < 1) {
    return { state, error: 'Region muss zuerst errichtet werden.' };
  }
  return {
    state: {
      ...state,
      globalRegions: {
        ...currentRegions,
        [id]: {
          ...target,
          mode,
        },
      },
    },
  };
}

export function setTeamDirective(state: GameState, directive: TeamDirective): GameState {
  return {
    ...state,
    teamDirective: directive,
  };
}

export function hireCandidate(
  state: GameState,
  candidateId: string
): { state: GameState; error?: string } {
  const metrics = computeEconomyMetrics(state);
  if (state.employees.length >= metrics.employeeCapacity) {
    return { state, error: 'Bürokapazität erschöpft. Baue das Büro aus.' };
  }
  const candidate = state.candidates.find((c) => c.id === candidateId);
  if (!candidate) {
    return { state, error: 'Kandidat nicht gefunden.' };
  }
  const cost = getCandidateHireCost(candidate);
  if (state.credits < cost) {
    return { state, error: `Benötigt ${cost} Credits.` };
  }

  const remaining = state.candidates.filter((c) => c.id !== candidateId);
  const replacement = generateCandidate(
    Math.floor(state.playTimeSeconds) + state.employees.length * 13 + 7,
    state.buildings.office
  );

  return {
    state: {
      ...state,
      credits: state.credits - cost,
      employees: [...state.employees, candidate],
      candidates: [...remaining, replacement],
    },
  };
}

export function refreshCandidates(state: GameState): { state: GameState; error?: string } {
  const cost = 75;
  if (state.credits < cost) {
    return { state, error: 'Recruiting-Suche kostet 75 Credits.' };
  }
  const baseSeed = Math.floor(state.playTimeSeconds * 3) + state.employees.length * 17 + 9;
  const fresh = [
    generateCandidate(baseSeed + 1, state.buildings.office),
    generateCandidate(baseSeed + 2, state.buildings.office),
    generateCandidate(baseSeed + 3, state.buildings.office),
    generateCandidate(baseSeed + 4, state.buildings.office),
  ];
  return {
    state: {
      ...state,
      credits: state.credits - cost,
      candidates: fresh,
    },
  };
}

export function boostEmployeeMotivation(
  state: GameState,
  employeeId: string
): { state: GameState; error?: string } {
  const cost = 90;
  if (state.credits < cost) {
    return { state, error: 'Teambuilding kostet 90 Credits.' };
  }
  return {
    state: {
      ...state,
      credits: state.credits - cost,
      employees: state.employees.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              motivation: Math.min(100, e.motivation + 25),
              loyalty: Math.min(100, e.loyalty + 6),
            }
          : e
      ),
    },
  };
}

export function trainEmployee(
  state: GameState,
  employeeId: string
): { state: GameState; error?: string } {
  const target = state.employees.find((e) => e.id === employeeId);
  if (!target) {
    return { state, error: 'Mitarbeiter nicht gefunden.' };
  }
  const currentTrainings = target.trainingCount ?? 0;
  if (currentTrainings >= 10) {
    return { state, error: 'Maximales Trainings-Level (10) erreicht.' };
  }
  const cost = getEmployeeTrainingCost(target);
  if (state.credits < cost.credits || state.researchPoints < cost.rp) {
    return { state, error: `Benötigt ${cost.credits} Cr & ${cost.rp} FP.` };
  }
  return {
    state: {
      ...state,
      credits: state.credits - cost.credits,
      researchPoints: state.researchPoints - cost.rp,
      employees: state.employees.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              trainingCount: currentTrainings + 1,
              intelligence: Math.min(100, e.intelligence + 4),
              experience: Math.min(100, e.experience + 6),
              motivation: Math.min(100, e.motivation + 5),
            }
          : e
      ),
    },
  };
}

export function promoteEmployee(
  state: GameState,
  employeeId: string
): { state: GameState; error?: string } {
  const target = state.employees.find((e) => e.id === employeeId);
  if (!target) {
    return { state, error: 'Mitarbeiter nicht gefunden.' };
  }
  const promo = getEmployeePromotionCost(target);
  if (!promo) {
    return { state, error: 'Bereits Legendär-Status erreicht.' };
  }
  if (state.credits < promo.credits || state.influence < promo.influence) {
    return { state, error: `Benötigt ${promo.credits} Cr & ${promo.influence} Einfluss.` };
  }
  const nextSalary = Math.round(
    ROLE_INFO[target.role].baseSalaryPerMin * RARITY_CONFIG[promo.nextRarity].multiplier
  );
  return {
    state: {
      ...state,
      credits: state.credits - promo.credits,
      influence: state.influence - promo.influence,
      employees: state.employees.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              rarity: promo.nextRarity,
              salaryPerMin: nextSalary,
              intelligence: Math.min(100, e.intelligence + 8),
              loyalty: Math.min(100, e.loyalty + 8),
              experience: Math.min(100, e.experience + 8),
            }
          : e
      ),
    },
  };
}

export function setWorkloadMode(state: GameState, mode: WorkloadMode): GameState {
  return {
    ...state,
    workloadMode: mode,
  };
}

export function fireEmployee(
  state: GameState,
  employeeId: string
): { state: GameState; error?: string } {
  const target = state.employees.find((e) => e.id === employeeId);
  if (!target) {
    return { state, error: 'Mitarbeiter nicht gefunden.' };
  }
  const severance = Math.min(state.credits, getEmployeeFireSeverance(target));
  const nextAlert =
    state.staffAlert?.employeeId === employeeId ? null : (state.staffAlert ?? null);

  return {
    state: {
      ...state,
      credits: Math.max(0, state.credits - severance),
      employees: state.employees.filter((e) => e.id !== employeeId),
      staffAlert: nextAlert,
      eventLog: [
        {
          id: nextId('evlog'),
          title: `Entlassung: ${target.name}`,
          sentiment: 'neutral' as const,
          timestamp: Date.now(),
          summary: `${target.name} (${target.role}) wurde mit ${severance} Cr Abfindung freigestellt.`,
        },
        ...state.eventLog,
      ].slice(0, 14),
    },
  };
}

export function raiseEmployeeSalary(
  state: GameState,
  employeeId: string
): { state: GameState; error?: string } {
  const target = state.employees.find((e) => e.id === employeeId);
  if (!target) {
    return { state, error: 'Mitarbeiter nicht gefunden.' };
  }
  const cost = getEmployeeRaiseCost(target);
  if (state.credits < cost) {
    return { state, error: `Gehaltsbonus benötigt ${cost.toLocaleString('de-DE')} Cr.` };
  }
  const salInc = Math.max(4, Math.round(target.salaryPerMin * 0.15));
  const clearAlert = state.staffAlert?.employeeId === employeeId ? null : (state.staffAlert ?? null);

  return {
    state: {
      ...state,
      credits: state.credits - cost,
      staffAlert: clearAlert,
      employees: state.employees.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              salaryPerMin: e.salaryPerMin + salInc,
              loyalty: Math.min(100, e.loyalty + 20),
              motivation: Math.min(100, e.motivation + 18),
            }
          : e
      ),
    },
  };
}

export function resolveStaffAlert(
  state: GameState,
  keep: boolean
): { state: GameState; error?: string } {
  const alert = state.staffAlert;
  if (!alert) {
    return { state, error: 'Keine aktive Kündigungsmeldung vorhanden.' };
  }
  if (keep) {
    if (state.credits < alert.raiseCostCredits) {
      return {
        state,
        error: `Gegenangebot benötigt ${alert.raiseCostCredits.toLocaleString('de-DE')} Cr.`,
      };
    }
    return {
      state: {
        ...state,
        credits: state.credits - alert.raiseCostCredits,
        staffAlert: null,
        employees: state.employees.map((e) =>
          e.id === alert.employeeId
            ? {
                ...e,
                salaryPerMin: e.salaryPerMin + alert.salaryIncreasePerMin,
                loyalty: Math.min(100, e.loyalty + 26),
                motivation: Math.min(100, e.motivation + 22),
              }
            : e
        ),
        eventLog: [
          {
            id: nextId('evlog'),
            title: `Gehaltserhöhung: ${alert.employeeName}`,
            sentiment: 'positive' as const,
            timestamp: Date.now(),
            summary: `${alert.employeeName} bleibt nach Gegenangebot im Team.`,
          },
          ...state.eventLog,
        ].slice(0, 14),
      },
    };
  }

  return {
    state: {
      ...state,
      staffAlert: null,
      employees: state.employees.filter((e) => e.id !== alert.employeeId),
      quitCount: (state.quitCount ?? 0) + 1,
      eventLog: [
        {
          id: nextId('evlog'),
          title: `Abgang: ${alert.employeeName}`,
          sentiment: 'negative' as const,
          timestamp: Date.now(),
          summary: `${alert.employeeName} (${alert.role}) hat das Unternehmen verlassen.`,
        },
        ...state.eventLog,
      ].slice(0, 14),
    },
  };
}

export function resolveDilemma(
  state: GameState,
  choiceId: string
): { state: GameState; error?: string } {
  const dilemma = state.activeDilemma;
  if (!dilemma) {
    return { state, error: 'Kein aktives Management-Dilemma vorhanden.' };
  }
  const choice = dilemma.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return { state, error: 'Ungültige Entscheidung.' };
  }
  if (choice.creditsDelta < 0 && state.credits < Math.abs(choice.creditsDelta)) {
    return {
      state,
      error: `Benötigt ${Math.abs(choice.creditsDelta).toLocaleString('de-DE')} Credits.`,
    };
  }

  const prevSec = state.security ?? createDefaultSecurityState();
  const nextEmployees = state.employees.map((e) => ({
    ...e,
    loyalty: Math.max(5, Math.min(100, e.loyalty + choice.loyaltyDelta)),
    motivation: Math.max(5, Math.min(100, e.motivation + choice.motivationDelta)),
  }));

  return {
    state: {
      ...state,
      credits: Math.max(0, state.credits + choice.creditsDelta),
      totalCreditsEarned:
        state.totalCreditsEarned + Math.max(0, choice.creditsDelta),
      researchPoints: Math.max(0, state.researchPoints + choice.rpDelta),
      influence: Math.max(0, state.influence + choice.influenceDelta),
      employees: nextEmployees,
      security: {
        ...prevSec,
        firewallIntegrity: Math.max(
          10,
          Math.min(100, prevSec.firewallIntegrity + choice.firewallDelta)
        ),
      },
      activeDilemma: null,
      seasonXp: state.seasonXp + 45,
      eventLog: [
        {
          id: nextId('evlog'),
          title: dilemma.title,
          sentiment: choice.influenceDelta >= 0 ? ('positive' as const) : ('neutral' as const),
          timestamp: Date.now(),
          summary: `Entscheidung: ${choice.label}`,
        },
        ...state.eventLog,
      ].slice(0, 14),
    },
  };
}

export function unlockResearch(
  state: GameState,
  researchId: string
): { state: GameState; error?: string } {
  if (state.unlockedResearch.includes(researchId)) {
    return { state, error: 'Bereits erforscht.' };
  }
  const def = RESEARCH_CATALOG.find((r) => r.id === researchId);
  if (!def) {
    return { state, error: 'Unbekannte Technologie.' };
  }
  const missingPrereq = def.prerequisites.find((p) => !state.unlockedResearch.includes(p));
  if (missingPrereq) {
    return { state, error: 'Voraussetzungen fehlen noch.' };
  }
  if (state.researchPoints < def.costRP) {
    return { state, error: `Benötigt ${def.costRP} Forschungspunkte.` };
  }
  if (state.credits < def.costCredits) {
    return { state, error: `Benötigt ${def.costCredits} Credits.` };
  }
  return {
    state: {
      ...state,
      researchPoints: state.researchPoints - def.costRP,
      credits: state.credits - def.costCredits,
      unlockedResearch: [...state.unlockedResearch, researchId],
      seasonXp: state.seasonXp + 75,
    },
  };
}

export function unlockRepeatableTech(
  state: GameState,
  id: RepeatableTechId
): { state: GameState; error?: string } {
  if (!state.unlockedResearch.includes('super_ai')) {
    return { state, error: 'Erfordert Forschung: Super-KI (Stufe 4).' };
  }
  const currentMap = state.repeatableResearch ?? createDefaultRepeatableResearch();
  const level = currentMap[id] ?? 0;
  const cost = getRepeatableTechCost(id, level);
  if (state.researchPoints < cost.rp || state.credits < cost.credits) {
    return { state, error: `Benötigt ${cost.rp} FP & ${cost.credits} Cr.` };
  }
  return {
    state: {
      ...state,
      researchPoints: state.researchPoints - cost.rp,
      credits: state.credits - cost.credits,
      repeatableResearch: {
        ...currentMap,
        [id]: level + 1,
      },
      seasonXp: state.seasonXp + 150,
    },
  };
}

export function resolveCyberIncident(
  state: GameState,
  method: CyberIncidentResolution
): { state: GameState; error?: string } {
  const sec = state.security ?? createDefaultSecurityState();
  const incident = sec.activeIncident;
  if (!incident) {
    return { state, error: 'Keine aktive Bedrohung vorhanden.' };
  }

  if (method === 'patch') {
    if (state.credits < incident.patchCostCredits) {
      return { state, error: `Notfall-Patch benötigt ${incident.patchCostCredits} Cr.` };
    }
    return {
      state: {
        ...state,
        credits: state.credits - incident.patchCostCredits,
        security: {
          ...sec,
          firewallIntegrity: Math.min(100, sec.firewallIntegrity + 18),
          activeIncident: null,
          incidentsBlockedCount: sec.incidentsBlockedCount + 1,
        },
        seasonXp: state.seasonXp + 35,
      },
    };
  }

  // Counter-measure using raw TFLOPS compute power
  const metrics = computeEconomyMetrics(state);
  if (metrics.computePower < incident.counterMinCompute) {
    return {
      state,
      error: `Gegenangriff erfordert ${incident.counterMinCompute} TFLOPS Rechenleistung.`,
    };
  }
  return {
    state: {
      ...state,
      influence: state.influence + incident.severity * 4,
      researchPoints: state.researchPoints + incident.severity * 60,
      security: {
        ...sec,
        firewallIntegrity: Math.min(100, sec.firewallIntegrity + 12),
        activeIncident: null,
        incidentsBlockedCount: sec.incidentsBlockedCount + 1,
      },
      seasonXp: state.seasonXp + 55,
    },
  };
}

export function runSecurityAudit(state: GameState): { state: GameState; error?: string } {
  const sec = state.security ?? createDefaultSecurityState();
  const cost = getSecurityAuditCost(state);
  if (state.credits < cost) {
    return { state, error: `Security-Audit kostet ${cost} Cr.` };
  }
  return {
    state: {
      ...state,
      credits: state.credits - cost,
      security: {
        ...sec,
        firewallIntegrity: 100,
        nextIncidentInSeconds: Math.max(sec.nextIncidentInSeconds, 50),
        lastAuditAtSeconds: Math.round(state.playTimeSeconds),
      },
    },
  };
}

export function toggleAutoSoc(state: GameState): { state: GameState; error?: string } {
  if (!state.unlockedResearch.includes('full_automation') && state.buildings.aiCenter < 1) {
    return { state, error: 'Erfordert KI-Zentrum Lv 1 oder Vollautomatisierung.' };
  }
  const sec = state.security ?? createDefaultSecurityState();
  return {
    state: {
      ...state,
      security: {
        ...sec,
        autoSocEnabled: !sec.autoSocEnabled,
      },
    },
  };
}

export function acceptContract(
  state: GameState,
  contractId: string
): { state: GameState; error?: string } {
  if (state.activeContracts.length >= 3) {
    return { state, error: 'Maximal 3 aktive Aufträge gleichzeitig.' };
  }
  const target = state.availableContracts.find((c) => c.id === contractId);
  if (!target) {
    return { state, error: 'Auftrag nicht verfügbar.' };
  }
  const metrics = computeEconomyMetrics(state);
  const rest = state.availableContracts.filter((c) => c.id !== contractId);
  const nextPool = topUpContractPool(
    rest,
    state.buildings.office,
    metrics.computePower,
    Math.floor(state.playTimeSeconds) + state.completedContractsCount + 5
  );
  return {
    state: {
      ...state,
      activeContracts: [...state.activeContracts, target],
      availableContracts: nextPool,
    },
  };
}

export function cancelContract(
  state: GameState,
  contractId: string
): { state: GameState; error?: string } {
  const exists = state.activeContracts.some((c) => c.id === contractId);
  if (!exists) {
    return { state, error: 'Aktiver Auftrag nicht gefunden.' };
  }
  return {
    state: {
      ...state,
      activeContracts: state.activeContracts.filter((c) => c.id !== contractId),
    },
  };
}

export function rerollContracts(state: GameState): { state: GameState; error?: string } {
  const cost = getContractRerollCost(state);
  if (state.credits < cost) {
    return { state, error: `Börsen-Erneuerung kostet ${cost.toLocaleString('de-DE')} Cr.` };
  }
  const metrics = computeEconomyMetrics(state);
  const seed =
    Math.floor(state.playTimeSeconds * 3) + state.completedContractsCount * 5 + 11;
  return {
    state: {
      ...state,
      credits: state.credits - cost,
      availableContracts: generateContractPool(state.buildings.office, metrics.computePower, seed),
    },
  };
}

export function unlockOrUpgradeProduct(
  state: GameState,
  productId: ProductId
): { state: GameState; error?: string } {
  const def = PRODUCT_CATALOG[productId];
  const current = state.products[productId];

  if (!current.unlocked) {
    if (def.requiredResearch && !state.unlockedResearch.includes(def.requiredResearch)) {
      return { state, error: 'Benötigte Technologie noch nicht erforscht.' };
    }
    if (state.credits < def.unlockCredits || state.researchPoints < def.unlockRP) {
      return {
        state,
        error: `Benötigt ${def.unlockCredits} Credits & ${def.unlockRP} FP.`,
      };
    }
    return {
      state: {
        ...state,
        credits: state.credits - def.unlockCredits,
        researchPoints: state.researchPoints - def.unlockRP,
        products: {
          ...state.products,
          [productId]: {
            ...current,
            unlocked: true,
            level: 1,
            subscribers: def.baseSubscribers,
            revenuePerSec: def.baseRevenuePerSec,
            stance: current.stance ?? 'balanced',
            releaseVersion: current.releaseVersion ?? 1,
          },
        },
        seasonXp: state.seasonXp + 120,
      },
    };
  }

  const upgradeCost = Math.round(def.upgradeBaseCost * Math.pow(1.65, current.level - 1));
  if (state.credits < upgradeCost) {
    return { state, error: `Benötigt ${upgradeCost} Credits.` };
  }
  return {
    state: {
      ...state,
      credits: state.credits - upgradeCost,
      products: {
        ...state.products,
        [productId]: {
          ...current,
          level: current.level + 1,
        },
      },
    },
  };
}

export function setProductStance(
  state: GameState,
  productId: ProductId,
  stance: ProductPricingStance
): { state: GameState; error?: string } {
  const current = state.products[productId];
  if (!current || !current.unlocked) {
    return { state, error: 'Produkt muss erst entwickelt werden.' };
  }
  return {
    state: {
      ...state,
      products: {
        ...state.products,
        [productId]: {
          ...current,
          stance,
        },
      },
    },
  };
}

export function releaseProductUpdate(
  state: GameState,
  productId: ProductId
): { state: GameState; error?: string } {
  const current = state.products[productId];
  if (!current || !current.unlocked) {
    return { state, error: 'Produkt noch nicht freigeschaltet.' };
  }
  const currentVer = current.releaseVersion ?? 1;
  const cost = getProductReleaseCost(productId, currentVer);
  if (state.credits < cost.credits || state.researchPoints < cost.rp) {
    return { state, error: `Major Release benötigt ${cost.credits} Cr & ${cost.rp} FP.` };
  }
  return {
    state: {
      ...state,
      credits: state.credits - cost.credits,
      researchPoints: state.researchPoints - cost.rp,
      products: {
        ...state.products,
        [productId]: {
          ...current,
          releaseVersion: currentVer + 1,
          stability: 100,
        },
      },
      seasonXp: state.seasonXp + 110,
    },
  };
}

export function stabilizeProduct(
  state: GameState,
  productId: ProductId
): { state: GameState; error?: string } {
  const current = state.products[productId];
  if (!current || !current.unlocked) {
    return { state, error: 'Produkt noch nicht entwickelt.' };
  }
  const cost = getProductHotfixCost(state, productId);
  if (state.credits < cost) {
    return { state, error: `QA-Hotfix kostet ${cost.toLocaleString('de-DE')} Cr.` };
  }
  return {
    state: {
      ...state,
      credits: state.credits - cost,
      products: {
        ...state.products,
        [productId]: {
          ...current,
          stability: 100,
        },
      },
    },
  };
}

export function launchMarketingCampaign(
  state: GameState,
  campaignId: MarketingCampaignId
): { state: GameState; error?: string } {
  const def = MARKETING_CAMPAIGNS.find((c) => c.id === campaignId);
  if (!def) {
    return { state, error: 'Unbekannte Kampagne.' };
  }
  const cost = getMarketingCampaignCost(state, campaignId);
  if (state.credits < cost) {
    return { state, error: `Kampagne benötigt ${cost.toLocaleString('de-DE')} Cr.` };
  }
  return {
    state: {
      ...state,
      credits: state.credits - cost,
      influence: state.influence + def.influenceGain,
      marketingBoostSeconds: def.durationSeconds,
      marketingBoostMult: def.revBoostMult,
      seasonXp: state.seasonXp + 55,
      eventLog: [
        {
          id: nextId('evlog'),
          title: `Kampagne: ${def.name}`,
          sentiment: 'positive' as const,
          timestamp: Date.now(),
          summary: `Umsatz- & Nutzerboost (${def.durationSeconds}s) gestartet.`,
        },
        ...state.eventLog,
      ].slice(0, 14),
    },
  };
}

export function takeLoan(
  state: GameState,
  amount: number
): { state: GameState; error?: string } {
  const cleanAmount = Math.round(amount);
  if (cleanAmount <= 0) {
    return { state, error: 'Ungültiger Kreditbetrag.' };
  }
  const maxLimit = getMaxLoanLimit(state);
  const currentLoan = state.loanBalance ?? 0;
  if (currentLoan + cleanAmount > maxLimit) {
    return {
      state,
      error: `Kreditlimit überschritten (Max ${maxLimit.toLocaleString('de-DE')} Cr).`,
    };
  }
  return {
    state: {
      ...state,
      credits: state.credits + cleanAmount,
      loanBalance: currentLoan + cleanAmount,
    },
  };
}

export function repayLoan(
  state: GameState,
  amount?: number
): { state: GameState; error?: string } {
  const currentLoan = state.loanBalance ?? 0;
  if (currentLoan <= 0) {
    return { state, error: 'Keine offenen Verbindlichkeiten.' };
  }
  const toPay = amount ? Math.min(currentLoan, Math.round(amount)) : currentLoan;
  if (state.credits < toPay) {
    return { state, error: `Tilgung benötigt ${toPay.toLocaleString('de-DE')} Cr.` };
  }
  return {
    state: {
      ...state,
      credits: state.credits - toPay,
      loanBalance: currentLoan - toPay,
    },
  };
}

export function buybackShares(state: GameState): { state: GameState; error?: string } {
  if (!state.ipoCompleted) {
    return { state, error: 'Erfordert abgeschlossenen Börsengang (IPO).' };
  }
  const cost = getShareBuybackCost(state);
  if (state.credits < cost) {
    return { state, error: `Aktienrückkauf benötigt ${cost} Cr.` };
  }
  return {
    state: {
      ...state,
      credits: state.credits - cost,
      shareBuybacks: (state.shareBuybacks ?? 0) + 1,
      influence: state.influence + 12,
      seasonXp: state.seasonXp + 140,
    },
  };
}

export function acquireRivalCompany(
  state: GameState,
  rivalId: string
): { state: GameState; error?: string } {
  const rival = RIVAL_COMPANIES.find((r) => r.id === rivalId);
  if (!rival) {
    return { state, error: 'Unternehmen nicht gefunden.' };
  }
  const acquired = state.acquiredRivals ?? [];
  if (acquired.includes(rivalId)) {
    return { state, error: `${rival.companyName} gehört bereits zum Konzern.` };
  }
  if (state.credits < rival.acquisitionCost) {
    return { state, error: `Übernahme benötigt ${rival.acquisitionCost} Cr.` };
  }
  return {
    state: {
      ...state,
      credits: state.credits - rival.acquisitionCost,
      acquiredRivals: [...acquired, rivalId],
      influence: state.influence + 40,
      seasonXp: state.seasonXp + 250,
      eventLog: [
        {
          id: nextId('evlog'),
          title: `Übernahme: ${rival.companyName}`,
          sentiment: 'positive' as const,
          timestamp: Date.now(),
          summary: `M&A abgeschlossen (${rival.perkLabel}).`,
        },
        ...state.eventLog,
      ].slice(0, 14),
    },
  };
}

export function triggerIPO(state: GameState): { state: GameState; error?: string } {
  if (state.ipoCompleted) {
    return { state, error: 'Börsengang bereits durchgeführt.' };
  }
  const metrics = computeEconomyMetrics(state);
  const unlockedProductsCount = Object.values(state.products).filter((p) => p.unlocked).length;
  if (metrics.valuation < 250000 || unlockedProductsCount < 2 || state.buildings.aiCenter < 1) {
    return {
      state,
      error:
        'Voraussetzungen für Börsengang: 250.000 Marktwert, mind. 2 eigene Produkte & KI-Zentrum Lv 1.',
    };
  }
  return {
    state: {
      ...state,
      ipoCompleted: true,
      credits: state.credits + 250000,
      totalCreditsEarned: state.totalCreditsEarned + 250000,
      influence: state.influence + 50,
      seasonXp: state.seasonXp + 500,
    },
  };
}

export function applyOfflineProgress(
  state: GameState,
  nowMs: number
): { state: GameState; report: OfflineReport | null } {
  const elapsedSeconds = Math.floor((nowMs - state.lastSavedAt) / 1000);
  if (elapsedSeconds < 15) {
    return { state, report: null };
  }
  // Cap offline catch-up to 8 hours (28800s) at 70% idle efficiency
  const cappedSeconds = Math.min(elapsedSeconds, 28800);
  const metrics = computeEconomyMetrics(state);
  const creditsGained = Math.max(0, Math.round(metrics.netCreditsPerSec * cappedSeconds * 0.7));
  const rpGained = Math.round(metrics.rpPerSec * cappedSeconds * 0.7 * 10) / 10;

  return {
    state: {
      ...state,
      credits: state.credits + creditsGained,
      totalCreditsEarned: state.totalCreditsEarned + creditsGained,
      researchPoints: state.researchPoints + rpGained,
      lastSavedAt: nowMs,
    },
    report: {
      elapsedSeconds: cappedSeconds,
      creditsGained,
      rpGained,
    },
  };
}

export function getLeaderboard(state: GameState): LeaderboardEntry[] {
  const metrics = computeEconomyMetrics(state);
  const acquiredSet = new Set(state.acquiredRivals ?? []);
  const playerEntry: LeaderboardEntry = {
    id: 'player',
    companyName: state.companyName,
    isPlayer: true,
    revenuePerMin: Math.round(metrics.creditsPerSec * 60),
    valuation: metrics.valuation,
    researchScore: state.unlockedResearch.length * 120 + Math.round(state.researchPoints),
    tierLabel: state.ipoCompleted ? 'Börsennotierter Konzern' : metrics.phase,
    marketSharePercent: metrics.marketSharePercent,
  };

  const unacquiredTotal = Math.max(
    1,
    RIVAL_COMPANIES.filter((r) => !acquiredSet.has(r.id)).reduce((s, r) => s + r.valuation, 0)
  );
  const remainingPool = Math.max(0.1, 100 - metrics.marketSharePercent);

  const rivals: LeaderboardEntry[] = RIVAL_COMPANIES.map((r) => {
    const isAcquired = acquiredSet.has(r.id);
    const rivalShare = isAcquired
      ? 0
      : Math.round(((r.valuation / unacquiredTotal) * remainingPool) * 10) / 10;
    return {
      ...r,
      isPlayer: false,
      acquired: isAcquired,
      tierLabel: isAcquired ? 'Tochtergesellschaft' : r.tierLabel,
      marketSharePercent: rivalShare,
    };
  });

  return [...rivals, playerEntry].sort((a, b) => b.valuation - a.valuation);
}

export function toggleAllianceMembership(state: GameState): GameState {
  const joining = !state.alliance.joined;
  return {
    ...state,
    alliance: {
      ...state.alliance,
      joined: joining,
      memberCount: joining ? 19 : 18,
    },
  };
}

export function contributeAllianceCoop(state: GameState): { state: GameState; error?: string } {
  if (!state.alliance.joined) {
    return { state, error: 'Tritt zuerst dem Verband bei.' };
  }
  const cost = Math.max(250, state.buildings.office * 120);
  if (state.credits < cost) {
    return { state, error: `Verbands-Beitrag kostet ${cost} Cr.` };
  }
  const nextProgress = state.alliance.coopProgress + 50;
  if (nextProgress >= state.alliance.coopGoal) {
    return {
      state: {
        ...state,
        credits: state.credits - cost,
        influence: state.influence + 15,
        seasonXp: state.seasonXp + 200,
        alliance: {
          ...state.alliance,
          coopProgress: 0,
          coopGoal: state.alliance.coopGoal + 500,
          sharedBonusPercent: Math.min(35, state.alliance.sharedBonusPercent + 2),
        },
      },
    };
  }
  return {
    state: {
      ...state,
      credits: state.credits - cost,
      seasonXp: state.seasonXp + 45,
      alliance: {
        ...state.alliance,
        coopProgress: nextProgress,
      },
    },
  };
}

export function sendAllianceMessage(state: GameState, text: string): GameState {
  const trimmed = text.trim();
  if (!trimmed || !state.alliance.joined) return state;
  const now = new Date();
  const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
  return {
    ...state,
    alliance: {
      ...state.alliance,
      coopProgress: Math.min(state.alliance.coopGoal, state.alliance.coopProgress + 25),
      messages: [
        ...state.alliance.messages,
        {
          id: nextId('msg'),
          author: state.companyName,
          text: trimmed,
          timeLabel,
        },
      ].slice(-25),
    },
  };
}

export function purchaseOrEquipSkin(
  state: GameState,
  skinId: CosmeticSkinId
): { state: GameState; error?: string } {
  const skin = COSMETIC_SKINS.find((s) => s.id === skinId);
  if (!skin) return { state, error: 'Skin nicht gefunden.' };
  if (state.unlockedSkins.includes(skinId)) {
    return { state: { ...state, activeSkin: skinId } };
  }
  if (state.influence < skin.costInfluence) {
    return { state, error: `Benötigt ${skin.costInfluence} Einfluss.` };
  }
  return {
    state: {
      ...state,
      influence: state.influence - skin.costInfluence,
      unlockedSkins: [...state.unlockedSkins, skinId],
      activeSkin: skinId,
    },
  };
}

export function serializeGameState(state: GameState): string {
  return JSON.stringify({ ...state, lastSavedAt: Date.now() }, null, 2);
}

export function deserializeGameState(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (!parsed || typeof parsed.credits !== 'number' || !parsed.buildings) {
      return null;
    }
    const base = createInitialGameState(Date.now());
    const mergedProducts = { ...base.products };
    if (parsed.products) {
      (Object.keys(base.products) as ProductId[]).forEach((pid) => {
        if (parsed.products?.[pid]) {
          mergedProducts[pid] = {
            ...base.products[pid],
            ...parsed.products[pid],
            stance: parsed.products[pid].stance ?? 'balanced',
            releaseVersion: parsed.products[pid].releaseVersion ?? 1,
            stability:
              typeof parsed.products[pid].stability === 'number'
                ? parsed.products[pid].stability
                : 100,
          };
        }
      });
    }

    const hydratedEmployees = Array.isArray(parsed.employees)
      ? parsed.employees.map((emp) => ({
          ...emp,
          trainingCount: emp.trainingCount ?? 0,
        }))
      : base.employees;

    return {
      ...base,
      ...parsed,
      buildings: { ...base.buildings, ...parsed.buildings },
      products: mergedProducts,
      employees: hydratedEmployees,
      alliance: { ...base.alliance, ...parsed.alliance },
      audio: { ...base.audio, ...parsed.audio },
      globalRegions: { ...createDefaultGlobalRegions(), ...(parsed.globalRegions ?? {}) },
      teamDirective: parsed.teamDirective ?? 'balanced',
      security: { ...createDefaultSecurityState(), ...(parsed.security ?? {}) },
      repeatableResearch: {
        ...createDefaultRepeatableResearch(),
        ...(parsed.repeatableResearch ?? {}),
      },
      acquiredRivals: Array.isArray(parsed.acquiredRivals) ? parsed.acquiredRivals : [],
      shareBuybacks: typeof parsed.shareBuybacks === 'number' ? parsed.shareBuybacks : 0,
      workloadMode: parsed.workloadMode ?? 'standard',
      staffAlert: parsed.staffAlert ?? null,
      activeDilemma: parsed.activeDilemma ?? null,
      nextDilemmaInSeconds:
        typeof parsed.nextDilemmaInSeconds === 'number' ? parsed.nextDilemmaInSeconds : 38,
      loanBalance: typeof parsed.loanBalance === 'number' ? parsed.loanBalance : 0,
      marketingBoostSeconds:
        typeof parsed.marketingBoostSeconds === 'number' ? parsed.marketingBoostSeconds : 0,
      marketingBoostMult:
        typeof parsed.marketingBoostMult === 'number' ? parsed.marketingBoostMult : 1,
      quitCount: typeof parsed.quitCount === 'number' ? parsed.quitCount : 0,
    };
  } catch {
    return null;
  }
}
