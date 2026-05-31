const MAX_QUICK_REPLIES = 4;
const MAX_OFFER_CARDS = 3;

const quickReplySets = {
  sv: {
    greeting: ['Mobilabonnemang', 'Bredband hemma', 'Täckning', 'Presentkort'],
    browsing: ['Hur fungerar Dealett?', 'Mobilabonnemang', 'Bredband hemma'],
    coverage: ['Kontrollera täckning', 'Jämför operatörer'],
    direct: ['Välj åt mig', 'Billigast', 'Bästa täckning'],
    confused: ['Mobil', 'Bredband', 'Täckning'],
  },
  en: {
    greeting: ['Mobile plan', 'Home broadband', 'Coverage', 'Gift card'],
    browsing: ['How does Dealett work?', 'Mobile plan', 'Home broadband'],
    coverage: ['Check coverage', 'Compare operators'],
    direct: ['Choose for me', 'Cheapest', 'Best coverage'],
    confused: ['Mobile', 'Broadband', 'Coverage'],
  },
};

const slugify = (value, fallback) => {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);

  return slug || fallback;
};

const normalizeQuickReply = (reply, index) => {
  const label = typeof reply === 'string'
    ? reply.trim()
    : String(reply?.label || '').trim();

  if (!label) return null;

  return {
    id: slugify(typeof reply === 'object' && reply?.id ? reply.id : label, `reply-${index + 1}`),
    label: label.slice(0, 80),
  };
};

const normalizeQuickReplies = (quickReplies = []) => (
  Array.isArray(quickReplies)
    ? quickReplies
      .map(normalizeQuickReply)
      .filter(Boolean)
      .slice(0, MAX_QUICK_REPLIES)
    : []
);

const formatMoney = (value, language = 'sv') => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const formattedAmount = Math.round(amount)
    .toLocaleString(language === 'en' ? 'en-US' : 'sv-SE')
    .replace(/[\u00a0\u202f]/g, ' ');
  return `${formattedAmount} ${language === 'en' ? 'SEK' : 'kr'}`;
};

const normalizeOfferCard = (card, index) => {
  if (!card || typeof card !== 'object') return null;

  const operator = String(card.operator || '').trim();
  const planName = String(card.planName || '').trim();
  if (!operator && !planName) return null;

  return {
    id: slugify(card.id || `${operator}-${planName}`, `offer-${index + 1}`),
    operator: operator.slice(0, 80),
    planName: planName.slice(0, 120),
    dataLabel: String(card.dataLabel || '').trim().slice(0, 80),
    monthlyPriceLabel: String(card.monthlyPriceLabel || '').trim().slice(0, 80),
    rewardLabel: String(card.rewardLabel || '').trim().slice(0, 100),
    bindingLabel: String(card.bindingLabel || '').trim().slice(0, 100),
    reason: String(card.reason || '').trim().slice(0, 220),
    ctaLabel: String(card.ctaLabel || '').trim().slice(0, 80),
    ctaUrl: String(card.ctaUrl || '').trim().slice(0, 240),
    planId: String(card.planId || '').trim().slice(0, 120),
  };
};

const normalizeOfferCards = (offerCards = []) => (
  Array.isArray(offerCards)
    ? offerCards
      .map(normalizeOfferCard)
      .filter(Boolean)
      .slice(0, MAX_OFFER_CARDS)
    : []
);

const normalizeWidgetAction = (action, index) => {
  const label = String(action?.label || '').trim();
  if (!label) return null;

  const id = String(action?.id || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);

  return {
    id: id || `action_${index + 1}`,
    label: label.slice(0, 80),
  };
};

const normalizeEmbeddedWidget = (embeddedWidget = null) => {
  if (!embeddedWidget || typeof embeddedWidget !== 'object') return null;
  if (embeddedWidget.type !== 'coverage_selector') return null;

  const actions = Array.isArray(embeddedWidget.actions)
    ? embeddedWidget.actions.map(normalizeWidgetAction).filter(Boolean).slice(0, 3)
    : [];

  if (!actions.length) return null;

  return {
    type: 'coverage_selector',
    title: String(embeddedWidget.title || '').trim().slice(0, 100) || 'Kontrollera täckning',
    description: String(embeddedWidget.description || '').trim().slice(0, 220),
    actions,
  };
};

