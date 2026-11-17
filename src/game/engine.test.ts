import test from 'node:test';
import assert from 'node:assert/strict';
import {
  acceptContract,
  acquireRivalCompany,
  applyOfflineProgress,
  buybackShares,
  cancelContract,
  computeEconomyMetrics,
  contributeAllianceCoop,
  createInitialGameState,
  deserializeGameState,
  fireEmployee,
  getBuildingUpgradeCost,
  getCandidateHireCost,
  getEmployeeQuitRisk,
  getLeaderboard,
  hireCandidate,
  launchMarketingCampaign,
  performManualWorkBoost,
  promoteEmployee,
  purchaseOrEquipSkin,
  raiseEmployeeSalary,
  releaseProductUpdate,
  repayLoan,
  rerollContracts,
  resolveCyberIncident,
  resolveDilemma,
  resolveStaffAlert,
  runSecurityAudit,
  serializeGameState,
  setProductStance,
  setRegionMode,
  setTeamDirective,
  setWorkloadMode,
  stabilizeProduct,
  takeLoan,
  tickSimulation,
  toggleAllianceMembership,
  toggleAutoSoc,
  trainEmployee,
  triggerIPO,
  unlockOrUpgradeProduct,
  unlockRepeatableTech,
  unlockResearch,
  upgradeBuilding,
  upgradeGlobalRegion,
  upgradeHardware,
} from './engine';

test('initial state starts in Frühspiel garage with 1 office and 4 candidates', () => {
  const state = createInitialGameState(1000);
  const metrics = computeEconomyMetrics(state);
  assert.equal(metrics.phase, 'Frühspiel');
  assert.equal(state.buildings.office, 1);
  assert.equal(metrics.employeeCapacity, 2);
  assert.equal(state.candidates.length, 4);
  assert.ok(state.availableContracts.length >= 3);
});

test('accepting and ticking a contract completes it and grants rewards', () => {
  let state = createInitialGameState(1000);
  const contract = state.availableContracts[0];
  const accepted = acceptContract(state, contract.id);
  assert.equal(accepted.error, undefined);
  state = accepted.state;
  assert.equal(state.activeContracts.length, 1);

  const creditsBefore = state.credits;
  for (let i = 0; i < 15; i += 1) {
    state = performManualWorkBoost(state);
  }
  assert.equal(state.completedContractsCount >= 1, true);
  assert.ok(state.credits > creditsBefore);
});

test('building upgrade and employee hiring increase capacity and speed', () => {
  let state = createInitialGameState(1000);
  state = { ...state, credits: 5000 };

  const officeCost = getBuildingUpgradeCost('office', 1);
  const upg = upgradeBuilding(state, 'office');
  assert.equal(upg.error, undefined);
  state = upg.state;
  assert.equal(state.buildings.office, 2);
  assert.equal(state.credits, 5000 - officeCost);

  const metricsBeforeHire = computeEconomyMetrics(state);
  assert.equal(metricsBeforeHire.employeeCapacity, 4);

  const candidate = state.candidates[0];
  const hireCost = getCandidateHireCost(candidate);
  const hired = hireCandidate(state, candidate.id);
  assert.equal(hired.error, undefined);
  state = hired.state;
  assert.equal(state.employees.length, 1);
  assert.equal(state.credits, 5000 - officeCost - hireCost);
});

test('research prerequisites and 4-tier progression unlock AI Center and IPO path', () => {
  let state = createInitialGameState(1000);
  state = { ...state, credits: 100000, researchPoints: 5000 };

  const blocked = unlockResearch(state, 'cloud_services');
  assert.ok(blocked.error);

  state = unlockResearch(state, 'ssds').state;
  state = unlockResearch(state, 'cloud_services').state;
  state = unlockResearch(state, 'automation').state;
  state = unlockResearch(state, 'ai_agents').state;

  const aiBuilt = upgradeBuilding(state, 'aiCenter');
  assert.equal(aiBuilt.error, undefined);
  state = aiBuilt.state;
  assert.equal(state.buildings.aiCenter, 1);
  assert.equal(computeEconomyMetrics(state).phase, 'Endgame');
});

