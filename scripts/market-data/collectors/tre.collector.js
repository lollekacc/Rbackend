const collectTreMarketData = async ({ fetchedAt = new Date().toISOString() } = {}) => ({
  operatorId: 'tre',
  sourceUrl: 'https://www.tre.se',
  fetchedAt,
  rawPlans: [],
  status: 'not_implemented',
});

module.exports = collectTreMarketData;
