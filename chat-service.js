const fs = require('node:fs');
const path = require('node:path');

const { calculateOfferOptions, MAX_ALLOWED_BINDING_MONTHS } = require('./offer-calculator');
const { getBroadbandPlans, getPlans } = require('./offer-service');

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-4o-mini';
const CHAT_RULES_DIR = path.join(__dirname, 'chat');
const ALLOWED_OPERATORS = ['Telia', 'Tele2', 'Telenor', 'Tre', 'Halebop'];

const sitePages = [
  'Startsida med behovsanalys för mobilabonnemang och familjepaket.',
  'Mobilabonnemang: jämför operatörer, surfmängd, pris och presentkort.',
  'Familjabonnemang: välj antal abonnemang, ny eller befintlig kund, och familjepris.',
  '5G-bredband: jämför 5G/fiber, hastighet, pris, bindningstid, TV-kanaler och täckning.',
  'Jämför täckning: karta för Telia, Tele2, Telenor, Tre och Halebop.',
  'Varukorg: kontaktuppgifter, nummerflytt, startdatum och signering hanteras där.',
  'Kontakt: kundservice för abonnemang, bredband och erbjudanden.',
  'Mina sidor: visar demo-/kundöversikt, valt abonnemang och presentkort.',
];

const compactPlan = (plan) => ({
  id: plan.id,
  operator: plan.operator,
  title: plan.title,
  data: plan.data,
  dataAmount: plan.dataAmount,
  price: plan.price,
  addonPrice: plan.addonPrice,
  category: plan.category,
  isFamilyPlan: Boolean(plan.isFamilyPlan),
  familyPriceType: plan.familyPriceType || null,
  text: plan.text || '',
});

const compactBroadbandPlan = (plan) => ({
  id: plan.id,
  operator: plan.operator,
  title: plan.title,
  technology: plan.technology,
  speed: plan.speed,
  speedMbps: plan.speedMbps,
  price: plan.price,
  bindingMonths: 24,
  features: plan.features || [],
  hasTv: Boolean(plan.tv?.channels?.length),
  tvChannels: plan.tv?.channels || [],
});

const buildKnowledge = () => ({
  site: {
    name: 'Dealett',
    tagline: 'bättre deals, helt enkelt.',
    languages: ['sv', 'en'],
    contactEmail: 'Info@minsida.com',
    contactPhone: '08-123 45 67',
    contactAddress: 'Hamngatan 20, 111 47 Stockholm',
    pages: sitePages,
    rewardGiftCards: ['Apollo', 'H&M', 'Hotel', 'ICA Maxi', 'Mio', 'Zalando', 'Elgiganten', 'Ticketmaster'],
    purchaseFlow: 'När kunden vill köpa eller signera ska de fortsätta i varukorgen. Samla inte namn, e-post eller telefon i chatten.',
  },
  mobilePlans: getPlans().map(compactPlan),
  broadbandPlans: getBroadbandPlans().map(compactBroadbandPlan),
});

const loadChatRules = () => {
  if (!fs.existsSync(CHAT_RULES_DIR)) return {};

  return fs.readdirSync(CHAT_RULES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .sort((left, right) => left.name.localeCompare(right.name))
    .reduce((rules, entry) => {
      const key = entry.name.replace(/\.json$/, '');
      const filePath = path.join(CHAT_RULES_DIR, entry.name);
      rules[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return rules;
    }, {});
};

const trimMessages = (messages = []) => (
  Array.isArray(messages)
    ? messages
      .slice(-8)
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: String(message.content || '').slice(0, 1000),
      }))
      .filter((message) => message.content)
    : []
);

const extractOutputText = (response) => {
  if (typeof response.output_text === 'string') return response.output_text;

  const parts = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) {
        parts.push(content.text);
      }
    }
  }

  return parts.join('\n').trim();
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text || '').match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
};

const hasOutsideTopic = (message) => (
  /elavtal|elbolag|hemförsäkring|försäkring|insurance|electricity|bank|bolån|lån|loan|matkasse|flyg|flight|resa|travel/i
    .test(String(message || ''))
);

const hasDealettTopic = (message) => (
  /dealett|abonnemang|mobil|telefon|telekom|bredband|5g|fiber|täckning|operator|operatör|telia|tele2|telenor|tre|halebop|presentkort|gift card|surf|varukorg|cart/i
    .test(String(message || ''))
);

const isGreetingOnly = (message) => (
  /^(hej|hejsan|hallå|tjena|god morgon|god kväll|hello|hi|hey|good morning|good evening)[!.\s]*$/i
    .test(String(message || '').trim())
);

const isMetaHelpIntent = (message) => (
  /vad kan du|hjälp|help|what can you do|vad gör du|who are you|vem är du/i
    .test(String(message || ''))
);

const isPurchaseIntent = (message) => (
  /signera|signering|köp|köpa|beställ|beställa|lägg.*varukorg|varukorg|flytta.*nummer|nummerflytt|telefonnummer|personnummer|bankid|startdatum|datum.*börjar|börjar.*abonnemang|buy|purchase|sign|checkout|cart|phone number|personal number|start date/i
    .test(String(message || ''))
);

const isCustomerServiceIntent = (message) => (
  /faktura|räkning|betalning|nästa.*(faktura|betalning)|förfall|invoice|bill|payment|due|mitt abonnemang|min bindningstid|hur länge|subscription length|my subscription|contract length|avtal|kundservice|support|mina sidor|konto|account|logga in|login|ändra|uppgradera|säga upp|cancel/i
    .test(String(message || ''))
);

const isMobileIntent = (message) => (
  /mobil|abonnemang|telefon|surf|sms|samtal|familj|familje|mobile|subscription|phone plan|data plan|family plan/i
    .test(String(message || ''))
);

const isBroadbandIntent = (message, page = {}) => {
  const text = String(message || '');
  const onBroadbandPage = String(page?.path || '').includes('5g-bredband');
  const strongBroadbandWords = /bredband|5g[-\s]?bredband|fiber|router|täckning|karta|adress|källare|basement|coverage|broadband|tv-kanal|tv kanal/i
    .test(text);
  const pageBroadbandWords = /wifi|wi-fi|netflix|tv/i.test(text);

  return strongBroadbandWords || (onBroadbandPage && pageBroadbandWords && !isMobileIntent(text));
};