test('hardware upgrade, product launch, and IPO victory check work end-to-end', () => {
  let state = createInitialGameState(1000);
  state = {
    ...state,
    credits: 500000,
    totalCreditsEarned: 500000,
    researchPoints: 5000,
    unlockedResearch: ['ssds', 'cloud_services', 'automation', 'ai_agents'],
  };

  state = upgradeHardware(state).state;
  assert.equal(state.hardwareLevel, 2);

  state = unlockOrUpgradeProduct(state, 'antivirus').state;
  state = unlockOrUpgradeProduct(state, 'cloudStorage').state;
  assert.equal(state.products.antivirus.unlocked, true);
  assert.equal(state.products.cloudStorage.unlocked, true);

  state = upgradeBuilding(state, 'aiCenter').state;
  const ipoRes = triggerIPO(state);
  assert.equal(ipoRes.error, undefined);
  assert.equal(ipoRes.state.ipoCompleted, true);
});

test('simulation tick triggers events and advances offline idle progress', () => {
  let state = createInitialGameState(1000);
  state = { ...state, nextEventInSeconds: 0.5, credits: 500 };

  const tickRes = tickSimulation(state, 1.0, 2000);
  assert.ok(tickRes.triggeredEvent);
  assert.ok(tickRes.state.activeEvents.length >= 1);

  const offlineRes = applyOfflineProgress(
    { ...tickRes.state, lastSavedAt: 1000 },
    1000 + 3600 * 1000
  );
  assert.ok(offlineRes.report);
  assert.equal(offlineRes.report.elapsedSeconds, 3600);
  assert.ok(offlineRes.report.creditsGained > 0);
});

test('serialization roundtrip, leaderboard sorting, and cosmetic skins work', () => {
  const state = createInitialGameState(1000);
  const raw = serializeGameState(state);
  const restored = deserializeGameState(raw);
  assert.ok(restored);
  assert.equal(restored.companyName, state.companyName);

  const board = getLeaderboard(restored);
  assert.equal(board.length, 6);
  assert.ok(board[0].valuation >= board[board.length - 1].valuation);

  const skinRes = purchaseOrEquipSkin({ ...restored, influence: 20 }, 'neon_magenta');
  assert.equal(skinRes.error, undefined);
  assert.equal(skinRes.state.activeSkin, 'neon_magenta');
});

test('automated endgame simulation keeps active and available contract counts rock-solid', () => {
  let state = createInitialGameState(1000);
  state = {
    ...state,
    hardwareLevel: 8,
    buildings: {
      office: 12,
      serverRoom: 8,
      researchLab: 6,
      marketingDept: 6,
      aiCenter: 3,
    },
    unlockedResearch: ['ssds', 'cloud_services', 'automation', 'ai_agents', 'data_centers'],
  };

  for (let i = 0; i < 8; i += 1) {
    const res = tickSimulation(state, 0.5, 2000 + i * 500);
    state = res.state;
    assert.equal(state.activeContracts.length, 2);
    assert.equal(state.availableContracts.length, 4);
  }
});

test('global datacenter regions upgrade and operational modes modify empire output', () => {
  let state = createInitialGameState(1000);
  state = {
    ...state,
    credits: 500000,
    influence: 100,
    unlockedResearch: ['ssds', 'cloud_services', 'data_centers'],
  };
  const metricsBefore = computeEconomyMetrics(state);

  const built = upgradeGlobalRegion(state, 'frankfurt');
  assert.equal(built.error, undefined);
  state = built.state;
  assert.equal(state.globalRegions?.frankfurt.level, 1);

  const modeRes = setRegionMode(state, 'frankfurt', 'compute');
  assert.equal(modeRes.error, undefined);
  state = modeRes.state;
  assert.equal(state.globalRegions?.frankfurt.mode, 'compute');

  const metricsAfter = computeEconomyMetrics(state);
  assert.ok(metricsAfter.computePower > metricsBefore.computePower);
  assert.ok(metricsAfter.creditsPerSec > metricsBefore.creditsPerSec);
  assert.equal(metricsAfter.globalRegionsCount, 1);
});

