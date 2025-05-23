import joplin from "api";
import "./styles/styles.css";

const PANEL_ID = "textCasePanel";
const STYLE_PATH = "./styles/styles.css";
const SCRIPT_PATH = "./webview/webview.js";

const CMD_UPPERCASE = "textFormatter.uppercase";
const CMD_LOWERCASE = "textFormatter.lowercase";
const CMD_CAPITALIZE = "textFormatter.capitalizeWords";

const UPPERCASE_BTN_ID = "uppercaseBtn";
const LOWERCASE_BTN_ID = "lowercaseBtn";
const CAPITALIZE_BTN_ID = "capitalizeBtn";

interface TextCaseMessage {
  command: "uppercase" | "lowercase" | "capitalize";
}

joplin.plugins.register({
  onStart: async () => {
    await joplin.commands.register({
      name: CMD_UPPERCASE,
      label: "Convertir a MAYÚSCULAS",
      iconName: "fas fa-arrow-up",
      execute: async () => {
        const selection = (await joplin.commands.execute(
          "selectedText"
        )) as string;
        if (selection) {
          await joplin.commands.execute(
            "replaceSelection",
            selection.toUpperCase()
          );
        }
      },
    });

    await joplin.commands.register({
      name: CMD_LOWERCASE,
      label: "Convertir a minúsculas",
      iconName: "fas fa-arrow-down",
      execute: async () => {
        const selection = (await joplin.commands.execute(
          "selectedText"
        )) as string;
        if (selection) {
          await joplin.commands.execute(
            "replaceSelection",
            selection.toLowerCase()
          );
        }
      },
    });

    await joplin.commands.register({
      name: CMD_CAPITALIZE,
      label: "Capitalizar Palabras",
      iconName: "fas fa-text-height",
      execute: async () => {
        const selection = (await joplin.commands.execute(
          "selectedText"
        )) as string;
        if (selection) {
          const result = selection.replace(
            /\b\p{L}+/gu,
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          );
          await joplin.commands.execute("replaceSelection", result);
        }
      },
    });

    const panelId = await joplin.views.panels.create(PANEL_ID);

    await joplin.views.panels.setHtml(
      panelId,
      `
      <div id="text-case-container">
        <button id="${UPPERCASE_BTN_ID}">MAYÚSCULAS</button>
        <button id="${LOWERCASE_BTN_ID}">minúsculas</button>
        <button id="${CAPITALIZE_BTN_ID}">Capitalizar Palabras</button>
      </div>
      `
    );

    await joplin.views.panels.addScript(panelId, STYLE_PATH);
    await joplin.views.panels.addScript(panelId, SCRIPT_PATH);
    await joplin.views.panels.show(panelId, true);

    await joplin.views.panels.onMessage(
      panelId,
      async (message: TextCaseMessage) => {
        switch (message.command) {
          case "uppercase":
            console.info(
              "[TextCaseFormatterPlugin] Botón MAYÚSCULAS presionado"
            );
            await joplin.commands.execute(CMD_UPPERCASE);
            break;
          case "lowercase":
            console.info(
              "[TextCaseFormatterPlugin] Botón minúsculas presionado"
            );
            await joplin.commands.execute(CMD_LOWERCASE);
            break;
          case "capitalize":
            console.info(
              "[TextCaseFormatterPlugin] Botón Capitalizar Palabras presionado"
            );
            await joplin.commands.execute(CMD_CAPITALIZE);
            break;
        }
      }
    );

    console.info("[TextCaseFormatterPlugin] Iniciado");
  },
});
