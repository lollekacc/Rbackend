#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_CHAT_API_URL = 'http://localhost:3000/api/chat';
const CHAT_API_URL = process.env.CHAT_API_URL || DEFAULT_CHAT_API_URL;
const OUTPUT_DIR = path.join(__dirname, 'results', 'real-human-gauntlet');
const CONVERSATION_COUNT = Math.max(Number(process.env.GAUNTLET_CONVERSATIONS) || 200, 200);

const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');
const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 90);
const escapeMarkdown = (value) => String(value ?? '').replace(/\|/g, '\\|');
const clampScore = (value) => Math.max(1, Math.min(5, Math.round(value * 10) / 10));

const personas = [
  'completely_confused',
  'lazy',
  'skeptical',
  'emotional',
  'distracted',
  'approximate_memory',
  'strong_opinions',
  'reward_hunter',
  'coverage_obsessed',
  'cheapest_possible',
  'family_manager',
  'elderly_relative_shopper',
  'student',
  'business_owner',
  'existing_customer_great_deal',
  'existing_customer_terrible_deal',
  'curious_browser',
  'troll_lite',
  'overconfident_customer',
  'just_wants_recommendation',
];

const situations = [
  'recommendation_without_information',
  'refuses_questions',
  'best_coverage',
  'best_value',
  'best_gift_card',
  'no_binding',
  'family_plan',
  'broadband',
  'mobile',
  'mobile_and_broadband',
  'unknown_need',
  'existing_customer_support',
  'cheap_price_claim',
  'contract_left',
  'coverage_problem',
  'invoice_confusion',
  'student_discount',
  'business_need',
  'elderly_parent',
  'curious_ad_browser',
];

const lengthPattern = [
  ...Array.from({ length: 70 }, () => 2),
  ...Array.from({ length: 60 }, () => 5),
  ...Array.from({ length: 45 }, () => 10),
  ...Array.from({ length: 25 }, () => 20),
];

const firstMessages = {
  completely_confused: [
    'hej jag fattar typ inget med abonnemang',
    'asså vad har jag ens? vet inte operatör eller pris',
    'ria eller rea? jag vet inte vad jag söker',
  ],
  lazy: [
    'välj nåt åt mig bara',
    'orkar inte svara på massa frågor, säg bara',
    'kort svar tack, vad ska jag ta',
  ],
  skeptical: [
    'är ni bara säljare eller?',
    'varför ska jag lita på er',
    'får ni betalt av operatörerna?',
  ],
  emotional: [
    'jag blir galen på alla abonnemang',
    'är så trött på telebolag, alla luras',
    'jag har stress, vill bara lösa detta',
  ],
  distracted: [
    'hej jag behöver mobil tror jag, eller bredband kanske',
    'jag kollade reklam men nu minns jag inte',
    'vänta jag har kanske telia eller tele2, skitsamma',
  ],
  approximate_memory: [
    'tror jag betalar runt 300 nånting',
    'jag har kanske 20 gb eller 50, inte säker',
    'typ tele2 tror jag, runt 349 kanske',
  ],
  strong_opinions: [
    'telia är garbage, vad ska jag ha då',
    'tele2 ljuger alltid, jag vill byta',
    'jag vägrar telenor, ge annat',
  ],
  reward_hunter: [
    'vilket ger högsta presentkortet',
    'jag vill bara ha mest bonus',
    'presentkort först, abonnemang sen',
  ],
  coverage_obsessed: [
    'jag vill ha bäst täckning hemma',
    'bor typ nära barkarby, vilken signal är bäst',
    'täckning är allt, pris spelar mindre roll',
  ],
  cheapest_possible: [
    'billigast möjligt tack',
    'ge mig lägsta priset bara',
    'jag vill spara varenda krona',
  ],
  family_manager: [
    'vi är flera hemma och allt är rörigt',
    'jag fixar abonnemang för familjen',
    'tre barn och min partner behöver nåt',
  ],
  elderly_relative_shopper: [
    'min pappa behöver bara ringa och bankid',
    'mamma är senior och vill ha enkel mobil',
    'ska fixa billigt till äldre förälder',
  ],
  student: [
    'jag är student och vill ha billigt',
    'studentpris? har halebop typ',
    'pluggar och behöver inte dyrt abonnemang',
  ],
  business_owner: [
    'har litet företag och behöver mobil',
    'företagsabonnemang till mig och en anställd',
    'kan jag ta detta på firman?',
  ],
  existing_customer_great_deal: [
    'jag betalar 99 kr för obegränsat hos telia',
    'har familjepris typ 899 för 5 personer',
    'jag har winback 149 kr fri surf tror jag',
  ],
  existing_customer_terrible_deal: [
    'jag betalar 549 kr för typ 20 gb',
    'min faktura är 699 och jag fattar inte varför',
    'har gammalt dyrt abonnemang sen många år',
  ],
  curious_browser: [
    'såg er reklam och tänkte kika',
    'vad är dealett egentligen',
    'jag vill bara testa chatten',
  ],
  troll_lite: [
    'överraska mig lol',
    'sälj nåt till mig då',
    'gissa allt, jag tänker inte hjälpa',
  ],
  overconfident_customer: [
    'jag kan telecom, ge mig bara bästa ARPU deal',
    'jag vet redan att telia är bäst, bevisa motsatsen',
    'jag vill optimera total cost, kom igen',
  ],
  just_wants_recommendation: [
    'kan du bara rekommendera något',
    'om du var jag vad hade du valt',
    'vad passar mig bäst',
  ],
};

