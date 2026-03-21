const input = document.getElementById("guessInput");
const button = document.getElementById("guessBtn");
const feedback = document.getElementById("feedback");
const attemptsText = document.getElementById("attempts");
const resetBtn = document.getElementById("resetBtn");

let numberToGuess = Math.floor(Math.random() * 100) + 1;
const token = localStorage.getItem("token");
let attempts = 0;

// Event för att kunna trycka Enter knappen för att Guess/submit
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    button.click();
  }
});

// Grunden för Gissa nummer spel - berättar för spelaren om dem gissat för högt/lågt och visar hur många försök
button.addEventListener("click", () => {
  const guess = Number(input.value);
  if (isNaN(guess) || guess < 1 || guess > 100) {
    feedback.textContent = "Please enter a number between 1 and 100";
    return;
  }
  attempts++;
  if (attempts === 1){
    unlockAchievement(2); // First Guess Achievement (KOLLA ATT DET ÄR RÄTT ID I DB)
  }
  if (guess === numberToGuess) {
    feedback.textContent = "🎉 Correct!";
    attemptsText.textContent = `Attempts: ${attempts}`;
    handleWin(attempts);
    resetBtn.style.display = "block";
    button.disabled = true;
    if (attempts <= 3) {
  unlockAchievement(3); // Lucky Guess Achievement (KOLLA ATT DET ÄR RÄTT ID I DB)
}
if (attempts >= 10) {
  unlockAchievement(4); // Persistent Achievement (KOLLA ATT DET ÄR RÄTT ID I DB)
}
  } else if (guess < numberToGuess) {
    feedback.textContent = "Too low ⬇️";
  } else {
    feedback.textContent = "Too high ⬆️";
  }
});
//FE får ta bort emojis om de inte tycker om

const handleWin = async (attempts) => {
  try {
    //Färre gissningar ger mer score
    const score = Math.max(100 - attempts * 10, 10);
    //Lägger in score i DB
    await fetch("http://localhost:3000/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        game_id: 3, // SE TILL ATT NI HAR RÄTT ID HÄR FRÅN DATABASEN (Guess The Number)
        score: score
      })
    });
    feedback.textContent += ` Your score: ${score}`;

  } catch (err) {
    console.error(err);
  }
};

// Reset av spelet vid "Play again"
const resetGame = () => {
  numberToGuess = Math.floor(Math.random() * 100) + 1;
  attempts = 0;
  input.value = "";
  feedback.textContent = "";
  attemptsText.textContent = "";
  resetBtn.style.display = "none";
  button.disabled = false;
};

resetBtn.addEventListener("click", resetGame);

// Låser upp Achievements/sparar dem
const unlockAchievement = async (achievementId) => {
  try {
    await fetch("http://localhost:3000/achievements/unlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        achievement_id: achievementId
      })
    });
  } catch (err) {
    console.error(err);
  }
};