const hasQualificationSignal = (message, qualification = {}) => {
  const text = String(message || '');
  if (isMobileIntent(text)) return true;
  if (/bindningstid|operatör|operator|telia|tele2|telenor|tre|halebop|pris|betalar|kostar|kr|sek|surf|stream|obegränsad|wifi/i.test(text)) {
    return true;
  }

  return Boolean(
    qualification.peopleCount ||
    qualification.mobileUsage ||
    qualification.priceRange ||
    qualification.exactMonthlyPrice ||
    (Array.isArray(qualification.operators) && qualification.operators.length) ||
    (Array.isArray(qualification.bindingEnds) && qualification.bindingEnds.length) ||
    (Array.isArray(qualification.exactMonthlyPrices) && qualification.exactMonthlyPrices.length)
  );
};

const isUnrelatedMessage = (message, page = {}, qualification = {}) => {
  const text = String(message || '');
  if (!text.trim()) return false;
  if (isGreetingOnly(text) || isMetaHelpIntent(text)) return false;
  if (hasDealettTopic(text) || hasOutsideTopic(text)) return false;
  if (isPurchaseIntent(text) || isCustomerServiceIntent(text)) return false;
  if (isBroadbandIntent(text, page) || hasQualificationSignal(text, qualification)) return false;
  return true;
};

const countUnrelatedUserMessages = ({ messages = [], latestMessage = '', page = {}, qualification = {} }) => (
  [
    ...trimMessages(messages).filter((message) => message.role === 'user').map((message) => message.content),
    latestMessage,
  ].filter((content) => isUnrelatedMessage(content, page, qualification)).length
);

const extractBindingAnswersFromText = (text, peopleCount, currentBindingEnds = []) => {
  const source = String(text || '');
  const lower = source.toLowerCase();
  const matches = [];
  const pattern = /\b(\d{4}-\d{2}-\d{2})\b|ingen bindningstid|no contract|no binding|vet inte|don't know|dont know|(\d+)\s*(mån|månad|månader|manader|month|months)/gi;

  for (const match of source.matchAll(pattern)) {
    const before = lower.slice(Math.max(0, match.index - 10), match.index);
    if (match[2] && /\binte\s*$|\bnot\s*$/i.test(before)) continue;

    if (match[1]) {
      matches.push(match[1]);
    } else if (match[2]) {
      matches.push(`${Number(match[2])} months`);
    } else if (/vet inte|don't know|dont know/i.test(match[0])) {
      matches.push('Vet inte');
    } else {
      matches.push('Ingen bindningstid');
    }
  }

  if (!matches.length) return null;

  const count = Number(peopleCount) || currentBindingEnds.length || 1;
  const appliesToAll = /alla|samtliga|båda|both|all/i.test(lower);
  if (matches.length === 1 && appliesToAll) {
    return Array.from({ length: count }, () => matches[0]);
  }

  if (
    matches.length === 1 &&
    currentBindingEnds.length &&
    currentBindingEnds.some((bindingEnd) => /vet/i.test(String(bindingEnd || '')))
  ) {
    const next = [...currentBindingEnds];
    const unknownIndex = next.findIndex((bindingEnd) => /vet/i.test(String(bindingEnd || '')));
    next[unknownIndex] = matches[0];
    return next.slice(0, count);
  }

  if (matches.length === 1 && count === 1) return [matches[0]];

  return matches.slice(0, count);
};

const createEmptyQualification = () => ({
  peopleCount: null,
  operators: [],
  bindingEnds: [],
  mobileUsage: null,
  priceRange: null,
  exactMonthlyPrice: null,
  exactMonthlyPrices: [],
  readyForOffer: false,
  missingFields: [
    'peopleCount',
    'operators',
    'bindingEnds',
    'mobileUsage',
    'priceRange',
  ],
});

const normalizeOperator = (value) => {
  const normalized = String(value || '').trim();
  return ALLOWED_OPERATORS.find((operator) => operator.toLowerCase() === normalized.toLowerCase()) ||
    (normalized ? normalized.slice(0, 40) : null);
};

const normalizeBindingEnd = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  if (/ingen/i.test(normalized)) return 'Ingen bindningstid';
  if (/vet/i.test(normalized)) return 'Vet inte';
  return normalized.slice(0, 40);
};

const appendUntilPeopleCount = (items, value, peopleCount) => {
  const nextItems = Array.isArray(items) ? [...items] : [];
  const limit = Number(peopleCount) || 10;

  while (nextItems.length < limit) {
    nextItems.push(value);
  }

  return nextItems.slice(0, limit);
};

