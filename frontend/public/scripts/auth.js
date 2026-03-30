/* JS till inloggning & registrering*/

let isLogin = true;

const form = document.getElementById("loginForm");
const toggleBtn = document.getElementById("toggleMode");
const usernameInput = document.getElementById("username");
const errorMessage = document.getElementById("errorMessage");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggleText");

// Toggle mellan Login/Register
toggleBtn.addEventListener("click", () => {
  isLogin = !isLogin;
  if (isLogin) {
    usernameInput.style.display = "none";
    toggleBtn.textContent = "Register";
    document.getElementById("formTitle").textContent = "Login";
    submitBtn.textContent = "Login";
    toggleText.textContent = "Don't have an account?";
  } else {
    usernameInput.style.display = "block";
    toggleBtn.textContent = "Login";
    document.getElementById("formTitle").textContent = "Register";
    submitBtn.textContent = "Register";
    toggleText.textContent = "Already have an account?";
  }
  errorMessage.textContent = "";
});

// Hämtar värden
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  let url = "";
  let body = {};

  if (isLogin) {
    // LOGIN
    url = "http://localhost:3000/auth/login";
    body = { email, password };
  } else {
    // REGISTER
    url = "http://localhost:3000/auth/register";
    body = { username, email, password };
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
      console.log("Login response data:", data); // Test


    // Kollar om inloggningen gick igenom
    if (response.ok) {
      if (isLogin) {
        // Korrekt inloggning, skickar användaren vidare till deras Dashboard
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);  // TEST 
        
        // Hämta användarens info (username) från /auth/me endpoint
        // Vi behöver detta för att visa användarnamnet i spelen
        try {
          const meResponse = await fetch("http://localhost:3000/auth/me", {
            headers: {
              // Vi skickar JWT-token i Authorization header för autentisering
              "Authorization": `Bearer ${data.token}`
            }
          });
          
          // Konvertera svaret från servern till JSON
          const meData = await meResponse.json();
          
          // Spara användarnamnet i localStorage så vi kan använda det senare
          localStorage.setItem("username", meData.username);
          console.log("Username saved:", meData.username);
        } catch (error) {
          // Om något går fel vid hämtning av användardata, logga felet men fortsätt
          console.error("Couldn't fetch username:", error);
        }
        
        window.location.href = "/dashboard.html";
      } else {
        // Korrekt registrering
        errorMessage.style.color = "green";
        errorMessage.textContent = "You just joined GameHub! Please log in to continue.";
        // Byter tillbaka till login mode
        isLogin = true;
        usernameInput.style.display = "none";
        toggleBtn.textContent = "Register";
        document.getElementById("formTitle").textContent = "Login";
        submitBtn.textContent = "Login";
        toggleText.textContent = "Don't have an account?";
      }
      // Errors
    } else {
      errorMessage.style.color = "red";
      errorMessage.textContent = data.message;
    }
  } catch (err) {
    errorMessage.textContent = "Something went wrong";
    console.error(err);
  }
});