test('cybersecurity incidents spawn, penalize revenue, and resolve via patch, counter, or auto-soc', () => {
  let state = createInitialGameState(1000);
  state = {
    ...state,
    credits: 100000,
    buildings: { ...state.buildings, office: 4, serverRoom: 4, aiCenter: 1 },
    security: {
      firewallIntegrity: 85,
      autoSocEnabled: false,
      activeIncident: null,
      nextIncidentInSeconds: 0.4,
      incidentsBlockedCount: 0,
      lastAuditAtSeconds: 0,
    },
  };

  // Trigger incident on tick
  const tickRes = tickSimulation(state, 1.0, 2000);
  state = tickRes.state;
  assert.ok(state.security?.activeIncident);

  const penalizedMetrics = computeEconomyMetrics(state);

  // Resolve via patch
  const patched = resolveCyberIncident(state, 'patch');
  assert.equal(patched.error, undefined);
  state = patched.state;
  assert.equal(state.security?.activeIncident, null);
  assert.equal(state.security?.incidentsBlockedCount, 1);

  const restoredMetrics = computeEconomyMetrics(state);
  assert.ok(restoredMetrics.creditsPerSec > penalizedMetrics.creditsPerSec);

  // Security Audit restores firewall to 100%
  state = runSecurityAudit(state).state;
  assert.equal(state.security?.firewallIntegrity, 100);

  // Auto-SOC blocks future incidents automatically
  state = toggleAutoSoc(state).state;
  assert.equal(state.security?.autoSocEnabled, true);
  state = {
    ...state,
    security: { ...state.security!, nextIncidentInSeconds: 0.2 },
  };
  const autoBlocked = tickSimulation(state, 0.5, 3000).state;
  assert.equal(autoBlocked.security?.activeIncident, null);
  assert.equal(autoBlocked.security?.incidentsBlockedCount, 2);
});

test('employee training, promotion, and team directives improve stats and specialization', () => {
  let state = createInitialGameState(1000);
  state = { ...state, credits: 100000, researchPoints: 5000, influence: 50 };
  const candidate = state.candidates[0];
  state = hireCandidate(state, candidate.id).state;
  const empId = state.employees[0].id;

  const baseMetrics = computeEconomyMetrics(state);
  const rpDirState = setTeamDirective(state, 'research');
  const rpDirMetrics = computeEconomyMetrics(rpDirState);
  assert.ok(rpDirMetrics.rpPerSec > baseMetrics.rpPerSec);

  const trained = trainEmployee(state, empId);
  assert.equal(trained.error, undefined);
  state = trained.state;
  assert.equal(state.employees[0].trainingCount, 1);

  const rarityBefore = state.employees[0].rarity;
  if (rarityBefore !== 'Legendär') {
    const promo = promoteEmployee(state, empId);
    assert.equal(promo.error, undefined);
    assert.notEqual(promo.state.employees[0].rarity, rarityBefore);
  }
});

