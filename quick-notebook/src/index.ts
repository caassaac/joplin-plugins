import joplin from "api";
import "./styles/styles.css";

const PANEL_ID = "quickNotebookPanel";
const STYLE_PATH = "./styles/styles.css";
const SCRIPT_PATH = "./webview/webview.js";

const CONTAINER_ID = "quick-notebook-container";
const BUTTON_ID = "quick-notebook-btn";

const MESSAGE_NAME_CREATE = "createQuick";

const PLUGIN_PREFIX = "[QuickNotebook]";

const BASE_NOTEBOOK_TITLE = "Cuaderno Rápido";
const NOTE_TITLE = "Nota Rápida";
const NOTE_BODY_TEMPLATE = `# Nota Rápida

Este espacio fue creado automáticamente en "{{notebookTitle}}". ¡Empieza a capturar tus ideas aquí!

---

`;

interface QuickNotebookMessage {
  name: typeof MESSAGE_NAME_CREATE;
}

joplin.plugins.register({
  onStart: async () => {
    const panelId = await joplin.views.panels.create(PANEL_ID);

    await joplin.views.panels.setHtml(
      panelId,
      `
      <div id="${CONTAINER_ID}">
        <button id="${BUTTON_ID}">${BASE_NOTEBOOK_TITLE}</button>
      </div>
      `
    );

    await joplin.views.panels.addScript(panelId, STYLE_PATH);
    await joplin.views.panels.addScript(panelId, SCRIPT_PATH);

    await joplin.views.panels.show(panelId, true);

    await joplin.views.panels.onMessage(
      panelId,
      async (message: QuickNotebookMessage) => {
        if (message.name === MESSAGE_NAME_CREATE) {
          console.info(
            PLUGIN_PREFIX,
            "Iniciando creación de cuaderno rápido..."
          );

          let notebookTitle = BASE_NOTEBOOK_TITLE;
          let index = 1;

          try {
            const allFolders = await joplin.data.get(["folders"], {
              fields: ["title"],
            });
            const existing = allFolders.items.map((f) => f.title);

            while (existing.includes(notebookTitle)) {
              index++;
              notebookTitle = `${BASE_NOTEBOOK_TITLE} ${index}`;
            }

            const notebook = await joplin.data.post(["folders"], null, {
              title: notebookTitle,
            });

            const noteBody = NOTE_BODY_TEMPLATE.replace(
              "{{notebookTitle}}",
              notebookTitle
            );

            await joplin.data.post(["notes"], null, {
              parent_id: notebook.id,
              title: NOTE_TITLE,
              body: noteBody,
            });

            console.info(
              PLUGIN_PREFIX,
              `Cuaderno "${notebookTitle}" creado exitosamente con nota inicial.`
            );
          } catch (error) {
            console.error(PLUGIN_PREFIX, "Error al crear el cuaderno:", error);
          }
        }
      }
    );
  },
});
