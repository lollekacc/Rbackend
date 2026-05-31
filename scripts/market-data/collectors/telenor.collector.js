const collectTelenorMarketData = async ({ fetchedAt = new Date().toISOString() } = {}) => ({
  operatorId: 'telenor',
  sourceUrl: 'https://www.telenor.se',
  fetchedAt,
  rawPlans: [],
  status: 'not_implemented',
});

module.exports = collectTelenorMarketData;
