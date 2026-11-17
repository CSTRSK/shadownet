export type GameScreenState = 'title' | 'playing' | 'paused' | 'gameover';

export type GamePhase = 'Frühspiel' | 'Midgame' | 'Endgame';

export type BuildingId =
  | 'office'
  | 'serverRoom'
  | 'researchLab'
  | 'marketingDept'
  | 'aiCenter';

export type EmployeeRole = 'Entwickler' | 'Sysadmin' | 'Forscher' | 'Manager';

export type EmployeeRarity = 'Gewöhnlich' | 'Selten' | 'Episch' | 'Legendär';

export type ResearchTier = 1 | 2 | 3 | 4;

export type ProductId =
  | 'antivirus'
  | 'cloudStorage'
  | 'messenger'
  | 'streaming'
  | 'aiAssistant';

export type ProductPricingStance = 'freemium' | 'balanced' | 'enterprise';

export type GlobalRegionId =
  | 'frankfurt'
  | 'reykjavik'
  | 'virginia'
  | 'tokyo'
  | 'orbital';

export type RegionMode = 'balanced' | 'compute' | 'eco' | 'security';

export type TeamDirective =
  | 'balanced'
  | 'contracts'
  | 'research'
  | 'growth'
  | 'defense';

export type CyberIncidentResolution = 'patch' | 'counter';

export type RepeatableTechId =
  | 'quantum_overclock'
  | 'neural_compression'
  | 'zero_day_immunity';

export type WorkloadMode = 'worklife' | 'standard' | 'crunch';

export type MarketingCampaignId = 'influencer' | 'conference_blitz' | 'enterprise_push';

export interface StaffQuitAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  reason: string;
  remainingSeconds: number;
  raiseCostCredits: number;
  salaryIncreasePerMin: number;
}

export interface DilemmaChoice {
  id: string;
  label: string;
  effectHint: string;
  creditsDelta: number;
  rpDelta: number;
  influenceDelta: number;
  loyaltyDelta: number;
  motivationDelta: number;
  firewallDelta: number;
}

export interface ManagementDilemma {
  id: string;
  title: string;
  description: string;
  remainingSeconds: number;
  choices: DilemmaChoice[];
}

export type EventSentiment = 'positive' | 'neutral' | 'negative';

export type CosmeticSkinId = 'tron_cyan' | 'neon_magenta' | 'quantum_gold';

export interface BuildingState {
  id: BuildingId;
  level: number;
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  rarity: EmployeeRarity;
  intelligence: number; // Forschung
  motivation: number;   // Produktivität (0-100)
  loyalty: number;      // Kündigungsrisiko inverse (1-100)
  experience: number;   // Effizienz
  salaryPerMin: number;
  hiredAtTick: number;
  trainingCount?: number;
}

export interface Contract {
  id: string;
  title: string;
  client: string;
  category: 'Security' | 'Cloud' | 'App' | 'KI';
  requiredWork: number;
  progress: number;
  rewardCredits: number;
  rewardRP: number;
  rewardInfluence: number;
  minOfficeLevel: number;
  minCompute: number;
}

export interface ProductState {
  id: ProductId;
  unlocked: boolean;
  level: number;
  subscribers: number;
  revenuePerSec: number;
  stance?: ProductPricingStance;
  releaseVersion?: number;
  stability?: number; // 0 - 100, below 70 causes subscriber churn
}

export interface GlobalRegionState {
  id: GlobalRegionId;
  level: number;
  mode: RegionMode;
}

export interface CyberIncident {
  id: string;
  title: string;
  targetLabel: string;
  description: string;
  severity: number; // 1 - 3
  remainingSeconds: number;
  revenuePenaltyMult: number;
  patchCostCredits: number;
  counterMinCompute: number;
}

export interface SecurityState {
  firewallIntegrity: number; // 0 - 100
  autoSocEnabled: boolean;
  activeIncident: CyberIncident | null;
  nextIncidentInSeconds: number;
  incidentsBlockedCount: number;
  lastAuditAtSeconds: number;
}