const followUps = {
  recommendation_without_information: ['vet inte', 'bara välj', 'ok men vad hade du tagit', 'nää jag vet inte gb', 'typ mobil kanske'],
  refuses_questions: ['nää', 'fråga inte mer', 'du får gissa', 'kortare tack', 'bara svara'],
  best_coverage: ['hemma är viktigast', 'ute funkar det men inne dåligt', 'bor nära jakobsberg typ', 'vill inte skriva adress', 'kompis har telia och bra signal'],
  best_value: ['vill ha värde inte billigast', 'runt 300 kanske', 'kan du förklara varför', 'måste vara värt det', 'hellre stabilt än billigt'],
  best_gift_card: ['hur mycket presentkort', 'störst bonus tack', 'skit i surf bara bonus', 'men om jag tar dyraste då', 'vad får jag exakt'],
  no_binding: ['vill inte låsa mig', 'har bindning till oktober', 'kan jag byta ändå', 'hur blir dubbelkostnaden', 'jag hatar bindningstid'],
  family_plan: ['vi är 3 eller 4 typ', 'barnen streamar mycket', 'min partner har telia', 'jag minns inte priserna', 'kan man samla allt'],
  broadband: ['internet hemma laggar', '5g bredband kanske', 'måste man skriva adress', 'jag vill inte ha fiber', 'funkar det i lägenhet'],
  mobile: ['mobilabonnemang', 'kanske 20 gb', 'har tele2 tror jag', 'runt 349', 'ingen bindning tror jag'],
  mobile_and_broadband: ['båda kanske', 'hemma först', 'mobilen också dyr', 'kan man paketera', 'vad är enklast'],
  unknown_need: ['ingen aning', 'jag bara kollar', 'vad gör ni', 'kanske senare', 'ok visa nåt intressant'],
  existing_customer_support: ['när kommer fakturan', 'jag hittar inte mina sidor', 'kan du se mitt abonnemang', 'vad är bindningstid', 'jag vill inte logga in'],
  cheap_price_claim: ['nej det är vanligt pris', 'kan du slå det eller inte', 'kanske familj rabatt', 'jag vet inte kampanj', 'låter du tveksam?'],
  contract_left: ['3 månader kvar', 'eller kanske 8', 'till oktober tror jag', 'är det värt ändå', 'räkna ungefär'],
  coverage_problem: ['tele2 suger hemma', 'ute funkar bättre', 'wifi calling vad är det', 'ska jag byta nät', 'vill ha säkert val'],
  invoice_confusion: ['fattar inte fakturan', 'det står massa rader', 'totalt 599 typ', 'är det dyrt', 'vad ska jag kolla först'],
  student_discount: ['student ja', 'har mecenat tror jag', 'vill ha billigt', 'streamar ibland', 'ingen bindning helst'],
  business_need: ['två abonnemang', 'vill ha kvitto på företaget', 'en anställd reser ibland', 'pris viktigt', 'kan ni hjälpa företag'],
  elderly_parent: ['han använder bankid', 'ringer mest', 'lite surf', 'ska vara enkelt', 'inte dyrt'],
  curious_ad_browser: ['såg reklam', 'är ni legit', 'jag vill bara kika', 'har ni något intressant', 'inte köpa idag'],
};

