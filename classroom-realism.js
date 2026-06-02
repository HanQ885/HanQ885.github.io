(() => {
  "use strict";

  injectStyles();
  upgradeRealism();

  const screen = document.getElementById("screen");
  if (screen) {
    new MutationObserver(upgradeRealism).observe(screen, {
      childList: true,
      subtree: true,
    });
  }

  function upgradeRealism() {
    document.querySelectorAll(".classroom").forEach((room) => {
      room.classList.add("real-classroom");
      room.classList.toggle("real-normal", Boolean(room.querySelector(".normal-grid")));
      room.classList.toggle("real-group", Boolean(room.querySelector(".group-grid")));

      const frontWall = room.querySelector(".front-wall");
      if (frontWall && !frontWall.querySelector(".board-speaker")) {
        const left = document.createElement("span");
        left.className = "board-speaker speaker-left";
        left.setAttribute("aria-hidden", "true");

        const right = document.createElement("span");
        right.className = "board-speaker speaker-right";
        right.setAttribute("aria-hidden", "true");

        frontWall.append(left, right);
      }
    });
  }

  function injectStyles() {
    if (document.getElementById("classroom-realism-styles")) return;

    const style = document.createElement("style");
    style.id = "classroom-realism-styles";
    style.textContent = `
      .real-classroom {
        position: relative;
        overflow: hidden;
        gap: 12px;
        margin-top: 18px;
        padding: 14px;
        border: 1px solid #c9bda9;
        border-radius: 8px;
        background:
          linear-gradient(90deg, rgba(221, 204, 181, 0.7) 0 34px, transparent 34px calc(100% - 34px), rgba(221, 204, 181, 0.7) calc(100% - 34px)),
          linear-gradient(180deg, #f7f1e7 0 28%, #e9dcc8 28% 31%, #d7b98e 31% 100%);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.5),
          0 14px 34px rgba(46, 37, 26, 0.12);
      }

      .real-classroom::before {
        content: "";
        position: absolute;
        left: 34px;
        right: 34px;
        top: 28%;
        bottom: 0;
        background:
          repeating-linear-gradient(90deg, rgba(118, 89, 54, 0.08) 0 1px, transparent 1px 60px),
          repeating-linear-gradient(0deg, rgba(118, 89, 54, 0.08) 0 1px, transparent 1px 32px),
          linear-gradient(180deg, #dfc09a 0%, #c79761 100%);
        opacity: 0.62;
        pointer-events: none;
      }

      .real-classroom::after {
        content: "";
        position: absolute;
        left: 5px;
        top: 31%;
        width: 22px;
        height: 42%;
        border: 2px solid #81919b;
        border-radius: 4px;
        background:
          linear-gradient(90deg, transparent 46%, rgba(95, 111, 122, 0.65) 47% 53%, transparent 54%),
          repeating-linear-gradient(0deg, #edf8ff 0 42px, #9cc3d4 42px 45px, #edf8ff 45px 84px);
        box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.65);
        pointer-events: none;
      }

      .real-classroom .front-wall,
      .real-classroom .teacher-desk,
      .real-classroom .seat-map-wrap,
      .real-classroom .btn.warning {
        position: relative;
        z-index: 1;
      }

      .real-classroom .front-wall {
        display: grid;
        grid-template-columns: clamp(72px, 12vw, 132px) minmax(0, 1fr);
        gap: 14px;
        align-items: end;
        padding: 0 clamp(8px, 2vw, 22px);
      }

      .real-classroom .tv-corner {
        width: clamp(62px, 10.5vw, 112px);
        aspect-ratio: 1.35;
        min-height: 0;
        align-self: center;
        justify-self: end;
        border: 4px solid #1b2028;
        border-radius: 4px;
        background:
          radial-gradient(circle at 30% 18%, rgba(255, 255, 255, 0.18), transparent 20%),
          linear-gradient(180deg, #2f3743 0%, #0f141b 100%) !important;
        color: rgba(255, 255, 255, 0.9);
        font-size: clamp(0.68rem, 1.4vw, 1rem);
        transform: rotate(-5deg) skewY(-1deg);
        transform-origin: 70% 50%;
        box-shadow:
          0 10px 18px rgba(30, 24, 18, 0.28),
          inset 0 -7px 0 rgba(0, 0, 0, 0.28);
      }

      .real-classroom .tv-corner::before {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -18px;
        width: 8px;
        height: 18px;
        background: #242a32;
        transform: translateX(-50%);
      }

      .real-classroom .tv-corner::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -24px;
        width: 42%;
        height: 7px;
        border-radius: 999px;
        background: #20262e;
        transform: translateX(-50%);
      }

      .real-classroom .front-wall .board {
        position: relative;
        min-height: clamp(66px, 13vw, 142px);
        display: grid;
        place-items: center;
        border: 5px solid #9b7040;
        border-radius: 3px;
        background:
          radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.05), transparent 32%),
          linear-gradient(180deg, #2f7650 0%, #1f573b 100%) !important;
        color: rgba(255, 255, 255, 0.92);
        font-size: clamp(1.05rem, 2.3vw, 2rem);
        font-weight: 900;
        box-shadow:
          inset 0 0 28px rgba(0, 0, 0, 0.18),
          inset 0 -9px 0 rgba(105, 70, 34, 0.45),
          0 8px 16px rgba(36, 28, 18, 0.18);
      }

      .real-classroom .front-wall .board::after {
        content: "";
        position: absolute;
        left: 5%;
        right: 5%;
        bottom: -10px;
        height: 8px;
        border-radius: 3px;
        background: linear-gradient(180deg, #c98e4d, #8a5b28);
      }

      .board-speaker {
        position: absolute;
        top: 6px;
        width: clamp(24px, 3.5vw, 42px);
        aspect-ratio: 1.7;
        border: 2px solid #7b7163;
        border-radius: 4px;
        background:
          radial-gradient(circle, rgba(0, 0, 0, 0.18) 0 3px, transparent 4px),
          linear-gradient(180deg, #a49a8a, #746d62);
        box-shadow: 0 4px 8px rgba(39, 31, 22, 0.16);
        z-index: 2;
      }

      .speaker-left {
        left: calc(clamp(72px, 12vw, 132px) + 28px);
      }

      .speaker-right {
        right: clamp(26px, 4vw, 60px);
      }

      .real-normal .front-wall {
        grid-template-columns: clamp(80px, 13vw, 142px) minmax(0, 1fr);
      }

      .real-normal .front-wall .board {
        min-height: clamp(84px, 15vw, 154px);
      }

      .real-normal .normal-grid {
        grid-template-columns: repeat(5, minmax(48px, 1fr));
        gap: clamp(7px, 1.5vw, 16px) clamp(9px, 1.8vw, 22px);
        align-items: end;
        padding: clamp(10px, 2vw, 24px) clamp(2px, 1vw, 12px);
      }

      .real-normal .normal-grid .seat-button {
        min-height: clamp(42px, 8vw, 74px);
        border: 2px solid #9a692f;
        border-radius: 7px;
        background:
          linear-gradient(180deg, rgba(255, 239, 200, 0.9), transparent 42%),
          linear-gradient(180deg, #e8bc75 0%, #bd7f36 100%);
        color: #24150a;
        font-size: clamp(0.82rem, 1.6vw, 1.2rem);
        box-shadow:
          0 10px 0 -6px #6f7c70,
          0 16px 14px rgba(64, 45, 25, 0.18),
          inset 0 -5px 0 rgba(77, 48, 18, 0.14);
      }

      .real-normal .normal-grid .seat-button::after {
        content: "";
        position: absolute;
        left: 22%;
        right: 22%;
        bottom: -14px;
        height: 11px;
        border: 2px solid #73817c;
        border-top: 0;
        border-radius: 0 0 10px 10px;
        background: rgba(61, 76, 74, 0.22);
        z-index: -1;
      }

      .real-group .teacher-desk {
        width: min(38%, 260px);
        min-height: clamp(50px, 7vw, 74px);
        border: 3px solid #8b5b23;
        border-radius: 4px;
        background:
          linear-gradient(180deg, rgba(255, 224, 160, 0.92), transparent 42%),
          linear-gradient(180deg, #e7b15a 0%, #b7762e 100%);
        box-shadow: 0 7px 0 #815322, 0 13px 18px rgba(52, 35, 20, 0.18);
      }

      .real-group .group-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: clamp(18px, 4vw, 42px) clamp(24px, 7vw, 86px);
        padding: clamp(10px, 2vw, 22px) clamp(8px, 3vw, 40px) clamp(12px, 3vw, 28px);
      }

      .real-group .group-title {
        width: fit-content;
        margin: 0 auto 6px;
        padding: 4px 9px;
        border-radius: 6px;
        background: rgba(52, 90, 56, 0.88);
        color: #fff;
        font-size: clamp(0.62rem, 1.2vw, 0.82rem);
      }

      .real-group .desk-cluster {
        grid-template-columns: 24px minmax(48px, 1fr) minmax(48px, 1fr) 24px;
        grid-template-rows: clamp(48px, 7vw, 72px) clamp(42px, 6vw, 60px) 24px;
        gap: 5px;
      }

      .real-group .desk-seat {
        min-height: 42px;
        border: 2px solid #8b5b23;
        border-radius: 6px;
        background:
          linear-gradient(180deg, rgba(255, 235, 190, 0.85), transparent 40%),
          linear-gradient(180deg, #f1c477 0%, #ca8535 100%);
        color: #111;
        font-size: clamp(0.95rem, 2vw, 1.4rem);
        box-shadow:
          0 7px 0 -3px #5d6761,
          0 13px 13px rgba(58, 39, 21, 0.15),
          inset 0 -5px 0 rgba(111, 74, 35, 0.16);
      }

      .real-group .chair-deco {
        border-color: #343d37;
        background:
          linear-gradient(180deg, rgba(255,255,255,0.2), transparent 35%),
          linear-gradient(180deg, #788754 0%, #4f6137 100%);
      }

      @media (max-width: 520px) {
        .real-classroom {
          padding: 10px 7px;
        }

        .real-classroom .front-wall {
          grid-template-columns: 54px minmax(0, 1fr);
          gap: 8px;
          padding: 0 2px;
        }

        .real-classroom .tv-corner {
          width: 52px;
          border-width: 3px;
        }

        .real-classroom .front-wall .board {
          min-height: 54px;
          border-width: 3px;
          font-size: 0.95rem;
        }

        .board-speaker {
          display: none;
        }

        .real-normal .normal-grid {
          grid-template-columns: repeat(5, minmax(42px, 1fr));
          gap: 8px 7px;
          padding: 12px 1px 6px;
        }

        .real-normal .normal-grid .seat-button {
          min-height: 46px;
          font-size: 0.9rem;
        }

        .real-group .teacher-desk {
          width: min(58%, 210px);
          min-height: 42px;
        }

        .real-group .group-grid {
          gap: 14px 12px;
          padding: 10px 0 14px;
        }

        .real-group .desk-cluster {
          grid-template-columns: 13px minmax(38px, 1fr) minmax(38px, 1fr) 13px;
          grid-template-rows: 44px 38px 15px;
          gap: 4px;
        }

        .real-group .desk-seat {
          min-height: 38px;
          border-width: 1.5px;
          font-size: 0.92rem;
        }
      }
    `;

    document.head.append(style);
  }
})();
