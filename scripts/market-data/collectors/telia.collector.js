const collectTeliaMarketData = async ({ fetchedAt = new Date().toISOString() } = {}) => ({
  operatorId: 'telia',
  sourceUrl: 'https://www.telia.se',
  fetchedAt,
  rawPlans: [],
  status: 'not_implemented',
});

module.exports = collectTeliaMarketData;
