(() => {
  "use strict";

  injectStyles();
  updateStepMode();

  const targets = [
    document.getElementById("progressText"),
    document.getElementById("stepTitle"),
    document.getElementById("screen"),
  ].filter(Boolean);

  const observer = new MutationObserver(updateStepMode);
  targets.forEach((target) => observer.observe(target, {
    childList: true,
    subtree: true,
    characterData: true,
  }));

  function updateStepMode() {
    const progressText = document.getElementById("progressText")?.textContent || "";
    const stepNumber = Number(progressText.match(/\d+/)?.[0] || 0);
    const isAvoidStep = stepNumber === 4 || stepNumber === 6;

    document.documentElement.classList.toggle("avoid-mode", isAvoidStep);
    document.querySelector(".survey-card")?.classList.toggle("avoid-mode", isAvoidStep);
  }

  function injectStyles() {
    if (document.getElementById("ui-polish-styles")) return;

    const style = document.createElement("style");
    style.id = "ui-polish-styles";
    style.textContent = `
      :root {
        --lux-ink: #142033;
        --lux-muted: #627087;
        --lux-gold: #c99542;
        --lux-gold-dark: #94652b;
        --lux-green: #0f766e;
        --lux-green-dark: #0b5d57;
        --lux-blue: #1f6fb8;
        --lux-red: #d83a3a;
        --lux-red-dark: #a92727;
      }

      body {
        background: linear-gradient(135deg, #eef4f8 0%, #faf7ef 46%, #edf6f2 100%);
        color: var(--lux-ink);
      }

      .app-shell {
        width: min(100%, 980px);
      }

      .survey-card {
        border: 1px solid rgba(185, 195, 212, 0.72);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(252, 250, 245, 0.96));
        box-shadow:
          0 24px 70px rgba(24, 37, 58, 0.16),
          0 1px 0 rgba(255, 255, 255, 0.9) inset;
      }

      h1,
      h2 {
        color: #10213a;
        font-weight: 950;
      }

      .eyebrow {
        color: var(--lux-gold-dark);
      }

      .lead,
      .hint,
      .seat-help {
        color: var(--lux-muted);
      }

      .notice {
        border-color: rgba(177, 190, 211, 0.78);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(245, 249, 252, 0.92));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }

      .progress-label {
        color: #40516a;
      }

      .progress-track {
        height: 9px;
        background: #dbe5ef;
        box-shadow: inset 0 1px 3px rgba(20, 32, 51, 0.12);
      }

      .progress-bar {
        background: linear-gradient(90deg, var(--lux-blue), var(--lux-green));
      }

      .avoid-mode .progress-bar {
        background: linear-gradient(90deg, #ef6262, var(--lux-red-dark));
      }

      .field input,
      .field select,
      .choice span {
        border-color: #c5d0df;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset;
      }

      .field input:focus,
      .field select:focus {
        border-color: var(--lux-blue);
        box-shadow:
          0 0 0 3px rgba(31, 111, 184, 0.16),
          0 1px 0 rgba(255, 255, 255, 0.8) inset;
      }

      .btn,
      .link-btn {
        border-radius: 8px;
        transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
      }

      .btn:hover,
      .link-btn:hover {
        transform: translateY(-1px);
      }

      .btn.primary {
        background: linear-gradient(180deg, #2f83c6 0%, #1d68aa 100%);
        box-shadow: 0 10px 22px rgba(31, 111, 184, 0.22);
      }

      .btn.primary:hover {
        background: linear-gradient(180deg, #2778bb 0%, #175b97 100%);
      }

      .btn.secondary,
      .link-btn {
        background: rgba(255, 255, 255, 0.88);
        border-color: #c5d0df;
      }

      .btn.warning {
        border-color: rgba(201, 149, 66, 0.5);
        background: linear-gradient(180deg, #fff9ec, #fff1d7);
        color: #815719;
      }

      .rank-chip {
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.9);
      }

      .rank-chip.filled {
        border-color: rgba(15, 118, 110, 0.36);
        background: #eaf7f4;
        color: var(--lux-green-dark);
      }

      .avoid-mode .rank-chip.filled {
        border-color: rgba(216, 58, 58, 0.4);
        background: #fff0ef;
        color: var(--lux-red-dark);
      }

      .classroom {
        border-radius: 8px;
      }

      .front-wall .board {
        background: linear-gradient(180deg, #2f6f4a 0%, #1f553a 100%);
        letter-spacing: 0;
      }

      .tv-corner {
        background: linear-gradient(180deg, #34455c 0%, #172033 100%);
        box-shadow: 0 6px 14px rgba(20, 32, 51, 0.22), inset 0 -4px 0 rgba(255, 255, 255, 0.08);
      }

      .normal-room .normal-grid .seat-button,
      .desk-seat {
        transition: transform 110ms ease, box-shadow 110ms ease, border-color 110ms ease, background 110ms ease;
      }

      .normal-room .normal-grid .seat-button:hover,
      .desk-seat:hover {
        transform: translateY(-1px);
      }

      .seat-button.selected,
      .normal-room .normal-grid .seat-button.selected,
      .desk-seat.selected {
        border-color: var(--lux-green-dark) !important;
        background: linear-gradient(180deg, #15947f 0%, var(--lux-green-dark) 100%) !important;
        color: #fff !important;
        box-shadow: 0 8px 18px rgba(15, 118, 110, 0.24) !important;
      }

      .seat-rank {
        background: var(--lux-gold);
        color: #fff;
      }

      .avoid-mode .seat-button.selected,
      .avoid-mode .normal-room .normal-grid .seat-button.selected,
      .avoid-mode .desk-seat.selected {
        border-color: var(--lux-red-dark) !important;
        background: linear-gradient(180deg, #f06464 0%, var(--lux-red-dark) 100%) !important;
        color: #fff !important;
        box-shadow: 0 8px 18px rgba(216, 58, 58, 0.25) !important;
      }

      .avoid-mode .seat-rank {
        background: var(--lux-red-dark);
      }

      .choice input:checked + span {
        border-color: var(--lux-green);
        background: #eaf7f4;
        color: var(--lux-green-dark);
      }

      .summary-table th,
      .summary-table td {
        border-bottom-color: rgba(197, 208, 223, 0.82);
      }

      .complete-mark {
        background: linear-gradient(180deg, #ecf9f5, #d7f0e8);
        box-shadow: 0 12px 28px rgba(15, 118, 110, 0.18);
      }

      @media (max-width: 420px) {
        .survey-card {
          box-shadow: 0 16px 44px rgba(24, 37, 58, 0.14);
        }

        .btn:hover,
        .link-btn:hover,
        .normal-room .normal-grid .seat-button:hover,
        .desk-seat:hover {
          transform: none;
        }
      }
    `;

    document.head.append(style);
  }
})();
