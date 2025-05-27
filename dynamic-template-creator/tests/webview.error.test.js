const path = require("path");

describe("webview.js error‐path tests", () => {
  const scriptPath = path.resolve(__dirname, "../dist/webview/webview.js");

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `<button id="createButton">Go</button>`;
    global.webviewApi = {
      postMessage: jest.fn().mockRejectedValue(new Error("boom")),
    };
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.webviewApi;
  });

  it("logs an error when postMessage itself rejects", async () => {
    require(scriptPath);
    document.getElementById("createButton").click();
    // wait for the async handler
    await new Promise(process.nextTick);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[Plugin Webview] Error en comunicación con núcleo del plugin:"),
      expect.any(Error)
    );
  });
});
