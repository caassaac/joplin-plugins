import * as path from "path";

describe("Text Case Formatter — webview.js", () => {
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

  it("binds and sends uppercase message on click", async () => {
    document.body.innerHTML = `<button id="uppercaseBtn">MAYÚSCULAS</button>`;
    const infoSpy = jest.spyOn(console, "info").mockImplementation();

    require(scriptPath);

    document.getElementById("uppercaseBtn")!.click();
    await Promise.resolve();

    expect((global as any).webviewApi.postMessage).toHaveBeenCalledWith({
      command: "uppercase",
    });
    expect(infoSpy).toHaveBeenCalledWith(
      "[TextCaseFormatterPlugin Webview] Botón presionado: uppercase"
    );

    infoSpy.mockRestore();
  });

  it("logs error when button ID not found", () => {
    document.body.innerHTML = `<div></div>`;
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    require(scriptPath);

    expect(errorSpy).toHaveBeenCalledWith(
      "[TextCaseFormatterPlugin Webview] Botón no encontrado:",
      "uppercaseBtn"
    );

    errorSpy.mockRestore();
  });
});
