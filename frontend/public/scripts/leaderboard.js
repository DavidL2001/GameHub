// leaderboard.js
// Denna fil ansvarar för att hämta och visa leaderboard-data för ett valt spel

// Const för API-URL
const API_URL = "http://localhost:3000";

// Funktion för att hämta leaderboard-data från backend
async function loadLeaderboard(gameId) {
  try {
    // Gör request till backend för att get leaderboard
    const response = await fetch(`${API_URL}/scores/leaderboard/${gameId}`);
    
    // Kolla om responsen är OK
    if (!response.ok) {
      throw new Error("Kunde inte hämta leaderboard");
    }

    // Konvertera svaret till JSON
    const data = await response.json();

    // Hitta tbody-elementet i tabellen
    const tbody = document.querySelector("#leaderboardTable tbody");
    tbody.innerHTML = ""; // Töm tabellen innan vi fyller den

    // Loopa genom vartje rad i datan och lägg till i tabellen
    data.forEach((row, index) => {
      // Skapa en ny rad med HTML
      const rowHTML = `
        <tr>
          <td>${index + 1}</td>
          <td>${row.username}</td>
          <td>${row.score}</td>
        </tr>
      `;
      // Lägg till raden i tbody
      tbody.innerHTML += rowHTML;
    });

  } catch (error) {
    // Om något går fel, skriv ut felet i console
    console.error("Fel vid hämtning av leaderboard:", error);
    
    // Visa ett felmeddelande för användaren
    const tbody = document.querySelector("#leaderboardTable tbody");
    tbody.innerHTML = `<tr><td colspan="3">Kunde inte ladda leaderboard</td></tr>`;
  }
}

// Funktion för att sätta upp event-lyssnare för spel-select
function setupGameSelector() {
  const gameSelect = document.getElementById("gameSelect");

  // Lyssna på förändringar när användaren väljer ett spel
  gameSelect.addEventListener("change", () => {
    const selectedGameId = gameSelect.value;
    // Ladda leaderboard för det valda spelet
    loadLeaderboard(selectedGameId);
  });
}

// När sidan har laddat klart, sätt upp allt
window.addEventListener("DOMContentLoaded", () => {
  // Sätt upp event-lyssnare
  setupGameSelector();
  
  // Ladda leaderboard för det första spelet (eller väljs spelet)
  const gameId = document.getElementById("gameSelect").value;
  loadLeaderboard(gameId);
});