const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const { createServer } = require('../server');
const {
  buildCoverageSelectorWidget,
  buildOfferCardsFromOfferCalculation,
  buildChatResponse,
  getEmbeddedWidgetForChatState,
  getQuickRepliesForChatState,
  normalizeEmbeddedWidget,
  normalizeOfferCards,
  normalizeQuickReplies,
} = require('./chat-ui-response');

const HOST = '127.0.0.1';

const getFreePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, HOST, () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

const listen = (server, port) => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, HOST, resolve);
});

const postChat = async (baseUrl, payload) => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  assert.equal(response.status, 200, body.error || `HTTP ${response.status}`);
  return body;
};

(async () => {
  const normalized = normalizeQuickReplies([
    'Mobilabonnemang',
    { id: 'home-broadband', label: 'Bredband hemma' },
    '',
    'Täckning',
    'Presentkort',
    'Extra ignored',
  ]);
  assert.deepEqual(normalized, [
    { id: 'mobilabonnemang', label: 'Mobilabonnemang' },
    { id: 'home-broadband', label: 'Bredband hemma' },
    { id: 'tackning', label: 'Täckning' },
    { id: 'presentkort', label: 'Presentkort' },
  ]);

  assert.deepEqual(buildChatResponse({
    message: 'Hej',
    quickReplies: ['Mobilabonnemang'],
  }), {
    message: 'Hej',
    quickReplies: [{ id: 'mobilabonnemang', label: 'Mobilabonnemang' }],
    offerCards: [],
    embeddedWidget: null,
  });
  assert.deepEqual(buildChatResponse({ message: 'Hej' }), {
    message: 'Hej',
    quickReplies: [],
    offerCards: [],
    embeddedWidget: null,
  });
  assert.deepEqual(buildChatResponse({
    message: 'Erbjudande',
    offerCards: [
      {
        id: 'url-only',
        operator: 'Tele2',
        planName: 'Mobil 20 GB',
        ctaLabel: 'Välj erbjudande',
        ctaUrl: 'varukorg.html',
      },
    ],
  }), {
    message: 'Erbjudande',
    quickReplies: [],
    offerCards: [
      {
        id: 'url-only',
        operator: 'Tele2',
        planName: 'Mobil 20 GB',
        dataLabel: '',
        monthlyPriceLabel: '',
        rewardLabel: '',
        bindingLabel: '',
        reason: '',
        ctaLabel: 'Välj erbjudande',
        ctaUrl: 'varukorg.html',
        planId: '',
      },
    ],
    embeddedWidget: null,
  });
  assert.deepEqual(buildChatResponse({
    message: 'Både knappar och kort',
    quickReplies: ['Billigast'],
    offerCards: [
      {
        id: 'with-plan',
        operator: 'Tele2',
        planName: 'Mobil 20 GB',
        planId: 'tele2-20gb',
        ctaUrl: 'varukorg.html',
      },
    ],
  }), {
    message: 'Både knappar och kort',
    quickReplies: [{ id: 'billigast', label: 'Billigast' }],
    offerCards: [
      {
        id: 'with-plan',
        operator: 'Tele2',
        planName: 'Mobil 20 GB',
        dataLabel: '',
        monthlyPriceLabel: '',
        rewardLabel: '',
        bindingLabel: '',
        reason: '',
        ctaLabel: '',
        ctaUrl: 'varukorg.html',
        planId: 'tele2-20gb',
      },
    ],
    embeddedWidget: null,
  });
  assert.deepEqual(buildCoverageSelectorWidget({ language: 'sv' }), {
    type: 'coverage_selector',
    title: 'Kontrollera täckning',
    description: 'Täckning beror på exakt adress, men vi kan börja med en enkel kontroll.',
    actions: [
      { id: 'use_location', label: 'Använd min position' },
      { id: 'enter_address', label: 'Ange adress' },
      { id: 'compare_operators', label: 'Jämför operatörer' },
    ],
  });
  assert.deepEqual(getEmbeddedWidgetForChatState({ intent: 'coverage', language: 'sv' }), {
    type: 'coverage_selector',
    title: 'Kontrollera täckning',
    description: 'Täckning beror på exakt adress, men vi kan börja med en enkel kontroll.',
    actions: [
      { id: 'use_location', label: 'Använd min position' },
      { id: 'enter_address', label: 'Ange adress' },
      { id: 'compare_operators', label: 'Jämför operatörer' },
    ],
  });
  assert.equal(getEmbeddedWidgetForChatState({ intent: 'greeting', language: 'sv' }), null);
  assert.equal(normalizeEmbeddedWidget({ type: 'unknown', actions: [{ id: 'x', label: 'X' }] }), null);

  assert.deepEqual(normalizeOfferCards([]), []);
  assert.deepEqual(normalizeOfferCards([
    {
      id: 'tele2-20',
      operator: 'Tele2',
      planName: 'Mobil 20 GB',
      dataLabel: '20 GB',
      monthlyPriceLabel: '249 kr/mån',
      ctaUrl: 'varukorg.html',
    },
  ]), [
    {
      id: 'tele2-20',
      operator: 'Tele2',
      planName: 'Mobil 20 GB',
      dataLabel: '20 GB',
      monthlyPriceLabel: '249 kr/mån',
      rewardLabel: '',
      bindingLabel: '',
      reason: '',
      ctaLabel: '',
      ctaUrl: 'varukorg.html',
      planId: '',
    },
  ]);

  const offerCards = buildOfferCardsFromOfferCalculation({
    validOfferAvailable: true,
    options: [
      {
        planId: 'tele2-20gb',
        operator: 'Tele2',
        title: 'Mobil 20 GB',
        data: '20 GB',
        monthlyPrice: 249,
        rewardTotal: 1000,
        contractMonths: 24,
        savingsVsStaying: 1200,
      },
    ],
  });
  assert.deepEqual(offerCards, [
    {
      id: 'tele2-20gb',
      operator: 'Tele2',
      planName: 'Mobil 20 GB',
      dataLabel: '20 GB',
      monthlyPriceLabel: '249 kr/mån',
      rewardLabel: 'Presentkort 1 000 kr',
      bindingLabel: '24 mån bindningstid',
      reason: 'Uppskattad vinst 1 200 kr efter dubbelkostnad och presentkort.',
      ctaLabel: 'Välj erbjudande',
      ctaUrl: 'varukorg.html',
      planId: 'tele2-20gb',
    },
  ]);

  assert.equal(buildOfferCardsFromOfferCalculation({
    validOfferAvailable: true,
    options: [
      { planId: 'one', operator: 'Tele2', title: 'One', monthlyPrice: 1 },
      { planId: 'two', operator: 'Tele2', title: 'Two', monthlyPrice: 2 },
      { planId: 'three', operator: 'Tele2', title: 'Three', monthlyPrice: 3 },
      { planId: 'four', operator: 'Tele2', title: 'Four', monthlyPrice: 4 },
    ],
  }).length, 3);
  assert.deepEqual(buildOfferCardsFromOfferCalculation({
    validOfferAvailable: false,
    options: [{ planId: 'fake', operator: 'Tele2', title: 'Fake' }],
  }), []);
  assert.deepEqual(buildOfferCardsFromOfferCalculation({
    validOfferAvailable: true,
    options: [{ operator: 'Tre' }],
  })[0].operator, 'Tre');

  assert.deepEqual(
    getQuickRepliesForChatState({ intent: 'greeting', language: 'sv' }).map((reply) => reply.label),
    ['Mobilabonnemang', 'Bredband hemma', 'Täckning', 'Presentkort']
  );
  assert.deepEqual(
    getQuickRepliesForChatState({ intent: 'browsing', language: 'sv' }).map((reply) => reply.label),
    ['Hur fungerar Dealett?', 'Mobilabonnemang', 'Bredband hemma']
  );
  assert.deepEqual(
    getQuickRepliesForChatState({ intent: 'coverage', language: 'sv' }).map((reply) => reply.label),
    ['Kontrollera täckning', 'Jämför operatörer']
  );
  assert.deepEqual(
    getQuickRepliesForChatState({
      intent: 'style_guided',
      language: 'sv',
      conversationStyle: { style: 'direct_answer' },
    }).map((reply) => reply.label),
    ['Välj åt mig', 'Billigast', 'Bästa täckning']
  );
  assert.deepEqual(
    getQuickRepliesForChatState({
      intent: 'style_guided',
      language: 'sv',
      conversationStyle: { style: 'confused' },
    }).map((reply) => reply.label),
    ['Mobil', 'Bredband', 'Täckning']
  );
  assert.deepEqual(
    getQuickRepliesForChatState({
      intent: 'mobile_offer',
      language: 'sv',
      conversationStyle: { style: 'confused' },
    }),
    []
  );

  const port = await getFreePort();
  const server = createServer();
  await listen(server, port);
  const baseUrl = `http://${HOST}:${port}`;

  try {
    const stalePrefixHistory = [
      { role: 'user', content: 'jag vill ha högsta presentkortet' },
      { role: 'assistant', content: 'För att presentkortet inte ska bli en dålig totalaffär: vi jämför totalvärdet.' },
      { role: 'user', content: 'typ 300 kr' },
      { role: 'assistant', content: 'Jag tar det som ungefärligt: vilken operatör har du idag?' },
    ];
    const completedQualification = {
      peopleCount: 3,
      operators: ['Telia', 'Tele2', 'Telia'],
      bindingEnds: ['Ingen bindningstid', '2 months', 'Ingen bindningstid'],
      mobileUsage: 'medium',
      priceRange: null,
      exactMonthlyPrice: 399,
      exactMonthlyPrices: [399, 399, 399],
      readyForOffer: true,
      missingFields: [],
    };
    const assertNoLeakedAdvisoryPrefix = (body) => {
      assert.doesNotMatch(body.reply, /För att presentkortet inte ska bli en dålig totalaffär/i);
      assert.doesNotMatch(body.reply, /Jag tar det som ungefärligt/i);
      assert.doesNotMatch(body.reply, /Ungefär räcker här/i);
    };
    const assertNoStaleOfferLoop = (body) => {
      assert.deepEqual(body.offerCards, []);
      assert.doesNotMatch(body.reply, /Jag hittade ett giltigt alternativ|Uppskattad vinst|Bäst match/i);
      assert.notEqual(body.offerCalculation?.validOfferAvailable, true);
    };

    const greeting = await postChat(baseUrl, {
      message: 'hej',
      language: 'sv',
      messages: stalePrefixHistory,
      qualification: completedQualification,
      cart: [],
      page: {},
    });
    assert.equal(greeting.message, greeting.reply);
    assert.equal(
      greeting.reply,
      'Hej! Jag kan hjälpa dig jämföra mobilabonnemang, bredband, täckning och presentkort. Vad vill du börja med?'
    );
    assertNoLeakedAdvisoryPrefix(greeting);
    assert.doesNotMatch(greeting.reply, /befintliga abonnemang|faktura|varukorg/i);
    assert.deepEqual(greeting.quickReplies.map((reply) => reply.label), [
      'Mobilabonnemang',
      'Bredband hemma',
      'Täckning',
      'Presentkort',
    ]);
    assert.deepEqual(greeting.offerCards, []);
    assert.equal(greeting.embeddedWidget, null);
    assert.equal(greeting.qualification.readyForOffer, false);

    const repeatedGreeting = await postChat(baseUrl, {
      message: 'hej',
      language: 'sv',
      messages: [
        {
          role: 'assistant',
          content: 'Hej! Jag kan hjälpa dig jämföra mobilabonnemang, bredband, täckning och presentkort. Vad vill du börja med?',
        },
      ],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(
      repeatedGreeting.reply,
      'Hej! Jag kan hjälpa dig jämföra mobilabonnemang, bredband, täckning och presentkort. Vad vill du börja med?'
    );
    assert.doesNotMatch(repeatedGreeting.reply, /Jag frågar enklare/i);

    const capabilities = await postChat(baseUrl, {
      message: 'ok men vad kan du göra',
      language: 'sv',
      messages: [
        { role: 'user', content: 'faktura' },
        { role: 'assistant', content: 'Jag kan guida dig, men jag har inte live-data om konto eller faktura i chatten.' },
      ],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(capabilities.intent, 'capabilities');
    assert.match(capabilities.reply, /jämföra mobilabonnemang|5G-bredband|täckning|presentkortsvärde/i);
    assert.match(capabilities.reply, /inte se live-data/i);
    assert.doesNotMatch(capabilities.reply, /^Hej!/);
    assert.deepEqual(capabilities.quickReplies, []);

    const identity = await postChat(baseUrl, {
      message: 'är du en människa',
      language: 'sv',
      messages: [],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(identity.intent, 'identity');
    assert.match(identity.reply, /Dealett AI|inte en människa/i);
    assert.doesNotMatch(identity.reply, /Det är för att pris, täckning/i);
    assert.deepEqual(identity.quickReplies, []);

    const shortIdentity = await postChat(baseUrl, {
      message: 'människa',
      language: 'sv',
      messages: [],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(shortIdentity.intent, 'identity');
    assert.match(shortIdentity.reply, /Dealett AI|inte en människa/i);
    assert.deepEqual(shortIdentity.quickReplies, []);

    const smallTalk = await postChat(baseUrl, {
      message: 'gillar du fotboll',
      language: 'sv',
      messages: [],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(smallTalk.intent, 'small_talk');
    assert.match(smallTalk.reply, /inga egna hobbyer|mobilabonnemang|bredband/i);
    assert.deepEqual(smallTalk.quickReplies, []);

    const greetingWithSmallTalk = await postChat(baseUrl, {
      message: 'hej hur mår du',
      language: 'sv',
      messages: stalePrefixHistory,
      qualification: completedQualification,
      cart: [],
      page: {},
    });
    assert.equal(greetingWithSmallTalk.intent, 'greeting');
    assert.equal(
      greetingWithSmallTalk.reply,
      'Hej! Jag kan hjälpa dig jämföra mobilabonnemang, bredband, täckning och presentkort. Vad vill du börja med?'
    );
    assertNoLeakedAdvisoryPrefix(greetingWithSmallTalk);

    const genericMobileStart = await postChat(baseUrl, {
      message: 'abonnemang',
      language: 'sv',
      messages: [],
      qualification: completedQualification,
      cart: [],
      page: {},
    });
    assertNoStaleOfferLoop(genericMobileStart);
    assert.equal(genericMobileStart.intent, 'mobile_offer');
    assert.match(genericMobileStart.reply, /Hur många abonnemang|gäller det ett abonnemang eller flera/i);

    const priceOnlyStart = await postChat(baseUrl, {
      message: 'jag vill inte just nu jag vill bara får pris',
      language: 'sv',
      messages: [
        { role: 'user', content: 'hej' },
        { role: 'assistant', content: greeting.reply },
      ],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(priceOnlyStart.intent, 'mobile_offer');
    assert.match(priceOnlyStart.reply, /håller det till pris|bara dig eller flera abonnemang/i);

    const onePersonPriceFlow = await postChat(baseUrl, {
      message: 'bara mig',
      language: 'sv',
      messages: [
        { role: 'user', content: 'jag vill inte just nu jag vill bara får pris' },
        { role: 'assistant', content: priceOnlyStart.reply },
      ],
      qualification: priceOnlyStart.qualification,
      cart: [],
      page: {},
    });
    assert.equal(onePersonPriceFlow.intent, 'mobile_offer');
    assert.equal(onePersonPriceFlow.qualification.peopleCount, 1);
    assert.deepEqual(onePersonPriceFlow.qualification.missingFields, ['operators', 'bindingEnds', 'mobileUsage', 'priceRange']);
    assert.match(onePersonPriceFlow.reply, /Toppen, ett abonnemang|Vilken operatör har du idag/i);
    assert.deepEqual(onePersonPriceFlow.quickReplies, []);

    const mobileClarificationKeepsState = await postChat(baseUrl, {
      message: 'Mobil',
      language: 'sv',
      messages: [
        { role: 'user', content: 'jag vill inte just nu jag vill bara får pris' },
        { role: 'assistant', content: priceOnlyStart.reply },
        { role: 'user', content: 'bara mig' },
        { role: 'assistant', content: onePersonPriceFlow.reply },
      ],
      qualification: onePersonPriceFlow.qualification,
      cart: [],
      page: {},
    });
    assert.equal(mobileClarificationKeepsState.intent, 'mobile_offer');
    assert.equal(mobileClarificationKeepsState.qualification.peopleCount, 1);
    assert.doesNotMatch(mobileClarificationKeepsState.reply, /gäller det bara dig eller flera/i);
    assert.match(mobileClarificationKeepsState.reply, /Ja, mobilabonnemang|Vilken operatör har du idag/i);
    assert.deepEqual(mobileClarificationKeepsState.quickReplies, []);

    const noPreferenceKeepsOfferFlow = await postChat(baseUrl, {
      message: 'nej',
      language: 'sv',
      messages: [
        { role: 'user', content: 'bara mig' },
        { role: 'assistant', content: onePersonPriceFlow.reply },
      ],
      qualification: onePersonPriceFlow.qualification,
      cart: [],
      page: {},
    });
    assert.equal(noPreferenceKeepsOfferFlow.intent, 'mobile_offer');
    assert.match(noPreferenceKeepsOfferFlow.reply, /Du behöver inte ha någon önskad operatör|operatören du har idag/i);
    assert.doesNotMatch(noPreferenceKeepsOfferFlow.reply, /Tele2 på alla|ni har idag/i);
    assert.deepEqual(noPreferenceKeepsOfferFlow.quickReplies, []);

    const vagueHelpAfterOffer = await postChat(baseUrl, {
      message: 'jag vill ha hjälp',
      language: 'sv',
      messages: [
        { role: 'user', content: 'abonnemang' },
        { role: 'assistant', content: 'Jag hittade ett giltigt alternativ: Tre 25 GB för 587 kr/mån totalt.' },
      ],
      qualification: completedQualification,
      cart: [],
      page: {},
    });
    assertNoStaleOfferLoop(vagueHelpAfterOffer);

    const singleLetterAfterOffer = await postChat(baseUrl, {
      message: 'h',
      language: 'sv',
      messages: [
        { role: 'user', content: 'abonnemang' },
        { role: 'assistant', content: 'Jag hittade ett giltigt alternativ: Tre 25 GB för 587 kr/mån totalt.' },
      ],
      qualification: completedQualification,
      cart: [],
      page: {},
    });
    assertNoStaleOfferLoop(singleLetterAfterOffer);

    const broadbandStart = await postChat(baseUrl, {
      message: 'jag vill ha bredband',
      language: 'sv',
      messages: [],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(broadbandStart.intent, 'broadband');
    assert.match(broadbandStart.reply, /5G-bredband|adress|täcknings/i);

    const broadbandOk = await postChat(baseUrl, {
      message: 'ok',
      language: 'sv',
      messages: [
        { role: 'user', content: 'jag vill ha bredband' },
        { role: 'assistant', content: broadbandStart.reply },
      ],
      qualification: {},
      cart: [],
      page: { path: '/5g-bredband.html' },
    });
    assert.equal(broadbandOk.intent, 'broadband');
    assert.match(broadbandOk.reply, /fortsätta med bredband|adresskontroll|täckningsjämförelse/i);
    assert.doesNotMatch(broadbandOk.reply, /Kan du ge mig din adress|Vilken adress/i);
    assert.deepEqual(broadbandOk.quickReplies, []);

    const standaloneOkOnBroadbandPage = await postChat(baseUrl, {
      message: 'ok',
      language: 'sv',
      messages: [],
      qualification: {},
      cart: [],
      page: { path: '/5g-bredband.html' },
    });
    assert.notEqual(standaloneOkOnBroadbandPage.intent, 'broadband');
    assert.doesNotMatch(standaloneOkOnBroadbandPage.reply, /Kan du ge mig din adress|Vilken adress/i);

    const staleBrowsingPrefix = await postChat(baseUrl, {
      message: '20 gb',
      language: 'sv',
      messages: [
        { role: 'user', content: 'såg reklamen och kollar bara' },
        { role: 'assistant', content: 'Ingen press medan du kikar: välkommen.' },
      ],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.doesNotMatch(staleBrowsingPrefix.reply, /Ingen press medan du kikar|Utan att pressa fram ett byte|Jag förstår, vi håller det enkelt/i);

    const coverage = await postChat(baseUrl, {
      message: 'Hur är täckningen där jag bor?',
      language: 'sv',
      messages: [],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(coverage.embeddedWidget?.type, 'coverage_selector');
    assertNoLeakedAdvisoryPrefix(coverage);
    assert.deepEqual(coverage.embeddedWidget.actions.map((action) => action.id), [
      'use_location',
      'enter_address',
      'compare_operators',
    ]);
    assert.deepEqual(coverage.quickReplies, []);
    assert.match(coverage.reply, /täckning|Täckning|garanter|adress|område/i);
    assert.doesNotMatch(coverage.reply, /öppna täckningskartan/i);
    assert.match(coverage.reply, /här i chatten|ange adress|använda position|jämföra operatörer/i);

    const vagueArea = await postChat(baseUrl, {
      message: 'jag bor i jakobsberg och vill ha bäst täckning',
      language: 'sv',
      messages: stalePrefixHistory,
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(vagueArea.embeddedWidget?.type, 'coverage_selector');
    assertNoLeakedAdvisoryPrefix(vagueArea);
    assert.match(vagueArea.reply, /Jakobsberg|Telias nät|Tele2\/Telenor|inte.*garanter|inomhus/i);
    assert.doesNotMatch(vagueArea.reply, /öppna täckningskartan/i);

    const bestCoverageArea = await postChat(baseUrl, {
      message: 'bäst täckning i jakobsberg',
      language: 'sv',
      messages: [],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(bestCoverageArea.embeddedWidget?.type, 'coverage_selector');
    assert.deepEqual(bestCoverageArea.quickReplies, []);
    assert.match(bestCoverageArea.reply, /Direkt svar|Telias nät|Tele2\/Telenor|inte.*garanter|ingen garanti/i);
    assert.doesNotMatch(bestCoverageArea.reply, /definitivt bäst|garanterad täckning|100\s*%|exakt signal/i);

    const directBestCoverage = await postChat(baseUrl, {
      message: 'jag vill ha bästa täckning i jakobsberg utan fler frågor, svara nu direkt',
      language: 'sv',
      messages: [],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(directBestCoverage.embeddedWidget?.type, 'coverage_selector');
    assert.deepEqual(directBestCoverage.quickReplies, []);
    assert.match(directBestCoverage.reply, /^Direkt svar:/);
    assert.match(directBestCoverage.reply, /Telias nät|förstahandsval|Tele2\/Telenor/i);
    assert.doesNotMatch(directBestCoverage.reply, /\?/);
    assert.doesNotMatch(directBestCoverage.reply, /definitivt bäst|garanterad täckning|100\s*%|exakt signal/i);

    const shortCoverageFollowup = await postChat(baseUrl, {
      message: 'bara svara något',
      language: 'sv',
      messages: [
        { role: 'user', content: 'jag vill ha bäst täckning i jakobsberg' },
        { role: 'assistant', content: bestCoverageArea.reply },
      ],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(shortCoverageFollowup.intent, 'coverage');
    assert.equal(shortCoverageFollowup.embeddedWidget?.type, 'coverage_selector');
    assert.deepEqual(shortCoverageFollowup.quickReplies, []);
    assert.match(shortCoverageFollowup.reply, /Telias nät|bästa chans till täckning|kontrollera adressen|inomhusmiljö/i);
    assert.doesNotMatch(shortCoverageFollowup.reply, /\?/);
    assert.doesNotMatch(shortCoverageFollowup.reply, /Mobilabonnemang|Bredband hemma|Presentkort/);

    const fullMap = await postChat(baseUrl, {
      message: 'visa full täckningskarta',
      language: 'sv',
      messages: stalePrefixHistory,
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(fullMap.embeddedWidget?.type, 'coverage_selector');
    assertNoLeakedAdvisoryPrefix(fullMap);
    assert.match(fullMap.reply, /stor kartvy|hela täckningskartan|full/i);

    const coverageCheck = await postChat(baseUrl, {
      message: 'jag vill kolla täckning',
      language: 'sv',
      messages: stalePrefixHistory,
      qualification: {},
      cart: [],
      page: {},
    });
    assert.equal(coverageCheck.embeddedWidget?.type, 'coverage_selector');
    assertNoLeakedAdvisoryPrefix(coverageCheck);

    const rewardIntent = await postChat(baseUrl, {
      message: 'jag vill ha högsta presentkortet',
      language: 'sv',
      messages: [],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.match(rewardIntent.reply, /presentkort|belöning|totalvärde|totalaffär/i);

    const approximateInput = await postChat(baseUrl, {
      message: 'typ 300 kr',
      language: 'sv',
      messages: [],
      qualification: {},
      cart: [],
      page: {},
    });
    assert.match(approximateInput.reply, /ungefär|ungefärligt|Runt/i);

    const validOffer = await postChat(baseUrl, {
      message: 'Jag har Tele2, 20 GB, ingen bindningstid och betalar 399 kr.',
      language: 'sv',
      messages: [],
      qualification: {
        peopleCount: 1,
        operators: ['Tele2'],
        bindingEnds: ['Ingen bindningstid'],
        mobileUsage: 'medium',
        priceRange: null,
        exactMonthlyPrice: 399,
        exactMonthlyPrices: [],
        readyForOffer: true,
        missingFields: [],
      },
      cart: [],
      page: {},
    });
    assert.ok(validOffer.offerCards.length > 0);
    assert.ok(validOffer.offerCards.length <= 3);
    assert.ok(validOffer.offerCards[0].operator);
    assert.ok(validOffer.offerCards[0].monthlyPriceLabel);
    assert.ok(validOffer.offerCards[0].ctaUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  const frontendScript = fs.readFileSync(path.resolve(__dirname, '../../Rdealett/script.js'), 'utf8');
  const frontendStyles = fs.readFileSync(path.resolve(__dirname, '../../Rdealett/styles.css'), 'utf8');
  assert.match(frontendScript, /const renderQuickReplies = \(messageItem, quickReplies\)/);
  assert.match(frontendScript, /!Array\.isArray\(quickReplies\) \|\| !quickReplies\.length/);
  assert.match(frontendScript, /quickReplies\.slice\(0, 4\)/);
  assert.match(frontendScript, /className = 'dealett-chat-quick-reply'/);
  assert.match(frontendScript, /input\.value = label/);
  assert.match(frontendScript, /sendMessage\(label\)/);
  assert.match(frontendScript, /renderQuickReplies\(assistantItem, response\.quickReplies\)/);
  assert.match(frontendScript, /const renderChatOfferCards = \(messageItem, offerCards\)/);
  assert.match(frontendScript, /!Array\.isArray\(offerCards\) \|\| !offerCards\.length/);
  assert.match(frontendScript, /offerCards\.slice\(0, 3\)/);
  assert.match(frontendScript, /const safeCtaUrl = getSafeChatUrl\(card\.ctaUrl\)/);
  assert.match(frontendScript, /data-chat-offer-card/);
  assert.match(frontendScript, /data-chat-offer-plan/);
  assert.match(frontendScript, /sendChatFeedback\(buildFeedbackPayload\(\{/);
  assert.match(frontendScript, /eventType: 'offer_click'/);
  assert.match(frontendScript, /if \(!planId && ctaUrl\)/);
  assert.match(frontendScript, /window\.location\.href = ctaUrl/);
  assert.match(frontendScript, /addCalculatedOfferToCart\(planId/);
  assert.match(frontendScript, /renderChatOfferCards\(assistantItem, response\.offerCards\)/);
  assert.match(frontendScript, /const renderCoverageSelector = \(messageItem, widget\)/);
  assert.match(frontendScript, /widget\?\.type !== 'coverage_selector'/);
  assert.match(frontendScript, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(frontendScript, /sendMessage\('Använd min position för täckning'\)/);
  assert.match(frontendScript, /Skriv adressen istället\./);
  assert.match(frontendScript, /sendMessage\(`Kontrollera täckning för: \$\{address\}`\)/);
  assert.match(frontendScript, /sendMessage\('Jämför täckning mellan operatörer'\)/);
  assert.match(frontendScript, /const renderEmbeddedWidget = \(messageItem, embeddedWidget\)/);
  assert.match(frontendScript, /renderEmbeddedWidget\(assistantItem, response\.embeddedWidget\)/);
  assert.match(frontendScript, /Hej! Jag kan hjälpa dig jämföra mobilabonnemang, bredband, täckning och presentkort\. Vad vill du börja med\?/);
  assert.doesNotMatch(frontendScript, /abonnemang, bredband, täckning, presentkort och din varukorg/);
  assert.match(frontendStyles, /\.dealett-chat-embedded-widget/);
  assert.match(frontendStyles, /\.dealett-chat-address-row/);
  assert.match(frontendStyles, /\.dealett-chat-address-input/);
  assert.doesNotMatch(frontendScript, /renderOfferCards\(response\.offerCalculation\)/);
  assert.doesNotMatch(frontendScript, /const renderOfferCards = \(offerCalculation\)/);
  assert.match(frontendStyles, /\.dealett-chat-panel \{[\s\S]*?width: min\(380px, calc\(100vw - 28px\)\);/);
  assert.match(frontendStyles, /\.dealett-chat-panel \{[\s\S]*?width: calc\(100vw - 24px\);/);
  assert.match(frontendStyles, /\.dealett-chat-offer-card \{[\s\S]*?width: 100%;/);
  assert.match(frontendStyles, /\.offer-card__stat > div \{[\s\S]*?min-width: 0;/);
  assert.match(frontendScript, /let hasUserStartedChat = false/);
  assert.match(
    frontendScript,
    /const renderSuggestions = \(suggestions\) => \{\s+suggestionArea\.replaceChildren\(\);\s+if \(hasUserStartedChat\) return;/s
  );
  assert.match(
    frontendScript,
    /hasUserStartedChat = true;\s+suggestionArea\.replaceChildren\(\);\s+addMessage\('user', message\);/s
  );
  assert.match(
    frontendScript,
    /hasUserStartedChat = false;\s+messages\.splice\(0, messages\.length\);\s+messageList\.replaceChildren\(\);/s
  );
  assert.doesNotMatch(frontendScript, /renderSuggestions\(response\.suggestions \|\| text\.suggestions\)/);
  assert.doesNotMatch(frontendScript, /catch \{\s+addMessage\('assistant', text\.error\);\s+renderSuggestions\(text\.suggestions\);/s);

  console.log('chat UI response tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
