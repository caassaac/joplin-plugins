const PLUGIN_WEBVIEW_PREFIX = "[Plugin Webview]";
const CREATE_BUTTON_ID = "createButton";
const MESSAGE_COMMAND_CREATE = "createNote";

const btn = document.getElementById(CREATE_BUTTON_ID);

if (!btn) {
  console.error(
    `${PLUGIN_WEBVIEW_PREFIX} Error: Elemento #${CREATE_BUTTON_ID} no encontrado en el DOM`
  );
} else {
  btn.addEventListener("click", async () => {
    console.info(`${PLUGIN_WEBVIEW_PREFIX} Botón presionado: creando nota...`);

    if (typeof webviewApi === "undefined") {
      console.error(`${PLUGIN_WEBVIEW_PREFIX} webviewApi no disponible.`);
      return;
    }

    try {
      const messagePayload = {
        command: MESSAGE_COMMAND_CREATE,
        timestamp: Date.now(),
      };
      console.debug(
        `${PLUGIN_WEBVIEW_PREFIX} Enviando mensaje:`,
        messagePayload
      );
      await webviewApi.postMessage(messagePayload);
    } catch (error) {
      console.error(
        `${PLUGIN_WEBVIEW_PREFIX} Error en comunicación con núcleo del plugin:`,
        error
      );
    }
  });
}
