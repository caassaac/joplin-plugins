(() => {
  const BUTTON_ID = "quick-notebook-btn";
  const MESSAGE_NAME_CREATE = "createQuick";
  const LOG_PREFIX = "[QuickNotebook Webview]";

  const btn = document.getElementById(BUTTON_ID);
  if (!btn) {
    console.error(LOG_PREFIX, `Botón #${BUTTON_ID} no encontrado`);
    return;
  }

  btn.addEventListener("click", async () => {
    console.info(LOG_PREFIX, "Botón presionado");
    if (typeof webviewApi === "undefined") {
      console.error(LOG_PREFIX, "webviewApi no disponible");
      return;
    }
    try {
      await webviewApi.postMessage({ name: MESSAGE_NAME_CREATE });
    } catch (error) {
      console.error(LOG_PREFIX, "Error enviando mensaje:", error);
    }
  });
})();