const inferQualificationFromText = (message, qualification = {}) => {
  const text = String(message || '');
  const lower = text.toLowerCase();
  const next = {
    ...qualification,
    operators: Array.isArray(qualification.operators) ? [...qualification.operators] : [],
    bindingEnds: Array.isArray(qualification.bindingEnds) ? [...qualification.bindingEnds] : [],
    exactMonthlyPrices: Array.isArray(qualification.exactMonthlyPrices) ? [...qualification.exactMonthlyPrices] : [],
  };
  const countMatch = lower.match(/(\d+)\s*(person|personer|abonnemang|subscriptions?|people)/);

  if (countMatch) {
    next.peopleCount = Number(countMatch[1]);
  } else if (/\b(one|en|ett)\s*(subscription|abonnemang|person)?\b/i.test(lower)) {
    next.peopleCount = 1;
  } else if (/\b(two|två)\s*(subscriptions?|abonnemang|personer|people)?\b/i.test(lower)) {
    next.peopleCount = 2;
  } else if (/\b(three|tre)\s*(subscriptions?|abonnemang|personer|people)?\b/i.test(lower)) {
    next.peopleCount = 3;
  } else if (/\b(four|fyra)\s*(subscriptions?|abonnemang|personer|people)?\b/i.test(lower)) {
    next.peopleCount = 4;
  } else if (/bara jag|bara mig|just me|only me/i.test(lower)) {
    next.peopleCount = 1;
  }

  const operatorMatches = [...text.matchAll(/\b(Telia|Tele2|Telenor|Tre|Halebop)\b/gi)]
    .map((match) => match[1])
    .map(normalizeOperator)
    .filter(Boolean);
  if (operatorMatches.length) {
    if (operatorMatches.length === 1 && /alla|samtliga|all/i.test(lower)) {
      next.operators = appendUntilPeopleCount(next.operators, operatorMatches[0], next.peopleCount);
    } else {
      next.operators = [...next.operators, ...operatorMatches].slice(0, Number(next.peopleCount) || 10);
    }
  }

  const bindingAnswers = extractBindingAnswersFromText(text, next.peopleCount, next.bindingEnds);
  if (bindingAnswers) {
    next.bindingEnds = bindingAnswers;
  }

  if (/wifi|social|sociala medier|lite surf/i.test(lower)) next.mobileUsage = 'low';
  if (/stream|video|youtube|netflix|hbo|disney/i.test(lower)) next.mobileUsage = 'medium';
  if (/max surf|obegränsad|obegransad|unlimited|100\s*gb/i.test(lower)) next.mobileUsage = 'high';

  const priceSource = lower.replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ');
  const exactPrices = (
    /pris|priser|betalar|kostar|kr|sek|price|pay|cost/i.test(priceSource)
      ? [...priceSource.matchAll(/\b(\d{2,4})\b/g)]
      : [...priceSource.matchAll(/(\d{2,4})\s*(kr|sek)/g)]
  )
    .map((match) => Number(match[1]))
    .filter((price) => Number.isFinite(price) && price >= 50 && price <= 2000);
  if (exactPrices.length) {
    const exactPrice = exactPrices[0];
    const rangePrice = exactPrices.length > 1
      ? Math.round(exactPrices.reduce((sum, price) => sum + price, 0) / exactPrices.length)
      : exactPrice;
    next.exactMonthlyPrice = exactPrice;
    if (exactPrices.length > 1) {
      next.exactMonthlyPrices = [...next.exactMonthlyPrices, ...exactPrices]
        .slice(0, Number(next.peopleCount) || 10);
    } else if (/alla|samtliga|all/i.test(lower)) {
      next.exactMonthlyPrices = appendUntilPeopleCount(next.exactMonthlyPrices, exactPrice, next.peopleCount);
    } else if (Number(next.peopleCount) > 1 && next.exactMonthlyPrices.length < Number(next.peopleCount)) {
      next.exactMonthlyPrices = [...next.exactMonthlyPrices, exactPrice].slice(0, Number(next.peopleCount));
    }

    if (rangePrice < 300) next.priceRange = 'under300';
    else if (rangePrice < 400) next.priceRange = '300-400';
    else next.priceRange = '400-500';
  } else if (/under\s*300/i.test(lower)) {
    next.priceRange = 'under300';
  } else if (/300\s*[–\-]\s*400/i.test(lower)) {
    next.priceRange = '300-400';
  } else if (/400\s*[–\-]\s*500|500\+/i.test(lower)) {
    next.priceRange = '400-500';
  }

  return normalizeQualification(next);
};

const normalizeQualification = (qualification = {}) => {
  const peopleCount = Number.isFinite(Number(qualification.peopleCount)) && Number(qualification.peopleCount) > 0
    ? Math.min(Math.round(Number(qualification.peopleCount)), 10)
    : null;
  const operators = Array.isArray(qualification.operators)
    ? qualification.operators.map(normalizeOperator).filter(Boolean).slice(0, peopleCount || 10)
    : [];
  const bindingEnds = Array.isArray(qualification.bindingEnds)
    ? qualification.bindingEnds.map(normalizeBindingEnd).filter(Boolean).slice(0, peopleCount || 10)
    : [];
  const mobileUsage = ['low', 'medium', 'high'].includes(qualification.mobileUsage)
    ? qualification.mobileUsage
    : null;
  const priceRange = ['under300', '300-400', '400-500'].includes(qualification.priceRange)
    ? qualification.priceRange
    : null;
  const exactMonthlyPrice = Number(qualification.exactMonthlyPrice) > 0
    ? Math.round(Number(qualification.exactMonthlyPrice))
    : null;
  const exactMonthlyPrices = Array.isArray(qualification.exactMonthlyPrices)
    ? qualification.exactMonthlyPrices
      .map((price) => Number(price))
      .filter((price) => Number.isFinite(price) && price > 0)
      .map((price) => Math.round(price))
      .slice(0, peopleCount || 10)
    : [];

  const missingFields = [];
  if (!peopleCount) missingFields.push('peopleCount');
  if (!peopleCount || operators.length < peopleCount) missingFields.push('operators');
  if (!peopleCount || bindingEnds.length < peopleCount) missingFields.push('bindingEnds');
  if (!mobileUsage) missingFields.push('mobileUsage');
  if (!priceRange && !exactMonthlyPrice && (!peopleCount || exactMonthlyPrices.length < peopleCount)) {
    missingFields.push('priceRange');
  }

  return {
    peopleCount,
    operators,
    bindingEnds,
    mobileUsage,
    priceRange,
    exactMonthlyPrice,
    exactMonthlyPrices,
    readyForOffer: missingFields.length === 0,
    missingFields,
  };
};

const isOutsideDealettScope = (message) => hasOutsideTopic(message) && !hasDealettTopic(message);

const getSuggestionAction = (label, action) => {
  if (
    action === 'openBroadbandPage' ||
    action === 'openBroadbandAddress' ||
    action === 'openCoverageMap' ||
    action === 'openCart' ||
    action === 'openAccount' ||
    action === 'openContact'
  ) return action;

  if (/skriv adress|ange adress|sök adress|enter address|search address/i.test(label)) {
    return 'openBroadbandAddress';
  }

  if (/öppna.*(5g|bredband)|5g[-\s]?bredband|broadband/i.test(label)) {
    return 'openBroadbandPage';
  }

  if (/täckningskarta|coverage map|öppna.*karta/i.test(label)) {
    return 'openCoverageMap';
  }

  if (/mina sidor|konto|account/i.test(label)) {
    return 'openAccount';
  }

  if (/kontakt|support|kundservice|contact/i.test(label)) {
    return 'openContact';
  }

  return null;
};

