const rollBtn = document.getElementById("rollBtn");
const resultText = document.getElementById("result");
const popup = document.getElementById("achievementPopup");
const popupText = document.getElementById("achievementText");
const reviewInput = document.getElementById("reviewText");
const reviewBtn = document.getElementById("reviewBtn");
const reviewMessage = document.getElementById("reviewMessage");
const reviewsList = document.getElementById("reviewsList");
const stars = document.querySelectorAll("#starRating span");
let hasRolled = false;
let selectedRating = 0;
let editingReviewId = null;
let editingRating = 0;

const token = localStorage.getItem("token");

/* Dice */
rollBtn.addEventListener("click", () => {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;

  const total = dice1 + dice2;

  resultText.textContent = `🎲 ${dice1} + 🎲 ${dice2} = ${total}`;
  saveScore(total);
  //Achievements
if (!hasRolled) {
    unlockAchievement(13, "First Roll"); // First Roll Achievement har ID 13
    hasRolled = true;
  }
  if (total >= 12) {
    unlockAchievement(14, "Seeing Double"); // Seeing Double Achievement har ID 14
  }
  if (total === 2) {
    unlockAchievement(15, "Unlucky"); // Unlucky Achievement har id 15
  }
});

/* Sparar score till DB */
const saveScore = async (score) => {
  try {
    await fetch("http://localhost:3000/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        game_id: 4, // SE TILL ATT NI HAR RÄTT ID HÄR FRÅN DATABASEN (Dice)
        score: score
      })
    });
  } catch (err) {
    console.error(err);
  }
};

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
        game_id: 4, // SE TILL ATT NI HAR RÄTT ID HÄR FRÅN DATABASEN (Dice)
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
    const response = await fetch("http://localhost:3000/reviews/game/4"); // SE TILL ATT NI HAR RÄTT ID HÄR FRÅN DATABASEN (Dice)
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