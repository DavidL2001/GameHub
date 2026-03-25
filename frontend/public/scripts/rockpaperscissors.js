// Rock Paper Scissors game

let playerScore = 0;
let computerScore = 0;
const choices = ["rock", "paper", "scissors"];
const gameId = 2; // Rock Paper Scissors ID
const token = localStorage.getItem("token");

// Hämta användarnamnet från localStorage (sparades vid inloggning)
// Om det inte finns något användarnamn, använd "You" som fallback
const playerName = localStorage.getItem("username") || "You";

const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

// Uppdatera etiketten för spelaren med användarnamnet istället för "You"
const playerLabelEl = document.getElementById("playerLabel");
if (playerLabelEl) {
  playerLabelEl.textContent = playerName;
}

// Dom-element för reviews
const reviewInput = document.getElementById("reviewText");
const reviewBtn = document.getElementById("reviewBtn");
const reviewMessage = document.getElementById("reviewMessage");
const reviewsList = document.getElementById("reviewsList");
const stars = document.querySelectorAll("#starRating span");
let selectedRating = 0;

// Dom-element för achievements
const popup = document.getElementById("achievementPopup");
const popupText = document.getElementById("achievementText");

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
  // Vi visar användarnamnet istället för "You" för personalisering
  resultEl.innerHTML = `<p>${playerName} chose ${choice} | Computer chose ${computerChoice}</p>`;
  
  if (result === "win") {
    playerScore++;
    // Visa användarnamnet när de vinner
    statusEl.textContent = `${playerName} wins this round!`;
    // Vi sparar inte 1 per runda längre, utan matchens slutpoäng.
    unlockAchievement(6, "First Win RPS"); // First Win RPS (ID 6)
  } else if (result === "lose") {
    computerScore++;
    // Visa användarnamnet även när de förlorar
    statusEl.textContent = `${playerName} loses this round!`;
  } else {
    statusEl.textContent = "It's a draw!";
  }
  
  updateScoreDisplay();
}

// Återställ spelet
function resetGame() {
  // Spara slutpoängen innan vi nollställer matchen.
  if (playerScore > 0) {
    logScore(playerScore);
  }

  playerScore = 0;
  computerScore = 0;
  resultEl.innerHTML = "";
  // Visa användarnamnet när spelet nollställs
  statusEl.textContent = `${playerName}, choose your move`;
  updateScoreDisplay();
}

// Om spelaren lämnar sidan utan att trycka reset försöker vi spara sessionens poäng.
window.addEventListener("beforeunload", () => {
  if (playerScore > 0) {
    logScore(playerScore);
  }
});

// Skicka poäng till leaderboard
async function logScore(score) {
  const userId = localStorage.getItem("userId");
  const gameId = 2; // Rock Paper Scissors har ID 2

  console.log("logScore anropades med score:", score); // DEBUG
  console.log("userId från localStorage:", userId); // DEBUG
  console.log("token från localStorage:", localStorage.getItem("token")); // DEBUG

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

    console.log("API response status:", response.status); // DEBUG
    const responseData = await response.json();
    console.log("API response data:", responseData); // DEBUG

    if (response.ok) {
      console.log("Score saved!");
    } else {
      console.error("Failed to save score");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Stjärnor för rating
stars.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);
    highlightStars(selectedRating);
  });
  star.style.color = "#ccc";
  star.style.cursor = "pointer";
});

const highlightStars = (rating) => {
  stars.forEach(star => {
    if (Number(star.dataset.value) <= rating) {
      star.style.color = "gold";
    } else {
      star.style.color = "gray";
    }
  });
};

stars.forEach(star => {
  star.addEventListener("mouseover", () => {
    highlightStars(Number(star.dataset.value));
  });
  star.addEventListener("mouseout", () => {
    highlightStars(selectedRating);
  });
});

