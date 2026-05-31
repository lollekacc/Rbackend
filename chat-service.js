const fs = require('node:fs');
const path = require('node:path');

const { calculateOfferOptions } = require('./offer-calculator');
const { getBroadbandPlans, getPlans } = require('./offer-service');

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-4o-mini';
const CHAT_RULES_DIR = path.join(__dirname, 'chat');
const ALLOWED_OPERATORS = ['Telia', 'Tele2', 'Telenor', 'Tre', 'Halebop'];

const emptyOfferCalculation = (qualification = {}) => ({
  readyForOffer: Boolean(qualification.readyForOffer),
  missingFields: qualification.missingFields || [],
  options: [],
});

const loadChatRules = () => {
  if (!fs.existsSync(CHAT_RULES_DIR)) return {};

  return fs.readdirSync(CHAT_RULES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .sort((left, right) => left.name.localeCompare(right.name))
    .reduce((rules, entry) => {
      const key = entry.name.replace(/\.json$/, '');
      rules[key] = JSON.parse(fs.readFileSync(path.join(CHAT_RULES_DIR, entry.name), 'utf8'));
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
  return (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === 'output_text' && content.text)
    .map((content) => content.text)
    .join('\n')
    .trim();
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text || '').match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
};

const normalizeOperator = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) return null;
  return ALLOWED_OPERATORS.find((operator) => operator.toLowerCase() === normalized.toLowerCase()) ||
    (/annan|ingen|other/i.test(normalized) ? 'Annan / ingen' : normalized.slice(0, 40));
};

const normalizeBindingEnd = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  if (/ingen|no contract|no binding/i.test(normalized)) return 'Ingen bindningstid';
  if (/vet|don't know|dont know/i.test(normalized)) return 'Vet inte';
  return normalized.slice(0, 40);
};

const appendUntilPeopleCount = (items, value, peopleCount) => {
  const nextItems = Array.isArray(items) ? [...items] : [];
  const limit = Number(peopleCount) || 1;
  while (nextItems.length < limit) nextItems.push(value);
  return nextItems.slice(0, limit);
};

const countMatches = (text, pattern) => [...String(text || '').matchAll(pattern)].length;

const inferPeopleCountFromFamilyText = (text) => {
  const lower = String(text || '').toLowerCase();
  const familyCount = countMatches(
    lower,
    /\b(mamma|pappa|mor|far|fru|make|partner|sambo|son|dotter|barn|mom|dad|mother|father|wife|husband|partner|child|son|daughter)\b/g
  );
  if (!familyCount) return null;

  const includesSelf = /\b(jag|mig|me|myself)\b|\band i\b/.test(lower);
  const inferredCount = familyCount + (includesSelf ? 1 : 0);
  return inferredCount > 1 ? Math.min(inferredCount, 10) : null;
};

const extractBindingAnswersFromText = (text, peopleCount, currentBindingEnds = []) => {
  const source = String(text || '');
  const lower = source.toLowerCase();
  const matches = [];
  const pattern = /\b(\d{4}-\d{2}-\d{2})\b|ingen bindningstid|no contract|no binding|vet inte|don't know|dont know|(\d+)\s*(mån|månad|månader|manader|month|months)/gi;

  for (const match of source.matchAll(pattern)) {
    const before = lower.slice(Math.max(0, match.index - 10), match.index);
    if (match[2] && /\binte\s*$|\bnot\s*$/i.test(before)) continue;
    if (match[1]) matches.push(match[1]);
    else if (match[2]) matches.push(`${Number(match[2])} months`);
    else if (/vet inte|don't know|dont know/i.test(match[0])) matches.push('Vet inte');
    else matches.push('Ingen bindningstid');
  }

  if (!matches.length) return null;
  const count = Number(peopleCount) || currentBindingEnds.length || 1;
  const appliesToAll = /alla|samtliga|båda|both|all/i.test(lower);
  if (matches.length === 1 && appliesToAll) return Array.from({ length: count }, () => matches[0]);

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
  missingFields: ['peopleCount', 'operators', 'bindingEnds', 'mobileUsage', 'priceRange'],
});

