const FOCUS_BTN_ID = "focusBtn";

const btn = document.getElementById(FOCUS_BTN_ID);

if (!btn) {
  console.error("[FocusModePlugin Webview] Botón no encontrado:", FOCUS_BTN_ID);
} else {
  btn.addEventListener("click", async () => {
    console.info("[FocusModePlugin Webview] Botón presionado");
    if (typeof webviewApi === "undefined") {
      console.error("[FocusModePlugin Webview] webviewApi no disponible");
      return;
    }
    try {
      await webviewApi.postMessage({ name: "toggleFocus" });
    } catch (error) {
      console.error("[FocusModePlugin Webview] Error enviando mensaje:", error);
    }
  });
}
