const rollBtn = document.getElementById("rollBtn");
const resultText = document.getElementById("result");
const popup = document.getElementById("achievementPopup");
const popupText = document.getElementById("achievementText");
const reviewInput = document.getElementById("reviewText");
const reviewBtn = document.getElementById("reviewBtn");
const reviewMessage = document.getElementById("reviewMessage");
const reviewsList = document.getElementById("reviewsList");
const stars = document.querySelectorAll("#starRating span");
let selectedRating = 0;

const token = localStorage.getItem("token");
let hasRolled = false;

/* Dice */
rollBtn.addEventListener("click", () => {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;

  const total = dice1 + dice2;

  resultText.textContent = `🎲 ${dice1} + 🎲 ${dice2} = ${total}`;
  saveScore(total);
  //Achievements
if (!hasRolled) {
    unlockAchievement(9, "First Roll"); // First Roll Achievement (KOLLA ATT DET ÄR RÄTT ID I DB)
    hasRolled = true;
  }
  if (total >= 12) {
    unlockAchievement(10, "Seeing Double"); // Seeing Double Achievement (KOLLA ATT DET ÄR RÄTT ID I DB)
  }
  if (total === 2) {
    unlockAchievement(11, "Unlucky"); // Unlucky Achievement (KOLLA ATT DET ÄR RÄTT ID I DB)
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
    // Visar bara "Updated" när man har redigerat
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