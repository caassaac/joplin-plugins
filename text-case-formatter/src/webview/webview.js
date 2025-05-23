const UPPERCASE_BTN_ID = "uppercaseBtn";
const LOWERCASE_BTN_ID = "lowercaseBtn";
const CAPITALIZE_BTN_ID = "capitalizeBtn";

function bindButton(btnId, command) {
  const btn = document.getElementById(btnId);
  if (!btn) {
    console.error(
      `[TextCaseFormatterPlugin Webview] Botón no encontrado:`,
      btnId
    );
    return;
  }
  btn.addEventListener("click", async () => {
    console.info(
      `[TextCaseFormatterPlugin Webview] Botón presionado: ${command}`
    );
    if (typeof webviewApi === "undefined") {
      console.error(
        "[TextCaseFormatterPlugin Webview] webviewApi no disponible"
      );
      return;
    }
    try {
      await webviewApi.postMessage({ command });
    } catch (error) {
      console.error(
        "[TextCaseFormatterPlugin Webview] Error enviando mensaje:",
        error
      );
    }
  });
}

bindButton(UPPERCASE_BTN_ID, "uppercase");
bindButton(LOWERCASE_BTN_ID, "lowercase");
bindButton(CAPITALIZE_BTN_ID, "capitalize");
