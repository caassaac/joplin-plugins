(() => {
  const DURATIONS = {
    work: 1500,
    shortBreak: 300,
    longBreak: 900,
  };

  const MODE_TITLES = {
    work: "Trabajo",
    shortBreak: "Descanso Corto",
    longBreak: "Descanso Largo",
  };

  const ALERT_MESSAGES = {
    work: "¡Hora de trabajar!",
    break: "¡Hora de descansar!",
  };

  let mode = "work";
  let remaining = DURATIONS[mode];
  let intervalId = null;
  let sessionCount = 0;

  const display = document.getElementById("display");
  const modeTitleElem = document.getElementById("modeTitle");
  const startBtn = document.getElementById("start");
  const pauseBtn = document.getElementById("pause");
  const resetTimerBtn = document.getElementById("resetTimer");
  const resetCycleBtn = document.getElementById("resetCycle");

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function updateDisplay() {
    display.textContent = formatTime(remaining);
    modeTitleElem.textContent = MODE_TITLES[mode];
  }

  function switchMode() {
    if (mode === "work") {
      sessionCount++;
      mode = sessionCount % 4 === 0 ? "longBreak" : "shortBreak";
    } else {
      mode = "work";
    }
    remaining = DURATIONS[mode];
    updateDisplay();
    alert(mode === "work" ? ALERT_MESSAGES.work : ALERT_MESSAGES.break);
  }

  function tick() {
    if (remaining > 0) {
      remaining--;
      updateDisplay();
    } else {
      clearInterval(intervalId);
      intervalId = null;
      switchMode();
    }
  }

  startBtn.addEventListener("click", () => {
    if (!intervalId) intervalId = setInterval(tick, 1000);
  });

  pauseBtn.addEventListener("click", () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  resetTimerBtn.addEventListener("click", () => {
    clearInterval(intervalId);
    intervalId = null;
    remaining = DURATIONS[mode];
    updateDisplay();
  });

  resetCycleBtn.addEventListener("click", () => {
    clearInterval(intervalId);
    intervalId = null;
    mode = "work";
    sessionCount = 0;
    remaining = DURATIONS[mode];
    updateDisplay();
  });

  updateDisplay();
})();