const sanitizeQualificationPatch = (patch) => {
  if (!patch || typeof patch !== 'object') return null;

  const sanitized = {};
  const peopleCount = Number(patch.peopleCount);
  if (Number.isFinite(peopleCount) && peopleCount > 0) {
    sanitized.peopleCount = Math.min(Math.round(peopleCount), 10);
  }

  if (Array.isArray(patch.operators)) {
    const operators = patch.operators
      .map((operator) => ALLOWED_OPERATORS.find((allowed) =>
        allowed.toLowerCase() === String(operator || '').trim().toLowerCase()
      ))
      .filter(Boolean);

    if (operators.length) sanitized.operators = operators;
  }

  if (Array.isArray(patch.bindingEnds)) {
    const bindingEnds = patch.bindingEnds.map(normalizeBindingEnd).filter(Boolean);
    if (bindingEnds.length) sanitized.bindingEnds = bindingEnds;
  }

  if (['low', 'medium', 'high'].includes(patch.mobileUsage)) {
    sanitized.mobileUsage = patch.mobileUsage;
  }

  if (['under300', '300-400', '400-500'].includes(patch.priceRange)) {
    sanitized.priceRange = patch.priceRange;
  }

  if (Number(patch.exactMonthlyPrice) > 0) {
    sanitized.exactMonthlyPrice = Math.round(Number(patch.exactMonthlyPrice));
  }

  if (Array.isArray(patch.exactMonthlyPrices)) {
    const exactMonthlyPrices = patch.exactMonthlyPrices
      .map((price) => Number(price))
      .filter((price) => Number.isFinite(price) && price > 0)
      .map((price) => Math.round(price));

    if (exactMonthlyPrices.length) sanitized.exactMonthlyPrices = exactMonthlyPrices;
  }

  return Object.keys(sanitized).length ? sanitized : null;
};

const buildDefaultSuggestions = (qualification, offerCalculation, language) => {
  const isEnglish = language === 'en';

  if (offerCalculation?.validOfferAvailable === true) {
    return isEnglish
      ? ['Explain calculation', 'Help with broadband', 'Explain gift cards']
      : ['Förklara kalkylen', 'Hjälp med bredband', 'Förklara presentkort'];
  }

  if (offerCalculation?.validOfferAvailable === false) {
    if (/mer än 6 månader/i.test(offerCalculation.noOfferReason || '')) {
      return isEnglish
        ? ['Explain contract period', 'Compare again later', 'Help with broadband']
        : ['Förklara bindningstid', 'Jämför igen senare', 'Hjälp med bredband'];
    }

    if (/billigare/i.test(offerCalculation.noOfferReason || '')) {
      return isEnglish
        ? ['Explain calculation', 'Change data need', 'Help with broadband']
        : ['Förklara kalkylen', 'Ändra surfbehov', 'Hjälp med bredband'];
    }

    return isEnglish
      ? ['No contract', '1 month left', '3 months left', '6 months left']
      : ['Ingen bindningstid', '1 månad kvar', '3 månader kvar', '6 månader kvar'];
  }

  if (!qualification.peopleCount) {
    return ['1', '2', '3', '4'].map((label) => ({
      label: isEnglish ? `${label} subscription${label === '1' ? '' : 's'}` : `${label} abonnemang`,
      qualificationPatch: { peopleCount: Number(label) },
      action: null,
    }));
  }

  if (qualification.missingFields.includes('operators')) {
    return ALLOWED_OPERATORS.map((label) => ({ label, qualificationPatch: null, action: null }));
  }

  if (qualification.missingFields.includes('bindingEnds')) {
    return isEnglish
      ? ['No contract', '1 month left', '3 months left', '6 months left']
      : ['Ingen bindningstid', '1 månad kvar', '3 månader kvar', '6 månader kvar'];
  }

  if (qualification.missingFields.includes('mobileUsage')) {
    return isEnglish
      ? [
        { label: 'Mostly Wi-Fi', qualificationPatch: { mobileUsage: 'low' }, action: null },
        { label: 'Streaming & video', qualificationPatch: { mobileUsage: 'medium' }, action: null },
        { label: 'Maximum data', qualificationPatch: { mobileUsage: 'high' }, action: null },
      ]
      : [
        { label: 'Mest wifi & sociala medier', qualificationPatch: { mobileUsage: 'low' }, action: null },
        { label: 'Streaming & video', qualificationPatch: { mobileUsage: 'medium' }, action: null },
        { label: 'Max surf', qualificationPatch: { mobileUsage: 'high' }, action: null },
      ];
  }

  if (qualification.missingFields.includes('priceRange')) {
    return isEnglish
      ? ['Under 300 SEK', '300-400 SEK', '400-500+ SEK']
      : ['Under 300 kr', '300-400 kr', '400-500+ kr'];
  }

  return isEnglish
    ? ['Compare mobile plans', 'Help with broadband', 'Explain gift cards']
    : ['Jämför mobilabonnemang', 'Hjälp med bredband', 'Förklara presentkort'];
};

const normalizeSuggestions = (
  rawSuggestions,
  qualification,
  offerCalculation,
  language,
  { useQualificationDefaults = true } = {}
) => {
  if (
    offerCalculation?.validOfferAvailable === true ||
    offerCalculation?.validOfferAvailable === false
  ) {
    return buildDefaultSuggestions(qualification, offerCalculation, language);
  }

  const cleaned = (Array.isArray(rawSuggestions) ? rawSuggestions : [])
    .flatMap((item) => {
      const suggestion = typeof item === 'object' && item
        ? item
        : { label: String(item || '').trim() };
      const label = String(suggestion.label || '').trim();

      if (
        !label ||
        label.includes('|') ||
        /^operatör$/i.test(label) ||
        /^ange (operatör|bindningstid)$/i.test(label) ||
        /^berätta/i.test(label)
      ) {
        return [];
      }

      return [{
        label,
        qualificationPatch: sanitizeQualificationPatch(suggestion.qualificationPatch),
        action: getSuggestionAction(label, suggestion.action),
      }];
    })
    .slice(0, 4);
  if (!useQualificationDefaults) {
    return cleaned.length
      ? cleaned
      : (language === 'en'
        ? ['New offer', 'Existing customer', 'Billing question', 'Cart']
        : ['Nytt erbjudande', 'Befintlig kund', 'Fakturafråga', 'Varukorg']);
  }

  const hasNavigationAction = cleaned.some((suggestion) => suggestion.action);
  const hasOperatorButton = cleaned.some((suggestion) =>
    ALLOWED_OPERATORS.includes(suggestion.label)
  );
  const hasBindingButton = cleaned.some((suggestion) =>
    /ingen bindningstid|vet inte|\d+\s*(månad|månader|month|months)/i.test(suggestion.label)
  );

  if (qualification.missingFields.includes('operators') && !hasNavigationAction && !hasOperatorButton) {
    return buildDefaultSuggestions(qualification, offerCalculation, language);
  }

  if (qualification.missingFields.includes('bindingEnds') && !hasNavigationAction && !hasBindingButton) {
    return buildDefaultSuggestions(qualification, offerCalculation, language);
  }

  return cleaned.length
    ? cleaned
    : buildDefaultSuggestions(qualification, offerCalculation, language);
};

