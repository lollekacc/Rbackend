const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const FEEDBACK_DIR = path.join(PROJECT_ROOT, 'data', 'chat-feedback');
const FEEDBACK_FILE = path.join(FEEDBACK_DIR, 'chat-feedback.jsonl');
const SUMMARY_JSON = path.join(FEEDBACK_DIR, 'chat-feedback-summary.json');
const SUMMARY_MD = path.join(FEEDBACK_DIR, 'chat-feedback-summary.md');

const stopWords = new Set([
  'och', 'att', 'det', 'den', 'till', 'för', 'med', 'som', 'jag', 'mig', 'min',
  'mitt', 'var', 'vad', 'har', 'inte', 'kan', 'men', 'eller', 'bara', 'bra',
  'dålig', 'dåligt', 'the', 'and', 'for', 'with', 'that', 'this', 'was', 'not',
  'you', 'your', 'too', 'very',
]);

const readJsonl = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return { records: [], invalidLines: [] };
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const records = [];
  const invalidLines = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      records.push({
        ...JSON.parse(trimmed),
        _lineNumber: index + 1,
      });
    } catch (error) {
      invalidLines.push({
        lineNumber: index + 1,
        error: error.message,
      });
    }
  });

  return { records, invalidLines };
};

const normalizeKey = (value, fallback = 'unknown') => {
  const text = String(value || '').trim();
  return text || fallback;
};

const percentage = (part, total) => {
  if (!total) return 0;
  return Math.round((part / total) * 1000) / 10;
};

const groupCounts = (records, getKey) => {
  const groups = new Map();

  records.forEach((record) => {
    const key = getKey(record);
    const existing = groups.get(key) || {
      key,
      total: 0,
      thumbsUp: 0,
      thumbsDown: 0,
      offerClicks: 0,
    };

    existing.total += 1;
    if (record.thumb === 'up') existing.thumbsUp += 1;
    if (record.thumb === 'down') existing.thumbsDown += 1;
    if (record.eventType === 'offer_click' || record.offerClicked === true) existing.offerClicks += 1;
    groups.set(key, existing);
  });

  return [...groups.values()].sort((a, b) => b.total - a.total || a.key.localeCompare(b.key));
};

const compactEntry = (record) => ({
  timestamp: record.timestamp || null,
  sessionId: record.sessionId || null,
  eventType: record.eventType || 'feedback',
  thumb: record.thumb || null,
  feedbackText: record.feedbackText || null,
  lastDetectedIntent: record.lastDetectedIntent || null,
  lastDetectedStyle: record.lastDetectedStyle || null,
  offerShown: record.offerShown === true,
  offerClicked: record.offerClicked === true || record.eventType === 'offer_click',
  finalBotRecommendation: record.finalBotRecommendation || null,
  clickedOfferId: record.clickedOfferId || null,
});

const getLatestRecords = (records, limit = 20) => [...records]
  .sort((a, b) => {
    const byTime = String(b.timestamp || '').localeCompare(String(a.timestamp || ''));
    if (byTime !== 0) return byTime;
    return Number(b._lineNumber || 0) - Number(a._lineNumber || 0);
  })
  .slice(0, limit)
  .map(compactEntry);

const collectSessionSummaries = (records, predicate) => {
  const sessions = new Map();

  records.filter(predicate).forEach((record) => {
    const sessionId = normalizeKey(record.sessionId, 'missing-session');
    const existing = sessions.get(sessionId) || {
      sessionId,
      events: 0,
      thumbsUp: 0,
      thumbsDown: 0,
      offerClicks: 0,
      latestTimestamp: null,
      latestFeedbackText: null,
      lastDetectedIntent: null,
      lastDetectedStyle: null,
    };

    existing.events += 1;
    if (record.thumb === 'up') existing.thumbsUp += 1;
    if (record.thumb === 'down') existing.thumbsDown += 1;
    if (record.eventType === 'offer_click' || record.offerClicked === true) existing.offerClicks += 1;

    if (!existing.latestTimestamp || String(record.timestamp || '') >= String(existing.latestTimestamp || '')) {
      existing.latestTimestamp = record.timestamp || null;
      existing.latestFeedbackText = record.feedbackText || existing.latestFeedbackText;
      existing.lastDetectedIntent = record.lastDetectedIntent || existing.lastDetectedIntent;
      existing.lastDetectedStyle = record.lastDetectedStyle || existing.lastDetectedStyle;
    }

    sessions.set(sessionId, existing);
  });

  return [...sessions.values()].sort((a, b) => String(b.latestTimestamp || '').localeCompare(String(a.latestTimestamp || '')));
};

