(() => {
  "use strict";

  const PREFIX = "010";
  const SCREEN_ID = "screen";
  const ORIGINAL_INPUT_ID = "phone";

  injectStyles();
  enhancePhoneInput();

  const screen = document.getElementById(SCREEN_ID);
  if (screen) {
    new MutationObserver(enhancePhoneInput).observe(screen, {
      childList: true,
      subtree: true,
    });
  }

  function enhancePhoneInput() {
    const original = document.getElementById(ORIGINAL_INPUT_ID);
    if (!original || original.dataset.segmentedPhone === "true") {
      return;
    }

    original.dataset.segmentedPhone = "true";
    original.classList.add("phone-original-hidden");
    original.tabIndex = -1;
    original.inputMode = "numeric";

    const parts = splitPhone(original.value);
    const middle = digitInput("phone-middle", "전화번호 가운데 네 자리", parts.middle);
    const last = digitInput("phone-last", "전화번호 마지막 네 자리", parts.last);

    const wrapper = document.createElement("div");
    wrapper.className = "phone-segment-inputs";
    wrapper.setAttribute("role", "group");
    wrapper.setAttribute("aria-label", "전화번호");

    wrapper.append(
      phonePrefix(),
      dash(),
      middle,
      dash(),
      last,
    );

    original.insertAdjacentElement("afterend", wrapper);
    original.addEventListener("focus", () => middle.focus());

    middle.addEventListener("input", () => {
      keepFourDigits(middle);
      if (middle.value.length === 4) {
        last.focus();
      }
      syncOriginal(original, middle, last);
    });

    last.addEventListener("input", () => {
      keepFourDigits(last);
      syncOriginal(original, middle, last);
    });

    middle.addEventListener("paste", (event) => distributePaste(event, original, middle, last));
    last.addEventListener("paste", (event) => distributePaste(event, original, middle, last));

    last.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && last.value === "") {
        middle.focus();
        middle.setSelectionRange(middle.value.length, middle.value.length);
      }
    });

    syncOriginal(original, middle, last);
  }

  function digitInput(id, label, value) {
    const input = document.createElement("input");
    input.id = id;
    input.className = "phone-digit";
    input.type = "tel";
    input.inputMode = "numeric";
    input.autocomplete = "off";
    input.pattern = "[0-9]*";
    input.maxLength = 4;
    input.placeholder = "0000";
    input.value = value;
    input.setAttribute("aria-label", label);
    return input;
  }

  function phonePrefix() {
    const prefix = document.createElement("span");
    prefix.className = "phone-prefix";
    prefix.textContent = PREFIX;
    return prefix;
  }

  function dash() {
    const node = document.createElement("span");
    node.className = "phone-dash";
    node.setAttribute("aria-hidden", "true");
    node.textContent = "-";
    return node;
  }

  function keepFourDigits(input) {
    input.value = input.value.replace(/[^0-9]/g, "").slice(0, 4);
  }

  function distributePaste(event, original, middle, last) {
    event.preventDefault();
    const text = event.clipboardData ? event.clipboardData.getData("text") : "";
    const digits = text.replace(/[^0-9]/g, "");
    const rest = digits.startsWith(PREFIX) ? digits.slice(PREFIX.length) : digits;

    middle.value = rest.slice(0, 4);
    last.value = rest.slice(4, 8);

    if (middle.value.length === 4) {
      last.focus();
    } else {
      middle.focus();
    }

    syncOriginal(original, middle, last);
  }

  function splitPhone(value) {
    const digits = String(value || "").replace(/[^0-9]/g, "");
    const rest = digits.startsWith(PREFIX) ? digits.slice(PREFIX.length) : digits;
    return {
      middle: rest.slice(0, 4),
      last: rest.slice(4, 8),
    };
  }

  function syncOriginal(original, middle, last) {
    const complete = middle.value.length === 4 && last.value.length === 4;
    original.value = complete ? `${PREFIX}-${middle.value}-${last.value}` : "";
    original.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function injectStyles() {
    if (document.getElementById("phone-segment-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "phone-segment-styles";
    style.textContent = `
      .phone-original-hidden {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0 0 0 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }

      .phone-segment-inputs {
        display: grid;
        grid-template-columns: 74px auto minmax(0, 1fr) auto minmax(0, 1fr);
        gap: 8px;
        align-items: center;
      }

      .phone-prefix {
        min-height: 50px;
        display: grid;
        place-items: center;
        border: 1px solid #c8d6e8;
        border-radius: 8px;
        background: #eef4fb;
        color: #27384f;
        font-weight: 900;
      }

      .phone-dash {
        color: var(--muted);
        font-weight: 900;
        text-align: center;
      }

      .phone-segment-inputs .phone-digit {
        text-align: center;
        font-weight: 850;
      }

      @media (max-width: 420px) {
        .phone-segment-inputs {
          grid-template-columns: 64px auto minmax(72px, 1fr) auto minmax(72px, 1fr);
          gap: 6px;
        }
      }
    `;
    document.head.append(style);
  }
})();
