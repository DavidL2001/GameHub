// Spelplanen: 9 rutor (0–8). Tom ruta = ""
let board = ["", "", "", "", "", "", "", "", ""];

// Vem är på tur just nu?
let currentPlayer = "X";

// Stoppar nya drag när spelet är slut
let gameActive = true;

// Alla sätt som kan ge vinst i tre i rad
const winningConditions = [
  [0, 1, 2], // övre raden
  [3, 4, 5], // mittraden
  [6, 7, 8], // nedersta raden
  [0, 3, 6], // vänster kolumn
  [1, 4, 7], // mitten kolumn
  [2, 5, 8], // höger kolumn
  [0, 4, 8], // diagonal vänster-upp → höger-ner
  [2, 4, 6], // diagonal höger-upp → vänster-ner
];

// Elementet där vi visar vem som är på tur
const statusEl = document.getElementById("status");

function updateStatus() {
  if (!statusEl) return;

  // Visa tur eller att spelet är slut
  statusEl.innerText = gameActive
    ? `Spelare ${currentPlayer} är på tur`
    : `Spelet är slut`;
}

function makeMove(cellIndex) {
  // Går inte att spela när spelet är slut eller rutan är upptagen
  if (!gameActive || board[cellIndex] !== "") return;

  board[cellIndex] = currentPlayer;
  document.getElementsByClassName("cell")[cellIndex].innerText = currentPlayer;

  // Kolla om vinsten är uppfylld
  if (checkResult()) {
    statusEl.innerText = `Spelet är slut`;
    gameActive = false;
    return;
  }

  // Oavgjort om alla rutor är fyllda
  if (!board.includes("")) {
    statusEl.innerText = "Oavgjort!";
    gameActive = false;
    return;
  }

  // Byt spelare
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus();
}

function checkResult() {
  for (const [a, b, c] of winningConditions) {
    // Alla tre rutor samma symbol = vinst
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }
  return false;
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";

  // Rensa rutorna i HTML
  document.querySelectorAll(".cell").forEach((cell) => (cell.textContent = ""));
  updateStatus();
}

// Startstatus direkt vid laddning
updateStatus();