const normalizeQualification = (qualification = {}) => {
  const peopleCount = Number.isFinite(Number(qualification.peopleCount)) && Number(qualification.peopleCount) > 0
    ? Math.min(Math.round(Number(qualification.peopleCount)), 10)
    : null;
  const rawOperators = Array.isArray(qualification.operators)
    ? qualification.operators.map(normalizeOperator).filter(Boolean).slice(0, peopleCount || 10)
    : [];
  const rawBindingEnds = Array.isArray(qualification.bindingEnds)
    ? qualification.bindingEnds.map(normalizeBindingEnd).filter(Boolean).slice(0, peopleCount || 10)
    : [];
  const operators = peopleCount && qualification.operatorAppliesToAll && rawOperators.length === 1
    ? Array.from({ length: peopleCount }, () => rawOperators[0])
    : rawOperators;
  const bindingEnds = peopleCount && qualification.bindingAppliesToAll && rawBindingEnds.length === 1
    ? Array.from({ length: peopleCount }, () => rawBindingEnds[0])
    : rawBindingEnds;
  const mobileUsage = ['low', 'medium', 'high'].includes(qualification.mobileUsage)
    ? qualification.mobileUsage
    : null;
  const priceRange = ['under300', '300-400', '400-500'].includes(qualification.priceRange)
    ? qualification.priceRange
    : null;
  const exactMonthlyPrice = Number(qualification.exactMonthlyPrice) > 0
    ? Math.round(Number(qualification.exactMonthlyPrice))
    : null;
  const rawExactMonthlyPrices = Array.isArray(qualification.exactMonthlyPrices)
    ? qualification.exactMonthlyPrices
      .map((price) => Number(price))
      .filter((price) => Number.isFinite(price) && price > 0)
      .map((price) => Math.round(price))
      .slice(0, peopleCount || 10)
    : [];
  const exactMonthlyPrices = peopleCount && qualification.priceAppliesToAll && rawExactMonthlyPrices.length === 1
    ? Array.from({ length: peopleCount }, () => rawExactMonthlyPrices[0])
    : rawExactMonthlyPrices;

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
    operatorAppliesToAll: Boolean(qualification.operatorAppliesToAll),
    bindingAppliesToAll: Boolean(qualification.bindingAppliesToAll),
    priceAppliesToAll: Boolean(qualification.priceAppliesToAll),
    readyForOffer: missingFields.length === 0,
    missingFields,
  };
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
  const naturalFamilyCount = inferPeopleCountFromFamilyText(lower);

  if (countMatch) next.peopleCount = Number(countMatch[1]);
  else if (naturalFamilyCount) next.peopleCount = naturalFamilyCount;
  else if (/\b(one subscription|one person|en person|ett abonnemang|en abonnemang|ett subscription)\b/i.test(lower)) next.peopleCount = 1;
  else if (/\b(two|två)\s*(subscriptions?|abonnemang|personer|people)?\b/i.test(lower)) next.peopleCount = 2;
  else if (/\b(three|tre)\s*(subscriptions?|abonnemang|personer|people)?\b/i.test(lower)) next.peopleCount = 3;
  else if (/\b(four|fyra)\s*(subscriptions?|abonnemang|personer|people)?\b/i.test(lower)) next.peopleCount = 4;
  else if (/jag och (min )?(mamma|pappa|fru|man|partner)|mom and i|dad and i|my partner and i/i.test(lower)) next.peopleCount = 2;
  else if (/bara jag|bara mig|just me|only me/i.test(lower)) next.peopleCount = 1;

  const operatorMatches = [...text.matchAll(/\b(Telia|Tele2|Telenor|Tre|Halebop)\b/gi)]
    .map((match) => normalizeOperator(match[1]))
    .filter(Boolean);
  if (operatorMatches.length) {
    if (operatorMatches.length === 1 && /alla|samtliga|båda|both|all/i.test(lower)) {
      next.operatorAppliesToAll = true;
      next.operators = appendUntilPeopleCount(next.operators, operatorMatches[0], next.peopleCount);
    } else {
      next.operators = [...next.operators, ...operatorMatches].slice(0, Number(next.peopleCount) || 10);
    }
  }

  const bindingAnswers = extractBindingAnswersFromText(text, next.peopleCount, next.bindingEnds);
  if (bindingAnswers) {
    if (bindingAnswers.length === 1 && /alla|samtliga|båda|both|all/i.test(lower)) next.bindingAppliesToAll = true;
    next.bindingEnds = bindingAnswers;
  }

  if (/wifi|social|sociala medier|lite surf/i.test(lower)) next.mobileUsage = 'low';
  if (/stream|video|youtube|netflix|hbo|disney/i.test(lower)) next.mobileUsage = 'medium';
  if (/max surf|obegränsad|obegransad|unlimited|100\s*gb/i.test(lower)) next.mobileUsage = 'high';

  const priceSource = lower.replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ');
  const exactPrices = [...priceSource.matchAll(/(\d{2,4})\s*(kr|sek)/g)]
    .map((match) => Number(match[1]))
    .filter((price) => Number.isFinite(price) && price >= 50 && price <= 2000);
  if (exactPrices.length) {
    const exactPrice = exactPrices[0];
    const rangePrice = exactPrices.length > 1
      ? Math.round(exactPrices.reduce((sum, price) => sum + price, 0) / exactPrices.length)
      : exactPrice;
    next.exactMonthlyPrice = exactPrice;
    if (exactPrices.length > 1) {
      next.exactMonthlyPrices = [...next.exactMonthlyPrices, ...exactPrices].slice(0, Number(next.peopleCount) || 10);
    } else if (/alla|samtliga|all|var|each|per/i.test(lower)) {
      next.priceAppliesToAll = true;
      next.exactMonthlyPrices = appendUntilPeopleCount(next.exactMonthlyPrices, exactPrice, next.peopleCount);
    } else if (Number(next.peopleCount) > 1 && next.exactMonthlyPrices.length < Number(next.peopleCount)) {
      next.exactMonthlyPrices = [...next.exactMonthlyPrices, exactPrice].slice(0, Number(next.peopleCount));
    }

    if (rangePrice < 300) next.priceRange = 'under300';
    else if (rangePrice < 400) next.priceRange = '300-400';
    else next.priceRange = '400-500';
  } else if (/under\s*300/i.test(lower)) {
    next.priceRange = 'under300';
  } else if (/300\s*[–-]\s*400/i.test(lower)) {
    next.priceRange = '300-400';
  } else if (/400\s*[–-]\s*500|500\+/i.test(lower)) {
    next.priceRange = '400-500';
  }

  return normalizeQualification(next);
};

