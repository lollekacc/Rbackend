const assert = require('node:assert/strict');
const net = require('node:net');

const { createServer } = require('../server');

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

const readyQualification = (overrides = {}) => ({
  peopleCount: 1,
  operators: ['Telia'],
  bindingEnds: ['Ingen bindningstid'],
  mobileUsage: 'medium',
  priceRange: null,
  exactMonthlyPrice: 249,
  exactMonthlyPrices: [],
  readyForOffer: true,
  missingFields: [],
  ...overrides,
});

(async () => {
  const port = await getFreePort();
  const server = createServer();
  await listen(server, port);
  const baseUrl = `http://${HOST}:${port}`;

  try {
    const suspicious = await postChat(baseUrl, {
      message: 'Jag har Telia och betalar 99 kr för obegränsad surf.',
      language: 'sv',
      qualification: readyQualification({
        operators: ['Telia'],
        mobileUsage: 'high',
        exactMonthlyPrice: 99,
      }),
      messages: [],
      cart: [],
      page: {},
    });
    assert.ok(
      ['suspicious_low', 'probably_not_sellable', 'possible_needs_clarification'].includes(suspicious.marketClassification?.status),
      `Expected market gate, got ${suspicious.marketClassification?.status}`
    );
    assert.notEqual(suspicious.offerCalculation.validOfferAvailable, true);
    assert.match(suspicious.reply, /ovanligt lågt|väldigt starkt|starkt avtal|kampanj|familjepris|rabatt/i);

    const campaign = await postChat(baseUrl, {
      message: 'Det är kampanjpris 149 kr för 25 GB.',
      language: 'sv',
      qualification: readyQualification({
        operators: ['Tele2'],
        mobileUsage: 'medium',
        exactMonthlyPrice: 149,
      }),
      messages: [],
      cart: [],
      page: {},
    });
    assert.equal(campaign.marketClassification?.status, 'possible_needs_clarification');
    assert.match(campaign.reply, /kampanj|hur länge|efter kampanjen/i);

    const realistic = await postChat(baseUrl, {
      message: 'Jag har Tele2, 20 GB och betalar 249 kr.',
      language: 'sv',
      qualification: readyQualification({
        operators: ['Tele2'],
        mobileUsage: 'medium',
        exactMonthlyPrice: 249,
      }),
      messages: [],
      cart: [],
      page: {},
    });
    assert.equal(realistic.marketClassification?.status, 'realistic');
    assert.equal(realistic.offerCalculation.validOfferAvailable, true);
    assert.match(realistic.reply, /giltigt alternativ|hittade|valid option/i);

    const highCurrentPrice = await postChat(baseUrl, {
      message: 'I have Tele2, mostly Wi-Fi, no contract and pay 299 SEK.',
      language: 'en',
      qualification: readyQualification({
        operators: ['Tele2'],
        bindingEnds: ['Ingen bindningstid'],
        mobileUsage: 'low',
        exactMonthlyPrice: 299,
      }),
      messages: [],
      cart: [],
      page: {},
    });
    assert.equal(highCurrentPrice.marketClassification?.status, 'realistic');
    assert.equal(highCurrentPrice.offerCalculation.validOfferAvailable, true);
    assert.match(highCurrentPrice.reply, /valid option|found/i);

    const explanation = await postChat(baseUrl, {
      message: 'Can you explain the recommendation?',
      language: 'en',
      qualification: readyQualification({
        operators: ['Tele2'],
        bindingEnds: ['Ingen bindningstid'],
        mobileUsage: 'low',
        exactMonthlyPrice: 299,
      }),
      messages: [
        { role: 'user', content: 'I pay 299 SEK per month.' },
        { role: 'assistant', content: highCurrentPrice.reply },
      ],
      cart: [],
      page: {},
    });
    assert.equal(explanation.offerCalculation.validOfferAvailable, true);
    assert.match(explanation.reply, /calculation|compares|gift card|savings/i);

    console.log('chat market intelligence route tests passed');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