const buildValidOfferReply = (offerCalculation, language) => {
  if (!offerCalculation?.validOfferAvailable || !offerCalculation.options?.length) return null;

  const [topOption] = offerCalculation.options;
  const estimateText = topOption.currentMonthlyPriceIsEstimate
    ? (language === 'en'
      ? ' The current price is estimated from the selected price range, so exact current prices make the calculation safer.'
      : ' Nuvarande pris är uppskattat från valt prisintervall, så exakt nuvarande pris gör kalkylen säkrare.')
    : '';

  if (language === 'en') {
    return `I found ${offerCalculation.options.length} valid option${offerCalculation.options.length === 1 ? '' : 's'}. Best match right now is ${topOption.operator} ${topOption.title} for ${topOption.monthlyPrice} SEK/month. The calculation includes ${topOption.contractMonths} months contract period, about ${topOption.overlapCostKnown} SEK overlap cost, and ${topOption.rewardTotal} SEK gift card. Estimated saving versus staying is ${topOption.savingsVsStaying} SEK. Choose one of the offer cards below to add it to the cart.${estimateText}`;
  }

  return `Jag hittade ${offerCalculation.options.length} giltiga alternativ. Bäst match just nu är ${topOption.operator} ${topOption.title} för ${topOption.monthlyPrice} kr/mån. Kalkylen räknar med ${topOption.contractMonths} mån bindningstid, cirka ${topOption.overlapCostKnown} kr i dubbelkostnad och ${topOption.rewardTotal} kr i presentkort. Uppskattad vinst mot att stanna är ${topOption.savingsVsStaying} kr. Välj ett erbjudandekort nedan för att lägga det i varukorgen.${estimateText}`;
};

const buildWelcomeResponse = (language, qualification) => {
  const normalizedQualification = normalizeQualification(qualification);
  const isEnglish = language === 'en';

  return {
    reply: isEnglish
      ? 'Hi! I am Dealett assistant. I can help you compare new mobile or broadband offers, explain gift cards and coverage, help with the cart, or guide existing customers with account, subscription, and billing questions. What would you like help with?'
      : 'Hej! Jag är Dealett assistant. Jag kan hjälpa dig jämföra nya mobil- eller bredbandserbjudanden, förklara presentkort och täckning, hjälpa med varukorgen eller guida befintliga kunder kring konto, abonnemang och faktura. Vad vill du ha hjälp med?',
    qualification: normalizedQualification,
    offerCalculation: calculateOfferOptions(normalizedQualification),
    suggestions: isEnglish
      ? ['Compare offers', 'Existing customer', 'My cart', '5G broadband']
      : ['Jämför erbjudanden', 'Befintlig kund', 'Min varukorg', '5G-bredband'],
  };
};

const buildUnclearIntentResponse = ({ message, language, qualification, unrelatedCount }) => {
  const normalizedQualification = normalizeQualification(qualification);
  const isEnglish = language === 'en';
  const shouldAskDirectly = unrelatedCount >= 5;

  return {
    reply: isEnglish
      ? (shouldAskDirectly
        ? 'I am happy to keep it friendly, but to help properly I need to understand what you need from Dealett. Is it a new offer, an existing subscription, a bill, coverage, broadband, or the cart?'
        : 'I am here with you. I can chat a little, but I am most useful when I know what you need from Dealett: offers, existing subscription help, bills, coverage, broadband, or the cart.')
      : (shouldAskDirectly
        ? 'Jag hänger med och kan hålla tonen avslappnad, men för att hjälpa dig på riktigt behöver jag förstå vad du vill ha från Dealett. Gäller det nytt erbjudande, befintligt abonnemang, faktura, täckning, bredband eller varukorg?'
        : 'Jag är med dig. Jag kan snacka lite, men jag är mest hjälpsam när jag vet vad du behöver hos Dealett: erbjudanden, befintligt abonnemang, faktura, täckning, bredband eller varukorg.'),
    qualification: normalizedQualification,
    offerCalculation: calculateOfferOptions(normalizedQualification),
    suggestions: isEnglish
      ? ['New offer', 'Existing customer', 'Billing question', 'Coverage']
      : ['Nytt erbjudande', 'Befintlig kund', 'Fakturafråga', 'Täckning'],
  };
};

const buildOutsideScopeResponse = (language, qualification) => {
  const normalizedQualification = normalizeQualification(qualification);

  return {
    reply: language === 'en'
      ? 'I can keep the conversation friendly, but I cannot give reliable help on that topic. My job is Dealett customer service: offers, existing subscription guidance, bills, coverage, broadband, gift cards, cart, and website support. What do you need help with at Dealett?'
      : 'Jag kan hålla samtalet trevligt, men jag kan inte ge pålitlig hjälp om just det ämnet. Mitt jobb är Dealett-kundservice: erbjudanden, befintliga abonnemang, faktura, täckning, bredband, presentkort, varukorg och webbplatsstöd. Vad behöver du hjälp med hos Dealett?',
    qualification: normalizedQualification,
    offerCalculation: calculateOfferOptions(normalizedQualification),
    suggestions: language === 'en'
      ? ['New offer', 'Existing customer', 'Billing question', 'Cart']
      : ['Nytt erbjudande', 'Befintlig kund', 'Fakturafråga', 'Varukorg'],
  };
};