test('product pricing stances, major releases, repeatable endgame research, M&A, buybacks, and v1 save import', () => {
  // Simulate importing user's exact v1 endgame JSON shape without new optional fields
  const v1EndgameJson = JSON.stringify({
    version: 1,
    companyName: 'ShadowNet Labs',
    credits: 177932211,
    totalCreditsEarned: 1413102779,
    researchPoints: 1743829,
    influence: 23889,
    hardwareLevel: 8,
    buildings: { office: 20, serverRoom: 15, researchLab: 15, marketingDept: 15, aiCenter: 6 },
    employees: [
      {
        id: 'emp_10',
        name: 'Fabian Brandt',
        role: 'Manager',
        rarity: 'Gewöhnlich',
        intelligence: 51,
        motivation: 100,
        loyalty: 76,
        experience: 100,
        salaryPerMin: 38,
        hiredAtTick: 0,
      },
    ],
    unlockedResearch: [
      'ssds',
      'cloud_services',
      'automation',
      'ai_agents',
      'data_centers',
      'quantum_computing',
      'global_infra',
      'super_ai',
      'full_automation',
    ],
    products: {
      antivirus: { id: 'antivirus', unlocked: true, level: 20, subscribers: 100000, revenuePerSec: 9000 },
      cloudStorage: { id: 'cloudStorage', unlocked: true, level: 20, subscribers: 200000, revenuePerSec: 18000 },
    },
    ipoCompleted: true,
    activeSkin: 'quantum_gold',
  });

  let state = deserializeGameState(v1EndgameJson)!;
  assert.ok(state);
  assert.equal(state.ipoCompleted, true);
  assert.equal(state.activeSkin, 'quantum_gold');
  assert.equal(state.teamDirective, 'balanced');
  assert.ok(state.globalRegions);
  assert.ok(state.security);
  assert.ok(state.repeatableResearch);

  const metricsBefore = computeEconomyMetrics(state);

  // Stance & Major Release
  state = setProductStance(state, 'antivirus', 'enterprise').state;
  state = releaseProductUpdate(state, 'antivirus').state;
  assert.equal(state.products.antivirus.releaseVersion, 2);

  // Repeatable Tier-5 research
  const repRes = unlockRepeatableTech(state, 'quantum_overclock');
  assert.equal(repRes.error, undefined);
  state = repRes.state;
  assert.equal(state.repeatableResearch?.quantum_overclock, 1);

  // M&A Rival Acquisition
  const maRes = acquireRivalCompany(state, 'rival_1');
  assert.equal(maRes.error, undefined);
  state = maRes.state;
  assert.ok(state.acquiredRivals?.includes('rival_1'));

  // Share Buyback
  const buybackRes = buybackShares(state);
  assert.equal(buybackRes.error, undefined);
  state = buybackRes.state;
  assert.equal(state.shareBuybacks, 1);

  // Alliance Co-op contribution
  state = toggleAllianceMembership(state);
  const coopRes = contributeAllianceCoop(state);
  assert.equal(coopRes.error, undefined);
  state = coopRes.state;

  const metricsAfter = computeEconomyMetrics(state);
  assert.ok(metricsAfter.creditsPerSec > metricsBefore.creditsPerSec);
  assert.ok(metricsAfter.sharePrice > metricsBefore.sharePrice);
  assert.equal(state.workloadMode, 'standard');
  assert.equal(state.products.antivirus.stability, 100);
});

