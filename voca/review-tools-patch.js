(() => {
  const STORAGE_KEY = "voca.wrong.v1";

  const style = document.createElement("style");
  style.textContent = `
    .wrong-filter { display: flex; align-items: center; gap: 10px; font-weight: 800; color: #475569; }
    .wrong-select { min-width: 170px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; padding: 9px 34px 9px 12px; font: inherit; font-weight: 800; color: #0f172a; }
    .wrong-head { gap: 12px; }
    .wrong-head-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .pdf-btn { border: 1px solid #0891b2; background: #ecfeff; color: #0e7490; border-radius: 8px; padding: 9px 14px; font: inherit; font-weight: 900; cursor: pointer; }
    .pdf-btn:disabled { opacity: .45; cursor: not-allowed; }
  `;
  document.head.append(style);

  setupControls();

  let source = (window.VOCA_APP_CHUNKS || []).join("");
  if (source) {
    source = source
      .replace(
        '    wrongOnlyToggle: document.querySelector("#wrongOnlyToggle"),',
        '    wrongCountFilter: document.querySelector("#wrongCountFilter"),',
      )
      .replace(
        '    wrongList: document.querySelector("#wrongList"),',
        '    wrongList: document.querySelector("#wrongList"),',
      )
      .replace("    wrongOnly: false,", '    wrongCountFilter: "all",')
      .replace(
        [
          '    els.wrongOnlyToggle.addEventListener("change", () => {',
          "      state.wrongOnly = els.wrongOnlyToggle.checked;",
          "      state.index = 0;",
          "      render();",
          "    });",
        ].join("\n"),
        [
          "    if (els.wrongCountFilter) {",
          '      els.wrongCountFilter.addEventListener("change", () => {',
          "        state.wrongCountFilter = els.wrongCountFilter.value;",
          "        state.index = 0;",
          "        render();",
          "      });",
          "    }",
        ].join("\n"),
      );

    source = replaceBetween(
      source,
      "  function baseList() {",
      "  function listKey() {",
      [
        "  function baseList() {",
        "    if (!banks[state.task]) return [];",
        "    return banks[state.task].filter((question) => {",
        '      const partMatch = state.part === "all" || question.part === state.part;',
        "      const wrong = wrongStore[question.id];",
        "      let wrongMatch = true;",
        '      if (state.wrongCountFilter === "wrong") {',
        "        wrongMatch = Boolean(wrong);",
        '      } else if ((state.wrongCountFilter || "").startsWith("count:")) {',
        '        const expected = Number(state.wrongCountFilter.split(":")[1]);',
        "        wrongMatch = Boolean(wrong) && (wrong.count || 1) === expected;",
        "      }",
        "      return partMatch && wrongMatch;",
        "    });",
        "  }",
        "",
        "",
      ].join("\n"),
    );

    source = replaceBetween(
      source,
      "  function listKey() {",
      "  function currentQuestion() {",
      [
        "  function listKey() {",
        '    return `${state.task}:${state.part}:${state.wrongCountFilter || "all"}`;',
        "  }",
        "",
        "",
      ].join("\n"),
    );

    source = source.replace(
      [
        "  function renderCounts() {",
        "    const total = Object.values(banks).reduce((sum, bank) => sum + bank.length, 0);",
        "    els.questionCount.textContent = total;",
        "    els.wrongCount.textContent = Object.keys(wrongStore).length;",
        "  }",
      ].join("\n"),
      [
        "  function renderCounts() {",
        "    const total = Object.values(banks).reduce((sum, bank) => sum + bank.length, 0);",
        "    els.questionCount.textContent = total;",
        "    els.wrongCount.textContent = Object.keys(wrongStore).length;",
        "    renderWrongCountFilterOptions();",
        "  }",
        "",
        "  function renderWrongCountFilterOptions() {",
        "    if (!els.wrongCountFilter) return;",
        '    const previous = state.wrongCountFilter || els.wrongCountFilter.value || "all";',
        "    const counts = [...new Set(Object.values(wrongStore).map((item) => item.count || 1))].sort((a, b) => a - b);",
        "    const options = [",
        '      { value: "all", label: "\\uC804\\uCCB4 \\uBB38\\uC81C" },',
        '      { value: "wrong", label: "\\uC624\\uB2F5 \\uC804\\uCCB4" },',
        '      ...counts.map((count) => ({ value: "count:" + count, label: count + "\\uBC88 \\uD2C0\\uB9B0 \\uBB38\\uC81C" })),',
        "    ];",
        '    els.wrongCountFilter.innerHTML = "";',
        "    options.forEach((option) => {",
        '      const item = document.createElement("option");',
        "      item.value = option.value;",
        "      item.textContent = option.label;",
        "      els.wrongCountFilter.append(item);",
        "    });",
        '    state.wrongCountFilter = options.some((option) => option.value === previous) ? previous : "all";',
        "    els.wrongCountFilter.value = state.wrongCountFilter;",
        "  }",
      ].join("\n"),
    );

    window.VOCA_APP_CHUNKS = [source];
  }

  document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "downloadWrongPdfBtn") downloadWrongPdf();
  });

  function setupControls() {
    const toggle = document.querySelector(".toggle");
    if (toggle && !document.querySelector("#wrongCountFilter")) {
      toggle.className = "wrong-filter";
      toggle.innerHTML = [
        "<span>\uBCF5\uC2B5 \uBC94\uC704</span>",
        '<select id="wrongCountFilter" class="wrong-select" aria-label="\uC624\uB2F5 \uBCF5\uC2B5 \uBC94\uC704">',
        '<option value="all">\uC804\uCCB4 \uBB38\uC81C</option>',
        '<option value="wrong">\uC624\uB2F5 \uC804\uCCB4</option>',
        "</select>",
      ].join("");
    }

    const wrongHead = document.querySelector(".wrong-head");
    if (wrongHead && !document.querySelector("#downloadWrongPdfBtn")) {
      const actions = document.createElement("div");
      actions.className = "wrong-head-actions";
      const button = document.createElement("button");
      button.id = "downloadWrongPdfBtn";
      button.className = "pdf-btn";
      button.type = "button";
      button.textContent = "PDF \uB2E4\uC6B4\uB85C\uB4DC";
      actions.append(button);
      wrongHead.append(actions);
    }
  }

  function downloadWrongPdf() {
    const items = readWrongItems();
    if (!items.length) {
      window.alert("저장된 오답이 없습니다.");
      return;
    }
    const pages = renderPages(items);
    const blob = buildPdf(pages);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "voca-wrong-list-" + new Date().toISOString().slice(0, 10) + ".pdf";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function readWrongItems() {
    try {
      return Object.values(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")).sort((a, b) => {
        if ((a.count || 1) !== (b.count || 1)) return (b.count || 1) - (a.count || 1);
        return String(b.lastWrongAt || "").localeCompare(String(a.lastWrongAt || ""));
      });
    } catch {
      return [];
    }
  }

  function renderPages(items) {
    const pageWidth = 1240;
    const pageHeight = 1754;
    const margin = 82;
    const pages = [];
    let canvas;
    let ctx;
    let y;

    const startPage = () => {
      canvas = document.createElement("canvas");
      canvas.width = pageWidth;
      canvas.height = pageHeight;
      ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageWidth, pageHeight);
      ctx.fillStyle = "#0f172a";
      ctx.font = "700 44px Arial, Malgun Gothic, sans-serif";
      ctx.fillText("Voca 오답 리스트", margin, margin);
      ctx.font = "24px Arial, Malgun Gothic, sans-serif";
      ctx.fillStyle = "#475569";
      ctx.fillText("저장된 오답 " + items.length + "개", margin, margin + 42);
      y = margin + 96;
      pages.push(canvas);
    };

    const ensureSpace = (height) => {
      if (!canvas || y + height > pageHeight - margin) startPage();
    };

    startPage();
    items.forEach((item, index) => {
      const lines = [
        index + 1 + ". " + item.taskLabel + " / " + item.part + " / " + (item.count || 1) + "회",
        "정답: " + item.answer,
      ];
      if (item.korean) lines.push(item.korean);
      if (item.prompt) lines.push(item.prompt);
      const wrapped = lines.flatMap((line, lineIndex) => wrapText(ctx, line, pageWidth - margin * 2, lineIndex < 2 ? 28 : 24));
      ensureSpace(34 + wrapped.length * 34);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(margin, y - 26, pageWidth - margin * 2, 2);
      wrapped.forEach((line) => {
        ctx.font = (line.size >= 28 ? "700 " : "") + line.size + "px Arial, Malgun Gothic, sans-serif";
        ctx.fillStyle = line.size >= 28 ? "#0f172a" : "#334155";
        ctx.fillText(line.text, margin, y);
        y += 34;
      });
      y += 18;
    });

    return pages.map((page) => ({
      width: page.width,
      height: page.height,
      bytes: base64ToBytes(page.toDataURL("image/jpeg", 0.92).split(",")[1]),
    }));
  }

  function wrapText(ctx, text, maxWidth, size) {
    ctx.font = (size >= 28 ? "700 " : "") + size + "px Arial, Malgun Gothic, sans-serif";
    const words = String(text || "").split(/\s+/);
    const lines = [];
    let current = "";
    words.forEach((word) => {
      const next = current ? current + " " + word : word;
      if (ctx.measureText(next).width <= maxWidth) {
        current = next;
        return;
      }
      if (current) lines.push({ text: current, size });
      current = word;
      while (ctx.measureText(current).width > maxWidth && current.length > 1) {
        let cut = current.length - 1;
        while (cut > 1 && ctx.measureText(current.slice(0, cut)).width > maxWidth) cut -= 1;
        lines.push({ text: current.slice(0, cut), size });
        current = current.slice(cut);
      }
    });
    if (current) lines.push({ text: current, size });
    return lines;
  }

  function buildPdf(pages) {
    const encoder = new TextEncoder();
    const chunks = [];
    const offsets = [0];
    let offset = 0;
    const add = (chunk) => {
      const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
      chunks.push(bytes);
      offset += bytes.length;
    };
    const addObject = (id, body) => {
      offsets[id] = offset;
      add(id + " 0 obj\n");
      add(body);
      add("\nendobj\n");
    };
    add("%PDF-1.4\n");
    const pageIds = pages.map((_, index) => 3 + index * 3);
    addObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
    addObject(2, "<< /Type /Pages /Kids [" + pageIds.map((id) => id + " 0 R").join(" ") + "] /Count " + pages.length + " >>");
    pages.forEach((page, index) => {
      const pageId = 3 + index * 3;
      const contentId = pageId + 1;
      const imageId = pageId + 2;
      const content = "q 595.28 0 0 841.89 0 0 cm /Im" + index + " Do Q";
      addObject(pageId, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im" + index + " " + imageId + " 0 R >> >> /Contents " + contentId + " 0 R >>");
      addObject(contentId, "<< /Length " + content.length + " >>\nstream\n" + content + "\nendstream");
      offsets[imageId] = offset;
      add(imageId + " 0 obj\n");
      add("<< /Type /XObject /Subtype /Image /Width " + page.width + " /Height " + page.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + page.bytes.length + " >>\nstream\n");
      add(page.bytes);
      add("\nendstream\nendobj\n");
    });
    const objectCount = 2 + pages.length * 3;
    const xrefOffset = offset;
    add("xref\n0 " + (objectCount + 1) + "\n0000000000 65535 f \n");
    for (let id = 1; id <= objectCount; id += 1) add(String(offsets[id]).padStart(10, "0") + " 00000 n \n");
    add("trailer\n<< /Size " + (objectCount + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF");
    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const merged = new Uint8Array(total);
    let cursor = 0;
    chunks.forEach((chunk) => {
      merged.set(chunk, cursor);
      cursor += chunk.length;
    });
    return new Blob([merged], { type: "application/pdf" });
  }

  function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function replaceBetween(text, startMarker, endMarker, replacement) {
    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker, start);
    if (start < 0 || end < 0 || end <= start) return text;
    return text.slice(0, start) + replacement + text.slice(end);
  }
})();
