const input = document.getElementById("guessInput");
const button = document.getElementById("guessBtn");
const feedback = document.getElementById("feedback");
const attemptsText = document.getElementById("attempts");
const resetBtn = document.getElementById("resetBtn");
const lastGuessText = document.getElementById("lastGuess");
const popup = document.getElementById("achievementPopup");
const popupText = document.getElementById("achievementText");
const reviewInput = document.getElementById("reviewText");
const reviewBtn = document.getElementById("reviewBtn");
const reviewMessage = document.getElementById("reviewMessage");
const reviewsList = document.getElementById("reviewsList");
const stars = document.querySelectorAll("#starRating span");
let selectedRating = 0;
let editingReviewId = null;
let editingRating = 0;

let numberToGuess = Math.floor(Math.random() * 100) + 1;
let attempts = 0;
const token = localStorage.getItem("token");

// Event för att kunna trycka Enter knappen för att Guess/submit
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    button.click();
  }
});

// Gissa nummer spel - Validation för gissningar - Achievements - Information till frontend
button.addEventListener("click", () => {
  const guess = Number(input.value);
  lastGuessText.textContent = `Your guess: ${guess}`;
  input.value = "";
  if (isNaN(guess) || guess < 1 || guess > 100) {
    feedback.textContent = "Please enter a number between 1 and 100";
    return;
  }
  attempts++;
  if (attempts === 1){
    unlockAchievement(2, "First Guess"); // First Guess Achievement (KOLLA ATT DET ÄR RÄTT ID I DB)
  }
  if (guess === numberToGuess) {
    feedback.textContent = "🎉 Correct!";
    attemptsText.textContent = `Attempts: ${attempts}`;
    handleWin(attempts);
    resetBtn.style.display = "block";
    button.disabled = true;
    if (attempts <= 3) {
  unlockAchievement(3, "Lucky Guess"); // Lucky Guess Achievement (KOLLA ATT DET ÄR RÄTT ID I DB)
}
if (attempts >= 10) {
  unlockAchievement(4, "Persistent"); // Persistent Achievement (KOLLA ATT DET ÄR RÄTT ID I DB)
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
const unlockAchievement = async (achievementId, name) => {
  try {
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
    const data = await response.json();
    // Visa bara achievement popup om det är nytt för spelaren
    if (data.unlocked) {
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

// Stjärnor som rating event
stars.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);
    highlightStars(selectedRating);
  });
});
stars.forEach(star => {
  star.style.color = "#ccc"; //Börja greyed out
});
stars.forEach(star => {
  star.style.cursor = "pointer"; //Muspekare
});
// Funktion för att gråa ut stjärnor som inte är med i vald rating
const highlightStars = (rating) => {
  stars.forEach(star => {
    if (Number(star.dataset.value) <= rating) {
      star.style.color = "gold";
    } else {
      star.style.color = "gray";
    }
  });
};
// Fuktion för hovereffekt så man ser vad man väljer för rating innan man confirm med ett klick
stars.forEach(star => {
  star.addEventListener("mouseover", () => {
    highlightStars(Number(star.dataset.value));
  });
  star.addEventListener("mouseout", () => {
    highlightStars(selectedRating);
  });
});

// POST Reviews, måste vara inloggad för att skriva reviews
reviewBtn.addEventListener("click", async () => {
  const comment = reviewInput.value;
  const rating = selectedRating;
  if (!comment) {
    reviewMessage.textContent = "You can't leave an empty review.";
    return;
  }
  if (!rating) {
  reviewMessage.textContent = "Please select a rating.";
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
        game_id: 3, // SE TILL ATT NI HAR RÄTT ID HÄR FRÅN DATABASEN (Guess The Number)
        rating: rating,
        comment: comment
      })
    });
    if (!response.ok) {
      reviewMessage.textContent = "You must be logged in to write a review.";
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

// GET Reviews
const fetchReviews = async () => {
  try {
    const response = await fetch("http://localhost:3000/reviews/game/3"); // SE TILL ATT NI HAR RÄTT ID HÄR FRÅN DATABASEN (Guess The Number)
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

// Redigera Review UPPDATERAD
const editReview = (id, oldComment, oldRating) => {
  const newComment = prompt("Edit comment:", oldComment);
  let newRating = prompt("Edit rating (1-5):", oldRating);
  if (!newComment || !newRating) return;
  newRating = Number(newRating);
  // Validation, stoppar användaren från att lägga till mer än 5 stjärnor/mindre än 1 stjärna
  if (isNaN(newRating) || newRating < 1 || newRating > 5) {
    alert("Rating must be between 1 and 5");
    return;
  }
  updateReview(id, newComment, newRating);
};

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

// Visar upp reviews - Simpel Frontend
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