const tokenize = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
  .split(/\s+/)
  .filter((token) => token.length > 2);

const flattenKnowledge = (value, label = '') => {
  if (!value) return [];
  if (typeof value === 'string' || typeof value === 'number') return [`${label}: ${value}`];
  if (Array.isArray(value)) return value.flatMap((item, index) => flattenKnowledge(item, label ? `${label}.${index}` : String(index)));
  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => flattenKnowledge(item, label ? `${label}.${key}` : key));
  }
  return [];
};

const retrieveKnowledge = ({ message, intent, cart = [] }) => {
  const rules = loadChatRules();
  const query = new Set([...tokenize(message), ...tokenize(intent)]);
  const docs = [
    ...flattenKnowledge(rules['site-content'], 'site'),
    ...flattenKnowledge(rules['dealett-profile'], 'profile'),
    ...flattenKnowledge(rules['website-map'], 'map'),
    ...getPlans().map((plan) => `plan ${plan.operator} ${plan.title}: ${plan.data || ''}, ${plan.price} kr/mån, ${plan.text || ''}`),
    ...getBroadbandPlans().map((plan) => `broadband ${plan.operator} ${plan.title}: ${plan.speed}, ${plan.price} kr/mån, ${(plan.features || []).join(', ')}`),
    ...cart.map((item) => `cart ${item.operator || ''} ${item.title || ''}: ${item.price || 0} kr/mån, ${item.rewardTotal || 0} kr presentkort`),
  ];

  return docs
    .map((text) => ({
      text,
      score: tokenize(text).reduce((score, token) => score + (query.has(token) ? 1 : 0), 0),
    }))
    .filter((doc) => doc.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8)
    .map((doc) => doc.text);
};

const hasDealettTopic = (message) => (
  /dealett|abonnemang|mobil|telefon|telekom|bredband|5g|fiber|täckning|operator|operatör|telia|tele2|telenor|tre|halebop|presentkort|gift card|surf|varukorg|cart|faktura|konto|mina sidor/i
    .test(String(message || ''))
);

const hasOutsideTopic = (message) => (
  /elavtal|elbolag|hemförsäkring|försäkring|insurance|electricity|bank|bolån|lån|loan|matkasse|flyg|flight|resa|travel/i
    .test(String(message || ''))
);

