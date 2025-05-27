import * as path from "path";
import {
  UPPERCASE_BTN_ID,
  LOWERCASE_BTN_ID,
  CAPITALIZE_BTN_ID,
} from "../src/index";

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
    delete (global as any).webviewApi;
  });

  it("sends uppercase message and logs info", async () => {
    document.body.innerHTML = `<button id="${UPPERCASE_BTN_ID}">MAYÚSCULAS</button>`;
    const infoSpy = jest.spyOn(console, "info").mockImplementation();

    require(scriptPath);
    document.getElementById(UPPERCASE_BTN_ID).click();
    await Promise.resolve();

    expect((global as any).webviewApi.postMessage).toHaveBeenCalledWith({
      command: "uppercase",
    });
    expect(infoSpy).toHaveBeenCalledWith(
      "[TextCaseFormatterPlugin Webview] Botón presionado: uppercase"
    );

    infoSpy.mockRestore();
  });

  it("logs an error for each missing button ID", () => {
    document.body.innerHTML = `<div></div>`;
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    require(scriptPath);

    [UPPERCASE_BTN_ID, LOWERCASE_BTN_ID, CAPITALIZE_BTN_ID].forEach((id) =>
      expect(errorSpy).toHaveBeenCalledWith(
        "[TextCaseFormatterPlugin Webview] Botón no encontrado:",
        id
      )
    );

    errorSpy.mockRestore();
  });

  it("logs error when webviewApi is absent", () => {
    document.body.innerHTML = `<button id="${UPPERCASE_BTN_ID}">MAYÚSCULAS</button>`;
    delete (global as any).webviewApi;
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    require(scriptPath);
    document.getElementById(UPPERCASE_BTN_ID).click();

    expect(errorSpy).toHaveBeenCalledWith(
      "[TextCaseFormatterPlugin Webview] webviewApi no disponible"
    );

    errorSpy.mockRestore();
  });

  it("catches and logs when postMessage throws", async () => {
    document.body.innerHTML = `<button id="${UPPERCASE_BTN_ID}">MAYÚSCULAS</button>`;
    (global as any).webviewApi.postMessage = jest
      .fn()
      .mockRejectedValue(new Error("fail"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    require(scriptPath);
    document.getElementById(UPPERCASE_BTN_ID).click();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith(
      "[TextCaseFormatterPlugin Webview] Error enviando mensaje:",
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });
});
