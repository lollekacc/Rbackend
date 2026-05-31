const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

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

const postFeedback = async (baseUrl, payload) => {
  const response = await fetch(`${baseUrl}/api/chat-feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
};

const readFeedbackLines = (filePath) => fs.readFileSync(filePath, 'utf8')
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line));

(async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dealett-chat-feedback-'));
  const feedbackFile = path.join(tempDir, 'chat-feedback.jsonl');
  process.env.CHAT_FEEDBACK_FILE = feedbackFile;

  const port = await getFreePort();
  const server = createServer();
  await listen(server, port);
  const baseUrl = `http://${HOST}:${port}`;

  try {
    const feedback = await postFeedback(baseUrl, {
      sessionId: 'session-123',
      transcriptId: 'session-123',
      thumb: 'up',
      feedbackText: 'Bra och tydligt.',
      lastDetectedIntent: 'mobile_offer',
      lastDetectedStyle: 'advisor',
      offerShown: true,
      offerClicked: false,
      finalBotRecommendation: 'Tele2 20 GB',
      page: {
        title: 'Dealett',
        path: 'index.html',
      },
    });

    assert.equal(feedback.response.status, 200, feedback.body.error || `HTTP ${feedback.response.status}`);
    assert.equal(feedback.body.ok, true);

    const clickEvent = await postFeedback(baseUrl, {
      eventType: 'offer_click',
      sessionId: 'session-123',
      transcriptId: 'session-123',
      clickedOfferId: 'tele2-20gb',
      offerShown: true,
      offerClicked: true,
      finalBotRecommendation: 'Tele2 20 GB',
    });
    assert.equal(clickEvent.response.status, 200, clickEvent.body.error || `HTTP ${clickEvent.response.status}`);

    const invalid = await postFeedback(baseUrl, {
      sessionId: 'session-123',
      thumb: 'maybe',
    });
    assert.equal(invalid.response.status, 400);

    const records = readFeedbackLines(feedbackFile);
    assert.equal(records.length, 2);
    assert.equal(records[0].eventType, 'feedback');
    assert.equal(records[0].thumb, 'up');
    assert.equal(records[0].sessionId, 'session-123');
    assert.equal(records[0].lastDetectedIntent, 'mobile_offer');
    assert.equal(records[0].offerShown, true);
    assert.equal(records[0].offerClicked, false);
    assert.equal(records[0].pagePath, 'index.html');
    assert.ok(records[0].timestamp);

    assert.equal(records[1].eventType, 'offer_click');
    assert.equal(records[1].thumb, null);
    assert.equal(records[1].offerClicked, true);
    assert.equal(records[1].clickedOfferId, 'tele2-20gb');

    console.log('chat feedback route tests passed');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    delete process.env.CHAT_FEEDBACK_FILE;
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