// Skicka review till backend
if (reviewBtn) {
  reviewBtn.addEventListener("click", async () => {
    const comment = reviewInput.value;
    const rating = selectedRating;
    if (!comment) {
      reviewMessage.textContent = "You cannot leave an empty review.";
      return;
    }
    if (!rating) {
      reviewMessage.textContent = "Select a rating.";
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          game_id: gameId,
          rating: rating,
          comment: comment
        })
      });
      if (!response.ok) {
        reviewMessage.textContent = "You must be logged in to leave a review.";
        return;
      }
      reviewMessage.textContent = "Review submitted!";
      reviewInput.value = "";
      selectedRating = 0;
      highlightStars(0);
    } catch (err) {
      console.error(err);
    }
    fetchReviews();
  });
}

// Hämta och visa reviews från backend
const fetchReviews = async () => {
  try {
    const response = await fetch(`http://localhost:3000/reviews/game/${gameId}`);
    const data = await response.json();
    displayReviews(data);
  } catch (err) {
    console.error(err);
  }
};

// DELETE Reviews
const deleteReview = async (id) => {
  await fetch(`http://localhost:3000/reviews/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  fetchReviews();
};

// Redigera Review
const editReview = (id, oldComment, oldRating) => {
  const newComment = prompt("Edit comment:", oldComment);
  const newRating = prompt("Edit rating (1-5):", oldRating);
  if (!newComment || !newRating) return;
  updateReview(id, newComment, Number(newRating));
};

// PUT reviews (updaterar review)
const updateReview = async (id, comment, rating) => {
  await fetch(`http://localhost:3000/reviews/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ comment, rating })
  });
  fetchReviews();
};

const getUserIdFromToken = () => {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.id;
};

// Stjärnor för reviewslistan
const renderStars = (rating) => {
  let stars = "";
  for (let i = 0; i < rating; i++) {
    stars += `<span style="color:#FFD700;">★</span>`;
  }
  return stars;
};

const displayReviews = (reviews) => {
  reviewsList.innerHTML = "";
  if (!reviews || reviews.length === 0) {
    reviewsList.innerHTML = "<li>No reviews yet.</li>";
    return;
  }
  reviews.forEach(r => {
    const li = document.createElement("li");
    const isOwner = r.userId === getUserIdFromToken();
    const createdDate = new Date(r.createdAt);
    const updatedDate = new Date(r.updatedAt);
    const created = createdDate.toLocaleDateString();
    const showUpdated = updatedDate.getTime() !== createdDate.getTime();
    const updated = updatedDate.toLocaleDateString();

    li.innerHTML = `
    👤 Username: ${r.username} <br>
    ${renderStars(r.rating)} — ${r.comment} <br>  
  📅 Created: ${created} <br>
  ${showUpdated ? `✏️ Updated: ${updated} <br>` : ""}
  ${isOwner ? `
    <button onclick="deleteReview('${r._id}')">Delete</button>
    <button onclick="editReview('${r._id}', '${r.comment}', ${r.rating})">Edit</button>
  ` : ""}
  <hr>
`;
  reviewsList.appendChild(li);
  });
};

fetchReviews();

// Låser upp Achievements/sparar dem
const unlockAchievement = async (achievementId, name) => {
  try {
    // Vi sparar response sa vi kan kontrollera om achievement verkligen blev upplast nu.
    const response = await fetch("http://localhost:3000/achievements/unlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        achievement_id: achievementId
      })
    });

    // Backend skickar t.ex. { unlocked: true/false }.
    // Visa popup bara nar det ar en ny unlock for spelaren.
    const data = await response.json();
    if (response.ok && data.unlocked) {
      showPopup(name);
    }
  } catch (err) {
    console.error(err);
  }
};

// Achievement popup funktionen
const showPopup = (name) => {
  popupText.textContent = `🏆 Achievement unlocked: ${name}`;
  popup.style.display = "block";
  setTimeout(() => {
    popup.style.display = "none";
  }, 2000);
};