const hasPersonalDataInChat = (message) => (
  /personnummer|bankid|mitt nummer|my number|phone number|telefonnummer|\b0\d[\d\s-]{6,}\d\b/i
    .test(String(message || ''))
);

const isGreetingOnly = (message) => (
  /^(hej|hejsan|hallå|tjena|god morgon|god kväll|hello|hi|hey|good morning|good evening)[!.\s]*$/i
    .test(String(message || '').trim())
);

const detectIntent = ({ message, messages = [], page = {}, qualification = {} }) => {
  const text = String(message || '').toLowerCase();
  const pagePath = String(page?.path || '');
  const hasQualification = Boolean(
    qualification.peopleCount ||
    qualification.mobileUsage ||
    qualification.priceRange ||
    qualification.exactMonthlyPrice ||
    qualification.operators?.length ||
    qualification.bindingEnds?.length ||
    qualification.exactMonthlyPrices?.length
  );

  if (isGreetingOnly(text) || /vad kan du|what can you do|vem är du|who are you/i.test(text)) return 'greeting';
  if (hasOutsideTopic(text) && !hasDealettTopic(text)) return 'outside_scope';
  if (/jämför erbjudanden|nytt erbjudande|new offer|compare offers/i.test(text)) return 'offer_discovery';
  if (hasPersonalDataInChat(text)) return 'checkout';
  if (/faktura|räkning|betalning|förfall|invoice|\bbill\b|payment|due|mitt abonnemang|min bindningstid|hur länge|subscription length|my subscription|contract length|avtal|kundservice|support|mina sidor|konto|account|logga in|login|ändra|uppgradera|säga upp|cancel|befintlig kund|redan kund|existing customer|already customer|current customer/i.test(text)) return 'support';
  if (/signera|signering|köp|köpa|beställ|beställa|lägg.*varukorg|varukorg|flytta.*nummer|nummerflytt|startdatum|checkout|cart|purchase|buy|sign/i.test(text)) return 'checkout';
  if (/presentkort|gift card|reward|belöning/i.test(text)) return 'gift_card';
  if (/täckning|coverage|nät|map|karta/i.test(text)) return 'coverage';
  if (/bredband|5g[-\s]?bredband|fiber|router|adress|broadband|tv-kanal|tv kanal/i.test(text) || pagePath.includes('5g-bredband')) return 'broadband';
  if (
    /familj|familje|mamma|pappa|\bfru\b|\bmake\b|partner|flera|båda|family|wife|husband/i.test(text) &&
    (/abonnemang|mobil|telefon|operatör|operator|telia|tele2|telenor|tre|halebop|byta|erbjudande|behöver|vill|plan|subscription|offer|switch|need|want|vi är|we are/i.test(text) || hasQualification)
  ) return 'family_offer';
  if (/mobil|abonnemang|telefon|surf|sms|samtal|operatör|operator|telia|tele2|telenor|tre|halebop|billigare|unlimited|obegränsad|kr|sek|pris|betalar|cheaper|mobile plan|phone plan|cell plan|data plan|subscription/i.test(text) || hasQualification) return 'mobile_offer';

  const unrelatedCount = [
    ...trimMessages(messages).filter((item) => item.role === 'user').map((item) => item.content),
    message,
  ].filter((item) => !hasDealettTopic(item) && !hasOutsideTopic(item) && !isGreetingOnly(item)).length;
  return unrelatedCount >= 5 ? 'unclear_direct' : 'unclear';
};

