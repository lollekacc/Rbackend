const collectTele2MarketData = async ({ fetchedAt = new Date().toISOString() } = {}) => ({
  operatorId: 'tele2',
  sourceUrl: 'https://www.tele2.se',
  fetchedAt,
  rawPlans: [],
  status: 'not_implemented',
});

module.exports = collectTele2MarketData;
