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
    console.table(lastCounters);
    counters = lastCounters;
    end = lastEnd;
    player = lastPlayer;
    moves = lastMoves;
    const el = document.getElementById(lastIdAdded);
    document
      .querySelectorAll(".win")
      .forEach((el) => el.classList.remove("win"));
    Array.from(el.children).forEach((c) => c.classList.add("hidden"));
    document
      .querySelector(`span[data-computer="${moves + 2}"]`)
      .classList.add("hidden");
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
      c.removeAttribute("data-computer");
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

function computerMove() {
  // board for best potential places
  const board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  // goes through each win counter
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      var cellNo = 3 * i + j;
      if (document.getElementById(`${cellNo}`).innerText !== "") {
        board[i][j] = -50;
      }

      // rows/columns
      // computers counters
      board[i][j] += 2 * Math.pow(counters[player][i], 3);
      board[j][i] += 2 * Math.pow(counters[player][i + 3], 3);

      // players counters
      board[i][j] += Math.pow(counters[(player + 1) % 2][i], 3);
      board[j][i] += Math.pow(counters[(player + 1) % 2][i + 3], 3);

      // different counters on the same row
      if (counters[0][i] > 0 && counters[1][i] > 0) {
        board[i][j] -= 3;
      }

      // different counters on the same column
      if (counters[0][i + 3] > 0 && counters[1][i + 3] > 0) {
        board[j][i] -= 3;
      }
    }
    // diagonals
    // computers counters
    board[i][i] += 2 * Math.pow(counters[player][6], 3);
    board[i][2 - i] += 2 * Math.pow(counters[player][7], 3);

    // players counters
    board[i][i] += Math.pow(counters[(player + 1) % 2][6], 3);
    board[i][2 - i] += Math.pow(counters[(player + 1) % 2][7], 3);

    // different counters on the diagonals
    if (counters[0][6] > 0 && counters[1][6] > 0) {
      board[i][i] -= 3;
    }
    if (counters[0][7] > 0 && counters[1][7] > 0) {
      board[i][2 - i] -= 3;
    }
  }

  let max = 0;
  let maxList = [];
  // get an array of all occurences of the 'best' position
  board.flat().forEach((n, idx) => {
    if (n > max) {
      max = n;
      maxList = [idx];
    } else if (n === max) {
      maxList.push(idx);
    }
  });
  const idx = Math.floor(Math.random() * maxList.length);
  const randomIdx = maxList[idx];
  return [Math.floor(randomIdx / 3), randomIdx % 3, randomIdx];
}

function toggleClass(player, id, cell) {
  const classToToggle = ["circle", "cross"][player];
  // display O/X
  let cellToDraw = Boolean(cell) ? cell : document.getElementById(id);

  const span = cellToDraw.querySelector(`.${classToToggle}`);
  span.classList.remove("hidden");
  !Boolean(cell) ? (span.dataset[`computer`] = moves) : null;
}

function turn(cellRow, cellCol, id, cell) {
  // increase moves taken
  moves++;

  // update the counters for the potential wins
  updateCounters(cellRow, cellCol);
  // draw X or O
  toggleClass(player, id, cell);
  // check for a winner/draw
  checkWinner();

  // next player
  player = player === 0 ? 1 : 0;
}

document.getElementById("grid").addEventListener("click", (eventObject) => {
  if (!end) {
    // get cell div
    const cell = eventObject.target;
    const { id, children } = cell;
    // row and column of cell
    const cellRow = Math.floor(id / 3);
    const cellCol = id % 3;
    const isEmpty = Array.from(children).every((c) =>
      c.classList.contains("hidden")
    );

    // check position is empty
    if (isEmpty) {
      let priorState = JSON.parse(sessionStorage.getItem("priorState")) || [];
      const currentState = {
        lastCounters: counters.map((el) => el),
        lastPlayer: player,
        lastMoves: moves,
        lastEnd: end,
        lastIdAdded: id,
      };
      priorState.push({ ...currentState });
      sessionStorage.setItem("priorState", JSON.stringify(priorState));

      turn(cellRow, cellCol, id, cell);
      // computers turn
      const [computerCellRow, computerCellCol, idx] = computerMove();

      turn(computerCellRow, computerCellCol, idx, null);
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
