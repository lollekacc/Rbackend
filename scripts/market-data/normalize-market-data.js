#!/usr/bin/env node

const slugify = (value) => String(value || 'plan')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

const numberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const booleanOrNull = (value) => {
  if (value === true || value === false) return value;
  return null;
};

const normalizeCategory = (value) => {
  const normalized = String(value || '').trim();
  const allowed = new Set([
    'mobile_subscription',
    'mobile_broadband',
    'fixed_broadband',
    'business_mobile',
  ]);
  return allowed.has(normalized) ? normalized : 'mobile_subscription';
};

const normalizeSegment = (value) => {
  const normalized = String(value || '').trim();
  const allowed = new Set(['private', 'family', 'student', 'senior', 'youth', 'child', 'business']);
  return allowed.has(normalized) ? normalized : 'private';
};

const formatDataLabel = ({ dataGb, isUnlimited, rawPlan }) => {
  if (rawPlan.data) return String(rawPlan.data);
  if (isUnlimited) return 'Obegränsad';
  if (Number.isFinite(Number(dataGb))) return `${Number(dataGb)} GB`;
  return null;
};

const normalizeRawPlan = (rawPlan = {}, snapshot = {}, index = 0) => {
  const operatorId = String(rawPlan.operatorId || snapshot.operatorId || '').trim().toLowerCase();
  const planName = rawPlan.planName || rawPlan.title || rawPlan.name || null;
  const isUnlimited = rawPlan.isUnlimited === true;
  const dataGb = isUnlimited ? null : numberOrNull(rawPlan.dataGb);
  const category = normalizeCategory(rawPlan.category);
  const segment = normalizeSegment(rawPlan.segment);
  const monthlyPrice = numberOrNull(rawPlan.monthlyPrice);
  const data = formatDataLabel({ dataGb, isUnlimited, rawPlan });
  const planId = rawPlan.planId || [
    operatorId || 'unknown',
    slugify(planName || rawPlan.rawId || `raw-${index + 1}`),
  ].filter(Boolean).join('-');
  const dataStatus = rawPlan.dataStatus === 'stale' ? 'stale' : 'placeholder';

  return {
    planId,
    id: rawPlan.id || planId,
    operatorId,
    operator: rawPlan.operator || null,
    planName,
    title: rawPlan.title || planName,
    category,
    legacyCategory: rawPlan.legacyCategory || (category === 'mobile_subscription' ? 'mobil' : null),
    segment,
    tier: rawPlan.tier || null,
    dataGb,
    data,
    dataAmount: rawPlan.dataAmount !== undefined ? numberOrNull(rawPlan.dataAmount) : dataGb,
    isUnlimited,
    monthlyPrice,
    price: monthlyPrice,
    campaignPrice: numberOrNull(rawPlan.campaignPrice),
    campaignMonths: numberOrNull(rawPlan.campaignMonths),
    normalPriceAfterCampaign: numberOrNull(rawPlan.normalPriceAfterCampaign),
    totalCostFirst12Months: numberOrNull(rawPlan.totalCostFirst12Months),
    totalCostFirst24Months: numberOrNull(rawPlan.totalCostFirst24Months),
    bindingMonths: numberOrNull(rawPlan.bindingMonths),
    noticePeriodMonths: numberOrNull(rawPlan.noticePeriodMonths),
    startFee: numberOrNull(rawPlan.startFee),
    simFee: numberOrNull(rawPlan.simFee),
    includesCallsSms: booleanOrNull(rawPlan.includesCallsSms),
    supports5G: booleanOrNull(rawPlan.supports5G),
    supportsEsim: booleanOrNull(rawPlan.supportsEsim),
    roamingEuGb: numberOrNull(rawPlan.roamingEuGb),
    speedCapMbps: numberOrNull(rawPlan.speedCapMbps),
    saveUnusedData: booleanOrNull(rawPlan.saveUnusedData),
    familyDiscountAvailable: booleanOrNull(rawPlan.familyDiscountAvailable),
    supportsFamilySharing: booleanOrNull(rawPlan.supportsFamilySharing),
    maxFamilyMembers: numberOrNull(rawPlan.maxFamilyMembers),
    extraSimAvailable: booleanOrNull(rawPlan.extraSimAvailable),
    studentDiscountAvailable: booleanOrNull(rawPlan.studentDiscountAvailable),
    seniorDiscountAvailable: booleanOrNull(rawPlan.seniorDiscountAvailable),
    youthDiscountAvailable: booleanOrNull(rawPlan.youthDiscountAvailable),
    childPlan: booleanOrNull(rawPlan.childPlan),
    bundleDiscountAvailable: booleanOrNull(rawPlan.bundleDiscountAvailable),
    includedStreaming: Array.isArray(rawPlan.includedStreaming) ? rawPlan.includedStreaming : [],
    internationalCallingIncluded: booleanOrNull(rawPlan.internationalCallingIncluded),
    fairUsePolicy: rawPlan.fairUsePolicy || null,
    isFamilyPlan: rawPlan.isFamilyPlan === true || segment === 'family',
    familyPriceType: rawPlan.familyPriceType || null,
    addonPrice: numberOrNull(rawPlan.addonPrice),
    logo: rawPlan.logo || null,
    text: rawPlan.text || null,
    runtimeSellable: false,
    sourceUrl: rawPlan.sourceUrl || snapshot.sourceUrl || null,
    lastChecked: rawPlan.lastChecked || null,
    dataStatus,
    notes: rawPlan.notes || 'Normalized from market-data collector. Requires manual verification before production use.',
  };
};

const normalizeSnapshot = (snapshot = {}) => {
  const rawPlans = Array.isArray(snapshot.rawPlans) ? snapshot.rawPlans : [];
  return {
    operatorId: snapshot.operatorId || null,
    sourceUrl: snapshot.sourceUrl || null,
    fetchedAt: snapshot.fetchedAt || null,
    collectorStatus: snapshot.status || 'unknown',
    plans: rawPlans.map((rawPlan, index) => normalizeRawPlan(rawPlan, snapshot, index)),
  };
};

const normalizeSnapshots = (snapshots = []) => {
  const normalizedOperators = snapshots.map(normalizeSnapshot);
  return {
    generatedAt: new Date().toISOString(),
    operators: normalizedOperators,
    plans: normalizedOperators.flatMap((operator) => operator.plans),
  };
};

module.exports = {
  normalizeRawPlan,
  normalizeSnapshot,
  normalizeSnapshots,
};