const tokenizeFeedback = (text) => String(text || '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
  .split(/\s+/)
  .map((word) => word.trim())
  .filter((word) => word.length > 2 && !stopWords.has(word));

const getNegativePhrases = (records) => {
  const counts = new Map();

  records
    .filter((record) => record.thumb === 'down' && record.feedbackText)
    .forEach((record) => {
      const words = tokenizeFeedback(record.feedbackText);
      const phrases = new Set();

      words.forEach((word, index) => {
        phrases.add(word);
        if (words[index + 1]) phrases.add(`${word} ${words[index + 1]}`);
        if (words[index + 1] && words[index + 2]) phrases.add(`${word} ${words[index + 1]} ${words[index + 2]}`);
      });

      phrases.forEach((phrase) => {
        counts.set(phrase, (counts.get(phrase) || 0) + 1);
      });
    });

  return [...counts.entries()]
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase))
    .slice(0, 20);
};

const buildSummary = (records, invalidLines) => {
  const thumbsUpCount = records.filter((record) => record.thumb === 'up').length;
  const thumbsDownCount = records.filter((record) => record.thumb === 'down').length;
  const ratedCount = thumbsUpCount + thumbsDownCount;
  const offerClickCount = records.filter((record) => record.eventType === 'offer_click' || record.offerClicked === true).length;
  const sessionsWithThumbsDown = collectSessionSummaries(records, (record) => record.thumb === 'down');
  const sessionsWithOfferClicks = collectSessionSummaries(records, (record) => record.eventType === 'offer_click' || record.offerClicked === true);
  const offerClickSessionIds = new Set(sessionsWithOfferClicks.map((session) => session.sessionId));
  const sessionsWithThumbsUpAndOfferClick = collectSessionSummaries(
    records,
    (record) => record.thumb === 'up' && offerClickSessionIds.has(normalizeKey(record.sessionId, 'missing-session'))
  );

  return {
    generatedAt: new Date().toISOString(),
    inputPath: FEEDBACK_FILE,
    outputPaths: {
      markdown: SUMMARY_MD,
      json: SUMMARY_JSON,
    },
    totalFeedbackEvents: records.length,
    invalidLineCount: invalidLines.length,
    invalidLines,
    thumbsUpCount,
    thumbsDownCount,
    thumbsUpPercentage: percentage(thumbsUpCount, ratedCount),
    ratedCount,
    offerClickCount,
    feedbackByDetectedIntentStyle: groupCounts(
      records,
      (record) => `${normalizeKey(record.lastDetectedIntent)} / ${normalizeKey(record.lastDetectedStyle)}`
    ),
    feedbackByDetectedIntent: groupCounts(records, (record) => normalizeKey(record.lastDetectedIntent)),
    feedbackByDetectedStyle: groupCounts(records, (record) => normalizeKey(record.lastDetectedStyle)),
    mostCommonNegativeFeedbackPhrases: getNegativePhrases(records),
    latest20FeedbackEntries: getLatestRecords(records, 20),
    sessionsWithThumbsDown,
    sessionsWithOfferClicks,
    sessionsWithThumbsUpAndOfferClick,
  };
};

