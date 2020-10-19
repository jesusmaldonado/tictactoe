// potential wins:
// [top, middle, bottom, left, center, right, topleft-bottomRight, topRight-bottomLeft]
let counters = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
let player = 0;
let moves = 0;
let end = false;

window.addEventListener("popstate", (event) => {
  const priorState = JSON.parse(window.sessionStorage.getItem("priorState"));
  if (Array.isArray(priorState) && priorState.length) {
    const {
      lastCounters,
      lastEnd,
      lastMoves,
      lastPlayer,
      lastIdAdded,
    } = priorState.pop();
    counters = lastCounters;
    end = lastEnd;
    player = lastPlayer;
    moves = lastMoves;
    const el = document.getElementById(lastIdAdded);
    document
      .querySelectorAll(".win")
      .forEach((el) => el.classList.remove("win"));
    Array.from(el.children).forEach((c) => c.classList.add("hidden"));
    document.getElementById("result").innerHTML = "";
    window.sessionStorage.setItem("priorState", JSON.stringify(priorState));
  }
});

function updateCounters(row, column) {
  // increase the row/column counters for the players move
  counters[player][row]++;
  counters[player][column + 3]++;

  // check if move is on a diagonal
  if (row == column) {
    counters[player][6]++;
  }
  if (row + column == 2) {
    counters[player][7]++;
  }
}

function checkWinner() {
  // check if player has won (line of 3)
  var win = counters[player].indexOf(3);
  if (win != -1) {
    end = true;
    //todo change
    document.getElementById("result").innerHTML = `Player ${player} Wins!`;
    let cellIds = [];
    if (win < 3) {
      // row win
      for (let n = 0; n < 3; n++) {
        const cellNo = win * 3 + n;
        cellIds.push(cellNo);
      }
    } else if (win < 6) {
      // column win
      for (let n = 0; n < 3; n++) {
        cellNo = n * 3 + win - 3;
        cellIds.push(cellNo);
      }
    } else if (win == 6) {
      // diagonal TL-BR win
      for (let n = 0; n < 3; n++) {
        cellNo = 4 * n;
        cellIds.push(cellNo);
      }
    } else {
      // diagonal TR-BL win
      for (let n = 0; n < 3; n++) {
        cellNo = 2 * (n + 1);
        cellIds.push(cellNo);
      }
    }
    for (let id of cellIds) {
      document.getElementById(id).classList.add("win");
    }
  }

  // check if board full
  if (moves >= 9) {
    end = true;
    document.getElementById("result").innerHTML = "Draw";
  }
}

function reset() {
  // remove O/X from each cell, reset color
  document.querySelectorAll(".cell").forEach((c) => {
    c.classList.remove("win");
    Array.from(c.children).forEach((c) => {
      c.classList.add("hidden");
    });
  });

  // reset result
  document.getElementById("result").innerHTML = "";

  // reset variables
  counters = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  player = 0;
  moves = 0;
  end = false;
}

document.getElementById("grid").addEventListener("click", (eventObject) => {
  if (!end) {
    // get cell div
    const cell = eventObject.target;

    // row and column of cell
    const cellRow = Math.floor(cell.id / 3);
    const cellCol = cell.id % 3;
    const isEmpty = Array.from(cell.children).every((c) =>
      c.classList.contains("hidden")
    );
    const classToToggle = ["circle", "cross"][player];

    // check position is empty
    if (isEmpty) {
      let priorState = JSON.parse(sessionStorage.getItem("priorState")) || [];
      const currentState = {
        lastCounters: counters,
        lastPlayer: player,
        lastMoves: moves,
        lastEnd: end,
        lastIdAdded: cell.id,
      };
      priorState.push(currentState);
      sessionStorage.setItem("priorState", JSON.stringify(priorState));
      // display O/X
      cell.querySelector(`.${classToToggle}`).classList.toggle("hidden");
      // increase moves taken
      moves++;

      // update the counters for the potential wins
      updateCounters(cellRow, cellCol);

      // check for a winner/draw
      checkWinner();

      // next player
      player = player === 0 ? 1 : 0;

      window.history.pushState({}, "", "index.html");
    }
  }
});

// reset button
document.getElementById("reset").addEventListener("click", () => {
  reset();
});

document.getElementById("back").addEventListener("click", () => {
  window.history.back();
});