const defaultSuggestions = ({ intent, qualification, offerCalculation, cart, language }) => {
  const isEnglish = language === 'en';
  if (intent === 'greeting' || intent === 'unclear' || intent === 'unclear_direct' || intent === 'outside_scope') {
    return isEnglish
      ? ['New offer', 'Existing customer', 'My cart', '5G broadband']
      : ['Nytt erbjudande', 'Befintlig kund', 'Min varukorg', '5G-bredband'];
  }
  if (intent === 'offer_discovery') {
    return isEnglish
      ? ['Mobile plan', 'Family plan', '5G broadband', 'Coverage']
      : ['Mobilabonnemang', 'Familjabonnemang', '5G-bredband', 'Täckning'];
  }
  if (intent === 'support') {
    return isEnglish
      ? [{ label: 'Open account', action: 'openAccount' }, { label: 'Open cart', action: 'openCart' }, 'Billing question', 'New offer']
      : [{ label: 'Öppna Mina sidor', action: 'openAccount' }, { label: 'Öppna varukorg', action: 'openCart' }, 'Fakturafråga', 'Nytt erbjudande'];
  }
  if (intent === 'checkout') {
    return cart?.length
      ? [{ label: isEnglish ? 'Open cart' : 'Öppna varukorg', action: 'openCart' }]
      : (isEnglish ? ['New offer', '5G broadband'] : ['Nytt erbjudande', '5G-bredband']);
  }
  if (intent === 'broadband') {
    return [
      { label: isEnglish ? 'Enter address' : 'Skriv adress', action: 'openBroadbandAddress' },
      { label: isEnglish ? 'Open coverage map' : 'Öppna täckningskarta', action: 'openCoverageMap' },
      { label: isEnglish ? 'Show offers' : 'Visa erbjudanden', action: 'openBroadbandPage' },
    ];
  }
  if (intent === 'coverage') {
    return [
      { label: isEnglish ? 'Open coverage map' : 'Öppna täckningskarta', action: 'openCoverageMap' },
      'Telia',
      'Tele2',
      'Telenor',
    ];
  }
  if (intent === 'gift_card') return isEnglish ? ['Mobile plan', 'Family plan', '5G broadband'] : ['Mobilabonnemang', 'Familjepaket', '5G-bredband'];
  if (offerCalculation?.validOfferAvailable) {
    return isEnglish
      ? ['Explain calculation', 'Gift cards', { label: 'Open cart', action: 'openCart' }]
      : ['Förklara kalkylen', 'Presentkort', { label: 'Öppna varukorg', action: 'openCart' }];
  }
  if (qualification?.missingFields?.includes('peopleCount')) {
    return ['1', '2', '3', '4'].map((label) => ({
      label: isEnglish ? `${label} subscription${label === '1' ? '' : 's'}` : `${label} abonnemang`,
      qualificationPatch: { peopleCount: Number(label) },
    }));
  }
  if (qualification?.missingFields?.includes('operators')) return ALLOWED_OPERATORS;
  if (qualification?.missingFields?.includes('bindingEnds')) return isEnglish ? ['No contract', '1 month left', '3 months left', '6 months left'] : ['Ingen bindningstid', '1 månad kvar', '3 månader kvar', '6 månader kvar'];
  if (qualification?.missingFields?.includes('mobileUsage')) {
    return isEnglish
      ? [
        { label: 'Mostly Wi-Fi', qualificationPatch: { mobileUsage: 'low' } },
        { label: 'Streaming & video', qualificationPatch: { mobileUsage: 'medium' } },
        { label: 'Maximum data', qualificationPatch: { mobileUsage: 'high' } },
      ]
      : [
        { label: 'Mest wifi & sociala medier', qualificationPatch: { mobileUsage: 'low' } },
        { label: 'Streaming & video', qualificationPatch: { mobileUsage: 'medium' } },
        { label: 'Max surf', qualificationPatch: { mobileUsage: 'high' } },
      ];
  }
  if (qualification?.missingFields?.includes('priceRange')) return isEnglish ? ['Under 300 SEK', '300-400 SEK', '400-500+ SEK'] : ['Under 300 kr', '300-400 kr', '400-500+ kr'];
  return isEnglish ? ['New offer', 'Existing customer', '5G broadband'] : ['Nytt erbjudande', 'Befintlig kund', '5G-bredband'];
};

