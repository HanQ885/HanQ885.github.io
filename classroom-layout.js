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
      addFrontWall(room);
      upgradeGroupLayout(room);
    });
  }

  function addFrontWall(room) {
    if (room.querySelector(".front-wall")) {
      return;
    }

    const board = room.querySelector(".board");
    if (!board) {
      return;
    }

    const frontWall = document.createElement("div");
    frontWall.className = "front-wall";

    const tv = document.createElement("div");
    tv.className = "tv-corner";
    tv.textContent = "TV";
    tv.setAttribute("aria-label", "TV");

    board.insertAdjacentElement("beforebegin", frontWall);
    frontWall.append(tv, board);
  }

  function upgradeGroupLayout(room) {
    const grid = room.querySelector(".group-grid");
    if (!grid) {
      return;
    }

    room.classList.add("group-room");

    grid.querySelectorAll(".group-box").forEach((box) => {
      const seats = box.querySelector(".group-seats");
      if (!seats) {
        return;
      }

      seats.classList.add("chair-map");

      if (!seats.querySelector(".group-table")) {
        const table = document.createElement("div");
        table.className = "group-table";
        table.textContent = "책상";
        table.setAttribute("aria-hidden", "true");
        seats.append(table);
      }

      Array.from(seats.querySelectorAll(".seat-button")).slice(0, 4).forEach((button, index) => {
        button.classList.add("chair-seat", `chair-${index + 1}`);
      });
    });
  }

  function injectStyles() {
    if (document.getElementById("classroom-layout-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "classroom-layout-styles";
    style.textContent = `
      .front-wall {
        display: grid;
        grid-template-columns: minmax(52px, 74px) minmax(0, 1fr);
        gap: 8px;
        align-items: stretch;
      }

      .tv-corner {
        min-height: 48px;
        display: grid;
        place-items: center;
        border: 2px solid #172033;
        border-radius: 8px;
        background: linear-gradient(180deg, #28384f 0%, #172033 100%);
        color: #fff;
        font-size: 0.88rem;
        font-weight: 950;
        box-shadow: inset 0 -5px 0 rgba(255, 255, 255, 0.08);
      }

      .front-wall .board {
        min-height: 48px;
        display: grid;
        place-items: center;
      }

      .group-room .teacher-desk {
        margin-top: 2px;
      }

      .group-room .group-box {
        padding: 10px;
      }

      .group-seats.chair-map {
        display: grid;
        grid-template-columns: minmax(44px, 1fr) minmax(58px, 1.25fr) minmax(44px, 1fr);
        grid-template-rows: 44px 58px 44px;
        grid-template-areas:
          ". chair1 ."
          "chair4 table chair2"
          ". chair3 .";
        gap: 6px;
        align-items: center;
      }

      .group-table {
        grid-area: table;
        min-height: 54px;
        display: grid;
        place-items: center;
        border: 2px solid #a8743f;
        border-radius: 8px;
        background: linear-gradient(180deg, #f3d2a4 0%, #d4a268 100%);
        color: #5b3416;
        font-size: 0.78rem;
        font-weight: 950;
        pointer-events: none;
      }

      .chair-seat {
        min-height: 42px;
        border-radius: 14px 14px 8px 8px;
      }

      .chair-1 { grid-area: chair1; }
      .chair-2 { grid-area: chair2; transform: rotate(90deg); }
      .chair-2 > * { transform: rotate(-90deg); }
      .chair-3 { grid-area: chair3; transform: rotate(180deg); }
      .chair-3 > * { transform: rotate(-180deg); }
      .chair-4 { grid-area: chair4; transform: rotate(-90deg); }
      .chair-4 > * { transform: rotate(90deg); }

      @media (min-width: 700px) {
        .group-seats.chair-map {
          grid-template-rows: 48px 66px 48px;
        }

        .group-table {
          min-height: 62px;
        }
      }

      @media (max-width: 420px) {
        .front-wall {
          grid-template-columns: 58px minmax(0, 1fr);
        }

        .group-seats.chair-map {
          grid-template-columns: minmax(38px, 1fr) minmax(50px, 1.2fr) minmax(38px, 1fr);
          grid-template-rows: 40px 52px 40px;
          gap: 5px;
        }

        .group-room .group-box {
          padding: 7px;
        }
      }
    `;

    document.head.append(style);
  }
})();
