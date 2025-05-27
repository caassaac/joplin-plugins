import joplin from "api";
import "./styles/styles.css";

const PANEL_ID = "focusModePanel";
const STYLE_PATH = "./styles/styles.css";
const SCRIPT_PATH = "./webview/webview.js";

export const state = {
  focusEnabled: false,
};

interface ToggleFocusMessage {
  name: "toggleFocus";
}

export async function onStart() {
  const panelId = await joplin.views.panels.create(PANEL_ID);

  await joplin.views.panels.setHtml(
    panelId,
    `
    <div id="focus-container">
      <button id="focusBtn">Modo Enfoque</button>
    </div>
    `
  );

  await joplin.views.panels.addScript(panelId, STYLE_PATH);
  await joplin.views.panels.addScript(panelId, SCRIPT_PATH);
  await joplin.views.panels.show(panelId, true);

  await joplin.views.panels.onMessage(
    panelId,
    async (message: ToggleFocusMessage) => {
      if (message.name !== "toggleFocus") return;

      try {
        state.focusEnabled = !state.focusEnabled;

        await Promise.all([
          joplin.commands.execute("toggleSideBar"),
          joplin.commands.execute("toggleNoteList"),
        ]);

        console.info(
          `[FocusModePlugin] Modo enfoque ${
            state.focusEnabled ? "ACTIVADO" : "DESACTIVADO"
          }`
        );
      } catch (error) {
        console.error("[FocusModePlugin] Error executing commands:", error);
        state.focusEnabled = !state.focusEnabled;
      }
    }
  );
}

joplin.plugins.register({
  onStart,
});
