(() => {
  let source = (window.VOCA_APP_CHUNKS || []).join("");
  if (!source) return;

  const style = document.createElement("style");
  style.textContent = `
    .choice.unknown-choice { border-style: dashed; color: #475569; background: #f8fafc; }
    .wrong-group { margin-bottom: 18px; }
    .wrong-group-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 8px 0 10px; }
    .wrong-group-head h3 { margin: 0; font-size: 1rem; color: #0f172a; }
    .wrong-group-head span { color: #64748b; font-weight: 700; }
  `;
  document.head.append(style);

  source = replaceBetween(
    source,
    "  function renderChoices(question) {",
    "  function submitAnswer(value, question, selectedButton) {",
    [
      "  function renderChoices(question) {",
      '    const marks = ["\\u2460", "\\u2461", "\\u2462", "\\u2463", "\\u2464"];',
      "    question.choices.forEach((choice, index) => {",
      '      const button = document.createElement("button");',
      '      button.type = "button";',
      '      button.className = "choice";',
      "      button.dataset.answer = choice;",
      '      const mark = marks[index] || String(index + 1) + ".";',
      `      button.innerHTML = '<span class="choice-mark">' + mark + '</span>' + escapeHtml(choice);`,
      "      button.addEventListener(\"click\", () => submitAnswer(choice, question, button));",
      "      els.choiceArea.append(button);",
      "    });",
      "",
      '    const unknown = document.createElement("button");',
      '    unknown.type = "button";',
      '    unknown.className = "choice unknown-choice";',
      '    unknown.dataset.answer = "__UNKNOWN__";',
      '    unknown.dataset.unknown = "true";',
      `    unknown.innerHTML = '<span class="choice-mark">?</span>\\uBAA8\\uB984';`,
      '    unknown.addEventListener("click", () => submitAnswer("__UNKNOWN__", question, unknown));',
      "    els.choiceArea.append(unknown);",
      "  }",
      "",
      "",
    ].join("\n"),
  );

  source = replaceBetween(
    source,
    "  function submitAnswer(value, question, selectedButton) {",
    "  function renderWrongBadge",
    [
      "  function submitAnswer(value, question, selectedButton) {",
      '    const unknown = value === "__UNKNOWN__";',
      "    const correct = !unknown && sameAnswer(value, question.answer);",
      "    if (question.choices) {",
      "      [...els.choiceArea.children].forEach((button) => {",
      '        const text = button.dataset.answer || button.textContent.replace(/^[\\u2460\\u2461\\u2462\\u2463\\u2464]\\s*/, "").replace(/^\\d+\\.\\s*/, "");',
      '        if (!button.dataset.unknown && sameAnswer(text, question.answer)) button.classList.add("correct");',
      "        button.disabled = true;",
      "      });",
      '      if (!correct && selectedButton) selectedButton.classList.add("wrong");',
      "    }",
      "",
      "    if (correct) {",
      '      showFeedback("correct", "\\uC815\\uB2F5\\uC785\\uB2C8\\uB2E4.");',
      "    } else {",
      "      recordWrong(question);",
      '      showFeedback("wrong", unknown ? "\\uBAA8\\uB984\\uC73C\\uB85C \\uC800\\uC7A5\\uD588\\uC2B5\\uB2C8\\uB2E4. \\uC815\\uB2F5: " + question.answer : "\\uC624\\uB2F5\\uC785\\uB2C8\\uB2E4. \\uC815\\uB2F5: " + question.answer);',
      "      renderCounts();",
      "      renderWrongBadge(question);",
      "    }",
      "  }",
      "",
      "",
    ].join("\n"),
  );

  source = replaceBetween(
    source,
    "  function renderWrongList() {",
    "  function loadWrongStore() {",
    [
      "  function renderWrongList() {",
      "    const items = Object.values(wrongStore).sort((a, b) => {",
      "      if ((a.count || 1) !== (b.count || 1)) return (a.count || 1) - (b.count || 1);",
      "      return b.lastWrongAt.localeCompare(a.lastWrongAt);",
      "    });",
      '    els.wrongSummary.textContent = items.length + "\\uAC1C";',
      '    els.wrongList.innerHTML = "";',
      "",
      "    if (!items.length) {",
      '      const empty = document.createElement("div");',
      '      empty.className = "empty";',
      '      empty.textContent = "\\uC800\\uC7A5\\uB41C \\uC624\\uB2F5\\uC774 \\uC5C6\\uC2B5\\uB2C8\\uB2E4.";',
      "      els.wrongList.append(empty);",
      "      return;",
      "    }",
      "",
      "    const grouped = new Map();",
      "    items.forEach((item) => {",
      "      const count = item.count || 1;",
      "      if (!grouped.has(count)) grouped.set(count, []);",
      "      grouped.get(count).push(item);",
      "    });",
      "",
      "    [...grouped.entries()].forEach(([wrongCount, groupItems]) => {",
      '      const section = document.createElement("section");',
      '      section.className = "wrong-group";',
      "",
      '      const head = document.createElement("div");',
      '      head.className = "wrong-group-head";',
      '      const title = document.createElement("h3");',
      '      title.textContent = wrongCount + "\\uBC88 \\uD2C0\\uB9B0 \\uBB38\\uC81C";',
      '      const amount = document.createElement("span");',
      '      amount.textContent = groupItems.length + "\\uAC1C";',
      "      head.append(title, amount);",
      "      section.append(head);",
      "",
      "      groupItems.forEach((item) => {",
      '        const row = document.createElement("article");',
      '        row.className = "wrong-item";',
      '        const body = document.createElement("div");',
      '        const itemTitle = document.createElement("strong");',
      '        itemTitle.textContent = item.taskLabel + " \\u00B7 " + item.part;',
      '        const prompt = document.createElement("p");',
      '        prompt.textContent = item.korean ? item.korean + " / " + item.prompt : item.prompt;',
      '        const answer = document.createElement("p");',
      '        answer.textContent = "\\uC815\\uB2F5: " + item.answer;',
      "        body.append(itemTitle, prompt, answer);",
      "",
      '        const count = document.createElement("div");',
      '        count.className = "wrong-count";',
      '        count.textContent = (item.count || 1) + "\\uD68C";',
      "        row.append(body, count);",
      "        section.append(row);",
      "      });",
      "",
      "      els.wrongList.append(section);",
      "    });",
      "  }",
      "",
      "",
    ].join("\n"),
  );

  window.VOCA_APP_CHUNKS = [source];

  function replaceBetween(text, startMarker, endMarker, replacement) {
    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker, start);
    if (start < 0 || end < 0 || end <= start) return text;
    return text.slice(0, start) + replacement + text.slice(end);
  }
})();
