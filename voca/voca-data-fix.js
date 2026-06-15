window.VOCA_DATA_READY = Promise.resolve(window.VOCA_DATA_READY).then(() => {
  const data = window.VOCA_DATA;
  if (!data || !Array.isArray(data.terms)) return;

  const additions = [
    {
      id: "term-extra-activism",
      part: "Part 1",
      term: "activism",
      meaning: "[\uBA85] \uD589\uB3D9\uC8FC\uC758, \uB2A5\uB3D9\uC8FC\uC758",
    },
    {
      id: "term-extra-nudge",
      part: "Part 1",
      term: "nudge",
      meaning: "[\uB3D9] \uCFE1 \uCC0C\uB974\uB2E4",
    },
  ];

  const seen = new Set(data.terms.map((item) => normalize(item.term)));
  additions.forEach((item) => {
    if (!seen.has(normalize(item.term))) {
      data.terms.push(item);
      seen.add(normalize(item.term));
    }
  });

  if (data.meta) data.meta.termCount = data.terms.length;

  function normalize(value) {
    return String(value || "").toLowerCase().replaceAll("\u2019", "'").replace(/\s+/g, " ").trim();
  }
});
