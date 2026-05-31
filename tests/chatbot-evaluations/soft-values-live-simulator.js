#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_CHAT_API_URL = 'http://localhost:3000/api/chat';
const CHAT_API_URL = process.env.CHAT_API_URL || DEFAULT_CHAT_API_URL;
const OUTPUT_DIR = path.join(__dirname, 'results');

const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

const escapeMarkdown = (value) => String(value ?? '').replace(/\|/g, '\\|');

const scenarios = [
  {
    name: 'Coverage vague area',
    profile: 'Lives in Jakobsberg and wants best coverage, but does not give exact address.',
    turns: ['jag bor i jakobsberg och vill ha bäst täckning'],
    expectations: {
      practical: /jakobsberg|område|hemma|pendling|jobb|inomhus|adress|täckningskarta|karta/i,
      softSignal: /jakobsberg|område/i,
      noDeadEnd: true,
      noGuarantee: true,
    },
  },
  {
    name: 'Coverage indoor problem',
    profile: 'Coverage works outside but is bad indoors.',
    turns: ['hemma har jag dålig täckning men ute funkar det'],
    expectations: {
      practical: /inomhus|väggar|byggnad|wifi-samtal|wi-fi-samtal|wifi calling|hemma|operatör|område/i,
      noDeadEnd: true,
      noGuarantee: true,
    },
  },
  {
    name: 'Unknown current price',
    profile: 'Customer does not know current price.',
    turns: ['vet inte vad jag betalar'],
    expectations: {
      practical: /ungefär|under 200|200.*350|över 350|spann|räcker|faktura/i,
      approximate: true,
      noDeadEnd: true,
    },
  },
  {
    name: 'Unknown data usage',
    profile: 'Customer does not know monthly GB usage.',
    turns: ['ingen aning hur mycket surf jag använder'],
    expectations: {
      practical: /tar surfen slut|stream|social|bankid|kart|wifi|beteende|använder/i,
      behaviorBased: true,
      noDeadEnd: true,
    },
  },
  {
    name: 'Just wants it to work',
    profile: 'Customer cares about reliability more than GB.',
    turns: ['jag bryr mig inte om gb jag vill bara att det ska funka'],
    expectations: {
      practical: /täckning|stabil|funkar|hemma|jobb|pendling|reliab|nät/i,
      noDeadEnd: true,
      noUnlimitedOversell: true,
    },
  },
  {
    name: 'Parent buying for child',
    profile: 'Parent wants a non-expensive plan for a child.',
    turns: ['det är till mitt barn, vill inte att det blir dyrt'],
    expectations: {
      practical: /barn|ungdom|billig|enkel|surfgräns|kontroll|ålder|användning/i,
      noUnlimitedOversell: true,
    },
  },
  {
    name: 'Elderly parent simple needs',
    profile: 'Elderly parent mostly needs calls and BankID.',
    turns: ['min pappa behöver bara ringa och lite bankid'],
    expectations: {
      practical: /låg surf|lite surf|enkelt|ringa|bankid|senior|wifi/i,
      noUnlimitedOversell: true,
    },
  },
  {
    name: 'Family unclear',
    profile: 'Family situation is messy and unclear.',
    turns: ['vi är flera hemma och allt är rörigt'],
    expectations: {
      practical: /förenkla|börja enkelt|hur många|familj|samla|mobilanvändare|kombiner/i,
      noDeadEnd: true,
    },
  },
  {
    name: 'Emotional frustrated',
    profile: 'Customer is frustrated and distrusts subscriptions.',
    turns: ['jag orkar inte med abonnemang, alla luras'],
    expectations: {
      practical: /förstår|frustrerande|lugnt|pressa|jämför|enkelt|ett steg/i,
      emotion: true,
      noDeadEnd: true,
    },
  },
  {
    name: 'Approximate price',
    profile: 'Customer gives approximate current price.',
    turns: ['tror jag betalar runt 300 nånting'],
    expectations: {
      practical: /ungefär|runt 300|räcker|spann|operatör|surf/i,
      approximate: true,
      noDeadEnd: true,
    },
  },
  {
    name: 'Mixed mobile and broadband need',
    profile: 'Customer may need both home internet and mobile.',
    turns: ['jag behöver internet hemma och mobil kanske samma'],
    expectations: {
      practical: /hemma|mobil|bredband|separat|olika|viktigast|akut/i,
      noDeadEnd: true,
    },
  },
  {
    name: 'Best not cheapest',
    profile: 'Customer wants best, not cheapest.',
    turns: ['jag vill ha bästa, inte billigaste'],
    expectations: {
      practical: /bästa|täckning|hastighet|support|stabilitet|familj|värde/i,
      noDeadEnd: true,
    },
  },
  {
    name: 'Safe choice',
    profile: 'Customer wants a safe cautious choice.',
    turns: ['vill bara ha säkert val'],
    expectations: {
      practical: /säkert|trygg|täckning|bindning|ingen bindning|försiktigt|stabil/i,
      noDeadEnd: true,
      noGuarantee: true,
    },
  },
  {
    name: 'No patience',
    profile: 'Customer does not want many questions.',
    turns: ['ställ inte massa frågor bara säg'],
    expectations: {
      practical: /kort|rimlig|säkert|börja|mobil|bredband|täckning|pris/i,
      noDeadEnd: true,
    },
  },
  {
    name: 'Vague place Barkarby',
    profile: 'Customer gives a vague nearby place.',
    turns: ['bor nära barkarby typ'],
    expectations: {
      practical: /barkarby|område|nära|adress|täckning|hemma|inomhus/i,
      softSignal: /barkarby|område|nära/i,
      noGuarantee: true,
    },
  },
  {
    name: 'Current operator bad at home',
    profile: 'Customer says Tele2 is bad at home.',
    turns: ['har tele2 och det suger hemma'],
    expectations: {
      practical: /tele2|hemma|inomhus|annan operatör|annat nät|täckning|wifi-samtal|område/i,
      softSignal: /tele2|hemma/i,
      noDeadEnd: true,
    },
  },
  {
    name: 'Friend coverage signal',
    profile: 'Friend has Telia and it works well at customer home.',
    turns: ['min kompis har telia och det funkar bra hos mig'],
    expectations: {
      practical: /telia|bra signal|nyttig signal|telefon|adress|inomhus|enhet|sim/i,
      softSignal: /kompis|telia|signal/i,
      noGuarantee: true,
    },
  },
  {
    name: 'Gift card but bad fit',
    profile: 'Customer only wants highest gift card.',
    turns: ['jag vill ha högsta presentkortet bara'],
    expectations: {
      practical: /presentkort|passar|behov|total|dyrare|värt|inte bara/i,
      giftcardFit: true,
      noDeadEnd: true,
    },
  },
  {
    name: 'Invoice confusion',
    profile: 'Customer does not understand invoice.',
    turns: ['jag fattar inte min faktura'],
    expectations: {
      practical: /faktura|total|månad|antal|abonnemang|tjänster|rader|kostnad/i,
      noDeadEnd: true,
    },
  },
  {
    name: 'Old plan',
    profile: 'Customer has had same plan for many years.',
    turns: ['jag har haft samma abonnemang i många år'],
    expectations: {
      practical: /gammalt|många år|bra|överpris|pris|surf|jämföra/i,
      noDeadEnd: true,
    },
  },
];

