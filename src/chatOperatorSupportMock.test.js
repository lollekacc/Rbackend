const assert = require('node:assert/strict');

process.env.DEALETT_CHAT_FORCE_FALLBACK = '1';

const { createChatCompletion } = require('../chat-service');

const cases = [
  {
    message: 'Hur tyder jag min Tre-faktura?',
    match: /Tre.*fakturan|fakturan.*Tre/i,
  },
  {
    message: 'Hur ansöker jag om autogiro?',
    context: { operator: 'Tre' },
    match: /autogiro.*Mitt3|Mitt3.*autogiro/i,
  },
  {
    message: 'Hur spårar jag min beställning hos Tele2?',
    match: /Tele2.*ordernummer|ordernummer.*Tele2/i,
  },
  {
    message: 'Hur överlåter jag ett abonnemang hos Telenor?',
    match: /Telenor.*inloggning|Telenor.*identifiering/i,
  },
  {
    message: 'Hur ser jag hur mycket surf jag har använt?',
    context: { selectedOperator: 'Telia' },
    match: /Telia.*surf|surf.*Telia/i,
  },
  {
    message: 'Hur aktiverar jag eSIM hos Tre?',
    match: /eSIM.*Mitt3|SIM.*Mitt3/i,
  },
  {
    message: 'Hur fungerar 3Extra Användare och Uppkoppling?',
    context: { operator: 'Tre' },
    match: /Tre.*abonnemangssida|Tre.*app/i,
  },
  {
    message: 'Hur flyttar jag mitt nummer till Tre?',
    match: /Tre.*inloggning|Tre.*identifiering/i,
  },
  {
    message: 'Vilka mobilabonnemang erbjuder Telia?',
    match: /Telia.*abonnemangssida|Telia.*app/i,
  },
  {
    message: 'Hur bestrider jag en avgift för utrustning som redan är betald hos Tre?',
    match: /Tre.*betalstatus|Tres kundservice/i,
  },
];

(async () => {
  for (const testCase of cases) {
    const result = await createChatCompletion({
      message: testCase.message,
      messages: [],
      language: 'sv',
      context: testCase.context || {},
    });

    assert.equal(result.intent, 'support', `${testCase.message} should be support`);
    assert.match(result.reply, testCase.match, result.reply);
    assert.doesNotMatch(result.reply, /Vad vill du ha hjälp med hos Dealett/i);
  }

  const comparison = await createChatCompletion({
    message: 'Jag har Tele2 och vill hitta ett billigare abonnemang',
    messages: [],
    language: 'sv',
  });

  assert.notEqual(comparison.intent, 'support');
  assert.match(comparison.reply, /Hur många abonnemang|Är det bara till dig/i);

  const actionBoundary = await createChatCompletion({
    message: 'Kan du fixa det åt mig direkt?',
    messages: [
      { role: 'user', content: 'Hur återställer jag PIN-koden hos Tre?' },
      { role: 'assistant', content: 'Som Tre normalt skulle svara: kontrollera SIM och PIN i Mitt3.' },
    ],
    language: 'sv',
    context: { operator: 'Tre' },
  });

  assert.equal(actionBoundary.intent, 'support');
  assert.match(actionBoundary.reply, /kan inte göra kontoändringar|starta ett riktigt supportärende/i);
  assert.match(actionBoundary.reply, /Mitt3|Tre-kundservice/i);

  console.log('operator support mock tests passed');
})();