const buildToolResult = ({ intent, qualification, cart = [] }) => {
  if (['mobile_offer', 'family_offer'].includes(intent)) {
    if (!qualification.readyForOffer) {
      return {
        type: 'qualification',
        status: 'missing_info',
        missingFields: qualification.missingFields,
        nextField: qualification.missingFields[0],
      };
    }

    const offerCalculation = calculateOfferOptions(qualification);
    return {
      type: 'offer_calculator',
      status: offerCalculation.validOfferAvailable ? 'valid_offer' : 'no_valid_offer',
      offerCalculation,
      rule: 'Code decided offer validity. GPT may only explain this result.',
    };
  }

  if (intent === 'checkout') {
    return {
      type: 'cart',
      status: Array.isArray(cart) && cart.length ? 'cart_has_items' : 'cart_empty',
      cart,
      boundary: 'Phone numbers, personal data, start date and signing are handled in varukorg.html, not in chat.',
    };
  }

  if (intent === 'support') {
    const item = Array.isArray(cart) && cart.length ? cart[0] : null;
    return {
      type: 'customer_service',
      status: 'account_data_limited',
      selectedCartItem: item
        ? {
          operator: item.operator,
          title: item.title || item.data,
          price: item.price,
          rewardTotal: item.rewardTotal,
        }
        : null,
      cart,
      boundary: 'Exact invoice dates and active account facts require Mina sidor or support. Do not invent them.',
    };
  }

  if (intent === 'broadband') {
    return {
      type: 'broadband',
      status: 'address_or_map_required',
      offers: getBroadbandPlans().slice(0, 6).map((plan) => ({
        operator: plan.operator,
        title: plan.title,
        speed: plan.speed,
        price: plan.price,
        bindingMonths: 24,
      })),
      boundary: 'Do not promise exact availability before address/map check.',
    };
  }

  if (intent === 'coverage') {
    return {
      type: 'coverage',
      status: 'map_required',
      message: 'Coverage varies by area and should be checked on the map.',
    };
  }

  if (intent === 'gift_card') {
    return {
      type: 'gift_card',
      status: cart?.length ? 'cart_reward_context' : 'general_reward_context',
      cart,
      giftCards: ['Apollo', 'H&M', 'Hotel', 'ICA Maxi', 'Mio', 'Zalando', 'Elgiganten', 'Ticketmaster'],
    };
  }

  return {
    type: intent,
    status: intent === 'outside_scope' ? 'outside_dealett_scope' : 'needs_intent',
  };
};

const summarizeCartItem = (item) => {
  if (!item) return null;
  const title = [item.operator, item.title || item.data].filter(Boolean).join(' ').trim() || 'valt erbjudande';
  const price = Number(item.price) > 0 ? `${Number(item.price)} kr/mån` : null;
  const reward = Number(item.rewardTotal) > 0 ? `${Number(item.rewardTotal)} kr presentkort` : null;
  return [title, price, reward].filter(Boolean).join(', ');
};

