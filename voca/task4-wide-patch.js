(() => {
  let source = (window.VOCA_APP_CHUNKS || []).join("");
  if (!source) return;

  source = source.replace(
    '      const target = pickTarget(item.english, "expression", item.part);',
    '      const target = task4WideTarget(item.english);',
  );

  const helperSource = [
    task4WideTarget.toString(),
    addTask4Candidate.toString(),
    task4WeakWord.toString(),
    weakTailWord.toString(),
    normalizeWideWord.toString(),
  ].join("\n\n");

  source = source.replace(
    "  function makeBlankQuestion(task, item, target, instruction) {",
    helperSource + "\n\n  function makeBlankQuestion(task, item, target, instruction) {",
  );

  source = replaceBetween(
    source,
    "  function expressionMask(text) {",
    "  function sameAnswer(value, answer) {",
    expressionMask.toString() + "\n\n",
  );

  window.VOCA_APP_CHUNKS = [source];

  function task4WideTarget(sentence) {
    const words = positionedWords(sentence);
    if (!words.length) return fallbackWordTarget(sentence);
    if (words.length === 1) return { text: words[0].text, start: words[0].start, end: words[0].end };

    const desired = Math.max(2, Math.min(words.length - 1, Math.ceil(words.length * 0.5)));
    const candidates = [];
    const weakStarts = new Set(["i", "i'm", "i'd", "you", "you'd", "he", "he's", "she", "we", "we're", "they", "it", "it's", "there", "this", "that"]);
    const auxWords = new Set(["am", "is", "are", "was", "were", "be", "been", "being", "can", "could", "would", "should", "will", "have", "has", "had", "do", "does", "did"]);

    const first = normalizeWideWord(words[0].text);
    let preferredStart = 0;
    if (words.length > 4 && weakStarts.has(first)) preferredStart = 1;
    if (preferredStart && auxWords.has(normalizeWideWord(words[preferredStart]?.text || "")) && words.length - preferredStart > desired) preferredStart += 1;
    if (first === "but" || first === "and" || first === "so") preferredStart = 1;

    [preferredStart, 0, Math.max(0, words.length - desired)].forEach((start) => {
      for (let delta = 0; delta <= 2; delta += 1) {
        addTask4Candidate(candidates, sentence, words, start, desired - delta);
        addTask4Candidate(candidates, sentence, words, start, desired + delta);
      }
    });

    candidates.sort((a, b) => b.score - a.score || Math.abs(desired - a.wordCount) - Math.abs(desired - b.wordCount));
    return candidates[0] || fallbackPhraseTarget(sentence);
  }

  function addTask4Candidate(candidates, sentence, words, start, length) {
    if (length < 2 || start < 0 || start >= words.length) return;
    let end = Math.min(words.length - 1, start + length - 1);
    while (end > start && weakTailWord(normalizeWideWord(words[end].text))) end -= 1;
    while (end + 1 < words.length && weakTailWord(normalizeWideWord(words[end].text))) end += 1;
    if (end <= start) return;

    const text = sentence.slice(words[start].start, words[end].end).trim();
    const tokens = wordTokens(text);
    const contentCount = tokens.filter((word) => !task4WeakWord(word)).length;
    if (contentCount < 2) return;

    const leavesContext = start > 0 || end < words.length - 1;
    const score = contentCount * 8 + tokens.length * 2 + (leavesContext ? 8 : -10) - Math.abs(tokens.length - Math.ceil(words.length * 0.5)) * 3;
    candidates.push({ text, start: words[start].start, end: words[end].end, wordCount: tokens.length, score });
  }

  function task4WeakWord(word) {
    return ["a", "an", "the", "to", "of", "for", "with", "at", "in", "on", "and", "but", "or", "so", "as", "by", "from"].includes(word);
  }

  function weakTailWord(word) {
    return task4WeakWord(word) || word === "i" || word === "you" || word === "he" || word === "she" || word === "we" || word === "they";
  }

  function normalizeWideWord(word) {
    return String(word || "").toLowerCase().replaceAll("\u2019", "'");
  }

  function expressionMask(text) {
    let revealed = false;
    return String(text)
      .split("")
      .map((char) => {
        if (!/[A-Za-z]/.test(char)) return char;
        if (!revealed) {
          revealed = true;
          return char;
        }
        return "_";
      })
      .join("")
      .replace(/\s+/g, " ");
  }

  function replaceBetween(text, startMarker, endMarker, replacement) {
    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker, start + startMarker.length);
    if (start < 0 || end < 0) return text;
    return text.slice(0, start) + replacement + text.slice(end);
  }
})();