const buildMixedScopeResponse = (language, qualification) => {
  const normalizedQualification = normalizeQualification(qualification);
  const offerCalculation = calculateOfferOptions(normalizedQualification);

  return {
    reply: language === 'en'
      ? 'I can help with the Dealett mobile/broadband part, but not insurance, electricity contracts, loans, or other services. For the subscription part, I can compare Dealett offers when I know the missing details.'
      : 'Jag kan hjälpa med Dealetts mobilabonnemang och bredband, men inte hemförsäkring, elavtal, lån eller andra tjänster. För abonnemangsdelen kan jag jämföra Dealetts erbjudanden när jag har de uppgifter som saknas.',
    qualification: normalizedQualification,
    offerCalculation,
    suggestions: buildDefaultSuggestions(normalizedQualification, offerCalculation, language),
  };
};

const buildPurchaseResponse = (language, qualification, cart = []) => {
  const normalizedQualification = normalizeQualification(qualification);
  const offerCalculation = calculateOfferOptions(normalizedQualification);
  const hasCart = Array.isArray(cart) && cart.length > 0;
  const hasValidOffer = offerCalculation.validOfferAvailable === true;

  const reply = (() => {
    if (language === 'en') {
      if (hasCart) {
        return 'Do not send phone numbers, personal identity numbers, BankID details, or contact details in the chat. Continue in the cart instead; number transfer, start date, contact details, and signing are handled there.';
      }

      if (hasValidOffer) {
        return 'Do not send phone numbers or personal details in the chat. Use the “add to cart” button on the recommended offer, then continue in the cart for number transfer, start date, contact details, and signing.';
      }

      return 'I cannot collect phone numbers, personal identity numbers, BankID details, or contact details in the chat. First choose a valid Dealett offer, then continue in the cart.';
    }

    if (hasCart) {
      return 'Skicka inte telefonnummer, personnummer, BankID-uppgifter eller kontaktuppgifter i chatten. Fortsätt i varukorgen istället; nummerflytt, startdatum, kontaktuppgifter och signering hanteras där.';
    }

    if (hasValidOffer) {
      return 'Skicka inte telefonnummer eller personuppgifter i chatten. Använd knappen “Lägg i varukorg” på det rekommenderade erbjudandet och fortsätt sedan i varukorgen för nummerflytt, startdatum, kontaktuppgifter och signering.';
    }

    return 'Jag kan inte samla telefonnummer, personnummer, BankID-uppgifter eller kontaktuppgifter i chatten. Välj först ett giltigt Dealett-erbjudande och fortsätt sedan i varukorgen.';
  })();

  return {
    reply,
    qualification: normalizedQualification,
    offerCalculation,
    suggestions: hasCart
      ? [{ label: language === 'en' ? 'Open cart' : 'Öppna varukorg', qualificationPatch: null, action: 'openCart' }]
      : buildDefaultSuggestions(normalizedQualification, offerCalculation, language),
  };
};

const getFirstCartItem = (cart = []) => (Array.isArray(cart) && cart.length ? cart[0] : null);

const buildCustomerServiceResponse = (message, language, qualification, cart = []) => {
  const normalizedQualification = normalizeQualification(qualification);
  const offerCalculation = calculateOfferOptions(normalizedQualification);
  const text = String(message || '').toLowerCase();
  const isEnglish = language === 'en';
  const item = getFirstCartItem(cart);
  const hasCart = Boolean(item);
  const asksBill = /faktura|räkning|betalning|förfall|invoice|bill|payment|due/.test(text);
  const asksSubscriptionLength = /hur länge|min bindningstid|bindningstid|subscription length|contract length|how long/.test(text);
  const asksAccount = /konto|mina sidor|logga in|login|account/.test(text);
  const selectedPlan = hasCart
    ? `${item.operator || 'Dealett'} ${item.title || item.data || 'abonnemang'}`
    : null;

  let reply;
  if (asksBill) {
    reply = isEnglish
      ? (hasCart
        ? `I can see your selected ${selectedPlan}, but I do not have live invoice data in the chat. For an exact next payment date, use My pages or contact support.`
        : 'I do not have live invoice data in the chat. For the exact next payment date, use My pages or contact support.')
      : (hasCart
        ? `Jag ser ditt valda ${selectedPlan}, men jag har inte live-data om fakturor i chatten. För exakt nästa betalningsdatum behöver du använda Mina sidor eller kontakta support.`
        : 'Jag har inte live-data om fakturor i chatten. För exakt nästa betalningsdatum behöver du använda Mina sidor eller kontakta support.');
  } else if (asksSubscriptionLength) {
    reply = isEnglish
      ? (hasCart
        ? `${selectedPlan} is shown in your cart. Dealett offers use 24 months contract period unless the final operator terms say otherwise. For exact time remaining on an already active subscription, use My pages or support.`
        : 'Dealett offers use 24 months contract period. For exact time remaining on an already active subscription, use My pages or support because I do not have your live account data in chat.')
      : (hasCart
        ? `${selectedPlan} finns i din varukorg. Dealetts erbjudanden har 24 månaders bindningstid om inget annat framgår i slutliga operatörsvillkor. För exakt tid kvar på ett redan aktivt abonnemang behöver du Mina sidor eller support.`
        : 'Dealetts erbjudanden har 24 månaders bindningstid. För exakt tid kvar på ett redan aktivt abonnemang behöver du Mina sidor eller support eftersom jag inte har live-kontodata i chatten.');
  } else if (asksAccount) {
    reply = isEnglish
      ? 'For account-specific details, use My pages. I can still explain what the fields mean, help with the cart, or guide you to the right next step.'
      : 'För kontospecifika uppgifter använder du Mina sidor. Jag kan ändå förklara vad fälten betyder, hjälpa med varukorgen eller guida dig till rätt nästa steg.';
  } else {
    reply = isEnglish
      ? 'I can help as Dealett customer service. For existing customers I can explain subscription period, cart status, gift cards, number transfer, start date, and where to find billing/account details. What do you want to check?'
      : 'Jag kan hjälpa som Dealett-kundservice. För befintliga kunder kan jag förklara bindningstid, varukorg, presentkort, nummerflytt, startdatum och var du hittar faktura/kontouppgifter. Vad vill du kolla?';
  }

  return {
    reply,
    qualification: normalizedQualification,
    offerCalculation,
    suggestions: isEnglish
      ? [
        { label: 'Open account', qualificationPatch: null, action: 'openAccount' },
        { label: 'Open cart', qualificationPatch: null, action: 'openCart' },
        'Billing question',
        'New offer',
      ]
      : [
        { label: 'Öppna Mina sidor', qualificationPatch: null, action: 'openAccount' },
        { label: 'Öppna varukorg', qualificationPatch: null, action: 'openCart' },
        'Fakturafråga',
        'Nytt erbjudande',
      ],
  };
};