const fallbackReply = ({ intent, language, message, qualification, toolResult }) => {
  const isEnglish = language === 'en';
  if (intent === 'greeting') {
    return isEnglish
      ? 'Hi! I can help with new offers, existing subscriptions, invoices, coverage, broadband, gift cards, and the cart. What do you need help with?'
      : 'Hej! Jag kan hjälpa med nya erbjudanden, befintliga abonnemang, faktura, täckning, bredband, presentkort och varukorg. Vad vill du ha hjälp med?';
  }
  if (intent === 'outside_scope') {
    return isEnglish
      ? 'I can only help with Dealett topics like mobile plans, 5G broadband, coverage, gift cards, cart and customer service. What do you need help with at Dealett?'
      : 'Jag kan bara hjälpa med Dealett-frågor som mobilabonnemang, 5G-bredband, täckning, presentkort, varukorg och kundservice. Vad behöver du hjälp med hos Dealett?';
  }
  if (intent === 'offer_discovery') {
    return isEnglish
      ? 'Sure. Do you want help with a mobile plan, family plan, or 5G broadband?'
      : 'Absolut. Vill du ha hjälp med mobilabonnemang, familjepaket eller 5G-bredband?';
  }
  if (intent === 'unclear_direct') {
    return isEnglish
      ? 'I am happy to keep it friendly, but to help properly I need to know what you need from Dealett: offer, existing subscription, bill, coverage, broadband, or cart?'
      : 'Jag hänger med, men för att hjälpa dig på riktigt behöver jag veta vad du behöver hos Dealett: erbjudande, befintligt abonnemang, faktura, täckning, bredband eller varukorg?';
  }
  if (intent === 'unclear') {
    return isEnglish
      ? 'I am here with you. When you are ready, tell me if you want help with an offer, existing subscription, bill, coverage, broadband, or the cart.'
      : 'Jag är med dig. När du vill kan du säga om du behöver hjälp med erbjudande, befintligt abonnemang, faktura, täckning, bredband eller varukorg.';
  }
  if (intent === 'support') {
    const selected = toolResult?.selectedCartItem
      ? `${toolResult.selectedCartItem.operator || 'Dealett'} ${toolResult.selectedCartItem.title || 'abonnemang'}`
      : null;
    if (selected) {
      return isEnglish
        ? `I can see ${selected} in your cart, but I do not have live account or invoice data in chat. Use My pages for exact billing or subscription details.`
        : `Jag ser ${selected} i varukorgen, men jag har inte live-data om konto eller faktura i chatten. Använd Mina sidor för exakta faktura- eller abonnemangsuppgifter.`;
    }
    return isEnglish
      ? 'I can guide you, but I do not have live account or invoice data in chat. Use My pages for exact billing or subscription details.'
      : 'Jag kan guida dig, men jag har inte live-data om konto eller faktura i chatten. Använd Mina sidor för exakta faktura- eller abonnemangsuppgifter.';
  }
  if (intent === 'checkout') {
    const summary = summarizeCartItem(toolResult?.cart?.[0]);
    const personalDataWarning = hasPersonalDataInChat(message)
      ? (isEnglish
        ? 'Do not send phone numbers or personal details in chat.'
        : 'Skicka inte telefonnummer eller personuppgifter i chatten.')
      : '';
    if (summary) {
      return isEnglish
        ? [personalDataWarning, `Your cart contains: ${summary}. Continue in the cart for number transfer, start date and signing.`].filter(Boolean).join(' ')
        : [personalDataWarning, `I varukorgen finns: ${summary}. Fortsätt där för nummerflytt, startdatum och signering.`].filter(Boolean).join(' ');
    }
    return isEnglish
      ? [personalDataWarning, 'Continue in the cart for contact details, number transfer, start date and signing.'].filter(Boolean).join(' ')
      : [personalDataWarning, 'Fortsätt i varukorgen för kontaktuppgifter, nummerflytt, startdatum och signering.'].filter(Boolean).join(' ');
  }
  if (intent === 'gift_card') {
    const summary = summarizeCartItem(toolResult?.cart?.[0]);
    if (summary) {
      return isEnglish
        ? `Gift cards are connected to the selected offer. In your cart I can see: ${summary}. You choose the gift card during the purchase flow.`
        : `Presentkortet hör ihop med det valda erbjudandet. I din varukorg ser jag: ${summary}. Du väljer presentkort i köpflödet.`;
    }
    const cards = (toolResult?.giftCards || []).slice(0, 5).join(', ');
    return isEnglish
      ? `Dealett offers gift cards with selected offers. Available examples are ${cards}. First choose an offer, then you can continue to the cart.`
      : `Dealett erbjuder presentkort med utvalda erbjudanden. Exempel är ${cards}. Välj först ett erbjudande, sedan fortsätter du till varukorgen.`;
  }
  if (intent === 'broadband') {
    return isEnglish
      ? 'For 5G broadband, the next step is to enter your address or open the coverage map. I can show the available offers, but exact availability must be checked by address.'
      : 'För 5G-bredband är nästa steg att skriva adress eller öppna täckningskartan. Jag kan visa erbjudanden, men exakt tillgänglighet måste kontrolleras med adress.';
  }
  if (intent === 'coverage') {
    return isEnglish
      ? 'Coverage depends on the exact area, so I cannot guarantee it from chat. Open the coverage map to compare operators at your address.'
      : 'Täckning beror på exakt område, så jag kan inte garantera den i chatten. Öppna täckningskartan för att jämföra operatörer på din adress.';
  }
  if (['mobile_offer', 'family_offer'].includes(intent) && toolResult?.status === 'missing_info') {
    const labels = {
      peopleCount: isEnglish ? 'How many subscriptions do you need?' : 'Hur många abonnemang vill du ha?',
      operators: isEnglish ? 'Which operator do you use today?' : 'Vilken operatör har du idag?',
      bindingEnds: isEnglish ? 'How much contract time is left?' : 'Hur lång bindningstid har du kvar?',
      mobileUsage: isEnglish ? 'How do you use mobile data?' : 'Hur använder du mobilen?',
      priceRange: isEnglish ? 'What do you pay per subscription today?' : 'Vad betalar du per abonnemang idag?',
    };
    return labels[toolResult.nextField] || (isEnglish ? 'I need one more detail to compare.' : 'Jag behöver en uppgift till för att jämföra.');
  }
  if (toolResult?.status === 'valid_offer') {
    const top = toolResult.offerCalculation.options[0];
    const priceText = Number(top.peopleCount) > 1
      ? (isEnglish
        ? `${top.monthlyPrice} SEK/month total, about ${top.pricePerPerson} SEK per subscription`
        : `${top.monthlyPrice} kr/mån totalt, cirka ${top.pricePerPerson} kr per abonnemang`)
      : (isEnglish ? `${top.monthlyPrice} SEK/month` : `${top.monthlyPrice} kr/mån`);
    return isEnglish
      ? `I found a valid option: ${top.operator} ${top.title} for ${priceText}. The estimated saving is ${top.savingsVsStaying} SEK after overlap cost and gift card.`
      : `Jag hittade ett giltigt alternativ: ${top.operator} ${top.title} för ${priceText}. Uppskattad vinst är ${top.savingsVsStaying} kr efter dubbelkostnad och presentkort.`;
  }
  if (toolResult?.status === 'no_valid_offer') {
    const reason = toolResult.offerCalculation.noOfferReason;
    if (/mer än 6|more than 6/i.test(String(reason || ''))) {
      return isEnglish
        ? 'I should not recommend switching right now because at least one subscription has more than 6 months left. Dealett only creates an offer when the remaining contract time is 6 months or less and the total becomes cheaper after overlap cost and gift card.'
        : 'Jag ska inte rekommendera byte just nu eftersom minst ett abonnemang har mer än 6 månader kvar. Dealett tar bara fram erbjudande när bindningstiden är högst 6 månader och totalen blir billigare efter dubbelkostnad och presentkort.';
    }
    return reason || (isEnglish ? 'I do not have a valid cheaper offer right now.' : 'Jag har inget giltigt billigare erbjudande just nu.');
  }
  return isEnglish
    ? 'What would you like help with at Dealett?'
    : 'Vad vill du ha hjälp med hos Dealett?';
};

