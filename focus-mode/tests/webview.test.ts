import * as path from "path";

describe("Focus Mode Plugin — webview.js", () => {
  const scriptPath = path.resolve(__dirname, "../dist/webview/webview.js");

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = "";
    (global as any).webviewApi = {
      postMessage: jest.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sends toggleFocus message on click", async () => {
    document.body.innerHTML = `<button id="focusBtn">Modo Enfoque</button>`;

    const infoSpy = jest.spyOn(console, "info").mockImplementation();

    require(scriptPath);

    document.getElementById("focusBtn")!.click();
    await Promise.resolve();

    expect((global as any).webviewApi.postMessage).toHaveBeenCalledWith({
      name: "toggleFocus",
    });
    expect(infoSpy).toHaveBeenCalledWith(
      "[FocusModePlugin Webview] Botón presionado"
    );

    infoSpy.mockRestore();
  });

  it("logs an error when button is missing", () => {
    document.body.innerHTML = `<div></div>`;

    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    require(scriptPath);

    expect(errorSpy).toHaveBeenCalledWith(
      "[FocusModePlugin Webview] Botón no encontrado:",
      "focusBtn"
    );

    errorSpy.mockRestore();
  });
});
