const assert = require('node:assert/strict');

const {
  classifyCustomerClaim,
  estimateMarketRange,
  getOperatorById,
  getPlansByOperator,
  getPlansBySegment,
  shouldContinueSalesAttempt,
} = require('./marketIntelligence');

const assertStatus = (result, allowedStatuses) => {
  assert.ok(
    allowedStatuses.includes(result.status),
    `Expected one of ${allowedStatuses.join(', ')}, got ${result.status}: ${result.reason}`
  );
};

const unlimited99 = classifyCustomerClaim({
  claimedPrice: 99,
  isUnlimited: true,
  segment: 'private',
  operatorId: 'telia',
});
assertStatus(unlimited99, ['suspicious_low', 'possible_needs_clarification']);
assert.ok(unlimited99.recommendedResponse.includes('ovanligt lågt'));
assert.ok(unlimited99.nextQuestions.length > 0);

const normal20gb = classifyCustomerClaim({
  claimedPrice: 249,
  dataGb: 20,
  isUnlimited: false,
  segment: 'private',
  operatorId: 'tele2',
});
assert.equal(normal20gb.status, 'realistic');

const highButBelievableLightUse = classifyCustomerClaim({
  claimedPrice: 299,
  dataGb: 10,
  isUnlimited: false,
  segment: 'private',
  operatorId: 'tele2',
});
assert.equal(highButBelievableLightUse.status, 'realistic');

const strongFamilyBundle = classifyCustomerClaim({
  claimedPrice: 90,
  dataGb: 50,
  isUnlimited: false,
  segment: 'family',
  operatorId: 'unknown-family-operator',
  familyBundle: true,
  canDealettBeat: false,
});
assert.equal(strongFamilyBundle.status, 'probably_not_sellable');
assert.equal(shouldContinueSalesAttempt({
  claimedPrice: 90,
  dataGb: 50,
  segment: 'family',
  familyBundle: true,
  canDealettBeat: false,
}), false);

const campaignWithoutLength = classifyCustomerClaim({
  claimedPrice: 149,
  dataGb: 30,
  isUnlimited: false,
  segment: 'private',
  operatorId: 'telenor',
  isCampaignPrice: true,
});
assert.equal(campaignWithoutLength.status, 'possible_needs_clarification');
assert.ok(campaignWithoutLength.nextQuestions.some((question) => question.includes('kampanj')));

const studentRange = estimateMarketRange({ dataGb: 20, segment: 'student' });
const seniorRange = estimateMarketRange({ dataGb: 20, segment: 'senior' });
const youthRange = estimateMarketRange({ dataGb: 20, segment: 'youth' });
const privateRange = estimateMarketRange({ dataGb: 20, segment: 'private' });
assert.ok(studentRange.min < privateRange.min);
assert.ok(seniorRange.min < privateRange.min);
assert.ok(youthRange.min < privateRange.min);

const studentClaim = classifyCustomerClaim({
  claimedPrice: 169,
  dataGb: 20,
  isUnlimited: false,
  segment: 'student',
  studentDiscount: true,
});
assertStatus(studentClaim, ['realistic', 'possible_needs_clarification']);

const unknownOperator = classifyCustomerClaim({
  claimedPrice: 249,
  dataGb: 20,
  isUnlimited: false,
  segment: 'private',
  operatorId: 'operator-that-does-not-exist',
});
assert.doesNotThrow(() => getOperatorById('operator-that-does-not-exist'));
assertStatus(unknownOperator, ['realistic', 'possible_needs_clarification', 'human_review']);

const missingPrice = classifyCustomerClaim({
  dataGb: 20,
  isUnlimited: false,
  segment: 'private',
  operatorId: 'tele2',
});
assert.equal(missingPrice.status, 'human_review');
assert.ok(missingPrice.nextQuestions.length > 0);

assert.ok(getPlansByOperator('tele2').length > 0);
assert.ok(getPlansBySegment('family').length > 0);

console.log('marketIntelligence tests passed');