const buildBroadbandResponse = (message, language) => {
  const text = String(message || '').toLowerCase();
  const asksGuarantee = /garantera|garanti|guarantee|säkert|funkar|works|källare|basement/.test(text);
  const asksMap = /öppna.*karta|kartan|map|coverage/.test(text);
  const asksRouterOrTv = /router|netflix|tv/.test(text);

  const reply = (() => {
    if (language === 'en') {
      if (asksGuarantee) {
        return 'I cannot guarantee indoor coverage or basement performance from chat. Use the coverage map or enter the address on the 5G broadband page, and treat the result as guidance rather than a guarantee.';
      }

      if (asksMap) {
        return 'Open the coverage map to check the area. Exact availability still depends on the address and operator coverage.';
      }

      if (asksRouterOrTv) {
        return 'I can compare Dealett broadband offers by speed, price, contract period, TV channels, and gift card. I cannot judge router design from the current data, and exact availability requires address/map check.';
      }

      return 'For 5G broadband, the best next step is to enter the address on the 5G broadband page or open the coverage map. I should not promise exact availability before that check.';
    }

    if (asksGuarantee) {
      return 'Jag kan inte garantera inomhustäckning eller funktion i källare från chatten. Använd täckningskartan eller skriv adress på 5G-bredbandssidan och se resultatet som vägledning, inte garanti.';
    }

    if (asksMap) {
      return 'Öppna täckningskartan för att kontrollera området. Exakt tillgänglighet beror fortfarande på adress och operatörernas täckning.';
    }

    if (asksRouterOrTv) {
      return 'Jag kan jämföra Dealetts bredbandserbjudanden efter hastighet, pris, bindningstid, TV-kanaler och presentkort. Jag kan inte bedöma routerdesign från nuvarande data, och exakt tillgänglighet kräver adress/kartkontroll.';
    }

    return 'För 5G-bredband är bästa nästa steg att skriva adress på 5G-bredbandssidan eller öppna täckningskartan. Jag ska inte lova exakt tillgänglighet innan den kontrollen.';
  })();

  return {
    reply,
    qualification: createEmptyQualification(),
    offerCalculation: calculateOfferOptions(createEmptyQualification()),
    suggestions: [
      { label: language === 'en' ? 'Enter address' : 'Skriv adress', qualificationPatch: null, action: 'openBroadbandAddress' },
      { label: language === 'en' ? 'Open coverage map' : 'Öppna täckningskarta', qualificationPatch: null, action: 'openCoverageMap' },
      { label: language === 'en' ? 'Show offers' : 'Visa erbjudanden', qualificationPatch: null, action: 'openBroadbandPage' },
    ],
  };
};

const normalizeChatResponse = (
  payload,
  language,
  currentQualification = {},
  { qualificationActive = true } = {}
) => {
  const fallback = language === 'en'
    ? 'I can help with Dealett plans, coverage, rewards, and the cart. What would you like to compare?'
    : 'Jag kan hjälpa dig med Dealetts abonnemang, täckning, presentkort och varukorg. Vad vill du jämföra?';

  const qualification = normalizeQualification({
    ...(payload?.qualification || {}),
    ...currentQualification,
  });
  const offerCalculation = calculateOfferOptions(qualification);
  const validOfferReply = buildValidOfferReply(offerCalculation, language);
  const noOfferReply = (() => {
    if (!qualification.readyForOffer || offerCalculation.validOfferAvailable !== false) return null;

    if (/mer än 6 månader/i.test(offerCalculation.noOfferReason || '')) {
      return language === 'en'
        ? 'Right now I should not recommend switching, because at least one subscription has more than 6 months left on the contract. Dealett should only make an offer when every subscription has 6 months or less remaining and the total calculation is cheaper after overlap cost and gift card.'
        : 'Just nu ska jag inte rekommendera ett byte, eftersom minst ett abonnemang har mer än 6 månader kvar i bindningstid. Dealett ska bara ta fram ett erbjudande när alla abonnemang har högst 6 månader kvar och totalen blir billigare efter dubbelkostnad och presentkort.';
    }

    if (/billigare/i.test(offerCalculation.noOfferReason || '')) {
      return language === 'en'
        ? 'I should not recommend a switch right now, because the Dealett offer is not cheaper after overlap cost and gift card. It is better to keep the current plan for now or check again later.'
        : 'Jag ska inte rekommendera ett byte just nu, eftersom Dealett-erbjudandet inte blir billigare efter dubbelkostnad och presentkort. Det är bättre att behålla nuvarande abonnemang just nu eller jämföra igen senare.';
    }

    return language === 'en'
      ? 'I need the exact remaining contract time before I can make a valid Dealett offer. The rule is maximum 6 months remaining and the total must be cheaper after overlap cost and gift card.'
      : 'Jag behöver exakt bindningstid innan jag kan ta fram ett giltigt Dealett-erbjudande. Regeln är högst 6 månader kvar och att totalen blir billigare efter dubbelkostnad och presentkort.';
  })();

  return {
    reply: String(noOfferReply || validOfferReply || payload?.reply || fallback).slice(0, 1400),
    qualification,
    offerCalculation,
    suggestions: normalizeSuggestions(payload?.suggestions, qualification, offerCalculation, language, {
      useQualificationDefaults: qualificationActive,
    }),
  };
};

