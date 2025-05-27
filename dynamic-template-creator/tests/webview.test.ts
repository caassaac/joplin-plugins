import * as path from "path";

describe("webview.js", () => {
  const scriptPath = path.resolve(__dirname, "../dist/webview/webview.js");

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = "";
    (global as any).webviewApi = {
      postMessage: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).webviewApi;
  });

  it("sends createNote message on click", async () => {
    document.body.innerHTML = `<button id="createButton">Click</button>`;

    require(scriptPath);

    const btn = document.getElementById("createButton");
    btn.click();
    await Promise.resolve();

    expect((global as any).webviewApi.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "createNote",
        timestamp: expect.any(Number)
      })
    );
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining("Botón presionado: creando nota...")
    );
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining("Enviando mensaje:"),
      expect.any(Object)
    );
  });

  it("logs an error if button not found", () => {
    document.body.innerHTML = `<div></div>`;

    require(scriptPath);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Error: Elemento #createButton no encontrado")
    );
  });

  describe("webviewApi error handling", () => {
    it("logs error when webviewApi is missing", async () => {
      document.body.innerHTML = `<button id="createButton">Click</button>`;
      (global as any).webviewApi = undefined;

      require(scriptPath);

      const btn = document.getElementById("createButton");
      btn.click();
      await Promise.resolve();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("webviewApi no disponible")
      );
    });
  });

  describe("Message payload validation", () => {
    it("sends correct timestamp in payload", async () => {
      document.body.innerHTML = `<button id="createButton">Click</button>`;
      const mockDate = 1748298539550;
      jest.spyOn(Date, "now").mockReturnValue(mockDate);

      require(scriptPath);
      const btn = document.getElementById("createButton");
      btn.click();
      await Promise.resolve();

      expect((global as any).webviewApi.postMessage).toHaveBeenCalledWith({
        command: "createNote",
        timestamp: mockDate
      });
    });
  });
});
