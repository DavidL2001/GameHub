const token = localStorage.getItem("token");
const logoutBtn = document.getElementById("logoutBtn");
const scoresList = document.getElementById("scoresList");
const welcome = document.getElementById("welcome");
const achievementsList = document.getElementById("achievementsList")

console.log("scoresList element:", scoresList);

// Om du inte är inloggad blir du skickad till Login/Register
if (!token) {
  window.location.href = "/registerLogin.html";
}
// Logga ut
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/registerLogin.html";
});

// Hämta user samt välkomst meddelande
const fetchUser = async () => {
  try {
    const response = await fetch("http://localhost:3000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const user = await response.json();
    welcome.textContent = `Welcome ${user.username}!🎉`; //Frontendare kan ta bort emojis om de inte gillar dem
  } catch (err) {
    console.error(err);
  }
};

// Hämta scores
const fetchScores = async () => {
  try {
    const response = await fetch("http://localhost:3000/scores/my", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    /* console.log("DATA FROM API:", data); */
    displayScores(data);
  } catch (err) {
    console.error(err);
  }
};

// Visa scores i frontend
const displayScores = (scores) => {
  scoresList.innerHTML = "";
  // Visar ett meddelande om du inte har någon score/tom array
  if (!scores || !Array.isArray(scores) || scores.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No scores yet - start playing a game now to compete!";
    scoresList.appendChild(li);
    return;
  }
  scores.forEach(score => {
    const li = document.createElement("li");
    li.textContent = `🎮 ${score.game_name}: ${score.score} pts (${new Date(score.played_at).toLocaleDateString()})`; //Frontendare kan ta bort emojis om de inte gillar dem
    scoresList.appendChild(li);
  });
};

// Hämta achievements
const fetchAchievements = async () => {
  try {
    const response = await fetch("http://localhost:3000/achievements/my", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    displayAchievements(data);
  } catch (err) {
    console.error(err);
  }
};

// Visa achievements i frontend
const displayAchievements = (achievements) => {
  achievementsList.innerHTML = "";
  // Visar ett meddelande om man inte har några achievements/tom array
  if (!achievements || !Array.isArray(achievements) || achievements.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No achievements yet — keep playing!";
    achievementsList.appendChild(li);
    return;
  }
  achievements.forEach(a => {
    const li = document.createElement("li");
    li.textContent = `⭐ ${a.name} — ${a.description} (${new Date(a.earned_at).toLocaleDateString()})` ; //Frontendare kan ta bort emojis om de inte gillar dem
    achievementsList.appendChild(li);
  });
};

fetchUser();
fetchScores();
fetchAchievements();