const buildCoverageSelectorWidget = ({ language = 'sv' } = {}) => {
  const isEnglish = language === 'en';

  return normalizeEmbeddedWidget({
    type: 'coverage_selector',
    title: isEnglish ? 'Check coverage' : 'Kontrollera täckning',
    description: isEnglish
      ? 'Coverage depends on the exact address, but we can start with a simple check.'
      : 'Täckning beror på exakt adress, men vi kan börja med en enkel kontroll.',
    actions: isEnglish
      ? [
        { id: 'use_location', label: 'Use my location' },
        { id: 'enter_address', label: 'Enter address' },
        { id: 'compare_operators', label: 'Compare operators' },
      ]
      : [
        { id: 'use_location', label: 'Använd min position' },
        { id: 'enter_address', label: 'Ange adress' },
        { id: 'compare_operators', label: 'Jämför operatörer' },
      ],
  });
};

const getEmbeddedWidgetForChatState = ({ intent, language = 'sv' }) => {
  if (intent !== 'coverage') return null;
  return buildCoverageSelectorWidget({ language });
};

const buildOfferCardsFromOfferCalculation = (offerCalculation = {}, { language = 'sv' } = {}) => {
  if (!offerCalculation?.validOfferAvailable || !Array.isArray(offerCalculation.options)) return [];

  const isEnglish = language === 'en';

  return normalizeOfferCards(offerCalculation.options.slice(0, MAX_OFFER_CARDS).map((option, index) => {
    const monthlyPrice = formatMoney(option.monthlyPrice, language);
    const reward = formatMoney(option.rewardTotal, language);
    const savings = formatMoney(option.savingsVsStaying, language);
    const contractMonths = Number(option.contractMonths) > 0 ? Number(option.contractMonths) : null;
    const planName = option.title || option.planName || '';
    const dataLabel = option.data || (Number(option.dataAmount) > 0 ? `${option.dataAmount} GB` : '');

    return {
      id: option.planId || `offer-${index + 1}`,
      planId: option.planId || '',
      operator: option.operator || '',
      planName,
      dataLabel,
      monthlyPriceLabel: monthlyPrice ? `${monthlyPrice}/${isEnglish ? 'month' : 'mån'}` : '',
      rewardLabel: reward ? `${isEnglish ? 'Gift card' : 'Presentkort'} ${reward}` : '',
      bindingLabel: contractMonths
        ? `${contractMonths} ${isEnglish ? 'months binding' : 'mån bindningstid'}`
        : '',
      reason: savings
        ? (isEnglish
          ? `Estimated saving ${savings} after overlap cost and gift card.`
          : `Uppskattad vinst ${savings} efter dubbelkostnad och presentkort.`)
        : (isEnglish
          ? 'Validated by Dealett calculation from the information provided.'
          : 'Validerad av Dealetts kalkyl utifrån uppgifterna du gav.'),
      ctaLabel: isEnglish ? 'Choose offer' : 'Välj erbjudande',
      ctaUrl: 'varukorg.html',
    };
  }));
};

const buildChatResponse = ({
  message,
  quickReplies = [],
  offerCards = [],
  embeddedWidget = null,
}) => ({
  message: String(message || ''),
  quickReplies: normalizeQuickReplies(quickReplies),
  offerCards: normalizeOfferCards(offerCards),
  embeddedWidget: normalizeEmbeddedWidget(embeddedWidget),
});

const getQuickRepliesForChatState = ({ intent, language = 'sv', conversationStyle = null }) => {
  const normalizedLanguage = language === 'en' ? 'en' : 'sv';
  const sets = quickReplySets[normalizedLanguage];
  const style = conversationStyle?.style || null;

  if (intent === 'greeting') return normalizeQuickReplies(sets.greeting);
  if (intent === 'browsing') return normalizeQuickReplies(sets.browsing);
  if (intent === 'coverage') return normalizeQuickReplies(sets.coverage);
  if (['direct_answer', 'impatient', 'human_test'].includes(style)) return normalizeQuickReplies(sets.direct);
  if (style === 'confused' || ['unknown_customer', 'unclear', 'unclear_direct'].includes(intent)) {
    return normalizeQuickReplies(sets.confused);
  }

  return [];
};

module.exports = {
  buildCoverageSelectorWidget,
  getEmbeddedWidgetForChatState,
  buildOfferCardsFromOfferCalculation,
  buildChatResponse,
  getQuickRepliesForChatState,
  normalizeEmbeddedWidget,
  normalizeOfferCards,
  normalizeQuickReplies,
};
