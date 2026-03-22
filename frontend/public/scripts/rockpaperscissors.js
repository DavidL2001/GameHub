// Rock Paper Scissors game

let playerScore = 0;
let computerScore = 0;
const choices = ["rock", "paper", "scissors"];

const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

// Hämta ett random val för datorn
function getComputerChoice() {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

// Bestäm vinnaren av rundan
function determineWinner(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) {
    return "draw";
  }
  
  if (playerChoice === "rock" && computerChoice === "scissors") {
    return "win";
  }
  if (playerChoice === "paper" && computerChoice === "rock") {
    return "win";
  }
  if (playerChoice === "scissors" && computerChoice === "paper") {
    return "win";
  }
  
  return "lose";
}

// Uppdatera poängen på skärmen
function updateScoreDisplay() {
  document.getElementById("playerScore").textContent = playerScore;
  document.getElementById("computerScore").textContent = computerScore;
}

// Spela en runda
function playerMove(choice) {
  const computerChoice = getComputerChoice();
  const result = determineWinner(choice, computerChoice);
  
  // Visa val och resultat (utan emojis)
  resultEl.innerHTML = `<p>You chose ${choice} | Computer chose ${computerChoice}</p>`;
  
  if (result === "win") {
    playerScore++;
    statusEl.textContent = "You win this round!";
    logScore(1); // Vinnare får 1 poäng
  } else if (result === "lose") {
    computerScore++;
    statusEl.textContent = "Computer wins this round!";
  } else {
    statusEl.textContent = "It's a draw!";
  }
  
  updateScoreDisplay();
}

// Återställ spelet
function resetGame() {
  playerScore = 0;
  computerScore = 0;
  resultEl.innerHTML = "";
  statusEl.textContent = "Choose your move";
  updateScoreDisplay();
}

// Skicka poäng till leaderboard
async function logScore(score) {
  const userId = localStorage.getItem("userId");
  const gameId = 2; // Rock Paper Scissors har ID 2

  if (!userId) {
    console.log("User not logged in - score not saved");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        user_id: userId,
        game_id: gameId,
        score: score
      })
    });

    if (response.ok) {
      console.log("Score saved!");
    } else {
      console.error("Failed to save score");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
