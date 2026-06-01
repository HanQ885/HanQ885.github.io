(() => {
  "use strict";

  injectStyles();
  updatePhoneCompletion();

  const screen = document.getElementById("screen");
  if (screen) {
    new MutationObserver(updatePhoneCompletion).observe(screen, {
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener("input", (event) => {
    if (event.target?.matches?.("#phone-middle, #phone-last")) {
      updatePhoneCompletion();
    }
  }, true);

  function updatePhoneCompletion() {
    document.querySelectorAll(".phone-segment-inputs").forEach((wrapper) => {
      if (!wrapper.querySelector(".phone-complete-mark")) {
        const mark = document.createElement("span");
        mark.className = "phone-complete-mark";
        mark.textContent = "\u2713";
        mark.setAttribute("aria-hidden", "true");
        wrapper.append(mark);
      }

      const middle = wrapper.querySelector("#phone-middle");
      const last = wrapper.querySelector("#phone-last");
      const complete = middle?.value.length === 4 && last?.value.length === 4;
      wrapper.classList.toggle("phone-complete", complete);
    });
  }

  function injectStyles() {
    if (document.getElementById("phone-complete-styles")) return;

    const style = document.createElement("style");
    style.id = "phone-complete-styles";
    style.textContent = `
      .phone-segment-inputs {
        grid-template-columns: 74px auto minmax(0, 1fr) auto minmax(0, 1fr) 30px !important;
      }

      .phone-complete-mark {
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        border: 1px solid #c8d6e8;
        background: #eef4fb;
        color: transparent;
        font-weight: 950;
        transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
      }

      .phone-segment-inputs.phone-complete .phone-complete-mark {
        border-color: #0f766e;
        background: #e6f6f1;
        color: #0f766e;
      }

      @media (max-width: 420px) {
        .phone-segment-inputs {
          grid-template-columns: 64px auto minmax(62px, 1fr) auto minmax(62px, 1fr) 28px !important;
        }

        .phone-complete-mark {
          width: 28px;
          height: 28px;
        }
      }
    `;

    document.head.append(style);
  }
})();
