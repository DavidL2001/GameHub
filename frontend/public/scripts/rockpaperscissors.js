// Rock Paper Scissors game

let playerScore = 0;
let computerScore = 0;
let sessionWins = 0; // Räkna wins i sessionen för achievement milestones
let roundsPlayed = 0;
const choices = ["rock", "paper", "scissors"];
const gameId = 3; // Rock Paper Scissors ID
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
let editingReviewId = null;
let editingRating = 0;

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
  roundsPlayed++;
  const computerChoice = getComputerChoice();
  const result = determineWinner(choice, computerChoice);
  
  // Visa val och resultat (utan emojis)
  // Vi visar användarnamnet istället för "You" för personalisering
  resultEl.innerHTML = `<p>${playerName} chose ${choice} | Computer chose ${computerChoice}</p>`;
  
  if (result === "win") {
    playerScore++;
    sessionWins++; // Räkna vita i sessionen
    statusEl.textContent = `${playerName} wins this round!`;
    
    // Check achievement milestones
    if (sessionWins === 1) {
      unlockAchievement(9, "First Win RPS"); // ID 9
    }
    if (sessionWins === 1 && roundsPlayed <= 3) {
      unlockAchievement(10, "Quick Win RPS"); // ID 10
    }
    if (sessionWins === 5) {
      unlockAchievement(11, "RPS Champion (5)"); // ID 11
    }
    if (sessionWins === 10) {
      unlockAchievement(12, "RPS Champion (10)"); // ID 12
    }
  } else if (result === "lose") {
    computerScore++;
    sessionWins = 0; // Nollställ streak vid förlust
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
  sessionWins = 0; // Nollställ streak för ny match
  roundsPlayed = 0;  
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
  const gameId = 3; // Rock Paper Scissors har ID 3

  if (!userId) {
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
window.deleteReview = deleteReview;

// Funktioner för att redigera, spara review eller avbryta
const startEdit = (id) => {
  editingReviewId = id;
  fetchReviews();
};
window.startEdit = startEdit;
const saveEdit = async (id) => {
  const input = document.getElementById(`editComment-${id}`);
  const newComment = input.value;
  if (!newComment) return;
  await updateReview(id, newComment, editingRating); 
  editingReviewId = null;
  fetchReviews();
};
window.saveEdit = saveEdit;
const cancelEdit = () => {
  editingReviewId = null;
  fetchReviews();
};
window.cancelEdit = cancelEdit;

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

// Visar upp reviews frontend
const displayReviews = (reviews) => {
  reviewsList.innerHTML = "";
  if (!reviews || reviews.length === 0) {
    reviewsList.innerHTML = "<li>No reviews yet</li>";
    return;
  }
  reviews.forEach(r => {
    const li = document.createElement("li");
    const isOwner = r.userId === getUserIdFromToken();
    const createdDate = new Date(r.createdAt);
    const updatedDate = new Date(r.updatedAt);
    const created = createdDate.toLocaleDateString();
    // Visas bara när man redigerat/uppdaterat review
    const showUpdated = updatedDate.getTime() !== createdDate.getTime();
    const updated = updatedDate.toLocaleDateString();
    if (editingReviewId === r._id) {
      // När man redigerar en review (Nu med stjärnsystemet)
     li.innerHTML = `
  <input id="editComment-${r._id}" value="${r.comment}" />
  <br>
  <div id="editStars-${r._id}">
    <span data-value="1">★</span>
    <span data-value="2">★</span>
    <span data-value="3">★</span>
    <span data-value="4">★</span>
    <span data-value="5">★</span>
  </div>
  <br>
  <button onclick="saveEdit('${r._id}')">Save</button>
  <button onclick="cancelEdit()">Cancel</button>
  <hr>
`;
setTimeout(() => {
  const stars = document.querySelectorAll(`#editStars-${r._id} span`);
  editingRating = r.rating;
  const highlight = (rating) => {
    stars.forEach(star => {
      star.style.color =
        Number(star.dataset.value) <= rating ? "#FFD700" : "#ccc";
      star.style.cursor = "pointer";
    });
  };
  highlight(editingRating);
  stars.forEach(star => {
    star.addEventListener("click", () => {
      editingRating = Number(star.dataset.value);
      highlight(editingRating);
    });
    star.addEventListener("mouseover", () => {
      highlight(Number(star.dataset.value));
    });
    star.addEventListener("mouseout", () => {
      highlight(editingRating);
    });
  });
}, 0);
    } else {
      // När man skriver review
      li.innerHTML = `
        👤 Username: ${r.username} <br>
        ${renderStars(r.rating)} — ${r.comment} <br>  
        📅 Created: ${created} <br>
        ${showUpdated ? `✏️ Updated: ${updated} <br>` : ""}
        ${isOwner ? `
          <button onclick="deleteReview('${r._id}')">Delete</button>
          <button onclick="startEdit('${r._id}')">Edit</button>
        ` : ""}
        <hr>
      `;
    }
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
