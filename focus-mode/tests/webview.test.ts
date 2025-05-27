import * as path from "path";

describe("Focus Mode Plugin — webview.js", () => {
  const scriptPath = path.resolve(__dirname, "../dist/webview/webview.js");

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = "";
    (global as any).webviewApi = {
      postMessage: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(console, "info").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).webviewApi;
  });

  it("handles successful toggle message", async () => {
    document.body.innerHTML = `<button id="focusBtn"></button>`;

    require(scriptPath);
    document.getElementById("focusBtn").click();
    await Promise.resolve();

    expect(console.info).toHaveBeenCalledWith(
      "[FocusModePlugin Webview] Botón presionado"
    );
    expect((global as any).webviewApi.postMessage).toHaveBeenCalledWith({
      name: "toggleFocus",
    });
  });

  it("handles missing webviewApi", async () => {
    document.body.innerHTML = `<button id="focusBtn"></button>`;
    delete (global as any).webviewApi;

    require(scriptPath);
    document.getElementById("focusBtn").click();
    await Promise.resolve();

    expect(console.error).toHaveBeenCalledWith(
      "[FocusModePlugin Webview] webviewApi no disponible"
    );
  });

  it("handles postMessage errors", async () => {
    const error = new Error("API failure");
    (global as any).webviewApi.postMessage.mockRejectedValue(error);
    document.body.innerHTML = `<button id="focusBtn"></button>`;

    require(scriptPath);
    document.getElementById("focusBtn").click();
    await Promise.resolve();

    expect(console.error).toHaveBeenCalledWith(
      "[FocusModePlugin Webview] Error enviando mensaje:",
      error
    );
  });

  it("logs error for missing button", () => {
    require(scriptPath);
    expect(console.error).toHaveBeenCalledWith(
      "[FocusModePlugin Webview] Botón no encontrado:",
      "focusBtn"
    );
  });
});