const contradictionTurns = [
  'vänta jag sa fel',
  'nej alltså det är inte så',
  'eller jo kanske',
  'glöm det där',
  'minns inte, typ tvärtom',
];

const oneWordTurns = ['nää', 'ja', 'kanske', 'typ', 'vet inte', 'ingen aning', 'ok', 'mm'];

const buildCustomerMessage = ({ persona, situation, turnIndex, length, botReply }) => {
  if (turnIndex === 0) {
    const options = firstMessages[persona] || ['hej'];
    return options[(persona.length + situation.length) % options.length];
  }

  const pool = followUps[situation] || followUps.unknown_need;
  const botText = String(botReply || '').toLowerCase();

  if (turnIndex % 7 === 0 && ['distracted', 'troll_lite', 'completely_confused'].includes(persona)) {
    return contradictionTurns[(turnIndex + persona.length) % contradictionTurns.length];
  }
  if (turnIndex % 5 === 0 && ['lazy', 'troll_lite', 'confused'].includes(persona)) {
    return oneWordTurns[(turnIndex + situation.length) % oneWordTurns.length];
  }
  if (/hur många|how many/.test(botText)) return ['1 typ', 'vi är 3 hemma', 'vet inte exakt, kanske 2', 'bara jag'][turnIndex % 4];
  if (/operatör|operator/.test(botText)) return ['tele2 tror jag', 'telia kanske', 'ingen aning', 'tre fast jag hatar tre'][turnIndex % 4];
  if (/bindning|contract/.test(botText)) return ['till oktober tror jag', '3 månader kanske', 'ingen bindning vad jag vet', 'vet inte'][turnIndex % 4];
  if (/surf|gb|data/.test(botText)) return ['ingen aning surf', 'streamar ibland', 'mest wifi', 'vill bara att det funkar'][turnIndex % 4];
  if (/pris|betalar|price|kostnad/.test(botText)) return ['runt 300 nånting', 'för mycket', '399 tror jag', 'vet inte fakturan är rörig'][turnIndex % 4];
  if (/täckning|coverage|hemma|adress/.test(botText)) return ['hemma inomhus', 'nära barkarby typ', 'vill inte ge exakt adress', 'pendlar också'][turnIndex % 4];

  const messy = pool[(turnIndex + length + persona.length) % pool.length];
  if (turnIndex % 6 === 0) return `${messy} asså`;
  if (turnIndex % 4 === 0) return `${messy} maybe`;
  return messy;
};

const makeScenarios = () => Array.from({ length: CONVERSATION_COUNT }, (_, index) => {
  const persona = personas[index % personas.length];
  const situation = situations[Math.floor(index / personas.length) % situations.length];
  const length = lengthPattern[index % lengthPattern.length];
  return {
    id: index + 1,
    name: `${String(index + 1).padStart(3, '0')} ${persona} / ${situation} / ${length} turns`,
    persona,
    situation,
    length,
  };
});

