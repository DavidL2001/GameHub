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
let sessionWins = 0; // Räkna wins i sessionen för achievement milestones

// Game ID för Tic Tac Toe
const gameId = 1;
const token = localStorage.getItem("token");

// Hämta användarnamnet från localStorage (sparades vid inloggning)
// Om det inte finns något användarnamn, använd "Player" som fallback
const playerName = localStorage.getItem("username") || "Player";

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
  // Vi visar användarens namn (playerName) när det är deras tur (currentPlayer === "X")
  // Datorn får bara ordet "Computer" eftersom det inte är en riktig person
  if (gameActive) {
    if (currentPlayer === "X") {
      // Det är spelaren (X) som ska spela - visa deras användarnamn
      statusEl.innerText = `${playerName}'s turn`;
    } else {
      // Det är datorn (O) som ska spela
      statusEl.innerText = "Computer's turn";
    }
  } else {
    // Spelet är över
    statusEl.innerText = `The game is over`;
  }
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
  
  // Datorn väljer sitt drag automatiskt
  if (currentPlayer === "O" && gameActive) {
    computerMove();
  }
}

function computerMove() {
  const emptySquares = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      emptySquares.push(i);
    }
  }
  
  if (emptySquares.length === 0) return;
  
  const randomCell = emptySquares[Math.floor(Math.random() * emptySquares.length)];
  setTimeout(() => makeMove(randomCell), 500);
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
        sessionWins++; // Räkna vita i sessionen
        
        // Check achievement milestones
        if (sessionWins === 1) {
          unlockAchievement(5, "First Win TTT"); // ID 5
        }
        if (sessionWins === 5) {
          unlockAchievement(7, "TTT Champion (5)"); // ID 7
        }
        if (sessionWins === 10) {
          unlockAchievement(8, "TTT Champion (10)"); // ID 8
        }
      } else {
        // Datorn (O) vann - spara inte något för spelaren
        computerWins++;
        sessionWins = 0; // Nollställ streak vid datorns vinst
      }
      
      updateWinCounter();  // Uppdatera räknaren på skärmen
      setTimeout(() => resetGame(), 2000);
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
  const userId = localStorage.getItem("userId");
  const gameId = 1;

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

fetchReviews();

// Låser upp Achievements/sparar dem
const unlockAchievement = async (achievementId, name) => {
  try {
    // Vi sparar response så vi kan kontrollera om achievement verkligen blev upplast nu.
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

// Startstatus och räknare direkt vid laddning
// Uppdatera etiketten för spelaren med användarnamnet istället för "Player (X)"
const playerLabelEl = document.getElementById("playerLabel");
if (playerLabelEl) {
  playerLabelEl.textContent = playerName;
}
updateStatus();
updateWinCounter();  // Visa poängen på skärmen när sidan laddar.