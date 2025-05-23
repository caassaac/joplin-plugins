import joplin from "api";
import "./styles/styles.css";

const PANEL_ID = "pomodoroPanel";
const STYLE_PATH = "./styles/styles.css";
const SCRIPT_PATH = "./webview/webview.js";

const CONTAINER_ID = "pomodoro";
const MODE_TITLE_ID = "modeTitle";
const DISPLAY_ID = "display";

const START_BTN_ID = "start";
const PAUSE_BTN_ID = "pause";
const RESET_TIMER_BTN_ID = "resetTimer";
const RESET_CYCLE_BTN_ID = "resetCycle";

const TITLE_TEXT = "Temporizador Pomodoro";
const BUTTON_START_TEXT = "Iniciar";
const BUTTON_PAUSE_TEXT = "Pausar";
const BUTTON_RESET_TIMER_TEXT = "Reiniciar Tiempo";
const BUTTON_RESET_CYCLE_TEXT = "Reiniciar Ciclo";

joplin.plugins.register({
  onStart: async () => {
    const panelId = await joplin.views.panels.create(PANEL_ID);

    await joplin.views.panels.setHtml(
      panelId,
      `
      <div id="${CONTAINER_ID}">
        <h2>${TITLE_TEXT}</h2>
        <div id="${MODE_TITLE_ID}"></div>
        <div id="${DISPLAY_ID}">25:00</div>
        <div>
          <button id="${START_BTN_ID}">${BUTTON_START_TEXT}</button>
          <button id="${PAUSE_BTN_ID}">${BUTTON_PAUSE_TEXT}</button>
        </div>
        <div>
          <button id="${RESET_TIMER_BTN_ID}">${BUTTON_RESET_TIMER_TEXT}</button>
          <button id="${RESET_CYCLE_BTN_ID}">${BUTTON_RESET_CYCLE_TEXT}</button>
        </div>
      </div>
      `
    );

    await joplin.views.panels.addScript(panelId, STYLE_PATH);
    await joplin.views.panels.addScript(panelId, SCRIPT_PATH);

    await joplin.views.panels.show(panelId, true);
  },
});