const postChat = async (payload) => {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Chat API failed with HTTP ${response.status}`);
  return body;
};

const countQuestions = (text) => (String(text || '').match(/\?/g) || []).length;
const hasAny = (text, pattern) => pattern.test(String(text || ''));
const unique = (items) => [...new Set(items.filter(Boolean))];

const flagRules = {
  robotic: (reply) => hasAny(reply, /field \d|missingFields|qualification|provide monthly data|please provide/i),
  repetitive: (_reply, transcript, index) => index > 0 && String(transcript[index - 1]?.botReply || '').trim() === String(transcript[index]?.botReply || '').trim(),
  over_questioning: (reply) => countQuestions(reply) > 2,
  under_questioning: (reply, _transcript, _index, scenario) => scenario.length >= 5 && countQuestions(reply) === 0 && !hasAny(reply, /jag kan|nästa|börja|fortsätt|kolla|välj|svara|vill du|kan du/i),
  generic_answer: (reply) => hasAny(reply, /vad vill du ha hjälp med hos dealett|how can i help|jag kan hjälpa med dealett-frågor/i),
  ignored_context: (reply, _transcript, _index, scenario) => {
    if (scenario.persona === 'skeptical') return !hasAny(reply, /ersättning|partners|tillit|nuvarande avtal|pressa|sälja|oberoende/i);
    if (scenario.persona === 'reward_hunter') return !hasAny(reply, /presentkort|belöning|bonus|totalvärde|dyrare|värde/i);
    if (scenario.persona === 'coverage_obsessed') return !hasAny(reply, /täckning|signal|hemma|adress|nät|inomhus/i);
    if (scenario.persona === 'emotional') return !hasAny(reply, /förstår|lugnt|frustrerande|stress|press|enkelt|steg/i);
    return false;
  },
  lost_conversation_state: (reply, transcript, index) => index > 2 && hasAny(reply, /^(hej|hejsan|hi)[!.]?\s/i),
  unnecessary_qualification: (reply, _transcript, _index, scenario) => ['curious_browser', 'troll_lite', 'skeptical', 'reward_hunter'].includes(scenario.persona) && hasAny(reply, /hur många abonnemang|vilken operatör har du idag|bindningstid har du kvar/i),
  recommendation_too_early: (reply, transcript) => transcript.length < 2 && hasAny(reply, /giltigt alternativ|fortsätt i varukorgen|beställ|köp nu/i),
  recommendation_too_late: (reply, transcript, index, scenario) => index >= 8 && ['just_wants_recommendation', 'cheapest_possible'].includes(scenario.persona) && !hasAny(reply, /om jag måste|alternativ|rekommend|gissning|jämför|billig/i),
  weak_explanation: (reply) => hasAny(reply, /rekommenderar|bättre|värt|värde/i) && !hasAny(reply, /för att|därför|eftersom|because|kostnad|täckning|bindning|surf|total/i),
  weak_trust_building: (reply, _transcript, _index, scenario) => scenario.persona === 'skeptical' && !hasAny(reply, /ersättning|partners|inte.*pressa|nuvarande avtal|bättre att behålla|tillit/i),
  ignored_uncertainty: (reply, transcript) => hasAny(transcript.map((turn) => turn.userMessage).join(' '), /tror|kanske|typ|runt|vet inte|ingen aning/i) && !hasAny(reply, /ungefär|gissning|inte exakt|kan inte garantera|räcker för att börja|osäker/i),
  failed_contradiction_handling: (reply, transcript) => hasAny(transcript.map((turn) => turn.userMessage).join(' '), /sa fel|inte så|tvärtom|glöm det/i) && !hasAny(reply, /ingen fara|vi justerar|då ändrar|okej|börjar om/i),
  failed_emotional_handling: (reply, _transcript, _index, scenario) => scenario.persona === 'emotional' && !hasAny(reply, /förstår|lugnt|frustrerande|stress|press|enkelt|steg/i),
  failed_browsing_handling: (reply, _transcript, _index, scenario) => scenario.persona === 'curious_browser' && !hasAny(reply, /kika|reklam|jämför|börjar.*när du vill|ingen press|vad dealett/i),
};

const classifySuccesses = (transcript, scenario) => {
  const botText = transcript.map((turn) => turn.botReply).join('\n');
  const successes = [];
  if (hasAny(botText, /ungefär|gissning|inte exakt|kan inte garantera|räcker för att börja/i)) successes.push('handled_uncertainty');
  if (hasAny(botText, /ersättning|partners|nuvarande avtal|inte.*pressa|bättre att behålla/i)) successes.push('built_trust');
  if (hasAny(botText, /förstår|lugnt|frustrerande|stress|press|enkelt/i)) successes.push('handled_emotion');
  if (hasAny(botText, /presentkort.*totalvärde|dyrare.*belöning|inte.*bara.*presentkort/i)) successes.push('reward_fit_over_bonus');
  if (hasAny(botText, /täckning|inomhus|adress|nät|wifi-samtal/i)) successes.push('coverage_practicality');
  if (hasAny(botText, /bindningstid|dubbelkostnad|innan bindningstiden/i)) successes.push('binding_context');
  if (hasAny(botText, /mellanstort|20-30|allround|kvalificerad gissning/i)) successes.push('safe_direct_guess');
  if (scenario.length >= 10 && !hasAny(botText, /^(hej|hejsan|hi)[!.]?\s/im)) successes.push('kept_conversation_state');
  return successes;
};

const evaluateTranscript = (scenario, transcript) => {
  const flags = [];
  transcript.forEach((turn, index) => {
    Object.entries(flagRules).forEach(([code, rule]) => {
      if (rule(turn.botReply, transcript, index, scenario)) flags.push(code);
    });
  });
  const uniqueFlags = unique(flags);
  const successes = classifySuccesses(transcript, scenario);

  let technical = 5;
  let human = 5;
  let trust = 5;
  let sales = 5;

  const penalty = (score, amount) => clampScore(score - amount);
  uniqueFlags.forEach((flag) => {
    if (['robotic', 'lost_conversation_state', 'repetitive', 'recommendation_too_early'].includes(flag)) technical = penalty(technical, 1.4);
    if (['over_questioning', 'generic_answer', 'failed_emotional_handling', 'failed_browsing_handling'].includes(flag)) human = penalty(human, 1.2);
    if (['weak_trust_building', 'ignored_uncertainty', 'failed_contradiction_handling'].includes(flag)) trust = penalty(trust, 1.1);
    if (['unnecessary_qualification', 'recommendation_too_late', 'weak_explanation', 'under_questioning'].includes(flag)) sales = penalty(sales, 1.0);
    if (flag === 'ignored_context') {
      human = penalty(human, 0.8);
      sales = penalty(sales, 0.8);
    }
  });

  if (successes.includes('handled_uncertainty')) trust = clampScore(trust + 0.3);
  if (successes.includes('built_trust')) trust = clampScore(trust + 0.4);
  if (successes.includes('handled_emotion')) human = clampScore(human + 0.4);
  if (successes.includes('reward_fit_over_bonus')) sales = clampScore(sales + 0.4);
  if (successes.includes('safe_direct_guess')) human = clampScore(human + 0.2);

  const finalScore = clampScore((technical + human + trust + sales) / 4);
  return {
    technical,
    human,
    trust,
    sales,
    finalScore,
    flags: uniqueFlags,
    successes,
  };
};

const runScenario = async (scenario, runStamp) => {
  const sessionId = `${runStamp}-gauntlet-${scenario.id}`;
  const messages = [];
  let qualification = {};
  let cart = [];
  let conversationStyle = null;
  let previousBotReply = '';
  const transcript = [];

  for (let turnIndex = 0; turnIndex < scenario.length; turnIndex += 1) {
    const userMessage = buildCustomerMessage({
      persona: scenario.persona,
      situation: scenario.situation,
      turnIndex,
      length: scenario.length,
      botReply: previousBotReply,
    });
    const response = await postChat({
      sessionId,
      message: userMessage,
      messages,
      language: 'sv',
      qualification,
      cart,
      conversationStyle,
      context: { conversationStyle },
      page: {},
    });
    const botReply = String(response.reply || '').trim();
    transcript.push({
      turn: turnIndex + 1,
      userMessage,
      botReply,
      signals: {
        intent: response.intent,
        conversationStyle: response.conversationStyle,
        marketClassification: response.marketClassification,
        offerCalculation: response.offerCalculation
          ? {
            readyForOffer: response.offerCalculation.readyForOffer,
            validOfferAvailable: response.offerCalculation.validOfferAvailable,
            noOfferReason: response.offerCalculation.noOfferReason,
          }
          : null,
      },
    });
    messages.push({ role: 'user', content: userMessage }, { role: 'assistant', content: botReply });
    qualification = response.qualification || qualification;
    cart = response.cart || cart;
    conversationStyle = response.conversationStyle || conversationStyle;
    previousBotReply = botReply;
  }

  return {
    scenario,
    sessionId,
    transcript,
    evaluation: evaluateTranscript(scenario, transcript),
  };
};

const renderConversationMarkdown = ({ scenario, sessionId, transcript, evaluation, jsonPath }) => {
  const turns = transcript.map((turn) => [
    `### Turn ${turn.turn}`,
    '',
    '**Customer:**',
    '',
    turn.userMessage,
    '',
    '**Dealett AI:**',
    '',
    turn.botReply,
    '',
    '**Signals:**',
    '',
    `- intent: ${turn.signals.intent || 'unknown'}`,
    `- style: ${turn.signals.conversationStyle?.style || 'unknown'}`,
    `- market: ${turn.signals.marketClassification?.status || 'none'}`,
    `- valid offer: ${turn.signals.offerCalculation?.validOfferAvailable === true ? 'yes' : 'no'}`,
  ].join('\n')).join('\n\n');

  return [
    `# Real Human Gauntlet: ${scenario.name}`,
    '',
    `- Session: ${sessionId}`,
    `- API: ${CHAT_API_URL}`,
    `- Persona: ${scenario.persona}`,
    `- Situation: ${scenario.situation}`,
    `- Length: ${scenario.length} turns`,
    `- JSON: ${jsonPath}`,
    '',
    '## Scores',
    '',
    `- Technical: ${evaluation.technical}/5`,
    `- Human: ${evaluation.human}/5`,
    `- Trust: ${evaluation.trust}/5`,
    `- Sales quality: ${evaluation.sales}/5`,
    `- Final: ${evaluation.finalScore}/5`,
    '',
    `Flags: ${evaluation.flags.join(', ') || 'none'}`,
    '',
    `Successes: ${evaluation.successes.join(', ') || 'none'}`,
    '',
    '## Transcript',
    '',
    turns,
    '',
  ].join('\n');
};

