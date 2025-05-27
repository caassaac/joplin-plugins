import joplin from "api";
import * as os from "os";
import { onStart } from "../src/index";

describe("index.ts error and edge cases", () => {
  const realDate = Date;
  const originalEnv = { ...process.env };

  beforeAll(() => {
    // freeze time
    jest.useFakeTimers({ legacyFakeTimers: false });
    jest.setSystemTime(new Date("2025-05-23T00:00:00Z"));
    global.Date = class extends realDate {
      constructor() { super("2025-05-23T00:00:00Z"); }
      toLocaleDateString() { return "23/5/2025"; }
      toLocaleTimeString() { return "00:00:00"; }
      toLocaleString() { return "23/5/2025 00:00:00"; }
    } as any;
    jest.spyOn(os, "type").mockReturnValue("Linux");
  });

  afterAll(() => {
    jest.useRealTimers();
    global.Date = realDate;
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    process.env = { ...originalEnv };
    // default mocks
    (joplin.views.panels.create as jest.Mock).mockResolvedValue("pnl");
    (joplin.views.panels.onMessage as jest.Mock).mockImplementation((_id, h) => {
      // store handler for manual invocation
      (joplin.views.panels.onMessage as any)._lastHandler = h;
    });
    (joplin.workspace.selectedFolder as jest.Mock).mockResolvedValue({ id: "f1", title: "F" });
    (joplin.data.get as jest.Mock).mockResolvedValue({ items: [] });
  });

  it("ignores messages with other commands", async () => {
    await onStart();
    const handler = (joplin.views.panels.onMessage as any)._lastHandler;
    await handler({ command: "otherCommand", timestamp: Date.now() });
    expect(joplin.data.post).not.toHaveBeenCalled();
  });

  it("falls back to 'Usuario' when neither USER nor USERNAME is set", async () => {
    // ensure no USER or USERNAME
    delete process.env.USER;
    delete process.env.USERNAME;

    await onStart();
    const handler = (joplin.views.panels.onMessage as any)._lastHandler;
    await handler({ command: "createNote", timestamp: Date.now() });

    expect(joplin.data.post).toHaveBeenCalledWith(
      ["notes"], null,
      expect.objectContaining({
        body: expect.stringContaining("**Usuario:** Usuario")
      })
    );
  });

  it("calls panels.show to reveal the panel", async () => {
    await onStart();
    expect(joplin.views.panels.show).toHaveBeenCalledWith("pnl", true);
  });

  it("logs an error if data.post throws", async () => {
    const testError = new Error("fail");
    (joplin.data.post as jest.Mock).mockRejectedValueOnce(testError);

    await onStart();
    const handler = (joplin.views.panels.onMessage as any)._lastHandler;
    await handler({ command: "createNote", timestamp: Date.now() });

    // the error should be caught and logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[Plugin] Error al crear nota desde plantilla:"),
      testError
    );
  });

});