const postChat = async (payload) => {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Chat API failed with HTTP ${response.status}`);
  }
  return body;
};

const compactResponse = (response) => ({
  intent: response.intent,
  suggestions: response.suggestions,
  qualification: response.qualification,
  marketClaim: response.marketClaim,
  marketClassification: response.marketClassification,
  offerCalculation: response.offerCalculation
    ? {
      readyForOffer: response.offerCalculation.readyForOffer,
      validOfferAvailable: response.offerCalculation.validOfferAvailable,
      noOfferReason: response.offerCalculation.noOfferReason,
      assumptions: response.offerCalculation.assumptions,
      options: (response.offerCalculation.options || []).map((option) => ({
        operator: option.operator,
        title: option.title,
        monthlyPrice: option.monthlyPrice,
        savingsVsStaying: option.savingsVsStaying,
        rewardTotal: option.rewardTotal,
      })),
    }
    : null,
});

const countQuestions = (text) => (String(text || '').match(/\?/g) || []).length;

const hasGenericRestart = (text) => (
  /^(hej|hi)[!.]?\s*(jag kan hjälpa|hur kan jag hjälpa|vad kan jag hjälpa|how can i help)/i.test(String(text || '').trim()) ||
  /ska vi titta på mobilabonnemang, familjepaket eller 5g-bredband/i.test(String(text || ''))
);

const hasGuarantee = (text) => (
  /jag kan garantera|garanterar|garanterat|säkert att .*funkar|kommer funka|i guarantee|guaranteed/i.test(String(text || ''))
);

const hasDeadEndUncertainty = (text) => {
  const value = String(text || '').toLowerCase();
  const uncertain = /kan inte veta|kan inte avgöra|kan inte säga|går inte att veta|i cannot know|can't know|cannot determine/.test(value);
  const practical = /men|däremot|börja|kolla|testa|praktiskt|täckning|hemma|adress|ungefär|spann|fråga|nästa steg/.test(value);
  return uncertain && !practical;
};

const demandsExactInfo = (text) => (
  /måste veta exakt|behöver exakt|exakt pris krävs|exakt adress krävs|kan inte hjälpa utan exakt|need exact|must know exact/i
    .test(String(text || ''))
);

const oversellsUnlimited = (text) => (
  /rekommenderar.*(obegränsad|fri surf)|obegränsad.*är bäst|fri surf.*är bäst/i.test(String(text || ''))
);

const giftcardOverFit = (text) => {
  const value = String(text || '');
  return /presentkort/i.test(value) &&
    !/passar|behov|total|dyrare|värt|inte bara|först|kostnad|abonnemang/i.test(value);
};

const ignoresEmotion = (text) => !/förstår|frustrerande|jobbigt|lugnt|pressa|enkelt|steg/i.test(String(text || ''));

const noPracticalGuidance = (scenario, text) => {
  const expected = scenario.expectations?.practical;
  return expected && !expected.test(String(text || ''));
};

const ignoresSoftSignal = (scenario, text) => {
  const expected = scenario.expectations?.softSignal;
  return expected && !expected.test(String(text || ''));
};

const buildIssue = (code, severity, message, turnIndex = null) => ({
  code,
  severity,
  message,
  turn: turnIndex === null ? null : turnIndex + 1,
});

const detectIssues = (scenario, transcript) => {
  const issues = [];
  const fullBotText = transcript.map((turn) => turn.botReply || '').join('\n');

  transcript.forEach((turn, index) => {
    const reply = turn.botReply || '';

    if (countQuestions(reply) > 1) {
      issues.push(buildIssue('asks_too_many_questions', 'critical', 'Bot asked more than one refining question in one reply.', index));
    }
    if (hasGenericRestart(reply) && index > 0) {
      issues.push(buildIssue('generic_restart', 'critical', 'Bot restarted the funnel after context existed.', index));
    }
    if (hasGuarantee(reply)) {
      issues.push(buildIssue('fake_guarantee', 'critical', 'Bot used guarantee wording.', index));
    }
    if (hasDeadEndUncertainty(reply)) {
      issues.push(buildIssue('dead_end_uncertainty', 'critical', 'Bot gave uncertainty without a practical next step.', index));
    }
    if (demandsExactInfo(reply)) {
      issues.push(buildIssue('demands_exact_info', 'critical', 'Bot demanded exact information where approximate guidance should be enough.', index));
    }
    if (oversellsUnlimited(reply) && scenario.expectations?.noUnlimitedOversell) {
      issues.push(buildIssue('oversells_unlimited', 'critical', 'Bot pushed unlimited data despite simple/soft needs.', index));
    }
    if (giftcardOverFit(reply) && scenario.expectations?.giftcardFit) {
      issues.push(buildIssue('giftcard_over_fit', 'critical', 'Bot emphasized gift card without plan fit or total value.', index));
    }
  });

  if (noPracticalGuidance(scenario, fullBotText)) {
    issues.push(buildIssue('no_practical_guidance', 'critical', 'Bot did not give expected practical soft guidance.'));
  }
  if (ignoresSoftSignal(scenario, fullBotText)) {
    issues.push(buildIssue('ignores_soft_signal', 'major', 'Bot ignored useful approximate or contextual signal.'));
  }
  if (scenario.expectations?.emotion && ignoresEmotion(fullBotText)) {
    issues.push(buildIssue('ignores_emotion', 'critical', 'Bot ignored emotional/frustrated context.'));
  }
  if (scenario.expectations?.approximate && demandsExactInfo(fullBotText)) {
    issues.push(buildIssue('demands_exact_info', 'critical', 'Bot demanded exact info instead of using an approximate range.'));
  }

  return issues;
};

const scoreFromIssues = (issues) => {
  if (issues.some((issue) => issue.severity === 'critical')) return 1;
  const majorCount = issues.filter((issue) => issue.severity === 'major').length;
  const mediumCount = issues.filter((issue) => issue.severity === 'medium').length;
  if (majorCount >= 2) return 2;
  if (majorCount === 1 || mediumCount >= 2) return 3;
  if (mediumCount === 1) return 4;
  return 5;
};

const recommendedFixesForIssues = (issues) => {
  const fixesByCode = {
    dead_end_uncertainty: 'Add practical uncertainty-aware guidance before asking the next question.',
    asks_too_many_questions: 'Ask only one refining question per reply.',
    no_practical_guidance: 'Add a soft-guidance layer for vague, approximate and emotional customer messages.',
    fake_guarantee: 'Remove guarantee wording and explain uncertainty clearly.',
    oversells_unlimited: 'Do not push unlimited data when the user describes simple usage or reliability needs.',
    giftcard_over_fit: 'Keep plan fit and total value ahead of gift card size.',
    ignores_emotion: 'Acknowledge frustration before guiding.',
    ignores_soft_signal: 'Use approximate area/operator/friend signals as useful but uncertain context.',
    generic_restart: 'Preserve session context and avoid restarting the funnel.',
    demands_exact_info: 'Convert exact-info demands into approximate range or behavior-based questions.',
  };

  return [...new Set(issues.map((issue) => fixesByCode[issue.code]).filter(Boolean))];
};

const evaluateTranscript = (scenario, transcript) => {
  const issues = detectIssues(scenario, transcript);
  const score = scoreFromIssues(issues);
  const recommendedFixes = recommendedFixesForIssues(issues);

  return {
    score,
    issues,
    recommendedFixes: recommendedFixes.length ? recommendedFixes : ['No automatic fix required; review tone manually.'],
  };
};

const runScenario = async (scenario, runStamp) => {
  const sessionId = `${runStamp}-soft-${slugify(scenario.name)}`;
  const messages = [];
  let qualification = {};
  let cart = [];
  const transcript = [];

  for (const [index, userMessage] of scenario.turns.entries()) {
    const response = await postChat({
      sessionId,
      message: userMessage,
      messages,
      language: 'sv',
      qualification,
      cart,
      page: {},
    });
    const botReply = String(response.reply || '').trim();

    transcript.push({
      turn: index + 1,
      userMessage,
      botReply,
      response: compactResponse(response),
    });

    messages.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: botReply }
    );
    qualification = response.qualification || qualification;
    cart = response.cart || cart;
  }

  const evaluation = evaluateTranscript(scenario, transcript);
  return { scenario, sessionId, transcript, evaluation };
};

const renderTranscriptMarkdown = ({ scenario, sessionId, transcript, evaluation, jsonPath }) => {
  const issueRows = evaluation.issues.length
    ? evaluation.issues.map((issue) => (
      `| ${escapeMarkdown(issue.code)} | ${escapeMarkdown(issue.severity)} | ${issue.turn || ''} | ${escapeMarkdown(issue.message)} |`
    )).join('\n')
    : '| none | none |  | No automatic issues detected. |';

  const transcriptText = transcript.map((turn) => [
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
    '**API Signals:**',
    '',
    `- intent: ${turn.response.intent || 'unknown'}`,
    `- market status: ${turn.response.marketClassification?.status || 'none'}`,
    `- valid offer: ${turn.response.offerCalculation?.validOfferAvailable === true ? 'yes' : 'no'}`,
  ].join('\n')).join('\n\n');

  return [
    `# Soft Values Live Simulation: ${scenario.name}`,
    '',
    `- Timestamp: ${new Date().toISOString()}`,
    `- Session: ${sessionId}`,
    `- API: ${CHAT_API_URL}`,
    `- JSON: ${jsonPath}`,
    `- Final score: ${evaluation.score}/5`,
    '',
    '## Customer Profile',
    '',
    scenario.profile,
    '',
    '## Transcript',
    '',
    transcriptText,
    '',
    '## Detected Issues',
    '',
    '| Code | Severity | Turn | Notes |',
    '|---|---|---:|---|',
    issueRows,
    '',
    '## Recommended Fixes',
    '',
    evaluation.recommendedFixes.map((fix) => `- ${fix}`).join('\n'),
    '',
  ].join('\n');
};