const saveScenario = (result, runStamp) => {
  const baseName = `${runStamp}-gauntlet-${String(result.scenario.id).padStart(3, '0')}-${slugify(result.scenario.persona)}-${slugify(result.scenario.situation)}`;
  const jsonPath = path.join(OUTPUT_DIR, `${baseName}.json`);
  const mdPath = path.join(OUTPUT_DIR, `${baseName}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify({
    timestamp: new Date().toISOString(),
    apiUrl: CHAT_API_URL,
    scenario: result.scenario,
    sessionId: result.sessionId,
    transcript: result.transcript,
    evaluation: result.evaluation,
  }, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderConversationMarkdown({ ...result, jsonPath }));
  return { jsonPath, mdPath };
};

const countBy = (items, selector) => items.reduce((map, item) => {
  const keys = selector(item);
  (Array.isArray(keys) ? keys : [keys]).filter(Boolean).forEach((key) => {
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
}, new Map());

const topEntries = (map, limit = 20) => [...map.entries()]
  .sort((left, right) => right[1] - left[1] || String(left[0]).localeCompare(String(right[0])))
  .slice(0, limit)
  .map(([name, count]) => ({ name, count }));

const buildSummary = (results) => {
  const averages = ['technical', 'human', 'trust', 'sales', 'finalScore'].reduce((memo, key) => ({
    ...memo,
    [key]: clampScore(results.reduce((sum, result) => sum + result.evaluation[key], 0) / results.length),
  }), {});
  const flagCounts = topEntries(countBy(results, (result) => result.evaluation.flags), 30);
  const successCounts = topEntries(countBy(results, (result) => result.evaluation.successes), 30);
  const personaAverages = personas.map((persona) => {
    const subset = results.filter((result) => result.scenario.persona === persona);
    return {
      persona,
      average: clampScore(subset.reduce((sum, result) => sum + result.evaluation.finalScore, 0) / subset.length),
      count: subset.length,
    };
  }).sort((left, right) => left.average - right.average);
  const situationAverages = situations.map((situation) => {
    const subset = results.filter((result) => result.scenario.situation === situation);
    return {
      situation,
      average: clampScore(subset.reduce((sum, result) => sum + result.evaluation.finalScore, 0) / subset.length),
      count: subset.length,
    };
  }).sort((left, right) => left.average - right.average);

  const poor = [...results].sort((left, right) => left.evaluation.finalScore - right.evaluation.finalScore).slice(0, 10);
  const excellent = [...results]
    .filter((result) => result.evaluation.finalScore >= 4.5)
    .sort((left, right) => right.evaluation.successes.length - left.evaluation.successes.length)
    .slice(0, 10);

  const roadmap = [
    ['Reduce generic fallback answers', flagCounts.find((item) => item.name === 'generic_answer')?.count || 0],
    ['Improve context preservation in long messy conversations', flagCounts.find((item) => item.name === 'lost_conversation_state')?.count || 0],
    ['Handle uncertainty and approximate memory more consistently', flagCounts.find((item) => item.name === 'ignored_uncertainty')?.count || 0],
    ['Improve emotional acknowledgement for frustrated users', flagCounts.find((item) => item.name === 'failed_emotional_handling')?.count || 0],
    ['Avoid unnecessary qualification for browsers/reward hunters/skeptics', flagCounts.find((item) => item.name === 'unnecessary_qualification')?.count || 0],
    ['Improve contradiction recovery', flagCounts.find((item) => item.name === 'failed_contradiction_handling')?.count || 0],
    ['Strengthen explanation of recommendation logic', flagCounts.find((item) => item.name === 'weak_explanation')?.count || 0],
    ['Keep asking enough but not too much', (flagCounts.find((item) => item.name === 'over_questioning')?.count || 0) + (flagCounts.find((item) => item.name === 'under_questioning')?.count || 0)],
  ]
    .map(([item, impact]) => ({ item, impact }))
    .sort((left, right) => right.impact - left.impact);

  return {
    timestamp: new Date().toISOString(),
    apiUrl: CHAT_API_URL,
    totalConversations: results.length,
    totalTurns: results.reduce((sum, result) => sum + result.transcript.length, 0),
    turnLengthMix: topEntries(countBy(results, (result) => `${result.scenario.length} turns`), 10),
    averageScores: averages,
    top20Weaknesses: flagCounts.slice(0, 20),
    top20Strengths: successCounts.slice(0, 20),
    mostCommonFailurePatterns: flagCounts.slice(0, 10),
    mostCommonSuccessPatterns: successCounts.slice(0, 10),
    personaAverages,
    situationAverages,
    examplesExcellent: excellent.map((result) => ({
      name: result.scenario.name,
      score: result.evaluation.finalScore,
      successes: result.evaluation.successes,
      path: result.paths.mdPath,
    })),
    examplesPoor: poor.map((result) => ({
      name: result.scenario.name,
      score: result.evaluation.finalScore,
      flags: result.evaluation.flags,
      path: result.paths.mdPath,
    })),
    improvementRoadmap: roadmap,
    transcripts: results.map((result) => ({
      name: result.scenario.name,
      persona: result.scenario.persona,
      situation: result.scenario.situation,
      length: result.scenario.length,
      score: result.evaluation.finalScore,
      flags: result.evaluation.flags,
      successes: result.evaluation.successes,
      markdownPath: result.paths.mdPath,
      jsonPath: result.paths.jsonPath,
    })),
  };
};

const renderSummaryMarkdown = (summary) => {
  const list = (items, label = 'name') => items.length
    ? items.map((item, index) => `${index + 1}. ${item[label] || item.item}: ${item.count ?? item.impact ?? item.average ?? ''}`).join('\n')
    : 'None.';
  const examples = (items) => items.length
    ? items.map((item, index) => `${index + 1}. ${item.name} (${item.score}/5): ${item.path}`).join('\n')
    : 'None.';

  return [
    '# Real Human Gauntlet Evaluation',
    '',
    '## Executive Summary',
    '',
    `- API: ${summary.apiUrl}`,
    `- Conversations: ${summary.totalConversations}`,
    `- Total turns: ${summary.totalTurns}`,
    `- Average technical score: ${summary.averageScores.technical}/5`,
    `- Average human score: ${summary.averageScores.human}/5`,
    `- Average trust score: ${summary.averageScores.trust}/5`,
    `- Average sales quality score: ${summary.averageScores.sales}/5`,
    `- Final average score: ${summary.averageScores.finalScore}/5`,
    '',
    'This is a heuristic live evaluation against the real HTTP endpoint. It intentionally uses messy, difficult ordinary-customer behavior and does not modify the chatbot.',
    '',
    '## Conversation Length Mix',
    '',
    list(summary.turnLengthMix),
    '',
    '## Top 20 Weaknesses',
    '',
    list(summary.top20Weaknesses),
    '',
    '## Top 20 Strengths',
    '',
    list(summary.top20Strengths),
    '',
    '## Most Common Failure Patterns',
    '',
    list(summary.mostCommonFailurePatterns),
    '',
    '## Most Common Success Patterns',
    '',
    list(summary.mostCommonSuccessPatterns),
    '',
    '## Lowest Persona Averages',
    '',
    summary.personaAverages.slice(0, 10).map((item, index) => `${index + 1}. ${item.persona}: ${item.average}/5 (${item.count})`).join('\n'),
    '',
    '## Lowest Situation Averages',
    '',
    summary.situationAverages.slice(0, 10).map((item, index) => `${index + 1}. ${item.situation}: ${item.average}/5 (${item.count})`).join('\n'),
    '',
    '## Examples Of Excellent Conversations',
    '',
    examples(summary.examplesExcellent),
    '',
    '## Examples Of Poor Conversations',
    '',
    examples(summary.examplesPoor),
    '',
    '## Improvement Roadmap Ranked By Impact',
    '',
    summary.improvementRoadmap.map((item, index) => `${index + 1}. ${item.item} (observed impact count: ${item.impact})`).join('\n'),
    '',
  ].join('\n');
};

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const runStamp = timestamp();
  const results = [];
  const scenarios = makeScenarios();

  for (const scenario of scenarios) {
    const result = await runScenario(scenario, runStamp);
    result.paths = saveScenario(result, runStamp);
    results.push(result);
    if (result.scenario.id % 10 === 0) {
      console.log(`Completed ${result.scenario.id}/${scenarios.length}`);
    }
  }

  const summary = buildSummary(results);
  const summaryJsonPath = path.join(OUTPUT_DIR, 'latest-real-human-gauntlet-summary.json');
  const summaryMdPath = path.join(OUTPUT_DIR, 'latest-real-human-gauntlet-summary.md');
  fs.writeFileSync(summaryJsonPath, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(summaryMdPath, renderSummaryMarkdown(summary));

  console.log('');
  console.log(`Real human gauntlet complete against ${CHAT_API_URL}`);
  console.log(`Conversations: ${summary.totalConversations}`);
  console.log(`Turns: ${summary.totalTurns}`);
  console.log(`Average final score: ${summary.averageScores.finalScore}/5`);
  console.log(`Summary JSON: ${summaryJsonPath}`);
  console.log(`Summary MD: ${summaryMdPath}`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
