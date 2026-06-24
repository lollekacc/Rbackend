const assert = require('node:assert/strict');

const { detectConversationStyle, getStyleGuidance } = require('./conversationStyle');

const cases = [
  ['advisor', 'Jag vill hitta bästa abonnemanget för familjen'],
  ['direct_answer', 'Välj ett abonnemang åt mig utan att fråga någonting alls'],
  ['impatient', 'Kort svar, ställ inte massa frågor'],
  ['skeptical', 'Får ni betalt och är ni oberoende?'],
  ['browsing', 'Jag såg er reklam och tänkte bara kika'],
  ['confused', 'ria'],
  ['comparison', 'Telia eller Tele2, vilken operatör har bäst täckning?'],
  ['complaint_or_problem', 'Tele2 suger hemma och internet laggar'],
  ['reward_focused', 'Jag vill ha högsta presentkortet bara'],
  ['human_test', 'överraska mig, du får bestämma'],
];

cases.forEach(([expectedStyle, message]) => {
  const detected = detectConversationStyle({ message, history: [], context: {} });
  assert.equal(
    detected.style,
    expectedStyle,
    `Expected ${expectedStyle} for "${message}", got ${detected.style}`
  );
  assert.ok(detected.confidence > 0 && detected.confidence <= 1);
  assert.ok(Array.isArray(detected.reasons));
  assert.equal(typeof detected.responsePolicy.answerFirst, 'boolean');
  assert.equal(typeof detected.responsePolicy.maxQuestions, 'number');
});

const directGuidance = getStyleGuidance('direct_answer');
assert.equal(directGuidance.responsePolicy.answerFirst, true);
assert.equal(directGuidance.responsePolicy.allowReasonableGuess, true);
assert.equal(directGuidance.responsePolicy.requireDisclaimer, true);
assert.equal(directGuidance.responsePolicy.maxQuestions, 1);

const preserved = detectConversationStyle({
  message: 'vet inte',
  history: [{ role: 'user', content: 'Säg vad jag ska ta' }],
  context: { conversationStyle: { style: 'direct_answer' } },
});
assert.equal(preserved.style, 'direct_answer');
assert.match(preserved.reasons.join(' '), /preserved_previous_style/);

const equipmentDispute = detectConversationStyle({
  message: 'Hur bestrider jag en avgift för utrustning som redan är betald hos Tre?',
  history: [],
  context: {},
});
assert.notEqual(equipmentDispute.style, 'skeptical');

console.log('conversation style tests passed');