export interface ActiveEvent {
  id: string;
  title: string;
  description: string;
  sentiment: EventSentiment;
  remainingSeconds: number;
  durationSeconds: number;
  revenueMultiplier: number;
  researchMultiplier: number;
  powerPenalty: number;
  productivityMultiplier: number;
  instantCredits?: number;
  instantInfluence?: number;
}

export interface EventLogEntry {
  id: string;
  title: string;
  sentiment: EventSentiment;
  timestamp: number;
  summary: string;
}

export interface AllianceMember {
  id: string;
  name: string;
  role: 'Anführer' | 'Offizier' | 'Mitglied';
  valuation: number;
}

export interface AllianceMessage {
  id: string;
  author: string;
  text: string;
  timeLabel: string;
}

export interface AllianceState {
  joined: boolean;
  name: string;
  tag: string;
  memberCount: number;
  maxMembers: number;
  sharedBonusPercent: number;
  coopProgress: number;
  coopGoal: number;
  members: AllianceMember[];
  messages: AllianceMessage[];
}

export interface LeaderboardEntry {
  id: string;
  companyName: string;
  isPlayer: boolean;
  revenuePerMin: number;
  valuation: number;
  researchScore: number;
  tierLabel: string;
  marketSharePercent?: number;
  acquired?: boolean;
  acquisitionCost?: number;
  perkLabel?: string;
}

export interface AudioSettings {
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export interface GameState {
  version: number;
  companyName: string;
  credits: number;
  totalCreditsEarned: number;
  researchPoints: number;
  influence: number;
  hardwareLevel: number; // Early-game PC upgrades (1-8)
  buildings: Record<BuildingId, number>;
  employees: Employee[];
  candidates: Employee[];
  unlockedResearch: string[];
  activeContracts: Contract[];
  availableContracts: Contract[];
  completedContractsCount: number;
  products: Record<ProductId, ProductState>;
  activeEvents: ActiveEvent[];
  eventLog: EventLogEntry[];
  nextEventInSeconds: number;
  alliance: AllianceState;
  seasonDay: number;
  seasonXp: number;
  activeSkin: CosmeticSkinId;
  unlockedSkins: CosmeticSkinId[];
  ipoCompleted: boolean;
  playTimeSeconds: number;
  lastSavedAt: number;
  audio: AudioSettings;
  // Expanded depth mechanics (optional in v1 saves, hydrated on load)
  globalRegions?: Record<GlobalRegionId, GlobalRegionState>;
  teamDirective?: TeamDirective;
  security?: SecurityState;
  repeatableResearch?: Record<RepeatableTechId, number>;
  acquiredRivals?: string[];
  shareBuybacks?: number;
  workloadMode?: WorkloadMode;
  staffAlert?: StaffQuitAlert | null;
  activeDilemma?: ManagementDilemma | null;
  nextDilemmaInSeconds?: number;
  loanBalance?: number;
  marketingBoostSeconds?: number;
  marketingBoostMult?: number;
  quitCount?: number;
}

export interface EconomyMetrics {
  phase: GamePhase;
  employeeCapacity: number;
  employeeCount: number;
  powerProduced: number;
  powerUsed: number;
  coolingProduced: number;
  coolingUsed: number;
  powerEfficiency: number; // 0.35 - 1.0
  computePower: number;
  reputation: number;
  productivityMultiplier: number;
  creditsPerSec: number;
  salaryPerSec: number;
  netCreditsPerSec: number;
  rpPerSec: number;
  influencePerSec: number;
  workSpeedPerSec: number;
  valuation: number;
  automationLevel: number; // 0 - 1
  securityRating: number;  // 0 - 100
  marketSharePercent: number;
  sharePrice: number;
  globalRegionsCount: number;
  loanInterestPerSec: number;
  avgQuitRiskPercent: number;
}

export interface OfflineReport {
  elapsedSeconds: number;
  creditsGained: number;
  rpGained: number;
}