const table = (headers, rows) => {
  if (!rows.length) return '_No data yet._\n';

  const headerLine = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell ?? '').replace(/\n/g, ' ').replace(/\|/g, '\\|')).join(' | ')} |`);

  return [headerLine, divider, ...body].join('\n');
};

const renderMarkdown = (summary) => [
  '# Chat Feedback Summary',
  '',
  `Generated: ${summary.generatedAt}`,
  '',
  '## Overview',
  '',
  table(
    ['Metric', 'Value'],
    [
      ['Total feedback events', summary.totalFeedbackEvents],
      ['Thumbs up', summary.thumbsUpCount],
      ['Thumbs down', summary.thumbsDownCount],
      ['Thumbs up percentage', `${summary.thumbsUpPercentage}%`],
      ['Offer click count', summary.offerClickCount],
      ['Invalid JSONL lines', summary.invalidLineCount],
    ]
  ),
  '',
  '## Feedback By Intent / Style',
  '',
  table(
    ['Intent / Style', 'Total', 'Up', 'Down', 'Offer clicks'],
    summary.feedbackByDetectedIntentStyle.map((item) => [
      item.key,
      item.total,
      item.thumbsUp,
      item.thumbsDown,
      item.offerClicks,
    ])
  ),
  '',
  '## Most Common Negative Feedback Phrases',
  '',
  table(
    ['Phrase', 'Count'],
    summary.mostCommonNegativeFeedbackPhrases.map((item) => [item.phrase, item.count])
  ),
  '',
  '## Latest 20 Feedback Entries',
  '',
  table(
    ['Time', 'Session', 'Event', 'Thumb', 'Intent', 'Style', 'Offer shown', 'Offer clicked', 'Text'],
    summary.latest20FeedbackEntries.map((entry) => [
      entry.timestamp || '',
      entry.sessionId || '',
      entry.eventType || '',
      entry.thumb || '',
      entry.lastDetectedIntent || '',
      entry.lastDetectedStyle || '',
      entry.offerShown ? 'yes' : 'no',
      entry.offerClicked ? 'yes' : 'no',
      entry.feedbackText || '',
    ])
  ),
  '',
  '## Sessions With Thumbs Down',
  '',
  table(
    ['Session', 'Events', 'Down', 'Latest', 'Intent', 'Style', 'Latest text'],
    summary.sessionsWithThumbsDown.map((session) => [
      session.sessionId,
      session.events,
      session.thumbsDown,
      session.latestTimestamp || '',
      session.lastDetectedIntent || '',
      session.lastDetectedStyle || '',
      session.latestFeedbackText || '',
    ])
  ),
  '',
  '## Sessions With Offer Clicks',
  '',
  table(
    ['Session', 'Events', 'Offer clicks', 'Latest', 'Intent', 'Style'],
    summary.sessionsWithOfferClicks.map((session) => [
      session.sessionId,
      session.events,
      session.offerClicks,
      session.latestTimestamp || '',
      session.lastDetectedIntent || '',
      session.lastDetectedStyle || '',
    ])
  ),
  '',
  '## Sessions With Thumbs Up And Offer Click',
  '',
  table(
    ['Session', 'Events', 'Up', 'Offer clicks', 'Latest', 'Intent', 'Style'],
    summary.sessionsWithThumbsUpAndOfferClick.map((session) => [
      session.sessionId,
      session.events,
      session.thumbsUp,
      session.offerClicks,
      session.latestTimestamp || '',
      session.lastDetectedIntent || '',
      session.lastDetectedStyle || '',
    ])
  ),
  '',
].join('\n');

const main = () => {
  fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

  const { records, invalidLines } = readJsonl(FEEDBACK_FILE);
  const summary = buildSummary(records, invalidLines);

  fs.writeFileSync(SUMMARY_JSON, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(SUMMARY_MD, renderMarkdown(summary));

  console.log(`Chat feedback report written to:
- ${path.relative(PROJECT_ROOT, SUMMARY_MD)}
- ${path.relative(PROJECT_ROOT, SUMMARY_JSON)}

Total events: ${summary.totalFeedbackEvents}
Thumbs up: ${summary.thumbsUpCount}
Thumbs down: ${summary.thumbsDownCount}
Thumbs up percentage: ${summary.thumbsUpPercentage}%
Offer clicks: ${summary.offerClickCount}`);
};

main();
