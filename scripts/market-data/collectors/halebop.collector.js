const collectHalebopMarketData = async ({ fetchedAt = new Date().toISOString() } = {}) => ({
  operatorId: 'halebop',
  sourceUrl: 'https://www.halebop.se',
  fetchedAt,
  rawPlans: [],
  status: 'not_implemented',
});

module.exports = collectHalebopMarketData;
