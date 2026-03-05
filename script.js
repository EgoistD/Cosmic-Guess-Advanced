let numberToGuess;
let attempts;
let maxRange = 50; 
let fuel;
let maxFuel = 10;
let timer;
let timeLeft = 20;
let initialTimeLimit = 20; 
let achievements = JSON.parse(localStorage.getItem("achievements")) || {};
let gameStarted = false;

function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

function startGame() {
  numberToGuess = Math.floor(Math.random() * maxRange) + 1;
  attempts = 0;
  fuel = maxFuel;
  timeLeft = initialTimeLimit;
  document.getElementById("message").textContent = "";
  document.getElementById("guessInput").value = "";
  document.getElementById("playAgain").style.display = "none";
  document.getElementById("fuelCell").style.display = "none";
  document.getElementById("cosmicEvent").style.display = "none";
  updateScoreboard();
  startTimer();
  gameStarted = true;
  playSound("soundLaunch");
}

function setDifficulty() {
  maxRange = parseInt(document.getElementById("difficulty").value);
  if (gameStarted) restartGame();
}

function setTimerLimit() {
  initialTimeLimit = parseInt(document.getElementById("timerSelect").value);
  timeLeft = initialTimeLimit;
  if (gameStarted) restartGame();
}

function checkGuess() {
  if (!gameStarted) {
    document.getElementById("message").textContent = "🚀 Start the mission first!";
    return;
  }

  const guess = parseInt(document.getElementById("guessInput").value);
  const message = document.getElementById("message");

  if (fuel <= 0 || timeLeft <= 0) {
    message.textContent = "💥 Mission failed! Out of fuel or time.";
    document.getElementById("playAgain").style.display = "inline-block";
    playSound("soundFail");
    rickRoll();
    return;
  }

  attempts++;
  fuel--;

  if (isNaN(guess)) {
    message.textContent = "🛰 Please enter a valid number!";
    return;
  }

  if (guess < numberToGuess) {
    message.textContent = `🌌 Too low! Fuel left: ${fuel}`;
    rocketShake();
    maybeFuelBonus(guess);
  } else if (guess > numberToGuess) {
    message.textContent = `☄️ Too high! Fuel left: ${fuel}`;
    rocketShake();
    maybeFuelBonus(guess);
  } else {
    message.textContent = `✨ Stellar job! You found the number in ${attempts} attempts with ${fuel} fuel left and ${timeLeft}s remaining.`;
    document.getElementById("playAgain").style.display = "inline-block";
    playSound("soundVictory");
    unlockAchievements();
    updateScoreboard();
    launchConfetti();
    clearInterval(timer);
  }

  if (fuel === 0 && guess !== numberToGuess) {
    message.textContent = "💥 Mission failed! You ran out of fuel.";
    document.getElementById("playAgain").style.display = "inline-block";
    clearInterval(timer);
    playSound("soundFail");
    rickRoll();
  }

  if (Math.random() < 0.2) spawnFuelCell();
  if (Math.random() < 0.1) triggerCosmicEvent();
} 

function restartGame() {
  clearInterval(timer);
  startGame();
}

function updateScoreboard() {
  const scoreboard = document.getElementById("scoreboard");
  let achievementList = Object.keys(achievements).map(a => `🏅 ${a}`).join(" | ");
  scoreboard.textContent = `⛽ Fuel: ${maxFuel} | ⏱ Time Limit: ${initialTimeLimit}s ${achievementList ? "| " + achievementList : ""}`;
} 
function startTimer() {
  clearInterval(timer);
  const timerDisplay = document.getElementById("timer");
  timerDisplay.textContent = `⏱ Time left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏱ Time left: ${timeLeft}s`;

 if (timeLeft === 5) {
  timerDisplay.classList.add("low-time");
  playSound("soundAlarm");
} else if (timeLeft < 5) {
  timerDisplay.classList.add("low-time");
} else {
  timerDisplay.classList.remove("low-time");
} 

    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById("message").textContent = "💥 Mission failed! Time ran out.";
      document.getElementById("playAgain").style.display = "inline-block";
      playSound("soundFail");
      rickRoll();
    }
  }, 1000);
}

function launchConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function rocketShake() {
  const body = document.body;
  body.style.transition = "transform 0.1s";
  body.style.transform = "translateX(-5px)";
  setTimeout(() => {
    body.style.transform = "translateX(5px)";
    setTimeout(() => {
      body.style.transform = "translateX(0)";
    }, 100);
  }, 100);
}

function starfield() {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [];

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      speed: Math.random() * 0.5
    });
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
    });
    requestAnimationFrame(drawStars);
  }

  drawStars();
}

function useWarpDrive() {
  if (!gameStarted) {
    document.getElementById("message").textContent = "🚀 Start the mission first!";
    return;
  }
  if (fuel < 2) {
    document.getElementById("message").textContent = "⚠️ Not enough fuel for Warp Drive!";
    return;
  }
  fuel -= 2;

  let hintRange = maxRange <= 50 ? 5 : maxRange <= 200 ? 10 : 20;
  let lowerBound = Math.max(1, numberToGuess - hintRange);
  let upperBound = Math.min(maxRange, numberToGuess + hintRange);

  document.getElementById("message").textContent =
    `⚡ Warp Drive activated! The number is between ${lowerBound} and ${upperBound}. Fuel left: ${fuel}`;

  updateScoreboard();
}

function unlockAchievements() {
  if (!achievements["First Launch"]) achievements["First Launch"] = true;
  if (fuel >= 5) achievements["Fuel Saver"] = true;
  if (timeLeft >= initialTimeLimit / 2) achievements["Speedster"] = true;
  localStorage.setItem("achievements", JSON.stringify(achievements));
}

function maybeFuelBonus(guess) {
  let bonusRange = maxRange <= 50 ? 3 : maxRange <= 200 ? 5 : 7;
  if (Math.abs(guess - numberToGuess) <= bonusRange && fuel < maxFuel) {
    fuel++;
    document.getElementById("message").textContent += " 🔋 Bonus fuel gained!";
  }
}

function spawnFuelCell() {
  const cell = document.getElementById("fuelCell");
  cell.style.display = "block";
  cell.onclick = () => {
    fuel += 2;
    updateScoreboard();
    cell.style.display = "none";
    document.getElementById("message").textContent = "🔋 You grabbed a Fuel Cell!";
  };
}

function triggerCosmicEvent() {
  const eventBox = document.getElementById("cosmicEvent");
  eventBox.style.display = "block";

  const events = [
    { type: "Meteor Shower", effect: () => { fuel = Math.max(0, fuel - 1); }, message: "☄️ Meteor Shower! You lost 1 fuel." },
    { type: "Solar Boost", effect: () => { timeLeft += 5; }, message: "☀️ Solar Boost! You gained +5 seconds." },
    { type: "Alien Encounter", effect: () => { fuel += 1; }, message: "👽 Alien Encounter! They gave you +1 fuel." }
  ];

  const randomEvent = events[Math.floor(Math.random() * events.length)];
  randomEvent.effect();
  eventBox.textContent = randomEvent.message;

  updateScoreboard();

  setTimeout(() => {
    eventBox.style.display = "none";
  }, 3000);
}

function rickRoll() {
  window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
}

document.addEventListener("DOMContentLoaded", () => {
  const guessInput = document.getElementById("guessInput");
  guessInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      checkGuess();
    }
  });
  starfield();

}); 
