(() => {
  "use strict";

  injectSceneStyles();
  enhanceScene();

  const screen = document.getElementById("screen");
  if (screen) {
    new MutationObserver(enhanceScene).observe(screen, {
      childList: true,
      subtree: true,
    });
  }

  function enhanceScene() {
    document.querySelectorAll(".classroom").forEach((room) => {
      const isNormal = Boolean(room.querySelector(".normal-grid"));

      if (isNormal && !room.querySelector(".normal-teacher-desk")) {
        const desk = document.createElement("div");
        desk.className = "teacher-desk normal-teacher-desk";
        desk.textContent = "\uad50\uc0ac \ucc45\uc0c1";

        const wrap = room.querySelector(".seat-map-wrap");
        if (wrap) wrap.insertAdjacentElement("beforebegin", desk);
      }

      addDetail(room, "room-bulletin");
      addDetail(room, "room-door");
      addDetail(room, "room-cabinet");
    });
  }

  function addDetail(room, className) {
    if (room.querySelector(`.${className}`)) return;

    const detail = document.createElement("span");
    detail.className = className;
    detail.setAttribute("aria-hidden", "true");
    room.append(detail);
  }

  function injectSceneStyles() {
    if (document.getElementById("classroom-scene-styles")) return;

    const style = document.createElement("style");
    style.id = "classroom-scene-styles";
    style.textContent = `
      .real-classroom {
        overflow: hidden;
        border-color: #c6b8a1;
        background:
          radial-gradient(circle at 15% 36%, rgba(255, 255, 255, 0.8), transparent 20%),
          linear-gradient(90deg, rgba(232, 221, 207, 0.92) 0 36px, transparent 36px calc(100% - 36px), rgba(221, 204, 181, 0.92) calc(100% - 36px)),
          linear-gradient(180deg, #fbf4eb 0 27%, #e7d4ba 27% 30%, #d4b282 30% 100%);
      }

      .real-classroom::before {
        left: 36px;
        right: 36px;
        top: 28%;
        background:
          linear-gradient(105deg, rgba(255, 255, 255, 0.42) 0 16%, transparent 16% 100%),
          repeating-linear-gradient(90deg, rgba(118, 89, 54, 0.1) 0 1px, transparent 1px 62px),
          repeating-linear-gradient(0deg, rgba(118, 89, 54, 0.08) 0 1px, transparent 1px 30px),
          linear-gradient(180deg, #dfc09a 0%, #c4945e 100%);
        opacity: 0.72;
      }

      .real-classroom .front-wall,
      .real-classroom .teacher-desk,
      .real-classroom .seat-map-wrap,
      .real-classroom .btn.warning {
        position: relative;
        z-index: 2;
      }

      .real-classroom .front-wall {
        grid-template-columns: clamp(78px, 13vw, 146px) minmax(0, 1fr);
        gap: clamp(10px, 1.8vw, 18px);
        align-items: end;
        padding-inline: clamp(8px, 2vw, 24px);
      }

      .real-classroom .tv-corner {
        width: clamp(68px, 11vw, 126px);
        align-self: start;
        justify-self: center;
        margin-top: clamp(9px, 1.8vw, 22px);
        border: 4px solid #171c24;
        border-radius: 4px;
        transform: rotate(-6deg) skewY(-1deg);
        box-shadow:
          0 12px 20px rgba(30, 24, 18, 0.3),
          inset 0 -8px 0 rgba(0, 0, 0, 0.32);
      }

      .real-classroom .front-wall .board {
        min-height: clamp(88px, 16vw, 166px);
        border-width: 6px;
        border-color: #9b7040;
        border-radius: 3px;
        background:
          radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.06), transparent 34%),
          linear-gradient(180deg, #2f7650 0%, #1f573b 100%) !important;
        box-shadow:
          inset 0 0 32px rgba(0, 0, 0, 0.2),
          inset 0 -10px 0 rgba(105, 70, 34, 0.42),
          0 9px 18px rgba(36, 28, 18, 0.2);
      }

      .real-classroom .front-wall .board::before {
        content: "";
        position: absolute;
        inset: 10px 12px 16px;
        border-radius: 1px;
        background:
          linear-gradient(90deg, transparent 0 47%, rgba(255, 255, 255, 0.08) 48% 52%, transparent 53%),
          repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 22px);
        pointer-events: none;
      }

      .room-bulletin,
      .room-door,
      .room-cabinet {
        position: absolute;
        display: block;
        pointer-events: none;
        z-index: 1;
      }

      .room-bulletin {
        right: clamp(44px, 6vw, 78px);
        top: 12%;
        width: clamp(36px, 6vw, 68px);
        height: clamp(42px, 7vw, 78px);
        border: 3px solid #9f7440;
        border-radius: 3px;
        background:
          linear-gradient(90deg, transparent 46%, rgba(124, 91, 50, 0.24) 47% 53%, transparent 54%),
          linear-gradient(180deg, #e9dac0, #d7bd91);
        box-shadow: inset 0 0 0 5px rgba(255, 252, 241, 0.62);
      }

      .room-bulletin::before,
      .room-bulletin::after {
        content: "";
        position: absolute;
        left: 8px;
        right: 8px;
        height: 16%;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.75);
      }

      .room-bulletin::before {
        top: 17%;
      }

      .room-bulletin::after {
        bottom: 18%;
      }

      .room-door {
        right: 8px;
        top: 28%;
        width: clamp(22px, 4.4vw, 48px);
        height: clamp(104px, 19vw, 210px);
        border: 3px solid #8a5a25;
        border-radius: 2px;
        background:
          radial-gradient(circle at 82% 54%, #f3dfb7 0 3px, transparent 4px),
          linear-gradient(180deg, #d99643 0%, #ad6725 100%);
        transform: skewY(-6deg);
        box-shadow: -5px 6px 14px rgba(76, 50, 25, 0.14);
      }

      .room-door::before {
        content: "";
        position: absolute;
        left: 24%;
        top: 15%;
        width: 42%;
        height: 23%;
        border: 2px solid rgba(65, 85, 96, 0.8);
        background: linear-gradient(180deg, #dff6ff, #9cc2d1);
      }

      .room-cabinet {
        left: 13px;
        bottom: 23%;
        width: clamp(24px, 5vw, 56px);
        height: clamp(44px, 8vw, 90px);
        border: 2px solid #9c6d36;
        border-radius: 3px;
        background:
          radial-gradient(circle at 50% -6px, #5b8b49 0 10px, transparent 11px),
          linear-gradient(180deg, #c28a48, #92602c);
        box-shadow: inset 0 -10px 0 rgba(72, 45, 19, 0.18);
      }

      .real-normal .normal-teacher-desk {
        width: min(34%, 240px);
        min-height: clamp(42px, 6.5vw, 72px);
        display: grid;
        place-items: center;
        margin: clamp(9px, 1.6vw, 18px) auto 0;
        border: 3px solid #8b5b23;
        border-radius: 4px;
        background:
          linear-gradient(180deg, rgba(255, 230, 180, 0.95), transparent 42%),
          linear-gradient(180deg, #e6b35f 0%, #b87932 100%);
        color: #231509;
        font-weight: 950;
        box-shadow:
          0 7px 0 #815322,
          0 12px 16px rgba(58, 38, 20, 0.15);
      }

      .real-normal .seat-map-wrap {
        grid-template-columns: clamp(24px, 5vw, 48px) minmax(0, 1fr) clamp(24px, 5vw, 48px);
        align-items: stretch;
        gap: clamp(7px, 1.6vw, 18px);
        padding-top: clamp(4px, 1.2vw, 12px);
      }

      .real-normal .side-label {
        display: grid;
        place-items: center;
        min-height: 100%;
        border: 2px solid rgba(75, 93, 73, 0.42);
        border-radius: 10px;
        background: rgba(250, 247, 230, 0.78);
        color: #314733;
        font-weight: 900;
        box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.58);
      }

      .real-normal .normal-grid .seat-button:nth-child(-n + 5) {
        min-height: clamp(36px, 6.2vw, 60px);
      }

      .real-normal .normal-grid .seat-button:nth-child(n + 6):nth-child(-n + 10) {
        min-height: clamp(40px, 6.9vw, 66px);
      }

      .real-normal .normal-grid .seat-button:nth-child(n + 16):nth-child(-n + 20) {
        min-height: clamp(48px, 8.3vw, 82px);
      }

      .real-normal .normal-grid .seat-button:nth-child(n + 21) {
        min-height: clamp(52px, 9vw, 88px);
      }

      .real-group .group-box {
        filter: drop-shadow(0 12px 12px rgba(69, 48, 25, 0.12));
      }

      @media (max-width: 520px) {
        .real-classroom .front-wall {
          grid-template-columns: 54px minmax(0, 1fr);
        }

        .real-classroom .tv-corner {
          width: 52px;
          border-width: 3px;
        }

        .real-classroom .front-wall .board {
          min-height: 58px;
          border-width: 3px;
        }

        .room-bulletin,
        .room-door,
        .room-cabinet {
          display: none;
        }

        .real-normal .normal-teacher-desk {
          width: min(58%, 190px);
          min-height: 40px;
          font-size: 0.8rem;
        }

        .real-normal .seat-map-wrap {
          grid-template-columns: 16px minmax(0, 1fr) 16px;
          gap: 5px;
        }

        .real-normal .side-label {
          font-size: 0;
          border-radius: 7px;
        }
      }
    `;

    document.head.append(style);
  }
})();
