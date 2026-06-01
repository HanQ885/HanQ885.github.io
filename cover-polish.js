(() => {
  "use strict";

  injectStyles();
  updateCover();

  const targets = [
    document.getElementById("screen"),
    document.getElementById("progressWrap"),
  ].filter(Boolean);

  const observer = new MutationObserver(updateCover);
  targets.forEach((target) => observer.observe(target, {
    childList: true,
    subtree: true,
    attributes: true,
  }));

  function updateCover() {
    const screen = document.getElementById("screen");
    const card = document.querySelector(".survey-card");
    const isCover = Boolean(screen?.querySelector("h1"));

    card?.classList.toggle("cover-refined", isCover);
    document.documentElement.classList.toggle("cover-refined-mode", isCover);

    if (!isCover) return;

    const notice = screen.querySelector(".notice");
    if (notice && notice.dataset.durationUpdated !== "true") {
      notice.textContent = notice.textContent.replace(/1~2/g, "1");
      notice.dataset.durationUpdated = "true";
    }
  }

  function injectStyles() {
    if (document.getElementById("cover-polish-styles")) return;

    const style = document.createElement("style");
    style.id = "cover-polish-styles";
    style.textContent = `
      .cover-refined .screen {
        min-height: 470px;
        display: grid;
        align-items: center;
      }

      .cover-refined #screen > div {
        position: relative;
        padding: 18px 0 6px;
      }

      .cover-refined .eyebrow {
        width: fit-content;
        margin-bottom: 18px;
        padding: 7px 10px;
        border: 1px solid rgba(201, 149, 66, 0.38);
        border-radius: 8px;
        background: rgba(255, 248, 235, 0.86);
        color: #7c5721;
        font-size: 0.78rem;
      }

      .cover-refined h1 {
        max-width: 760px;
        font-size: clamp(2.15rem, 7vw, 4.45rem);
        line-height: 1.06;
      }

      .cover-refined .lead {
        max-width: 640px;
        margin-top: 18px;
        padding-bottom: 18px;
        border-bottom: 1px solid rgba(201, 149, 66, 0.26);
        color: #3d4d64;
      }

      .cover-refined .notice {
        max-width: 760px;
        margin-top: 22px;
        padding: 16px 18px;
        border-left: 4px solid #c99542;
        background: rgba(255, 255, 255, 0.82);
      }

      @media (max-width: 420px) {
        .cover-refined .screen {
          min-height: 520px;
        }
      }
    `;

    document.head.append(style);
  }
})();