const saveScenarioResult = (result, runStamp) => {
  const baseName = `${runStamp}-soft-${slugify(result.scenario.name)}`;
  const jsonPath = path.join(OUTPUT_DIR, `${baseName}.json`);
  const mdPath = path.join(OUTPUT_DIR, `${baseName}.md`);
  const jsonPayload = {
    timestamp: new Date().toISOString(),
    apiUrl: CHAT_API_URL,
    scenarioName: result.scenario.name,
    sessionId: result.sessionId,
    profile: result.scenario.profile,
    transcript: result.transcript,
    evaluation: result.evaluation,
  };

  fs.writeFileSync(jsonPath, `${JSON.stringify(jsonPayload, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderTranscriptMarkdown({
    ...result,
    jsonPath,
  }));

  return { jsonPath, mdPath };
};

const summarizeResults = (results) => {
  const totalConversations = results.length;
  const averageScore = totalConversations
    ? Math.round((results.reduce((sum, result) => sum + result.evaluation.score, 0) / totalConversations) * 100) / 100
    : 0;
  const issueCounts = new Map();
  const fixCounts = new Map();

  results.forEach((result) => {
    result.evaluation.issues.forEach((issue) => {
      issueCounts.set(issue.code, (issueCounts.get(issue.code) || 0) + 1);
    });
    result.evaluation.recommendedFixes.forEach((fix) => {
      if (!fix.startsWith('No automatic')) fixCounts.set(fix, (fixCounts.get(fix) || 0) + 1);
    });
  });

  return {
    timestamp: new Date().toISOString(),
    apiUrl: CHAT_API_URL,
    totalConversations,
    averageScore,
    lowestScoringScenarios: [...results]
      .sort((left, right) => left.evaluation.score - right.evaluation.score || left.scenario.name.localeCompare(right.scenario.name))
      .slice(0, 5)
      .map((result) => ({
        scenarioName: result.scenario.name,
        score: result.evaluation.score,
        issues: result.evaluation.issues.map((issue) => issue.code),
        markdownPath: result.paths.mdPath,
        jsonPath: result.paths.jsonPath,
      })),
    repeatedIssues: [...issueCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([code, count]) => ({ code, count })),
    transcripts: results.map((result) => ({
      scenarioName: result.scenario.name,
      score: result.evaluation.score,
      markdownPath: result.paths.mdPath,
      jsonPath: result.paths.jsonPath,
    })),
    recommendedFixes: [...fixCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([fix, count]) => ({ fix, count })),
  };
};

const renderSummaryMarkdown = (summary) => {
  const lowestRows = summary.lowestScoringScenarios.length
    ? summary.lowestScoringScenarios.map((item) => (
      `| ${escapeMarkdown(item.scenarioName)} | ${item.score} | ${escapeMarkdown(item.issues.join(', ') || 'none')} | ${item.markdownPath} |`
    )).join('\n')
    : '| none |  |  |  |';
  const issueRows = summary.repeatedIssues.length
    ? summary.repeatedIssues.map((item) => `| ${escapeMarkdown(item.code)} | ${item.count} |`).join('\n')
    : '| none | 0 |';
  const transcriptRows = summary.transcripts.map((item) => (
    `| ${escapeMarkdown(item.scenarioName)} | ${item.score} | ${item.markdownPath} | ${item.jsonPath} |`
  )).join('\n');
  const fixes = summary.recommendedFixes.length
    ? summary.recommendedFixes.map((item) => `- (${item.count}x) ${item.fix}`).join('\n')
    : '- No automatic fixes recommended.';

  return [
    '# Latest Soft Values Live Chatbot Evaluation Summary',
    '',
    `- Timestamp: ${summary.timestamp}`,
    `- API: ${summary.apiUrl}`,
    `- Total conversations: ${summary.totalConversations}`,
    `- Average score: ${summary.averageScore}/5`,
    '',
    '## Lowest Scoring Scenarios',
    '',
    '| Scenario | Score | Issues | Markdown |',
    '|---|---:|---|---|',
    lowestRows,
    '',
    '## Repeated Issues',
    '',
    '| Issue | Count |',
    '|---|---:|',
    issueRows,
    '',
    '## Recommended Fixes',
    '',
    fixes,
    '',
    '## Transcripts',
    '',
    '| Scenario | Score | Markdown | JSON |',
    '|---|---:|---|---|',
    transcriptRows,
    '',
  ].join('\n');
};

const saveSummary = (summary) => {
  const jsonPath = path.join(OUTPUT_DIR, 'latest-soft-values-summary.json');
  const mdPath = path.join(OUTPUT_DIR, 'latest-soft-values-summary.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderSummaryMarkdown(summary));
  return { jsonPath, mdPath };
};

const main = async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const runStamp = timestamp();
  const results = [];

  for (const scenario of scenarios) {
    const result = await runScenario(scenario, runStamp);
    const paths = saveScenarioResult(result, runStamp);
    result.paths = paths;
    results.push(result);
    console.log(`Saved ${scenario.name}: ${paths.mdPath}`);
  }

  const summary = summarizeResults(results);
  const summaryPaths = saveSummary(summary);

  console.log('');
  console.log(`Soft-values live evaluation complete against ${CHAT_API_URL}`);
  console.log(`Saved ${results.length} conversations to: ${OUTPUT_DIR}`);
  console.log(`Summary JSON: ${summaryPaths.jsonPath}`);
  console.log(`Summary MD: ${summaryPaths.mdPath}`);
  console.log(`Average score: ${summary.averageScore}/5`);
  console.log(`Lowest scoring scenarios: ${summary.lowestScoringScenarios.map((item) => `${item.scenarioName} (${item.score}/5)`).join(', ') || 'none'}`);
};

main().catch((error) => {
  console.error('');
  console.error('Soft-values live chatbot evaluation failed.');
  console.error(`Endpoint: ${CHAT_API_URL}`);
  console.error(error.message || error);
  console.error('');
  console.error('Start the backend first, or set CHAT_API_URL to the live chat endpoint.');
  process.exitCode = 1;
});