test('employee firing, salary raises, crunch quit risk, and resignation alert timeout', () => {
  let state = createInitialGameState(1000);
  state = { ...state, credits: 50000, buildings: { ...state.buildings, office: 3 } };
  state = hireCandidate(state, state.candidates[0].id).state;
  state = hireCandidate(state, state.candidates[0].id).state;
  assert.equal(state.employees.length, 2);

  // Fire second employee directly
  const secondId = state.employees[1].id;
  const fired = fireEmployee(state, secondId);
  assert.equal(fired.error, undefined);
  state = fired.state;
  assert.equal(state.employees.length, 1);

  // Crunch-Mode increases work speed & quit risk
  const stdMetrics = computeEconomyMetrics(state);
  state = setWorkloadMode(state, 'crunch');
  const crunchMetrics = computeEconomyMetrics(state);
  assert.ok(crunchMetrics.workSpeedPerSec > stdMetrics.workSpeedPerSec);

  // Low loyalty triggers resignation alert, and salary raise / counter-offer saves them
  state = {
    ...state,
    employees: [{ ...state.employees[0], loyalty: 25, motivation: 30 }],
  };
  assert.ok(getEmployeeQuitRisk(state.employees[0], 'crunch', false) >= 42);
  state = tickSimulation(state, 1.0, 2000).state;
  assert.ok(state.staffAlert);

  const kept = resolveStaffAlert(state, true);
  assert.equal(kept.error, undefined);
  state = kept.state;
  assert.equal(state.staffAlert, null);
  assert.equal(state.employees.length, 1);

  // Direct salary raise also boosts loyalty/motivation
  const beforeSal = state.employees[0].salaryPerMin;
  state = raiseEmployeeSalary(state, state.employees[0].id).state;
  assert.ok(state.employees[0].salaryPerMin > beforeSal);

  // Ignoring a resignation alert until timeout causes the employee to quit
  state = {
    ...state,
    employees: [{ ...state.employees[0], loyalty: 15, motivation: 20 }],
  };
  state = tickSimulation(state, 1.0, 3000).state;
  assert.ok(state.staffAlert);
  state = {
    ...state,
    staffAlert: { ...state.staffAlert!, remainingSeconds: 0.4 },
  };
  const quitTick = tickSimulation(state, 1.0, 4000);
  assert.ok(quitTick.quitEmployeeName);
  assert.equal(quitTick.state.employees.length, 0);
  assert.equal(quitTick.state.quitCount, 1);
});

test('management dilemmas, product stability churn/hotfix, marketing campaigns, contract cancel/reroll, and loans', () => {
  let state = createInitialGameState(1000);
  state = {
    ...state,
    credits: 120000,
    researchPoints: 1000,
    buildings: { ...state.buildings, office: 3 },
    nextDilemmaInSeconds: 0.3,
  };

  // Spawn & resolve dilemma
  state = tickSimulation(state, 1.0, 2000).state;
  assert.ok(state.activeDilemma);
  const firstChoice = state.activeDilemma!.choices[0];
  const dilRes = resolveDilemma(state, firstChoice.id);
  assert.equal(dilRes.error, undefined);
  state = dilRes.state;
  assert.equal(state.activeDilemma, null);

  // Contract accept -> cancel -> reroll
  const cId = state.availableContracts[0].id;
  state = acceptContract(state, cId).state;
  assert.equal(state.activeContracts.length, 1);
  state = cancelContract(state, cId).state;
  assert.equal(state.activeContracts.length, 0);

  const oldIds = state.availableContracts.map((c) => c.id).join(',');
  state = rerollContracts(state).state;
  assert.notEqual(state.availableContracts.map((c) => c.id).join(','), oldIds);

  // Product stability penalty & QA hotfix
  state = unlockOrUpgradeProduct(state, 'antivirus').state;
  const healthyMetrics = computeEconomyMetrics(state);
  state = {
    ...state,
    products: {
      ...state.products,
      antivirus: { ...state.products.antivirus, stability: 40 },
    },
  };
  const degradedMetrics = computeEconomyMetrics(state);
  assert.ok(degradedMetrics.creditsPerSec < healthyMetrics.creditsPerSec);

  state = stabilizeProduct(state, 'antivirus').state;
  assert.equal(state.products.antivirus.stability, 100);

  // Marketing campaign boost
  const beforeCamp = computeEconomyMetrics(state);
  state = launchMarketingCampaign(state, 'influencer').state;
  const afterCamp = computeEconomyMetrics(state);
  assert.ok(afterCamp.creditsPerSec > beforeCamp.creditsPerSec);

  // Corporate loan & repayment
  const crBeforeLoan = state.credits;
  const loaned = takeLoan(state, 5000);
  assert.equal(loaned.error, undefined);
  state = loaned.state;
  assert.equal(state.credits, crBeforeLoan + 5000);
  assert.equal(state.loanBalance, 5000);
  assert.ok(computeEconomyMetrics(state).loanInterestPerSec > 0);

  const repaid = repayLoan(state);
  assert.equal(repaid.error, undefined);
  state = repaid.state;
  assert.equal(state.loanBalance, 0);
});