const buildPrompt = ({ language, page, cart, messages, qualification, qualificationActive, unrelatedCount }) => [
  `Offer calculation from current qualification: ${JSON.stringify(calculateOfferOptions(normalizeQualification(qualification)))}`,
  'You are Dealett assistant, a complete customer service agent for the Dealett website.',
  'Your mission, website map, answer rules, and required-info rules are in Dealett chat rules below. Follow them before making recommendations.',
  'Decision order: first understand customer intent, then choose the right route: casual greeting, existing-customer service, website explanation, cart help, broadband address/map guidance, or mobile/family offer qualification.',
  'Act naturally until the customer tells you what they want. Do not start the mobile/family qualification interview from a greeting, small talk, or unclear message.',
  'Only ask mobile/family qualification questions when the customer clearly wants a mobile/family recommendation, compares subscriptions, or has already started giving qualification details.',
  'If the customer sends several unrelated or unclear messages, remain friendly. From the fifth unrelated/unclear user message, ask directly what they need from Dealett while still being polite.',
  'For existing-customer questions like subscription length, next bill, account, support, or cancellation, answer as customer service. Use cart/account context if provided; if live account/billing data is not available, say so and route to Mina sidor/contact.',
  'When updating qualification, do not ask again for fields that are already filled. Ask only for the first or most important field still listed in missingFields.',
  'If peopleCount is filled, do not ask how many people/subscriptions again. Move to operators and bindingEnds per person.',
  'If readyForOffer is true, stop asking qualification questions and make the best matching offer from Dealett data.',
  `A valid Dealett offer may only be made when every subscription has ${MAX_ALLOWED_BINDING_MONTHS} months or less remaining binding time and the offer is cheaper than staying after overlap/double-cost and gift card.`,
  'When readyForOffer is true, use Offer calculation from current qualification for math: monthly price, 24-month total, overlap cost from remaining binding time, gift card value, and savingsVsStaying.',
  'If offerCalculation.validOfferAvailable is false, do not present rejected offers as recommendations. Explain the noOfferReason and ask for exact missing binding/price data only if that can change the result.',
  'If unknownBindingCount is greater than 0, explain that exact binding end dates are needed before a valid offer can be made.',
  'Answer only using Dealett chat rules, Dealett website/offers/cart context, mobilePlans, and broadbandPlans. If the answer is not there, say you do not have that information.',
  'Support Swedish and English. Reply in the requested language unless the customer clearly writes in the other language.',
  'Maintain customer qualification state for offer-making. Use the current qualification state, update it from the latest customer message, and return it every time.',
  'Qualification schema: {"peopleCount":number|null,"operators":["Telia|Tele2|Telenor|Tre|Halebop|Annan / ingen"],"bindingEnds":["Ingen bindningstid|Vet inte|YYYY-MM-DD|3 months"],"mobileUsage":"low|medium|high|null","priceRange":"under300|300-400|400-500|null","exactMonthlyPrice":number|null,"exactMonthlyPrices":[number],"readyForOffer":boolean,"missingFields":["peopleCount|operators|bindingEnds|mobileUsage|priceRange"]}.',
  'If customer gives an exact current price like 399 kr, store it as exactMonthlyPrice and also choose the closest priceRange. If they give one price per person, store them in exactMonthlyPrices in the same order as the people/subscriptions.',
  'Return JSON only with this shape: {"reply":"...","qualification":{...},"suggestions":[{"label":"...","qualificationPatch":{...},"action":null}]}. Suggestions must be short button labels that help the next step.',
  '',
  `Requested language: ${language === 'en' ? 'English' : 'Swedish'}`,
  `Current page: ${JSON.stringify(page || {})}`,
  `Current cart: ${JSON.stringify(cart || [])}`,
  `Current qualification: ${JSON.stringify(normalizeQualification(qualification))}`,
  `Qualification interview active: ${qualificationActive ? 'yes' : 'no'}`,
  `Unrelated/unclear user message count: ${Number(unrelatedCount) || 0}`,
  `Conversation: ${JSON.stringify(trimMessages(messages))}`,
  `Dealett chat rules: ${JSON.stringify(loadChatRules())}`,
  `Dealett context: ${JSON.stringify(buildKnowledge())}`,
].join('\n');

const createChatCompletion = async ({ message, messages, language = 'sv', page = {}, cart = [], qualification = {} }) => {
  const latestMessage = String(message || '').trim();
  if (!latestMessage) {
    const error = new Error('Message is required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedLanguage = language === 'en' ? 'en' : 'sv';
  const inferredQualification = inferQualificationFromText(latestMessage, qualification);
  const qualificationActive = hasQualificationSignal(latestMessage, inferredQualification);
  const unrelatedCount = countUnrelatedUserMessages({
    messages,
    latestMessage,
    page,
    qualification: inferredQualification,
  });

  if (isGreetingOnly(latestMessage) || isMetaHelpIntent(latestMessage)) {
    return buildWelcomeResponse(normalizedLanguage, inferredQualification);
  }

  if (isCustomerServiceIntent(latestMessage)) {
    return buildCustomerServiceResponse(latestMessage, normalizedLanguage, inferredQualification, cart);
  }

  if (isPurchaseIntent(latestMessage)) {
    return buildPurchaseResponse(normalizedLanguage, inferredQualification, cart);
  }

  if (isUnrelatedMessage(latestMessage, page, inferredQualification)) {
    return buildUnclearIntentResponse({
      message: latestMessage,
      language: normalizedLanguage,
      qualification: inferredQualification,
      unrelatedCount,
    });
  }

  if (isOutsideDealettScope(latestMessage)) {
    return buildOutsideScopeResponse(normalizedLanguage, inferredQualification);
  }

  if (hasOutsideTopic(latestMessage) && hasDealettTopic(latestMessage)) {
    return buildMixedScopeResponse(normalizedLanguage, inferredQualification);
  }

  if (isBroadbandIntent(latestMessage, page)) {
    return buildBroadbandResponse(latestMessage, normalizedLanguage);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured');
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      input: buildPrompt({
        language: normalizedLanguage,
        page,
        cart,
        qualification: inferredQualification,
        qualificationActive,
        unrelatedCount,
        messages: [
          ...trimMessages(messages),
          { role: 'user', content: latestMessage },
        ],
      }),
      max_output_tokens: 700,
    }),
  });

  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(responseBody.error?.message || `OpenAI request failed with HTTP ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  const parsed = safeJsonParse(extractOutputText(responseBody));
  return normalizeChatResponse(parsed, normalizedLanguage, inferredQualification, {
    qualificationActive,
  });
};

module.exports = {
  createChatCompletion,
  inferQualificationFromText,
  loadChatRules,
  normalizeQualification,
};
