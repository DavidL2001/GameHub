// Spelplanen: 9 rutor (0–8). Tom ruta = ""
let board = ["", "", "", "", "", "", "", "", ""];

// Vem är på tur just nu?
let currentPlayer = "X";

// Stoppar nya drag när spelet är slut
let gameActive = true;

// Räknare för hur många matcher spelaren och datorn vunnit (för leaderboarden)
let playerWins = 0;
let computerWins = 0;
let lastSavedSessionScore = 0;

// Game ID för Tic Tac Toe
const gameId = 1;
const token = localStorage.getItem("token");

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

// Uppdatera och visa poängen på skärmen (liksom Sten Sax Påse gör)
function updateWinCounter() {
  const playerWinsEl = document.getElementById("playerWins");
  const computerWinsEl = document.getElementById("computerWins");
  
  if (playerWinsEl) playerWinsEl.textContent = playerWins;
  if (computerWinsEl) computerWinsEl.textContent = computerWins;
}

function updateStatus() {
  if (!statusEl) return;

  // Visa tur eller att spelet är slut
  statusEl.innerText = gameActive
    ? `Player ${currentPlayer}'s turn`
    : `The game is over`;
}

function makeMove(cellIndex) {
  // Går inte att spela när spelet är slut eller rutan är upptagen
  if (!gameActive || board[cellIndex] !== "") return;

  if (!board.includes("")) {
    statusEl.innerText = "Draw!";
    gameActive = false;
    logScore(0); // Logga 0 poäng vid oavgjort
    return;
  }

  board[cellIndex] = currentPlayer;
  document.getElementsByClassName("cell")[cellIndex].innerText = currentPlayer;

  // Kolla om vinsten är uppfylld
  if (checkResult()) {
    statusEl.innerText = `The game is over`;
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
      statusEl.innerText = `Player ${currentPlayer} wins!`
      gameActive = false;
      
      // Bara spelaren (X) får spara poäng - datorn (O) sparar inget
      if (currentPlayer === "X") {
        playerWins++;
        // Vi skickar inte alltid 1 längre, utan sparar sessionens slutpoäng senare.
        unlockAchievement(4, "First Win TTT"); // First Win TTT (ID 4)
      } else {
        // Datorn (O) vann - spara inte något för spelaren
        computerWins++;
      }
      
      updateWinCounter();  // Uppdatera räknaren på skärmen
      return true;
    }
  }
  return false;
}

function resetGame() {
  // Spara aktuell sessionspoäng om den blivit bättre än senaste sparade.
  if (playerWins > lastSavedSessionScore) {
    logScore(playerWins);
    lastSavedSessionScore = playerWins;
  }

  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";

  // Rensa rutorna i HTML
  document.querySelectorAll(".cell").forEach((cell) => (cell.textContent = ""));
  updateStatus();
  // Notering: Vi nollställer INTE playerWins/computerWins - de sparar totala matchresultat
  // för att visa på leaderboarden hur många gånger spelaren vunnit totalt
}

// Säkerhet: om spelaren lämnar sidan sparar vi bästa sessionspoäng en sista gång.
window.addEventListener("beforeunload", () => {
  if (playerWins > lastSavedSessionScore) {
    logScore(playerWins);
    lastSavedSessionScore = playerWins;
  }
});


async function logScore(score) {
  // Hämta user info från localStorage 
  const userId = localStorage.getItem("userId");
  const gameId = 1; 

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

fetchReviews();

// Låser upp Achievements/sparar dem
const unlockAchievement = async (achievementId, name) => {
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
    showPopup(name);
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

// Startstatus och räknare direkt vid laddning
updateStatus();
updateWinCounter();  // Visa poängen på skärmen när sidan laddar.