(() => {
  const fixes = {
    "ex-p2-070": "across",
    "ex-p2-071": "away",
    "ex-p2-072": "into",
    "ex-p2-073": "out",
    "ex-p2-074": "out",
    "ex-p2-075": "over",
    "ex-p2-076": "through",
    "ex-p2-077": "through",
    "ex-p2-078": "up",
    "ex-p2-079": "up",
    "ex-p2-080": "at",
    "ex-p2-081": "down",
    "ex-p2-082": "on",
    "ex-p2-083": "out",
    "ex-p2-084": "up",
    "ex-p2-085": "in",
    "ex-p2-086": "off",
    "ex-p2-087": "off",
    "ex-p2-088": "off",
    "ex-p2-090": "on",
    "ex-p2-091": "out",
    "ex-p2-092": "out",
    "ex-p2-093": "over",
    "ex-p2-094": "through",
    "ex-p2-095": "together",
    "ex-p2-096": "for",
    "ex-p2-097": "to",
    "ex-p2-098": "of",
    "ex-p2-099": "up",
    "ex-p2-100": "up",
    "ex-p2-101": "up",
    "ex-p2-102": "along",
    "ex-p2-103": "in",
    "ex-p2-104": "along",
    "ex-p2-105": "around",
    "ex-p2-106": "by",
    "ex-p2-107": "down",
    "ex-p2-108": "for",
    "ex-p2-109": "on",
    "ex-p2-110": "out",
    "ex-p2-111": "over",
    "ex-p2-112": "up",
    "ex-p2-113": "away",
    "ex-p2-114": "down",
    "ex-p2-115": "up",
    "ex-p2-116": "for",
    "ex-p2-117": "in",
    "ex-p2-118": "off",
    "ex-p2-119": "on",
    "ex-p2-120": "up",
    "ex-p2-121": "with",
    "ex-p2-122": "after",
    "ex-p2-123": "down",
    "ex-p2-124": "for",
    "ex-p2-125": "forward",
    "ex-p2-126": "into",
    "ex-p2-127": "over",
    "ex-p2-128": "to",
    "ex-p2-129": "up",
    "ex-p2-130": "around",
    "ex-p2-131": "together",
    "ex-p2-132": "up",
    "ex-p2-133": "up",
    "ex-p2-134": "back",
    "ex-p2-135": "back",
    "ex-p2-136": "down",
    "ex-p2-137": "on",
    "ex-p2-138": "out",
    "ex-p2-139": "up",
    "ex-p2-140": "up",
    "ex-p2-141": "down",
    "ex-p2-142": "from",
    "ex-p2-143": "off",
    "ex-p2-144": "out",
    "ex-p2-145": "up",
    "ex-p2-146": "up",
    "ex-p2-168": "up"
  };

  Object.assign((window.VOCA_TARGETS ||= {}), fixes);

  function findTargetStart(sentence, target) {
    const normalized = sentence.replaceAll("\u2019", "'");
    const normalizedTarget = String(target).replaceAll("\u2019", "'");
    const haystack = normalized.toLowerCase();
    const needle = normalizedTarget.toLowerCase();
    let start = haystack.indexOf(needle);
    while (start >= 0) {
      const before = start === 0 ? "" : normalized[start - 1];
      const after = normalized[start + needle.length] || "";
      if (!/[A-Za-z]/.test(before) && !/[A-Za-z]/.test(after)) return start;
      start = haystack.indexOf(needle, start + 1);
    }
    return haystack.indexOf(needle);
  }

  window.applyVocaTargets = function applyVocaTargets() {
    const byId = window.VOCA_TARGETS || {};
    const examples = (window.VOCA_DATA && window.VOCA_DATA.examples) || [];
    const seen = new Set(examples.map((item) => item.id));
    (window.VOCA_EXTRA_EXAMPLES || []).forEach((item) => {
      if (!seen.has(item.id)) {
        examples.push(item);
        seen.add(item.id);
      }
    });

    const toTarget = (item, text) => {
      if (!text) return null;
      const target = String(text);
      const start = findTargetStart(item.english, target);
      if (start < 0) return null;
      return { text: item.english.slice(start, start + target.length), start, end: start + target.length };
    };

    examples.forEach((item) => {
      const patch = byId[item.id];
      if (Array.isArray(patch)) item.targets = patch.map((text) => toTarget(item, text)).filter(Boolean);
      else if (typeof patch === "string") item.target = toTarget(item, patch);
    });

    if (window.VOCA_DATA && window.VOCA_DATA.meta) window.VOCA_DATA.meta.exampleCount = examples.length;
  };
})();
