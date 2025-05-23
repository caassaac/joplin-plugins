import joplin from "api";
import { onStart, focusEnabled } from "../src/index";

describe("Focus Mode Plugin — index.ts", () => {
  let messageHandler: (msg: any) => Promise<void>;

  beforeEach(() => {
    jest.resetModules();

    (joplin.views.panels.create as jest.Mock).mockResolvedValue("PANEL123");
    (joplin.views.panels.setHtml as jest.Mock).mockResolvedValue(undefined);
    (joplin.views.panels.addScript as jest.Mock).mockResolvedValue(undefined);
    (joplin.views.panels.show as jest.Mock).mockResolvedValue(undefined);

    (joplin.views.panels.onMessage as jest.Mock).mockImplementation(
      async (_panelId: string, callback: any) => {
        messageHandler = callback;
      }
    );

    (joplin.commands.execute as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates the panel and registers a message handler", async () => {
    await onStart();

    expect(joplin.views.panels.create).toHaveBeenCalledWith("focusModePanel");
    expect(joplin.views.panels.setHtml).toHaveBeenCalledWith(
      "PANEL123",
      expect.stringContaining("focusBtn")
    );
    expect(joplin.views.panels.addScript).toHaveBeenCalledTimes(2);
    expect(joplin.views.panels.show).toHaveBeenCalledWith("PANEL123", true);
    expect(typeof messageHandler).toBe("function");
  });

  it("toggles focusEnabled, executes commands, and logs", async () => {
    await onStart();

    expect(focusEnabled).toBe(false);

    const infoSpy = jest.spyOn(console, "info").mockImplementation();

    await messageHandler({ name: "toggleFocus" });

    expect(focusEnabled).toBe(true);
    expect(joplin.commands.execute).toHaveBeenCalledWith("toggleSideBar");
    expect(joplin.commands.execute).toHaveBeenCalledWith("toggleNoteList");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining("Modo enfoque ACTIVADO")
    );

    infoSpy.mockRestore();
  });
});