const buildPrompt = ({ language, intent, message, messages, qualification, toolResult, facts }) => [
  'You are Dealett assistant, Dealett customer service and sales support.',
  'Use GPT only for conversation, explanation and natural follow-up wording.',
  'Never decide offer validity, prices, savings, coverage availability, invoice dates or account facts.',
  'Use the supplied toolResult as truth. If data is missing, say so and ask one natural question.',
  'Be concise, friendly and human. Ask at most two questions.',
  'Do not collect personal identity numbers, phone numbers, payment details or BankID details in chat.',
  'When checkout/signing is needed, direct the customer to the cart.',
  'Return JSON only: {"reply":"..."}',
  '',
  `Language: ${language === 'en' ? 'English' : 'Swedish'}`,
  `Intent: ${intent}`,
  `Customer message: ${message}`,
  `Recent conversation: ${JSON.stringify(trimMessages(messages))}`,
  `Memory/qualification: ${JSON.stringify(qualification)}`,
  `Tool result: ${JSON.stringify(toolResult)}`,
  `Relevant Dealett facts: ${JSON.stringify(facts)}`,
].join('\n');

const generateReply = async (context) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackReply(context);

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        input: buildPrompt(context),
        max_output_tokens: 350,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return fallbackReply(context);
    const parsed = safeJsonParse(extractOutputText(body));
    return String(parsed?.reply || fallbackReply(context)).slice(0, 1400);
  } catch {
    return fallbackReply(context);
  }
};

const createChatCompletion = async ({ message, messages, language = 'sv', page = {}, cart = [], qualification = {} }) => {
  const latestMessage = String(message || '').trim();
  if (!latestMessage) {
    const error = new Error('Message is required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedLanguage = language === 'en' ? 'en' : 'sv';
  const nextQualification = inferQualificationFromText(latestMessage, qualification);
  const intent = detectIntent({
    message: latestMessage,
    messages,
    page,
    qualification: nextQualification,
  });
  const toolResult = buildToolResult({
    intent,
    qualification: nextQualification,
    cart,
  });
  const offerCalculation = toolResult.offerCalculation || emptyOfferCalculation(nextQualification);
  const facts = retrieveKnowledge({
    message: latestMessage,
    intent,
    cart,
  });
  const suggestions = defaultSuggestions({
    intent,
    qualification: nextQualification,
    offerCalculation,
    cart,
    language: normalizedLanguage,
  });
  const reply = await generateReply({
    intent,
    language: normalizedLanguage,
    message: latestMessage,
    messages,
    qualification: nextQualification,
    toolResult,
    facts,
  });

  return {
    reply,
    qualification: nextQualification,
    offerCalculation,
    suggestions,
    intent,
  };
};

module.exports = {
  createChatCompletion,
  inferQualificationFromText,
  loadChatRules,
  normalizeQualification,
};
