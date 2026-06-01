(() => {
  "use strict";

  injectStyles();
  upgradeClassrooms();

  const screen = document.getElementById("screen");
  if (screen) {
    new MutationObserver(upgradeClassrooms).observe(screen, {
      childList: true,
      subtree: true,
    });
  }

  function upgradeClassrooms() {
    document.querySelectorAll(".classroom").forEach((room) => {
      room.classList.toggle("normal-room", Boolean(room.querySelector(".normal-grid")));
      addFrontWall(room);
      upgradeGroupRoom(room);
    });
  }

  function addFrontWall(room) {
    if (room.querySelector(".front-wall")) return;

    const board = room.querySelector(".board");
    if (!board) return;

    const frontWall = document.createElement("div");
    frontWall.className = "front-wall";

    const tv = document.createElement("div");
    tv.className = "tv-corner";
    tv.textContent = "TV";
    tv.setAttribute("aria-label", "TV");

    board.insertAdjacentElement("beforebegin", frontWall);
    frontWall.append(tv, board);
  }

  function upgradeGroupRoom(room) {
    const grid = room.querySelector(".group-grid");
    if (!grid) return;

    room.classList.add("group-room");

    grid.querySelectorAll(".group-box").forEach((box) => {
      const seats = box.querySelector(".group-seats");
      if (!seats) return;

      seats.classList.add("desk-cluster");
      seats.querySelector(".group-table")?.remove();

      ensureChair(seats, "chair-left");
      ensureChair(seats, "chair-right");
      ensureChair(seats, "chair-bottom-left");
      ensureChair(seats, "chair-bottom-right");

      Array.from(seats.querySelectorAll(".seat-button")).slice(0, 4).forEach((button, index) => {
        button.classList.add("desk-seat", `desk-${index + 1}`);
      });
    });
  }

  function ensureChair(parent, className) {
    if (parent.querySelector(`.${className}`)) return;
    const chair = document.createElement("span");
    chair.className = `chair-deco ${className}`;
    chair.setAttribute("aria-hidden", "true");
    parent.append(chair);
  }

  function injectStyles() {
    if (document.getElementById("classroom-layout-styles")) return;

    const style = document.createElement("style");
    style.id = "classroom-layout-styles";
    style.textContent = `
      .classroom {
        position: relative;
      }

      .front-wall {
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr);
        gap: 8px;
        align-items: stretch;
      }

      .tv-corner {
        min-height: 42px;
        display: grid;
        place-items: center;
        border: 1px solid #44566b;
        border-radius: 6px;
        background: linear-gradient(180deg, #293647 0%, #172033 100%);
        color: #fff;
        font-size: 0.78rem;
        font-weight: 950;
      }

      .front-wall .board {
        min-height: 42px;
        display: grid;
        place-items: center;
        border-radius: 6px;
        box-shadow: inset 0 -5px 0 rgba(111, 74, 35, 0.45);
      }

      .normal-room .normal-grid .seat-button {
        border-color: #bf8950;
        background: linear-gradient(180deg, #f5d6a8 0%, #d79d61 100%);
        color: #321e10;
        box-shadow: inset 0 -5px 0 rgba(91, 52, 22, 0.14);
      }

      .normal-room .normal-grid .seat-button::before {
        content: "";
        position: absolute;
        left: 8px;
        right: 8px;
        top: 7px;
        height: 3px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.42);
      }

      .normal-room .normal-grid .seat-button:hover {
        border-color: var(--primary);
        background: linear-gradient(180deg, #fae0b7 0%, #e0a76b 100%);
      }

      .normal-room .normal-grid .seat-button.selected {
        border-color: var(--primary);
        background: var(--primary);
        color: #fff;
        box-shadow: none;
      }

      .group-room {
        gap: 10px;
        padding: 10px;
        border: 2px solid #222;
        border-radius: 6px;
        background:
          linear-gradient(90deg, #e8dccd 0 26px, transparent 26px calc(100% - 26px), #e8dccd calc(100% - 26px)),
          radial-gradient(circle at 50% 35%, #fff 0, #fbf7ef 56%, #f0e3d4 100%);
      }

      .group-room .front-wall {
        grid-template-columns: 50px minmax(0, 1fr);
      }

      .group-room .teacher-desk {
        position: relative;
        width: min(54%, 230px);
        min-height: 46px;
        display: grid;
        place-items: center;
        border: 2px solid #8b5b23;
        background: linear-gradient(180deg, #f7c879 0%, #df9f45 100%);
        color: #20140b;
        box-shadow: 0 4px 0 #8b5b23;
      }

      .group-room .teacher-desk::before {
        content: "";
        position: absolute;
        top: -18px;
        width: 52px;
        height: 22px;
        border: 2px solid #8b5b23;
        border-bottom: 0;
        border-radius: 14px 14px 0 0;
        background: #d89128;
        z-index: -1;
      }

      .group-room .seat-map-wrap {
        grid-template-columns: 22px minmax(0, 1fr) 22px;
        gap: 8px;
        align-items: stretch;
      }

      .group-room .side-label {
        position: relative;
        min-height: 100%;
        display: grid;
        place-items: center;
        writing-mode: vertical-rl;
        border-radius: 4px;
        background: rgba(234, 221, 206, 0.78);
        color: #4e5d70;
        font-size: 0.72rem;
      }

      .group-room .side-label:first-child::before,
      .group-room .side-label:first-child::after {
        content: "";
        width: 13px;
        height: 48px;
        border: 2px solid #6f7f8f;
        border-radius: 3px;
        background: linear-gradient(90deg, #e8f7ff 48%, #9bc6dc 50%, #e8f7ff 52%);
      }

      .group-room .side-label:first-child {
        align-content: space-around;
      }

      .group-room .side-label:last-child::before {
        content: "";
        width: 14px;
        height: 72px;
        border: 2px solid #8f5a20;
        border-radius: 3px;
        background: linear-gradient(135deg, #e6ad5e, #b7762e);
      }

      .group-room .group-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px 22px;
        padding: 8px 0 10px;
      }

      .group-room .group-box {
        border: 0;
        background: transparent;
        padding: 0;
      }

      .group-room .group-title {
        margin: 0 0 4px;
        color: #56657a;
        font-size: 0.72rem;
        font-weight: 900;
      }

      .desk-cluster {
        display: grid;
        grid-template-columns: 18px minmax(40px, 1fr) minmax(40px, 1fr) 18px;
        grid-template-rows: 48px 42px 18px;
        grid-template-areas:
          "chairLeft desk1 desk2 chairRight"
          ". desk3 desk4 ."
          ". chairBottomLeft chairBottomRight .";
        gap: 5px;
        align-items: stretch;
      }

      .desk-seat {
        position: relative;
        min-height: 40px;
        border: 2px solid #8b5b23;
        border-radius: 5px;
        background: linear-gradient(180deg, #ffd18d 0%, #edaf5f 100%);
        color: #111;
        font-size: 1rem;
        font-weight: 950;
        box-shadow: inset 0 -4px 0 rgba(111, 74, 35, 0.16);
      }

      .desk-1 { grid-area: desk1; }
      .desk-2 { grid-area: desk2; }
      .desk-3 { grid-area: desk3; }
      .desk-4 { grid-area: desk4; }

      .chair-deco {
        display: block;
        border: 2px solid #1d2430;
        border-radius: 8px;
        background: linear-gradient(180deg, #e4a33a 0%, #c27e19 100%);
        box-shadow: inset 0 -4px 0 rgba(72, 44, 14, 0.24);
      }

      .chair-left {
        grid-area: chairLeft;
        align-self: center;
        height: 34px;
        border-right-width: 4px;
      }

      .chair-right {
        grid-area: chairRight;
        align-self: center;
        height: 34px;
        border-left-width: 4px;
      }

      .chair-bottom-left {
        grid-area: chairBottomLeft;
        justify-self: center;
        width: 34px;
        border-top-width: 4px;
      }

      .chair-bottom-right {
        grid-area: chairBottomRight;
        justify-self: center;
        width: 34px;
        border-top-width: 4px;
      }

      .desk-seat:hover {
        border-color: var(--primary);
        background: linear-gradient(180deg, #ffdb9d 0%, #f0b86d 100%);
      }

      .desk-seat.selected {
        border-color: var(--primary);
        background: var(--primary);
        color: #fff;
        box-shadow: none;
      }

      @media (min-width: 700px) {
        .front-wall {
          grid-template-columns: 64px minmax(0, 1fr);
        }

        .group-room {
          padding: 16px 18px;
        }

        .group-room .seat-map-wrap {
          grid-template-columns: 34px minmax(0, 1fr) 34px;
          gap: 14px;
        }

        .group-room .group-grid {
          gap: 26px 54px;
          padding: 14px 20px 18px;
        }

        .desk-cluster {
          grid-template-columns: 22px minmax(54px, 1fr) minmax(54px, 1fr) 22px;
          grid-template-rows: 64px 56px 22px;
          gap: 7px;
        }

        .desk-seat {
          font-size: 1.28rem;
        }

        .chair-left,
        .chair-right {
          height: 40px;
        }
      }

      @media (max-width: 420px) {
        .group-room {
          padding: 8px 6px;
        }

        .group-room .seat-map-wrap {
          grid-template-columns: 18px minmax(0, 1fr) 18px;
          gap: 5px;
        }

        .group-room .side-label {
          font-size: 0;
        }

        .group-room .group-grid {
          gap: 14px 12px;
        }

        .desk-cluster {
          grid-template-columns: 14px minmax(38px, 1fr) minmax(38px, 1fr) 14px;
          grid-template-rows: 46px 40px 16px;
          gap: 4px;
        }

        .desk-seat {
          font-size: 0.95rem;
          border-width: 1.5px;
        }

        .chair-deco {
          border-width: 1.5px;
        }
      }
    `;

    document.head.append(style);
  }
})();
