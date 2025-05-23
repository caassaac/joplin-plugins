import * as path from "path";

describe("webview.js", () => {
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

  it("sends createNote message on click", async () => {
    document.body.innerHTML = `<button id="createButton">Click</button>`;

    const infoSpy = jest.spyOn(console, "info").mockImplementation();
    const debugSpy = jest.spyOn(console, "debug").mockImplementation();

    require(scriptPath);

    const btn = document.getElementById("createButton")!;
    btn.click();
    await Promise.resolve();

    expect((global as any).webviewApi.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ command: "createNote" })
    );
    expect(infoSpy).toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalled();
  });

  it("logs an error if button not found", () => {
    document.body.innerHTML = `<div></div>`;

    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    require(scriptPath);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error: Elemento #createButton no encontrado")
    );
  });
});
