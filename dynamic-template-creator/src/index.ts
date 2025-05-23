import joplin from "api";
import * as os from "os";
import "./styles/styles.css";

const PANEL_ID = "templatePanel";
const STYLE_PATH = "./styles/styles.css";
const SCRIPT_PATH = "./webview/webview.js";
const TEMPLATE_CONTAINER_ID = "template-container";
const CREATE_BUTTON_ID = "createButton";

const DEFAULT_TITLE = "Nueva Nota";
const TAG_LIST = "reunión, diario";

const DEFAULT_TEMPLATE = `# {{titulo}}
**Cuaderno:** {{cuaderno}}
**Etiquetas:** {{tags}}
**Sistema Operativo:** {{os}}
**Notas existentes:** {{note_count}}

**Fecha:** {{fecha}}
**Hora:** {{hora}}
**Fecha y hora:** {{fecha_hora}}
**Usuario:** {{usuario}}

*(Escribe aquí tu contenido…)*`;

interface TemplateMessage {
  command: "createNote";
  timestamp: number;
}

joplin.plugins.register({
  onStart: async () => {
    const panelId = await joplin.views.panels.create(PANEL_ID);

    await joplin.views.panels.setHtml(
      panelId,
      `
      <div id="${TEMPLATE_CONTAINER_ID}">
        <button id="${CREATE_BUTTON_ID}">Crear desde Plantilla</button>
      </div>
      `
    );

    await joplin.views.panels.addScript(panelId, STYLE_PATH);
    await joplin.views.panels.addScript(panelId, SCRIPT_PATH);

    await joplin.views.panels.show(panelId, true);

    await joplin.views.panels.onMessage(
      panelId,
      async (message: TemplateMessage) => {
        if (message.command === "createNote") {
          try {
            const now = new Date();
            const folder = await joplin.workspace.selectedFolder();

            const notesRes = await joplin.data.get(
              ["folders", folder.id, "notes"],
              { fields: ["id"] }
            );

            const body = DEFAULT_TEMPLATE.replace(/{{titulo}}/g, DEFAULT_TITLE)
              .replace(/{{cuaderno}}/g, folder.title)
              .replace(/{{tags}}/g, TAG_LIST)
              .replace(/{{os}}/g, os.type())
              .replace(/{{note_count}}/g, String(notesRes.items.length + 1))
              .replace(/{{fecha}}/g, now.toLocaleDateString())
              .replace(/{{hora}}/g, now.toLocaleTimeString())
              .replace(/{{fecha_hora}}/g, now.toLocaleString())
              .replace(
                /{{usuario}}/g,
                process.env.USER || process.env.USERNAME || "Usuario"
              );

            await joplin.data.post(["notes"], null, {
              title: DEFAULT_TITLE,
              body: body,
              parent_id: folder.id,
            });

            console.info("[Plugin] Nota creada exitosamente desde plantilla");
          } catch (error) {
            console.error(
              "[Plugin] Error al crear nota desde plantilla:",
              error
            );
          }
        }
      }
    );
  },
});
